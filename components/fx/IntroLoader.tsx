'use client';
import { useEffect, useState, useSyncExternalStore } from 'react';
import { PawPrint } from './sprites';

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

/** Once-per-session intro: a coral paw bounces three times, then the overlay slides away (≤ 1.6 s). Renders null on the server. */
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
      <div className="relative flex h-[140px] w-[120px] items-end justify-center">
        <span className="fx-intro-shadow absolute bottom-[6px] h-[10px] w-[64px] rounded-full bg-ink/15" />
        <PawPrint size={72} className="fx-intro-paw relative text-cta" />
      </div>
    </div>
  );
}
