'use client';
import { useSyncExternalStore } from 'react';
import { ButtonLink } from '@/components/ui';
import { copy } from '@/content/copy';
import { product } from '@/content/product';
import { peso } from '@/lib/pricing';

// Shown once the hero Buy button (#hero-buy) has scrolled above the viewport. Reads the layout on
// scroll/resize through useSyncExternalStore, so it is deterministic regardless of hydration order.
const subscribe = (cb: () => void) => {
  window.addEventListener('scroll', cb, { passive: true });
  window.addEventListener('resize', cb);
  return () => { window.removeEventListener('scroll', cb); window.removeEventListener('resize', cb); };
};
const heroButtonAbove = () => { const el = document.getElementById('hero-buy'); return !!el && el.getBoundingClientRect().bottom < 0; };

/** Mobile-only bottom bar; slides in once #hero-buy has scrolled above the viewport. */
export function StickyBuyBar() {
  const show = useSyncExternalStore(subscribe, heroButtonAbove, () => false);
  return (
    <div
      inert={!show}
      className={`fixed inset-x-0 bottom-0 z-30 flex items-center justify-between gap-3 border-t border-border bg-white/96 px-4 pt-3 shadow-[0_-8px_24px_rgba(30,36,48,0.12)] transition-[transform,opacity,visibility] duration-300 motion-reduce:transition-none lg:hidden ${show ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0 invisible'}`}
      style={{ paddingBottom: 'calc(12px + env(safe-area-inset-bottom))' }}
    >
      <div className="flex flex-col">
        <span className="font-display text-[22px] font-bold leading-none text-ink">{peso(product.prices.solo)}</span>
        <span className="text-[11px] font-bold text-muted">{copy.stickyBar.sub}</span>
      </div>
      <ButtonLink href="/checkout" size="md" icon="cart" className="flex-[1_1_auto]">{copy.stickyBar.button}</ButtonLink>
    </div>
  );
}
