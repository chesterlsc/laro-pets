'use client';
import { useEffect, useState } from 'react';
import { Icon } from '@/components/icons';
import { copy } from '@/content/copy';
import { timeAgo } from '@/lib/social-shared';

type Item = { city: string; tier: string; at: string };

/** "Someone in Cebu City ordered Mat + Refill · 3 h ago" — real orders only; renders nothing until /api/social returns items. */
export function RecentOrders() {
  const [items, setItems] = useState<Item[]>([]);
  const [idx, setIdx] = useState(-1);
  const [closed, setClosed] = useState(false);

  useEffect(() => {
    let alive = true;
    const timers: ReturnType<typeof setTimeout>[] = [];
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    fetch('/api/social').then((r) => r.json()).then((j: { items: Item[] }) => {
      if (!alive || !j.items?.length) return;
      setItems(j.items);
      // first toast after 12 s, then one every 25 s, stop after the list is exhausted
      j.items.forEach((_, i) => {
        timers.push(setTimeout(() => setIdx(i), 12_000 + i * 25_000));
        timers.push(setTimeout(() => setIdx((cur) => (cur === i ? -1 : cur)), 12_000 + i * 25_000 + 7_000));
      });
    }).catch(() => {});
    return () => { alive = false; timers.forEach(clearTimeout); };
  }, []);

  const it = idx >= 0 ? items[idx] : null;
  if (!it || closed) return null;
  return (
    <div role="status" className="fixed bottom-[92px] left-4 z-20 flex max-w-[320px] items-center gap-3 rounded-card border border-border bg-surface p-3 pr-2 shadow-card lg:bottom-6">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-tint text-primary"><Icon name="box" size={20} /></span>
      <span className="flex flex-col">
        <span className="text-[14px] font-extrabold leading-tight">{copy.trust.toast(it.city, it.tier)}</span>
        <span className="text-[12px] text-muted">{timeAgo(it.at)} · {copy.trust.toastVerified}</span>
      </span>
      <button type="button" onClick={() => setClosed(true)} aria-label="Dismiss" className="ml-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-muted hover:bg-bg"><Icon name="close" size={16} /></button>
    </div>
  );
}
