'use client';
import { useEffect, useState, useSyncExternalStore, type CSSProperties } from 'react';
import { CatPounce, Feather, MatBlob } from './sprites';

const KEY = 'laro-intro';
let wanted: boolean | undefined;
const subscribe = () => () => {};
const getServerSnapshot = () => false;
// Decided once per page load (client only): first visit this session and motion allowed.
const getSnapshot = () =>
  (wanted ??= (() => {
    try {
      return !sessionStorage.getItem(KEY) && !matchMedia('(prefers-reduced-motion: reduce)').matches;
    } catch {
      return false;
    }
  })());

/** Once-per-session intro: mat pops, feather peeks, cat pounces, overlay slides away (≤ 1.6 s). Renders null on the server. */
export function IntroLoader() {
  const show = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const [done, setDone] = useState(false);
  useEffect(() => {
    if (!show) return;
    try {
      sessionStorage.setItem(KEY, '1');
    } catch {
      /* private mode: just play it */
    }
    const t = setTimeout(() => setDone(true), 1600);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setDone(true);
    };
    addEventListener('keydown', onKey);
    return () => {
      clearTimeout(t);
      removeEventListener('keydown', onKey);
    };
  }, [show]);
  if (!show || done) return null;
  return (
    <div role="presentation" aria-hidden="true" onClick={() => setDone(true)} className="fx-intro fixed inset-0 z-[100] flex cursor-pointer items-center justify-center bg-bg text-ink">
      <div className="relative h-[160px] w-[160px]">
        <span className="fx-intro-feather absolute left-[40px] top-[60px]" style={{ '--px': '-40px', '--py': '0px' } as CSSProperties}>
          <Feather size={40} className="-rotate-[135deg] text-[#3F8F5E] [&_.fx-tip]:stroke-accent2" />
        </span>
        <MatBlob size={160} className="fx-intro-mat absolute inset-0 fill-tint" />
        <CatPounce size={96} className="fx-intro-cat absolute left-[28px] top-[28px]" />
      </div>
    </div>
  );
}
