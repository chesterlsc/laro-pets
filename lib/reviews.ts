// Customer reviews. Same backend rules as orders: Supabase when configured, a local JSON file for dev/e2e,
// and a hard error on Vercel without Supabase. Reviews start as 'pending'; the owner approves them in Supabase.
import { randomUUID } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { createClient } from '@supabase/supabase-js';
import { unstable_cache } from 'next/cache';
import { getOrderByNo } from './orders';
import { EMPTY_SUMMARY, summarize, type Review, type ReviewInput, type Sort, type Summary } from './review-schema';

export * from './review-schema';

type ListOpts = { stars?: number; sort?: Sort; limit?: number; offset?: number };
type Store = {
  insert(r: Review): Promise<void>;
  listApproved(o: Required<ListOpts>): Promise<{ items: Review[]; total: number }>;
  approvedForSummary(): Promise<Pick<Review, 'stars' | 'verified'>[]>;
  bumpHelpful(id: string): Promise<number | null>;
  recentByName(name: string, sinceIso: string): Promise<boolean>;
};

const sortRows = (rows: Review[], sort: Sort) =>
  [...rows].sort((a, b) =>
    sort === 'highest' ? b.stars - a.stars || b.created_at.localeCompare(a.created_at)
    : sort === 'lowest' ? a.stars - b.stars || b.created_at.localeCompare(a.created_at)
    : sort === 'helpful' ? b.helpful - a.helpful || b.created_at.localeCompare(a.created_at)
    : b.created_at.localeCompare(a.created_at));

function supabaseStore(url: string, key: string): Store {
  const sb = createClient(url, key, { auth: { persistSession: false } });
  const fail = (e: { message: string } | null) => { if (e) throw new Error(`Supabase: ${e.message}`); };
  return {
    async insert(r) { fail((await sb.from('reviews').insert(r)).error); },
    async listApproved({ stars, sort, limit, offset }) {
      let q = sb.from('reviews').select('*', { count: 'exact' }).eq('status', 'approved');
      if (stars) q = q.eq('stars', stars);
      q = sort === 'highest' ? q.order('stars', { ascending: false }).order('created_at', { ascending: false })
        : sort === 'lowest' ? q.order('stars', { ascending: true }).order('created_at', { ascending: false })
        : sort === 'helpful' ? q.order('helpful', { ascending: false }).order('created_at', { ascending: false })
        : q.order('created_at', { ascending: false });
      const r = await q.range(offset, offset + limit - 1); fail(r.error);
      return { items: (r.data as Review[]) ?? [], total: r.count ?? 0 };
    },
    async approvedForSummary() { const r = await sb.from('reviews').select('stars,verified').eq('status', 'approved'); fail(r.error); return (r.data as Pick<Review, 'stars' | 'verified'>[]) ?? []; },
    async bumpHelpful(id) {
      const cur = await sb.from('reviews').select('helpful').eq('id', id).eq('status', 'approved').maybeSingle(); fail(cur.error);
      if (!cur.data) return null;
      const next = (cur.data.helpful as number) + 1;
      const r = await sb.from('reviews').update({ helpful: next }).eq('id', id).select('helpful').maybeSingle(); fail(r.error);
      return (r.data?.helpful as number | undefined) ?? next;
    },
    async recentByName(name, sinceIso) { const r = await sb.from('reviews').select('id').ilike('name', name).gte('created_at', sinceIso).limit(1); fail(r.error); return (r.data?.length ?? 0) > 0; },
  };
}

// Local development / e2e only — never used on Vercel (getStore throws instead).
function fileStore(): Store {
  const file = path.join(process.cwd(), '.data', 'reviews.json');
  const readAll = async (): Promise<Review[]> => { try { return JSON.parse(await readFile(file, 'utf8')); } catch { return []; } };
  const writeAll = async (rows: Review[]) => { await mkdir(path.dirname(file), { recursive: true }); await writeFile(file, JSON.stringify(rows, null, 2)); };
  const approved = async () => (await readAll()).filter((r) => r.status === 'approved');
  return {
    async insert(r) { const rows = await readAll(); rows.push(r); await writeAll(rows); },
    async listApproved({ stars, sort, limit, offset }) {
      const rows = sortRows((await approved()).filter((r) => !stars || r.stars === stars), sort);
      return { items: rows.slice(offset, offset + limit), total: rows.length };
    },
    approvedForSummary: approved,
    async bumpHelpful(id) {
      const rows = await readAll(); const i = rows.findIndex((r) => r.id === id && r.status === 'approved'); if (i < 0) return null;
      rows[i].helpful += 1; await writeAll(rows); return rows[i].helpful;
    },
    async recentByName(name, sinceIso) { return (await readAll()).some((r) => r.name.toLowerCase() === name.toLowerCase() && r.created_at >= sinceIso); },
  };
}

let store: Store | undefined;
function getStore(): Store {
  if (store) return store;
  const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = process.env;
  if (SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) store = supabaseStore(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
  else if (process.env.VERCEL) throw new Error('Reviews need SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY');
  else store = fileStore();
  return store;
}

export async function createReview(input: ReviewInput): Promise<Review> {
  const order = input.orderNo ? await getOrderByNo(input.orderNo).catch(() => null) : null;
  const review: Review = {
    id: randomUUID(),
    created_at: new Date().toISOString(),
    status: 'pending',
    name: input.name,
    city: input.city ?? null,
    stars: input.stars,
    title: input.title ?? null,
    body: input.body,
    print: input.print ?? null,
    order_no: input.orderNo ?? null,
    verified: !!order,
    photo_url: null,
    helpful: 0,
    owner_reply: null,
    source: 'site',
  };
  await getStore().insert(review);
  return review;
}

export const listApprovedReviews = (o: ListOpts = {}) =>
  getStore().listApproved({ stars: o.stars ?? 0, sort: o.sort ?? 'newest', limit: Math.min(40, Math.max(1, o.limit ?? 8)), offset: Math.max(0, o.offset ?? 0) });
export const reviewSummary = async (): Promise<Summary> => summarize(await getStore().approvedForSummary());
export const markHelpful = (id: string) => getStore().bumpHelpful(id);
export const postedRecently = (name: string, minutes: number) => getStore().recentByName(name, new Date(Date.now() - minutes * 60_000).toISOString());

// Cached for the static home page (5-minute revalidation). Never throws: an unconfigured store just means "no reviews yet".
export const getReviewSummaryCached = unstable_cache(
  async () => { try { return await reviewSummary(); } catch (e) { console.warn('[reviews] summary unavailable:', (e as Error).message); return EMPTY_SUMMARY; } },
  ['reviews-summary'], { revalidate: 300, tags: ['reviews'] },
);
export const getApprovedReviewsCached = unstable_cache(
  async (limit: number) => { try { return (await listApprovedReviews({ limit })).items; } catch (e) { console.warn('[reviews] list unavailable:', (e as Error).message); return [] as Review[]; } },
  ['reviews-list'], { revalidate: 300, tags: ['reviews'] },
);
