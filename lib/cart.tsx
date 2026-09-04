'use client';
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { DEFAULT_TIER, product, tierById, type Print, type TierId } from '@/content/product';
import { clampRefills } from './pricing';

export type Cart = { tier: TierId; extraRefills: number; prints: Print[] };
type CartCtx = {
  cart: Cart;
  ready: boolean;
  setTier: (tier: TierId) => void;
  setExtraRefills: (n: number) => void;
  setPrint: (matIndex: number, print: Print) => void;
  reset: () => void;
};

const KEY = 'laro-cart';
const initial: Cart = { tier: DEFAULT_TIER, extraRefills: 0, prints: ['fish'] };

/** Prints array always has exactly `mats` entries for the tier. */
export const normalizeCart = (c: Partial<Cart> | null | undefined): Cart => {
  const tier = product.tiers.some((t) => t.id === c?.tier) ? (c!.tier as TierId) : DEFAULT_TIER;
  const mats = tierById(tier).mats;
  const prints = Array.from({ length: mats }, (_, i) => (product.prints.includes(c?.prints?.[i] as Print) ? (c!.prints![i] as Print) : 'fish'));
  return { tier, extraRefills: clampRefills(c?.extraRefills ?? 0), prints };
};

const Ctx = createContext<CartCtx | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<Cart>(initial);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setCart(normalizeCart(JSON.parse(raw)));
    } catch {}
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try { localStorage.setItem(KEY, JSON.stringify(cart)); } catch {}
  }, [cart, ready]);

  const value: CartCtx = {
    cart,
    ready,
    setTier: (tier) => setCart((c) => normalizeCart({ ...c, tier })),
    setExtraRefills: (n) => setCart((c) => ({ ...c, extraRefills: clampRefills(n) })),
    setPrint: (i, print) => setCart((c) => ({ ...c, prints: c.prints.map((p, idx) => (idx === i ? print : p)) })),
    reset: () => setCart(initial),
  };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useCart() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useCart must be used inside <CartProvider>');
  return ctx;
}
