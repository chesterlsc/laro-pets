import { describe, expect, it } from 'vitest';
import { quote, peso, clampRefills } from './pricing';
import { product } from '@/content/product';

describe('pricing', () => {
  it.each([
    ['solo', 0, 799, 79, 878],
    ['solo', 1, 948, 0, 948],
    ['solo', 2, 1097, 0, 1097],
    ['solo', 3, 1246, 0, 1246],
    ['bundle', 0, 899, 0, 899],
    ['bundle', 1, 1048, 0, 1048],
    ['bundle', 2, 1197, 0, 1197],
    ['bundle', 3, 1346, 0, 1346],
    ['multi', 0, 1679, 0, 1679],
    ['multi', 1, 1828, 0, 1828],
    ['multi', 2, 1977, 0, 1977],
    ['multi', 3, 2126, 0, 2126],
  ] as const)('%s + %i refills → subtotal %i, shipping %i, total %i', (tier, extraRefills, subtotal, shipping, total) => {
    expect(quote({ tier, extraRefills })).toMatchObject({ subtotal, shipping, total });
  });

  it('shipping flips to free at exactly ₱899', () => {
    expect(quote({ tier: 'solo', extraRefills: 0 }).shipping).toBe(79);
    expect(quote({ tier: 'bundle', extraRefills: 0 }).subtotal).toBe(899);
    expect(quote({ tier: 'bundle', extraRefills: 0 }).shipping).toBe(0);
  });

  it('Solo + 1 refill = ₱948 with free shipping', () => {
    expect(quote({ tier: 'solo', extraRefills: 1 })).toEqual({ subtotal: 948, shipping: 0, total: 948, remaining: 0 });
  });

  it('Solo alone needs ₱100 more for free shipping', () => {
    expect(quote({ tier: 'solo', extraRefills: 0 }).remaining).toBe(100);
  });

  it('Multi-Cat total is ₱1,679 and formats with a comma', () => {
    expect(quote({ tier: 'multi', extraRefills: 0 }).total).toBe(1679);
    expect(peso(1679)).toBe('₱1,679');
    expect(peso(799)).toBe('₱799');
  });

  it('savings shown are 128 / 147', () => {
    const [solo, bundle, multi] = product.tiers;
    expect(bundle.save).toBe(solo.price + product.prices.refill + product.shipping.fee - bundle.price); // 128
    expect(multi.save).toBe(solo.price * 2 + product.prices.refill + product.shipping.fee - multi.price); // 147
    expect(bundle.save).toBe(128);
    expect(multi.save).toBe(147);
  });

  it('clamps extra refills to 0–3', () => {
    expect(clampRefills(-1)).toBe(0);
    expect(clampRefills(9)).toBe(3);
    expect(clampRefills(NaN)).toBe(0);
  });
});
