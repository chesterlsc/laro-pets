import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { placeholders } from '@/content/placeholders';
import { tierById } from '@/content/product';
import { Icon } from '@/components/icons';
import { ButtonLink, Container, IconTile } from '@/components/ui';
import { PurchaseTracker } from '@/components/checkout/PurchaseTracker';
import { getOrder, lineItems } from '@/lib/orders';
import { peso } from '@/lib/pricing';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Order confirmed', robots: { index: false } };

export default async function ThankYouPage({ params, searchParams }: { params: Promise<{ orderId: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const [{ orderId }, sp] = await Promise.all([params, searchParams]);
  const order = await getOrder(orderId);
  if (!order) notFound();
  const tier = tierById(order.items.tier);
  const cod = order.payment_method === 'cod';
  const row = 'flex items-start justify-between gap-4 text-[15px]';

  return (
    <main className="py-10 xl:py-16">
      <Container className="max-w-[760px]">
        <PurchaseTracker orderNo={order.order_no} value={order.total} items={lineItems(order)} />
        <div className="flex flex-col gap-6 rounded-card border border-border bg-white p-6 xl:p-10">
          <IconTile icon="check" size={72} radius={22} iconSize={36} />
          <div className="flex flex-col gap-2">
            <h1 className="text-[32px] leading-[1.1] xl:text-[44px]">Salamat! Order {order.order_no} is in.</h1>
            <p className="text-[16px] text-muted">We&apos;ll text {order.customer.mobile} with updates.</p>
          </div>

          {order.status === 'paid' && <p className="flex items-center gap-2 text-[15px] font-extrabold text-primary"><Icon name="check" size={18} />Payment received</p>}
          {order.status === 'pending_payment' && sp.paid === '1' && <p role="status" className="flex items-center gap-2 text-[15px] font-bold text-muted"><Icon name="lock" size={18} />Confirming your payment… this page updates once PayMongo confirms.</p>}

          <div className="flex flex-col gap-3 rounded-inner bg-bg p-5">
            <div className={row}>
              <span><b>{tier.name}</b><span className="block text-[13px] text-muted">{tier.contents} · {order.items.prints.map((p, i) => `Mat ${i + 1}: ${p}`).join(' · ')}</span></span>
              <span className="font-bold">{peso(tier.price)}</span>
            </div>
            {order.items.extraRefills > 0 && <div className={row}><span>Extra refill packs × {order.items.extraRefills}</span><span className="font-bold">{peso(order.subtotal - tier.price)}</span></div>}
            <div className={row + ' border-t border-border pt-3'}><span className="text-muted">Subtotal</span><span>{peso(order.subtotal)}</span></div>
            <div className={row}><span className="text-muted">Shipping</span><span className={order.shipping ? '' : 'font-extrabold text-primary'}>{order.shipping ? peso(order.shipping) : 'FREE'}</span></div>
            <div className="flex items-baseline justify-between border-t border-border pt-3"><span className="font-extrabold">Total</span><span className="font-display text-[28px] font-bold leading-none">{peso(order.total)}</span></div>
          </div>

          {cod && (
            <div className="flex items-center gap-4 rounded-inner border border-dashed border-[#FF6A45] bg-tint2 p-5">
              <IconTile icon="cod" />
              <div><p className="font-display text-[20px] font-bold">Prepare {peso(order.total)} in cash</p><p className="text-[14px] text-muted">Pay the courier when your order arrives.</p></div>
            </div>
          )}

          <div>
            <h2 className="mb-3 text-[24px]">What happens next</h2>
            <ol className="m-0 flex list-none flex-col gap-3 p-0">
              {['We pack your order today.', 'The courier picks it up.', `You get a tracking number by SMS within ${placeholders.deliveryDaysMetroManila} days (Metro Manila) or ${placeholders.deliveryDaysProvinces} days (provinces).`].map((s, i) => (
                <li key={i} className="flex items-center gap-3 text-[16px]"><span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-cta font-display text-[15px] font-bold text-white shadow-step">{i + 1}</span>{s}</li>
              ))}
            </ol>
          </div>

          <p className="text-[14px] text-muted">Delivering to {[order.address.line1, order.address.barangay, order.address.city, order.address.province, order.address.zip].join(', ')}</p>
          <ButtonLink href="/" variant="ink" icon="arrow">Back to Laro Pets</ButtonLink>
        </div>
      </Container>
    </main>
  );
}
