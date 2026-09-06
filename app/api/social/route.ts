import { NextResponse } from 'next/server';
import { tierById } from '@/content/product';
import { publicOrderStats } from '@/lib/orders';
import { recentWithinWindow, SHOW_TOASTS_FROM } from '@/lib/social';

export const runtime = 'nodejs';

/** Anonymised recent orders for the "someone just ordered" toast. Empty until there are enough real orders. */
export async function GET() {
  try {
    const stats = await publicOrderStats(8);
    const recent = recentWithinWindow(stats);
    const items = recent.length >= SHOW_TOASTS_FROM ? recent.map((r) => ({ city: r.city, tier: tierById(r.tier).name, at: r.at })) : [];
    return NextResponse.json({ items }, { headers: { 'cache-control': 'public, max-age=60, s-maxage=60' } });
  } catch {
    return NextResponse.json({ items: [] });
  }
}
