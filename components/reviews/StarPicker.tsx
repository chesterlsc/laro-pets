'use client';
import { useState } from 'react';
import { Star } from '@/components/icons';
import { PawPrint } from '@/components/fx/sprites';

/** Accessible 1–5 star radio group with hover preview and a paw sparkle on select. */
export function StarPicker({ value, onChange, label }: { value: number; onChange: (n: number) => void; label: string }) {
  const [hover, setHover] = useState(0);
  const [burst, setBurst] = useState(0);
  const shown = hover || value;
  return (
    <div className="flex flex-col gap-2">
      <span className="text-[14px] font-extrabold">{label}</span>
      <div role="radiogroup" aria-label={label} className="relative flex items-center gap-1" onMouseLeave={() => setHover(0)}>
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            role="radio"
            aria-checked={value === n}
            aria-label={`${n} ${n === 1 ? 'star' : 'stars'}`}
            onMouseEnter={() => setHover(n)}
            onFocus={() => setHover(n)}
            onBlur={() => setHover(0)}
            onClick={() => { onChange(n); setBurst((b) => b + 1); }}
            className={`flex h-11 w-11 cursor-pointer items-center justify-center rounded-full transition-transform hover:scale-110 motion-reduce:transition-none ${value === n ? 'fx-wiggle-hover' : ''}`}
          >
            <Star size={32} on={n <= shown} />
          </button>
        ))}
        {burst > 0 && (
          <span key={burst} aria-hidden="true" className="pointer-events-none absolute inset-0">
            {[[-6, -14, -30], [40, -18, 20], [90, -12, -10], [150, -20, 25], [210, -10, -20]].map(([x, y, r], i) => (
              <span key={i} className="fx-sparkle absolute text-cta" style={{ left: x, top: y, transform: `rotate(${r}deg)`, animationDelay: `${i * 60}ms` }}><PawPrint size={14} /></span>
            ))}
          </span>
        )}
      </div>
    </div>
  );
}
