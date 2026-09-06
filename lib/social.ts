// Server side of social proof: cached, anonymised order stats. Thresholds and formatting live in social-shared.ts
// so client components can import them without dragging the order store (node:fs, Supabase) into the browser bundle.
import { unstable_cache } from 'next/cache';
import { publicOrderStats, type PublicStats } from './orders';
import { TOAST_WINDOW_DAYS } from './social-shared';

export * from './social-shared';
export const EMPTY_STATS: PublicStats = { orders: 0, recent: [] };

export const getOrderStatsCached = unstable_cache(
  async () => { try { return await publicOrderStats(8); } catch (e) { console.warn('[social] order stats unavailable:', (e as Error).message); return EMPTY_STATS; } },
  ['order-stats'], { revalidate: 300, tags: ['orders'] },
);

/** Orders in the toast window, newest first. */
export const recentWithinWindow = (stats: PublicStats, now = Date.now()) =>
  stats.recent.filter((r) => now - new Date(r.at).getTime() < TOAST_WINDOW_DAYS * 86_400_000);
