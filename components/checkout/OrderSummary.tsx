'use client';
import { copy } from '@/content/copy';
import { product, tierById } from '@/content/product';
import { Icon } from '@/components/icons';
import { useCart } from '@/lib/cart';
import { peso, quote } from '@/lib/pricing';

function Lines() {
  const { cart } = useCart();
  const tier = tierById(cart.tier);
  const q = quote(cart);
  const row = 'flex items-start justify-between gap-4 text-[15px]';
  return (
    <div className="flex flex-col gap-3">
      <div className={row}>
        <span><b>{tier.name}</b><span className="block text-[13px] text-muted">{tier.contents} · {cart.prints.map((p, i) => `Mat ${i + 1}: ${p}`).join(' · ')}</span></span>
        <span className="font-bold">{peso(tier.price)}</span>
      </div>
      {cart.extraRefills > 0 && (
        <div className={row}><span>Extra refill packs × {cart.extraRefills}</span><span className="font-bold">{peso(cart.extraRefills * product.prices.refill)}</span></div>
      )}
      <hr className="m-0 border-0 border-t border-border" />
      <div className={row}><span className="text-muted">Subtotal</span><span>{peso(q.subtotal)}</span></div>
      <div className={row}><span className="text-muted">Shipping</span><span className={q.shipping ? '' : 'font-extrabold text-primary'}>{q.shipping ? peso(q.shipping) : 'FREE'}</span></div>
      {q.remaining > 0 && <p className="text-[13px] font-bold text-cta">{peso(q.remaining)} more for free shipping</p>}
      <div className="flex items-baseline justify-between border-t border-border pt-3">
        <span className="font-extrabold">Total</span>
        <span className="font-display text-[28px] font-bold leading-none">{peso(q.total)}</span>
      </div>
      <p className="flex items-center gap-[6px] text-[13px] text-muted"><Icon name="box" size={16} />Max {product.limits.maxMatsPerOrder} mats per order · {copy.stickyBar.sub}</p>
    </div>
  );
}

export function OrderSummary() {
  const { cart } = useCart();
  return (
    <>
      <details className="rounded-card border border-border bg-white p-5 lg:hidden">
        <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between font-display text-[18px] font-bold">
          <span>Order summary · {peso(quote(cart).total)}</span>
          <Icon name="chevron" />
        </summary>
        <div className="pt-4"><Lines /></div>
      </details>
      <aside className="hidden rounded-card border border-border bg-white p-6 lg:sticky lg:top-6 lg:block xl:p-7" aria-label="Order summary">
        <h2 className="mb-4 text-[24px]">Order summary</h2>
        <Lines />
      </aside>
    </>
  );
}
