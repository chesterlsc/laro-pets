'use client';
import { useState, useSyncExternalStore, type FormEvent } from 'react';
import { Icon, Star, Stars } from '@/components/icons';
import { Button, Chip } from '@/components/ui';
import { PawPrint } from '@/components/fx/sprites';
import { categoryFeedback } from '@/content/categoryFeedback';
import { copy } from '@/content/copy';
import { product } from '@/content/product';
import { reviewSchema, type Review, type Sort, type Summary } from '@/lib/review-schema';
import { StarPicker } from './StarPicker';

const e = copy.reviewsEngine;
const SORTS = Object.keys(e.sorts) as Sort[];
const VOTED_KEY = 'laro-helpful';
const readVoted = (): string[] => { try { return JSON.parse(localStorage.getItem(VOTED_KEY) ?? '[]'); } catch { return []; } };
const noSub = () => () => {};
const votedSnapshot = () => localStorage.getItem(VOTED_KEY) ?? '[]';
// ?order=LP-… from the thank-you page, read without useSearchParams so the list still server-renders on the static home page.
const orderParam = () => (new URLSearchParams(window.location.search).get('order') ?? '').toUpperCase();

function fmtDate(iso: string) { return new Date(iso).toLocaleDateString('en-PH', { month: 'short', year: 'numeric' }); }

function ReviewCard({ r, voted, onVote }: { r: Review; voted: boolean; onVote: (id: string) => void }) {
  const [open, setOpen] = useState(false);
  const long = r.body.length > 280;
  return (
    <article className="flex flex-col gap-3 rounded-card border border-border bg-surface p-[22px]">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Stars count={r.stars} size={16} />
        {r.verified && <span className="inline-flex items-center gap-1 rounded-full bg-tint px-2 py-[3px] text-[11px] font-extrabold uppercase tracking-[0.08em] text-primary"><Icon name="check" size={12} />{e.verified}</span>}
      </div>
      {r.title && <h3 className="text-[18px]">{r.title}</h3>}
      <p className={`text-[15px] leading-[1.6] text-ink ${!open && long ? 'line-clamp-5' : ''}`}>{r.body}</p>
      {long && <button type="button" onClick={() => setOpen((o) => !o)} className="self-start text-[13px] font-extrabold text-primary underline-offset-2 hover:underline">{open ? e.readLess : e.readMore}</button>}
      {/* Owner-curated photo URLs live on any host, so a plain img is used instead of next/image remotePatterns. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      {r.photo_url && <img src={r.photo_url} alt={`Photo from ${r.name}`} loading="lazy" className="h-[180px] w-full rounded-inner object-cover" />}
      {r.owner_reply && (
        <div className="rounded-inner bg-bg p-3 text-[14px] leading-[1.6]"><span className="mb-1 block text-[11px] font-extrabold uppercase tracking-[0.1em] text-primary">{e.replied}</span>{r.owner_reply}</div>
      )}
      <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-1">
        <div className="flex items-center gap-[10px]">
          <span className="flex h-[34px] w-[34px] items-center justify-center rounded-full bg-tint text-primary"><Icon name="user" size={18} /></span>
          <span className="flex flex-col">
            <span className="text-[14px] font-extrabold">{r.name}</span>
            <span className="text-[12px] text-muted">{[r.city, fmtDate(r.created_at)].filter(Boolean).join(' · ')}{r.print ? ` · ${r.print} print` : ''}</span>
          </span>
        </div>
        <button type="button" disabled={voted} onClick={() => onVote(r.id)} aria-pressed={voted} className="inline-flex min-h-11 items-center gap-2 rounded-full border-2 border-border px-3 text-[13px] font-extrabold text-muted transition-colors hover:border-primary hover:text-primary disabled:cursor-default disabled:border-tint disabled:text-primary">
          <PawPrint size={14} />{e.helpful} · {r.helpful}
        </button>
      </div>
    </article>
  );
}

function ReviewForm({ initialOrder, onDone }: { initialOrder: string; onDone: () => void }) {
  const f = e.form;
  const [stars, setStars] = useState(0);
  const [body, setBody] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState('');
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<null | { verified: boolean }>(null);
  const field = (err?: string) => `w-full rounded-inner border-2 bg-white px-4 py-3 font-body text-[16px] text-ink outline-none transition-colors focus:border-primary ${err ? 'border-cta' : 'border-border'}`;

  async function onSubmit(ev: FormEvent<HTMLFormElement>) {
    ev.preventDefault();
    const d = new FormData(ev.currentTarget);
    const s = (k: string) => String(d.get(k) ?? '');
    const payload = { name: s('name'), city: s('city'), stars, title: s('title'), body: s('body'), print: s('print'), orderNo: s('orderNo'), website: s('website') };
    const parsed = reviewSchema.safeParse(payload);
    if (!parsed.success) {
      const next: Record<string, string> = {};
      for (const i of parsed.error.issues) next[i.path.join('.')] ??= i.message;
      setErrors(next); return;
    }
    setErrors({}); setServerError(''); setBusy(true);
    try {
      const res = await fetch('/api/reviews', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(payload) });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error ?? json.errors?.formErrors?.[0] ?? 'Something went wrong. Please try again.');
      setDone({ verified: !!json.verified });
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally { setBusy(false); }
  }

  if (done) {
    return (
      <div role="status" className="flex flex-col items-center gap-3 rounded-card border border-border bg-surface p-8 text-center">
        <PawPrint size={56} className="fx-intro-paw text-cta" />
        <p className="font-display text-[24px] font-bold">{f.success}</p>
        <p className="text-[15px] text-muted">{f.successBody}{done.verified ? ` It will carry the “${e.verified}” badge.` : ''}</p>
        <Button variant="secondary" size="md" onClick={onDone}>{e.cancel}</Button>
      </div>
    );
  }
  return (
    <form onSubmit={onSubmit} noValidate className="relative grid gap-4 rounded-card border border-border bg-surface p-6 md:grid-cols-2 xl:p-7">
      <div className="md:col-span-2"><StarPicker value={stars} onChange={setStars} label={f.stars} />{errors.stars && <p className="mt-1 text-[13px] font-bold text-cta">{errors.stars}</p>}</div>
      <label className="flex flex-col gap-[6px] text-[14px] font-extrabold">{f.name}<input name="name" required maxLength={40} autoComplete="given-name" className={field(errors.name)} />{errors.name && <span className="text-[13px] text-cta">{errors.name}</span>}</label>
      <label className="flex flex-col gap-[6px] text-[14px] font-extrabold">{f.city}<input name="city" maxLength={40} autoComplete="address-level2" className={field(errors.city)} /></label>
      <label className="flex flex-col gap-[6px] text-[14px] font-extrabold md:col-span-2">{f.title}<input name="title" maxLength={80} className={field(errors.title)} /></label>
      <label className="flex flex-col gap-[6px] text-[14px] font-extrabold md:col-span-2">{f.body}
        <textarea name="body" required rows={4} maxLength={800} value={body} onChange={(ev) => setBody(ev.target.value)} className={field(errors.body)} />
        <span className="flex justify-between text-[12px] font-bold text-muted"><span>{errors.body ? <span className="text-cta">{errors.body}</span> : f.bodyHint}</span><span className="tabular-nums">{body.length}/800</span></span>
      </label>
      <label className="flex flex-col gap-[6px] text-[14px] font-extrabold">{f.print}
        <select name="print" defaultValue="" className={field()}><option value="">—</option>{product.prints.map((p) => <option key={p} value={p}>{p}</option>)}</select>
      </label>
      <label className="flex flex-col gap-[6px] text-[14px] font-extrabold">{f.orderNo}
        <input name="orderNo" defaultValue={initialOrder} placeholder="LP-260906-AB12" maxLength={14} className={`${field(errors.orderNo)} uppercase`} />
        <span className="text-[12px] font-bold text-muted">{errors.orderNo ? <span className="text-cta">{errors.orderNo}</span> : f.orderHint}</span>
      </label>
      <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden"><label>Website<input name="website" type="text" tabIndex={-1} autoComplete="off" /></label></div>
      {serverError && <div role="alert" className="rounded-inner border-2 border-cta bg-tint2 px-4 py-3 text-[15px] font-bold text-cta md:col-span-2">{serverError}</div>}
      <div className="flex flex-wrap gap-3 md:col-span-2">
        <Button type="submit" size="md" disabled={busy}>{busy ? f.submitting : f.submit}</Button>
        <Button type="button" variant="secondary" size="md" onClick={onDone}>{e.cancel}</Button>
      </div>
    </form>
  );
}

export function ReviewsClient({ items: initial, summary }: { items: Review[]; summary: Summary }) {
  const initialOrder = useSyncExternalStore(noSub, orderParam, () => '');
  const [writingState, setWriting] = useState<boolean | null>(null);
  const writing = writingState ?? Boolean(initialOrder);
  const [stars, setStars] = useState(0);
  const [sort, setSort] = useState<Sort>('newest');
  const [extra, setExtra] = useState<Review[]>([]);
  const [loading, setLoading] = useState(false);
  const [votes, setVotes] = useState<Record<string, number>>({});
  const votedRaw = useSyncExternalStore(noSub, votedSnapshot, () => '[]');
  const voted = new Set<string>(JSON.parse(votedRaw) as string[]);

  const all = [...initial, ...extra.filter((x) => !initial.some((i) => i.id === x.id))];
  const shown = all
    .filter((r) => !stars || r.stars === stars)
    .sort((a, b) => sort === 'highest' ? b.stars - a.stars : sort === 'lowest' ? a.stars - b.stars : sort === 'helpful' ? (votes[b.id] ?? b.helpful) - (votes[a.id] ?? a.helpful) : b.created_at.localeCompare(a.created_at));
  const canLoadMore = summary.count > all.length;

  async function loadMore() {
    setLoading(true);
    try {
      const res = await fetch(`/api/reviews?limit=20&offset=${all.length}&sort=newest`);
      const json = await res.json();
      setExtra((x) => [...x, ...(json.items ?? [])]);
    } finally { setLoading(false); }
  }
  async function vote(id: string) {
    if (voted.has(id)) return;
    const next = [...readVoted(), id];
    try { localStorage.setItem(VOTED_KEY, JSON.stringify(next)); } catch {}
    setVotes((v) => ({ ...v, [id]: (v[id] ?? all.find((r) => r.id === id)?.helpful ?? 0) + 1 }));
    fetch(`/api/reviews/${id}/helpful`, { method: 'POST' }).then((r) => r.json()).then((j) => { if (typeof j.helpful === 'number') setVotes((v) => ({ ...v, [id]: j.helpful })); }).catch(() => {});
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {summary.count > 0 ? (
          <div className="flex flex-wrap items-center gap-2">
            {[0, 5, 4, 3, 2, 1].map((n) => (
              <button key={n} type="button" aria-pressed={stars === n} onClick={() => setStars(n)} className={`inline-flex min-h-11 items-center gap-1 rounded-full border-2 px-3 text-[13px] font-extrabold transition-colors ${stars === n ? 'border-primary bg-primary text-white' : 'border-border bg-surface text-ink hover:border-primary'}`}>
                {n === 0 ? e.filterAll : <>{n}<Star size={12} /></>}
                {n > 0 && <span className="text-[11px] opacity-70">({summary.distribution[n as 1 | 2 | 3 | 4 | 5]})</span>}
              </button>
            ))}
            <label className="ml-1 inline-flex items-center gap-2 text-[13px] font-extrabold text-muted">{e.sortLabel}
              <select value={sort} onChange={(ev) => setSort(ev.target.value as Sort)} className="min-h-11 rounded-full border-2 border-border bg-surface px-3 text-[13px] font-extrabold text-ink">
                {SORTS.map((s) => <option key={s} value={s}>{e.sorts[s]}</option>)}
              </select>
            </label>
          </div>
        ) : <span />}
        {!writing && <Button size="md" icon="feather" onClick={() => setWriting(true)}>{e.write}</Button>}
      </div>

      {writing && <ReviewForm initialOrder={initialOrder} onDone={() => setWriting(false)} />}

      {summary.count === 0 ? (
        <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
          <div className="flex flex-col gap-3 rounded-card border border-dashed border-[#FF6A45] bg-tint2 p-6">
            <h3 className="text-[22px]">{e.firstTitle}</h3>
            <p className="text-[15px] leading-[1.6] text-muted">{e.firstBody}</p>
            {!writing && <div><Button size="md" icon="feather" onClick={() => setWriting(true)}>{e.write}</Button></div>}
          </div>
          <div className="flex flex-col gap-4 rounded-card border border-border bg-surface p-6">
            <h3 className="text-[20px]">{e.categoryTitle}</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div><span className="mb-2 block text-[11px] font-extrabold uppercase tracking-[0.12em] text-primary">{e.prosLabel}</span>
                <ul className="m-0 flex list-none flex-col gap-2 p-0">{categoryFeedback.pros.map((t) => <li key={t} className="flex gap-2 text-[14px] leading-[1.55]"><Icon name="check" size={16} className="mt-1 shrink-0 text-primary" />{t}</li>)}</ul></div>
              <div><span className="mb-2 block text-[11px] font-extrabold uppercase tracking-[0.12em] text-cta">{e.consLabel}</span>
                <ul className="m-0 flex list-none flex-col gap-3 p-0">{categoryFeedback.cons.map((c) => <li key={c.text} className="text-[14px] leading-[1.55]"><span className="flex gap-2"><Icon name="quiet" size={16} className="mt-1 shrink-0 text-cta" />{c.text}</span><span className="mt-1 block pl-6 text-[13px] text-muted"><b className="text-ink">{e.answerLabel}:</b> {c.answer}</span></li>)}</ul></div>
            </div>
            <p className="text-[12px] leading-[1.5] text-muted">{categoryFeedback.attribution}</p>
          </div>
        </div>
      ) : shown.length === 0 ? (
        <p className="text-[15px] text-muted">{e.noneForFilter}</p>
      ) : (
        <div className="grid grid-cols-1 gap-[18px] md:grid-cols-2 xl:grid-cols-3">
          {shown.map((r) => <ReviewCard key={r.id} r={{ ...r, helpful: votes[r.id] ?? r.helpful }} voted={voted.has(r.id)} onVote={vote} />)}
        </div>
      )}

      {canLoadMore && !stars && <div className="flex justify-center"><Button variant="secondary" size="md" onClick={loadMore} disabled={loading}>{loading ? '…' : e.loadMore}</Button></div>}
      {summary.count > 0 && <p className="text-center text-[12px] text-muted"><Chip icon="check" iconSize={13}>{e.verified}</Chip> means the order number matched a real Laro order.</p>}
    </div>
  );
}
