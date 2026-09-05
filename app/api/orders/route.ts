import { NextResponse, after } from 'next/server';
import { orderSchema } from '@/lib/order-schema';
import { createOrder, findRecentCod } from '@/lib/orders';
import { sendOrderEmails } from '@/lib/email';

export const runtime = 'nodejs';
const DUPLICATE_WINDOW_MIN = 10;

export async function POST(req: Request) {
  const parsed = orderSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ errors: parsed.error.flatten() }, { status: 400 });
  if (parsed.data.paymentMethod !== 'cod') return NextResponse.json({ errors: { formErrors: ['Online payments go through /api/checkout/paymongo'], fieldErrors: {} } }, { status: 400 });
  try {
    const recent = await findRecentCod(parsed.data.customer.mobile, DUPLICATE_WINDOW_MIN);
    if (recent) return NextResponse.json({ error: `We already have Cash on Delivery order ${recent.order_no} from this number. Message us if you need to change it.` }, { status: 429 });
    const order = await createOrder(parsed.data, 'pending_cod');
    after(() => sendOrderEmails(order).catch((e) => console.error('[orders] email failed', e)));
    return NextResponse.json({ orderId: order.id, orderNo: order.order_no, total: order.total }, { status: 201 });
  } catch (e) {
    console.error('[orders] create failed', e);
    return NextResponse.json({ error: 'Could not save your order. Please try again.' }, { status: 500 });
  }
}
