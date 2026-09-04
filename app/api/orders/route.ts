import { NextResponse } from 'next/server';
import { orderSchema } from '@/lib/order-schema';
import { createOrder } from '@/lib/orders';
import { sendOrderEmails } from '@/lib/email';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  const parsed = orderSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ errors: parsed.error.flatten() }, { status: 400 });
  if (parsed.data.paymentMethod !== 'cod') return NextResponse.json({ errors: { formErrors: ['Online payments go through /api/checkout/paymongo'], fieldErrors: {} } }, { status: 400 });
  try {
    const order = await createOrder(parsed.data, 'pending_cod');
    await sendOrderEmails(order).catch((e) => console.error('[orders] email failed', e));
    return NextResponse.json({ orderId: order.id, orderNo: order.order_no, total: order.total }, { status: 201 });
  } catch (e) {
    console.error('[orders] create failed', e);
    return NextResponse.json({ error: 'Could not save your order. Please try again.' }, { status: 500 });
  }
}
