import { describe, expect, it } from 'vitest';
import { reviewSchema, summarize } from './review-schema';

const base = { name: 'Chester', city: 'Quezon City', stars: 5, title: '', body: 'Si Mochi stalked the feather for ten minutes straight.', print: 'fish', orderNo: '', website: '' };

describe('review schema', () => {
  it('accepts a valid review and drops empty optionals', () => {
    const r = reviewSchema.parse(base);
    expect(r.title).toBeUndefined();
    expect(r.orderNo).toBeUndefined();
    expect(r.print).toBe('fish');
  });
  it('rejects short bodies, bad stars, bad order numbers and a filled honeypot', () => {
    expect(reviewSchema.safeParse({ ...base, body: 'Nice' }).success).toBe(false);
    expect(reviewSchema.safeParse({ ...base, stars: 0 }).success).toBe(false);
    expect(reviewSchema.safeParse({ ...base, orderNo: 'ORDER-1' }).success).toBe(false);
    expect(reviewSchema.safeParse({ ...base, website: 'http://spam' }).success).toBe(false);
  });
  it('normalises the order number', () => {
    expect(reviewSchema.parse({ ...base, orderNo: 'lp-260906-ab12' }).orderNo).toBe('LP-260906-AB12');
  });
});

describe('summarize', () => {
  it('computes count, 1-decimal average, distribution and verified count', () => {
    const s = summarize([{ stars: 5, verified: true }, { stars: 4, verified: false }, { stars: 5, verified: true }, { stars: 2, verified: false }]);
    expect(s).toEqual({ count: 4, average: 4, distribution: { 1: 0, 2: 1, 3: 0, 4: 1, 5: 2 }, verifiedCount: 2 });
    expect(summarize([{ stars: 5, verified: false }, { stars: 4, verified: false }, { stars: 4, verified: false }]).average).toBe(4.3);
  });
  it('is empty for no reviews', () => {
    expect(summarize([]).count).toBe(0);
    expect(summarize([]).average).toBe(0);
  });
});
