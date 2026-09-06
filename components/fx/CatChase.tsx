import type { CSSProperties } from 'react';
import { CatPounce, CatSit, CatStalk, Feather, MatBlob, PawPrint } from './sprites';

// Feather peeks: placement (static attribute transform) + peek direction (CSS vars read by laro-chase-peek) + phase.
const feathers = [
  { at: 'translate(278 66) rotate(45 10 10)', px: '14px', py: '0px', delay: '0.3s' },
  { at: 'translate(258 52) rotate(-45 10 10)', px: '0px', py: '-18px', delay: '1.3s' },
  { at: 'translate(238 66) rotate(-135 10 10)', px: '-14px', py: '0px', delay: '2.4s' },
];
// Paw prints left behind the stalking cat, timed to when it has passed each spot.
const paws = [
  { x: 12, y: 90, r: 82, delay: '1.1s' },
  { x: 52, y: 97, r: 98, delay: '1.9s' },
  { x: 92, y: 90, r: 82, delay: '2.35s' },
  { x: 132, y: 97, r: 98, delay: '3.1s' },
];

/**
 * Looping 6 s scene (320×120): feather taunts from the mat, cat stalks in, pounces, lands, mat wiggles, paw prints fade.
 * Static fallback (reduced motion): cat sitting on the mat. tone 'dark' = white strokes for teal/coral bands.
 */
export function CatChase({ className, tone = 'light' }: { className?: string; tone?: 'light' | 'dark' }) {
  const dark = tone === 'dark';
  return (
    <svg viewBox="0 0 320 120" width="100%" aria-hidden="true" focusable="false" className={`fx-chase block ${dark ? 'text-white' : 'text-ink'} ${className ?? ''}`}>
      {paws.map((p) => (
        <g key={p.x} transform={`translate(${p.x} ${p.y}) rotate(${p.r} 6 6)`} className="fx-chase-paw opacity-0" style={{ animationDelay: p.delay }}>
          <PawPrint size={12} />
        </g>
      ))}
      {feathers.map((f) => (
        <g key={f.at} transform={f.at}>
          <g className={`fx-chase-feather opacity-0 ${dark ? 'text-accent2' : 'text-[#3F8F5E] [&_.fx-tip]:stroke-accent2'}`} style={{ '--px': f.px, '--py': f.py, animationDelay: f.delay } as CSSProperties}>
            <Feather size={20} />
          </g>
        </g>
      ))}
      <g transform="translate(232 40)" className="fx-chase-mat">
        <MatBlob size={72} className={dark ? 'fill-white/15' : 'fill-tint'} />
      </g>
      <g transform="translate(205 56)" className="fx-chase-cat">
        <g className="fx-chase-stalk opacity-0">
          <g>
            <CatStalk />
          </g>
        </g>
        <g className="fx-chase-pounce opacity-0">
          <CatPounce />
        </g>
        <g className="fx-chase-sit">
          <CatSit />
        </g>
      </g>
    </svg>
  );
}
