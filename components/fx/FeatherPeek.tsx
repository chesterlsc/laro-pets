import type { CSSProperties } from 'react';
import { Feather } from './sprites';

// Each spot is a clip window just outside the parent's edge; the feather rests hidden on the parent's side and slides into view.
const spots = [
  { win: 'left-[-22px] top-[38%] h-[26px] w-[22px]', rest: 'left-[22px]', rotate: '-rotate-[135deg]', px: '-20px', py: '0px', delay: '0s' },
  { win: 'bottom-[10px] right-[-22px] h-[26px] w-[22px]', rest: 'left-[-24px]', rotate: 'rotate-90', px: '20px', py: '4px', delay: '1.4s' },
  { win: 'right-[-22px] top-[10px] h-[26px] w-[22px]', rest: 'left-[-24px]', rotate: 'rotate-0', px: '20px', py: '-4px', delay: '2.8s' },
];

/** Three green feathers peeking out from behind a `relative` parent (left edge, bottom-right, top-right). */
export function FeatherPeek({ className }: { className?: string }) {
  return (
    <>
      {spots.map((s) => (
        <span key={s.delay} aria-hidden="true" className={`pointer-events-none absolute overflow-hidden ${s.win} ${className ?? ''}`}>
          <span className={`fx-peek absolute top-[1px] ${s.rest}`} style={{ '--px': s.px, '--py': s.py, animationDelay: s.delay } as CSSProperties}>
            <Feather size={24} className={`${s.rotate} text-[#3F8F5E] [&_.fx-tip]:stroke-accent2`} />
          </span>
        </span>
      ))}
    </>
  );
}
