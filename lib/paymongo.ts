import { createHmac, timingSafeEqual } from 'node:crypto';
import { lineItems, type Order } from './orders';
import type { PaymentMethod } from './order-schema';

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
const TYPES: Record<Exclude<PaymentMethod, 'cod'>, string[]> = { gcash: ['gcash'], maya: ['paymaya'], card: ['card'] };

export async function createCheckoutSession(order: Order, method: Exclude<PaymentMethod, 'cod'>): Promise<{ id: string; checkout_url: string }> {
  const key = process.env.PAYMONGO_SECRET_KEY;
  if (!key) throw new Error('PAYMONGO_SECRET_KEY is not set');
  const attributes = {
    line_items: lineItems(order).map((l) => ({ name: l.name, amount: l.amount * 100, currency: 'PHP', quantity: l.quantity })),
    payment_method_types: TYPES[method],
    metadata: { orderId: order.id, orderNo: order.order_no },
    success_url: `${SITE}/thank-you/${order.id}?paid=1`,
    cancel_url: `${SITE}/checkout?cancelled=1`,
    description: `Laro Pets order ${order.order_no}`,
    send_email_receipt: false,
    show_line_items: true,
    reference_number: order.order_no,
  };
  const res = await fetch('https://api.paymongo.com/v1/checkout_sessions', {
    method: 'POST',
    headers: { 'content-type': 'application/json', accept: 'application/json', authorization: `Basic ${Buffer.from(key + ':').toString('base64')}` },
    body: JSON.stringify({ data: { attributes } }),
    signal: AbortSignal.timeout(10_000),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`PayMongo ${res.status}: ${json?.errors?.[0]?.detail ?? 'checkout session failed'}`);
  return { id: json.data.id, checkout_url: json.data.attributes.checkout_url };
}

export const SIGNATURE_TOLERANCE_S = 5 * 60;

/** Paymongo-Signature: `t=<ts>,te=<test sig>,li=<live sig>`; sig = HMAC-SHA256(`${t}.${rawBody}`, webhook secret).
 *  Either the test or the live signature may match (one secret per mode); `t` must be within 5 minutes to block replays. */
export function verifyWebhookSignature(rawBody: string, signatureHeader: string | null, secret: string | undefined, nowMs = Date.now()): boolean {
  if (!signatureHeader || !secret) return false;
  const parts = Object.fromEntries(signatureHeader.split(',').map((p) => p.trim().split('=') as [string, string]));
  const { t, te = '', li = '' } = parts;
  if (!t || !/^\d+$/.test(t) || Math.abs(nowMs / 1000 - Number(t)) > SIGNATURE_TOLERANCE_S) return false;
  const expected = Buffer.from(createHmac('sha256', secret).update(`${t}.${rawBody}`).digest('hex'));
  const eq = (sig: string) => { const b = Buffer.from(sig); return b.length === expected.length && timingSafeEqual(b, expected); };
  return eq(te) || eq(li);
}

/** Paid amount in centavos from a checkout_session.payment.paid or payment.paid event, when present. */
export function paidAmountFromEvent(event: unknown): number | null {
  const attrs = (event as { data?: { attributes?: Record<string, unknown> } })?.data?.attributes ?? {};
  const inner = (attrs.data as { attributes?: Record<string, unknown> } | undefined)?.attributes ?? {};
  const payments = inner.payments as { attributes?: { amount?: number } }[] | undefined;
  const amount = payments?.[0]?.attributes?.amount ?? (inner.amount as number | undefined);
  return typeof amount === 'number' ? amount : null;
}
