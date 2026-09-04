'use client';
import { useEffect, useState } from 'react';
import { Icon } from '@/components/icons';
import { ButtonLink } from '@/components/ui';
import { copy } from '@/content/copy';
import { tierById } from '@/content/product';
import { useCart } from '@/lib/cart';

/** Mats-in-cart badge (mobile only). Renders 0 until the cart has hydrated. */
export function CartBadge() {
  const { cart, ready } = useCart();
  const n = ready ? tierById(cart.tier).mats : 0;
  return (
    <span className="absolute -top-[6px] -right-2 flex h-[18px] w-[18px] items-center justify-center rounded-full bg-cta text-[11px] font-extrabold text-white lg:hidden">
      <span className="sr-only">Mats in cart: </span>{n}
    </span>
  );
}

/** Hamburger + slide-down nav (mobile only). */
export function MobileMenu() {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);
  const closeMenu = () => setOpen(false);
  return (
    <>
      <button type="button" aria-label="Menu" aria-expanded={open} aria-controls="mobile-menu" onClick={() => setOpen((o) => !o)} className="-ml-2 flex h-11 w-11 cursor-pointer items-center justify-center text-ink lg:hidden">
        <Icon name={open ? 'close' : 'menu'} size={26} />
      </button>
      <nav id="mobile-menu" hidden={!open} aria-label="Menu" className="absolute inset-x-0 top-full flex flex-col border-t border-border bg-bg px-5 py-3 shadow-card lg:hidden">
        {copy.nav.map((l) => (
          <a key={l.href} href={l.href} onClick={closeMenu} className="py-3 text-[17px] font-bold text-ink no-underline">{l.label}</a>
        ))}
        <ButtonLink href="/checkout" size="md" full className="mt-3" onClick={closeMenu}>{copy.header.buyNow}</ButtonLink>
      </nav>
    </>
  );
}
