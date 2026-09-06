'use client';
import { useEffect, useState } from 'react';
import { PawPrint } from './sprites';

type Paw = { id: number; x: number; y: number; r: number };

/** Desktop-only cursor paw trail: a coral paw print every ~90px of travel, alternating left/right, fading out. Never runs on touch or reduced motion. */
export function PawTrail() {
  const [paws, setPaws] = useState<Paw[]>([]);
  useEffect(() => {
    if (!matchMedia('(pointer: fine)').matches || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let last: { x: number; y: number } | null = null;
    let n = 0;
    const onMove = (e: PointerEvent) => {
      if (e.pointerType === 'touch') return;
      const dx = last ? e.clientX - last.x : 0;
      const dy = last ? e.clientY - last.y : 0;
      if (last && dx * dx + dy * dy < 90 * 90) return;
      const ang = last ? Math.atan2(dy, dx) : -Math.PI / 2;
      last = { x: e.clientX, y: e.clientY };
      n += 1;
      const side = (n % 2 ? 1 : -1) * 7; // alternate paws either side of the path
      const paw = { id: n, x: e.clientX + Math.cos(ang + Math.PI / 2) * side, y: e.clientY + Math.sin(ang + Math.PI / 2) * side, r: (ang * 180) / Math.PI + 90 };
      setPaws((s) => [...s.slice(-13), paw]);
    };
    addEventListener('pointermove', onMove, { passive: true });
    return () => removeEventListener('pointermove', onMove);
  }, []);
  if (!paws.length) return null;
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-[90] overflow-hidden">
      {paws.map((p) => (
        <span key={p.id} className="fx-paw absolute text-cta" style={{ left: p.x - 9, top: p.y - 9, rotate: `${p.r}deg` }} onAnimationEnd={() => setPaws((s) => s.filter((q) => q.id !== p.id))}>
          <PawPrint size={18} />
        </span>
      ))}
    </div>
  );
}
