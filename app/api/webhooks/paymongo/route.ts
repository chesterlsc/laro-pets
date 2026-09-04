import { NextResponse } from 'next/server';
import { verifyWebhookSignature } from '@/lib/paymongo';
import { getOrder, markPaid } from '@/lib/orders';
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
  if (type !== 'checkout_session.payment.paid' && type !== 'payment.paid') return NextResponse.json({ ok: true, ignored: type });

  // checkout_session.*: metadata on the session; payment.*: metadata on the payment. Be defensive about both.
  const inner = attrs.data?.attributes ?? {};
  const orderId: string | undefined = inner.metadata?.orderId ?? attrs.metadata?.orderId;
  if (!orderId) return NextResponse.json({ error: 'No metadata.orderId' }, { status: 400 });
  const paymentRef: string = inner.payments?.[0]?.id ?? attrs.data?.id ?? event?.data?.id ?? 'unknown';

  const existing = await getOrder(orderId);
  if (!existing) return NextResponse.json({ error: 'Order not found' }, { status: 404 });
  if (existing.status === 'paid') return NextResponse.json({ ok: true, already: true });
  const order = await markPaid(orderId, paymentRef);
  if (order) await sendOrderEmails(order).catch((e) => console.error('[webhook] email failed', e));
  return NextResponse.json({ ok: true });
}
