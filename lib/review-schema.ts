// Client-safe part of the reviews module: types, zod schema and pure maths. No Node or Supabase imports,
// so client components (the review form and list) can share validation with the API route.
import { z } from 'zod';
import { product, type Print } from '@/content/product';

export type ReviewStatus = 'pending' | 'approved' | 'rejected';
export type Review = {
  id: string;
  created_at: string;
  status: ReviewStatus;
  name: string;
  city: string | null;
  stars: number;
  title: string | null;
  body: string;
  print: Print | null;
  order_no: string | null;
  verified: boolean;
  photo_url: string | null;
  helpful: number;
  owner_reply: string | null;
  source: string;
};
export type Sort = 'newest' | 'highest' | 'lowest' | 'helpful';
export type Summary = { count: number; average: number; distribution: Record<1 | 2 | 3 | 4 | 5, number>; verifiedCount: number };
export const EMPTY_SUMMARY: Summary = { count: 0, average: 0, distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }, verifiedCount: 0 };
export const ORDER_NO = /^LP-\d{6}-[A-Z0-9]{4}$/;

const optional = (max: number) => z.union([z.literal('').transform(() => undefined), z.string().trim().max(max)]).optional();
export const reviewSchema = z.object({
  name: z.string().trim().min(2, 'Tell us your first name').max(40),
  city: optional(40),
  stars: z.number().int().min(1, 'Pick a star rating').max(5),
  title: optional(80),
  body: z.string().trim().min(20, 'Tell us a little more (at least 20 characters)').max(800, 'Keep it under 800 characters'),
  print: z.union([z.literal('').transform(() => undefined), z.enum(product.prints)]).optional(),
  orderNo: z.union([z.literal('').transform(() => undefined), z.string().trim().toUpperCase().regex(ORDER_NO, 'Order numbers look like LP-260906-AB12')]).optional(),
  website: z.literal('').optional(), // honeypot
});
export type ReviewInput = z.infer<typeof reviewSchema>;

/** Pure summary maths, shared by the store and the unit tests. */
export function summarize(items: Pick<Review, 'stars' | 'verified'>[]): Summary {
  const distribution: Summary['distribution'] = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  let total = 0, verifiedCount = 0;
  for (const r of items) {
    const s = Math.min(5, Math.max(1, Math.round(r.stars))) as 1 | 2 | 3 | 4 | 5;
    distribution[s]++; total += s; if (r.verified) verifiedCount++;
  }
  const count = items.length;
  return { count, average: count ? Math.round((total / count) * 10) / 10 : 0, distribution, verifiedCount };
}

