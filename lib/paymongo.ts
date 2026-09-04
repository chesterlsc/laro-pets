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
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`PayMongo ${res.status}: ${json?.errors?.[0]?.detail ?? 'checkout session failed'}`);
  return { id: json.data.id, checkout_url: json.data.attributes.checkout_url };
}

/** Paymongo-Signature: `t=<ts>,te=<test sig>,li=<live sig>`; sig = HMAC-SHA256(`${t}.${rawBody}`, webhook secret). */
export function verifyWebhookSignature(rawBody: string, signatureHeader: string | null, secret: string | undefined): boolean {
  if (!signatureHeader || !secret) return false;
  const parts = Object.fromEntries(signatureHeader.split(',').map((p) => p.trim().split('=') as [string, string]));
  const { t, te = '', li = '' } = parts;
  if (!t) return false;
  const expected = Buffer.from(createHmac('sha256', secret).update(`${t}.${rawBody}`).digest('hex'));
  const eq = (sig: string) => { const b = Buffer.from(sig); return b.length === expected.length && timingSafeEqual(b, expected); };
  const testMode = (process.env.PAYMONGO_SECRET_KEY ?? '').startsWith('sk_test_') || !li;
  return testMode ? eq(te) || (!!li && eq(li)) : eq(li) || (!!te && eq(te));
}
