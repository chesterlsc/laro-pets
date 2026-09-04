import { product, tierById, type TierId } from '@/content/product';

export type CartInput = { tier: TierId; extraRefills: number };
export type Quote = { subtotal: number; shipping: number; total: number; remaining: number };

export const clampRefills = (n: number) => Math.min(product.limits.maxExtraRefills, Math.max(0, Math.floor(n) || 0));

export const subtotalFor = ({ tier, extraRefills }: CartInput) => tierById(tier).price + clampRefills(extraRefills) * product.prices.refill;

export const shippingFor = (subtotal: number) => (subtotal >= product.shipping.freeFrom ? 0 : product.shipping.fee);

/** ₱ still needed to unlock free shipping (0 when already free). */
export const remainingForFreeShipping = (subtotal: number) => Math.max(0, product.shipping.freeFrom - subtotal);

export function quote(input: CartInput): Quote {
  const subtotal = subtotalFor(input);
  const shipping = shippingFor(subtotal);
  return { subtotal, shipping, total: subtotal + shipping, remaining: remainingForFreeShipping(subtotal) };
}

/** ₱799 → "₱799", 1679 → "₱1,679" (no decimals) */
export const peso = (n: number) => '₱' + Math.round(n).toLocaleString('en-PH', { maximumFractionDigits: 0 });
