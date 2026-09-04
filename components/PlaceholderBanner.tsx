'use client';
import { useEffect, useState } from 'react';
import { placeholders, unfilledPlaceholders } from '@/content/placeholders';

// Development only: lists every unfilled [bracket] so nothing ships by accident.
export function PlaceholderBanner() {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    try { setOpen(sessionStorage.getItem('laro-ph-banner') !== 'closed'); } catch { setOpen(true); }
  }, []);
  if (process.env.NODE_ENV === 'production') return null;
  const keys = unfilledPlaceholders();
  if (!open || keys.length === 0) return null;
  return (
    <div role="status" className="bg-accent2 text-ink text-[13px] font-bold px-4 py-2 flex flex-wrap items-center gap-x-3 gap-y-1 border-b border-border">
      <span className="font-extrabold uppercase tracking-[0.1em] text-[11px]">Dev · unfilled placeholders ({keys.length})</span>
      <span className="text-[12px]">{keys.map((k) => `${k} = ${placeholders[k]}`).join(' · ')}</span>
      <button type="button" onClick={() => { setOpen(false); try { sessionStorage.setItem('laro-ph-banner', 'closed'); } catch {} }} className="ml-auto min-h-[32px] px-3 rounded-full border-2 border-ink/40 text-[12px] font-extrabold">Dismiss</button>
    </div>
  );
}
