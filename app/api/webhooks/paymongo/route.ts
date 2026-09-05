import { NextResponse } from 'next/server';
import { paidAmountFromEvent, verifyWebhookSignature } from '@/lib/paymongo';
import { getOrder, markCancelled, markPaid } from '@/lib/orders';
import { sendOrderEmails } from '@/lib/email';

export const runtime = 'nodejs';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Loose = any;

export async function POST(req: Request) {
  const raw = await req.text();
  if (!verifyWebhookSignature(raw, req.headers.get('paymongo-signature'), process.env.PAYMONGO_WEBHOOK_SECRET)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }
  let event: Loose;
  try { event = JSON.parse(raw); } catch { return NextResponse.json({ error: 'Bad JSON' }, { status: 400 }); }

  const attrs = event?.data?.attributes ?? {};
  const type: string = attrs.type ?? '';
  const PAID = ['checkout_session.payment.paid', 'payment.paid'];
  const FAILED = ['payment.failed', 'checkout_session.payment.failed'];
  if (!PAID.includes(type) && !FAILED.includes(type)) return NextResponse.json({ ok: true, ignored: type });

  // checkout_session.*: metadata on the session; payment.*: metadata on the payment. Be defensive about both.
  const inner = attrs.data?.attributes ?? {};
  const orderId: string | undefined = inner.metadata?.orderId ?? attrs.metadata?.orderId;
  if (!orderId) return NextResponse.json({ error: 'No metadata.orderId' }, { status: 400 });

  const existing = await getOrder(orderId);
  if (!existing) return NextResponse.json({ error: 'Order not found' }, { status: 404 });

  if (FAILED.includes(type)) {
    await markCancelled(orderId); // no-op unless still pending_payment
    return NextResponse.json({ ok: true, cancelled: existing.status === 'pending_payment' });
  }

  if (existing.status === 'paid') return NextResponse.json({ ok: true, already: true });
  const paidCentavos = paidAmountFromEvent(event);
  if (paidCentavos !== null && paidCentavos !== existing.total * 100) {
    console.error(`[webhook] amount mismatch for ${existing.order_no}: paid ${paidCentavos}, expected ${existing.total * 100}`);
    return NextResponse.json({ ok: false, reason: 'amount mismatch' });
  }
  const paymentRef: string = inner.payments?.[0]?.id ?? attrs.data?.id ?? event?.data?.id ?? 'unknown';
  // Conditional update: only the first delivery flips pending_payment → paid, so replays/duplicates never re-send emails.
  const order = await markPaid(orderId, paymentRef);
  if (order) await sendOrderEmails(order).catch((e) => console.error('[webhook] email failed', e));
  return NextResponse.json({ ok: true, updated: !!order });
}
