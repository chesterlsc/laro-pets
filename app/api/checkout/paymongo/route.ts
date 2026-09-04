import { NextResponse } from 'next/server';
import { orderSchema } from '@/lib/order-schema';
import { createOrder } from '@/lib/orders';
import { createCheckoutSession } from '@/lib/paymongo';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  if (!process.env.PAYMONGO_SECRET_KEY) return NextResponse.json({ error: 'Online payments are not set up yet — please choose Cash on Delivery.' }, { status: 503 });
  const parsed = orderSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ errors: parsed.error.flatten() }, { status: 400 });
  const { paymentMethod } = parsed.data;
  if (paymentMethod === 'cod') return NextResponse.json({ errors: { formErrors: ['Cash on Delivery orders go through /api/orders'], fieldErrors: {} } }, { status: 400 });
  try {
    const order = await createOrder(parsed.data, 'pending_payment');
    const session = await createCheckoutSession(order, paymentMethod);
    return NextResponse.json({ url: session.checkout_url, orderId: order.id });
  } catch (e) {
    console.error('[checkout/paymongo] failed', e);
    return NextResponse.json({ error: 'Could not start the payment. Please try again or choose Cash on Delivery.' }, { status: 502 });
  }
}
