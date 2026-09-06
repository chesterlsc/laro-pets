import { NextResponse } from 'next/server';
import { createReview, listApprovedReviews, postedRecently, reviewSchema, type Sort } from '@/lib/reviews';

export const runtime = 'nodejs';
const SORTS: Sort[] = ['newest', 'highest', 'lowest', 'helpful'];

export async function POST(req: Request) {
  const parsed = reviewSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ errors: parsed.error.flatten() }, { status: 400 });
  try {
    if (await postedRecently(parsed.data.name, 10)) return NextResponse.json({ error: 'You just posted a review — give it a few minutes before adding another.' }, { status: 429 });
    const review = await createReview(parsed.data);
    return NextResponse.json({ id: review.id, status: review.status, verified: review.verified }, { status: 201 });
  } catch (e) {
    console.error('[reviews] create failed', e);
    return NextResponse.json({ error: 'Could not save your review. Please try again.' }, { status: 500 });
  }
}

export async function GET(req: Request) {
  const u = new URL(req.url);
  const stars = Number(u.searchParams.get('stars') ?? 0) || 0;
  const sort = (SORTS.includes(u.searchParams.get('sort') as Sort) ? u.searchParams.get('sort') : 'newest') as Sort;
  const limit = Number(u.searchParams.get('limit') ?? 8) || 8;
  const offset = Number(u.searchParams.get('offset') ?? 0) || 0;
  try {
    return NextResponse.json(await listApprovedReviews({ stars: stars >= 1 && stars <= 5 ? stars : 0, sort, limit, offset }), { headers: { 'cache-control': 'public, max-age=60' } });
  } catch (e) {
    console.error('[reviews] list failed', e);
    return NextResponse.json({ items: [], total: 0 });
  }
}
