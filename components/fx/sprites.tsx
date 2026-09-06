import type { ReactNode } from 'react';

// Line-art sprites: stroke 1.8, round caps, currentColor, fill none. Cats + mat on a 48-grid, feather/paw/star on a 24-grid.
// Cats face RIGHT (travel direction); mirror with `-scale-x-100` when needed. Server-safe, no hooks.
export type SpriteProps = { className?: string; size?: number };

function Sprite({ box, size = 48, className, children }: SpriteProps & { box: 24 | 48; children: ReactNode }) {
  return (
    <svg width={size} height={size} viewBox={`0 0 ${box} ${box}`} fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false" className={className}>
      {children}
    </svg>
  );
}

/** Sitting cat, side view, content eye, tail wrapped around the front paws. */
export function CatSit(p: SpriteProps) {
  return (
    <Sprite box={48} {...p}>
      <path d="M28.8 10.8L27 4.5L32 9.1A6 6 0 0 1 34 9.1L39 4.5L37.2 10.8A6 6 0 1 1 28.8 10.8Z" />
      <path d="M34.5 15.5Q36 14 37.5 15.5" />
      <path d="M39.5 14.5L43.5 13.5M39.5 16.8H43.8M39.5 19L43.5 20" />
      <path d="M28.5 19.5C21 16 12 19 10 29C8.5 35 9 39 11 41H34C36 36 36 28 34.2 21" />
      <path d="M28.5 41V29" />
      <path d="M13 28C19 30 21 35 20 41" />
      <path d="M11 41C16 44.5 28 45 38 43.5C41.5 43 41 40 38.5 40.5" />
    </Sprite>
  );
}

/** Cat low to the ground, ears flat back, narrowed eye, paws stretched forward. */
export function CatStalk(p: SpriteProps) {
  return (
    <Sprite box={48} {...p}>
      <path d="M38.3 25L34.5 20L34.6 24.7A5.5 5.5 0 0 0 33.25 25.2L28.5 23L31 27.7A5.5 5.5 0 1 0 38.3 25Z" />
      <path d="M35.5 29H38.5" />
      <path d="M41 30L45 29M41 32H45M41 34L44.5 35.5" />
      <path d="M31.5 26.5C23 22 12 22 7 26.5C3.5 29.5 3.5 36 8 39H40" />
      <path d="M28 39C29 36.5 30 34 32 33" />
      <path d="M10 28C16 30 18 34 17 39" />
      <path d="M4 32C2 31 1.5 28.5 3.5 26.5" />
    </Sprite>
  );
}

/** Cat mid-air, wide eye, front paws out, hind legs trailing, tail flicked up. */
export function CatPounce(p: SpriteProps) {
  return (
    <Sprite box={48} {...p}>
      <path d="M37.9 18.1L39.5 12L34.8 16.6A5.5 5.5 0 0 0 33.2 16.6L28.5 12L30.1 18.1A5.5 5.5 0 1 0 37.9 18.1Z" />
      <circle cx="36.5" cy="21.5" r="1.2" />
      <path d="M39 22.5L43 21.5M39 24.5H43M39 26.5L42.5 28" />
      <path d="M29.8 18.5C23 12 14 9.5 8 12C3.5 14 3 19.5 7 22C13 21.5 20 24 26 29" />
      <path d="M30 27C35 30 39 33 41 36M26.5 29.5C31 32.5 35 36 36.5 39.5" />
      <path d="M9.5 21C6.5 26 4.5 28 2 29M12 20.5C10 26 8 30 4 32" />
      <path d="M6.5 13.5C2.5 11 1.5 6 5 3" />
    </Sprite>
  );
}

/** Single feather pointing up-right, 3 barbs; `.fx-tip` is the tip accent (colour it via `[&_.fx-tip]:stroke-*`). */
export function Feather(p: SpriteProps) {
  return (
    <Sprite box={24} {...p}>
      <path d="M19 5C13 5 8 9 7 17C15 16 19 11 19 5Z" />
      <path d="M3 21L19 5" />
      <path d="M9.5 11.5l3 3M11.5 9.5l3 3M13.5 7.5l3 3" />
      <path className="fx-tip" d="M16.5 5.3C17.5 5 18.3 5 19 5C19 5.7 19 6.5 18.7 7.5" />
    </Sprite>
  );
}

/** Paw print, toes up: pad + 4 toes. */
export function PawPrint(p: SpriteProps) {
  return (
    <Sprite box={24} {...p}>
      <circle cx="5.5" cy="10" r="1.6" />
      <circle cx="9.6" cy="6.3" r="1.7" />
      <circle cx="14.4" cy="6.3" r="1.7" />
      <circle cx="18.5" cy="10" r="1.6" />
      <path d="M12 11c-3.3 0-6.3 3-6.3 5.6 0 2 1.5 3.4 3.2 3.4 1.1 0 2.1-.7 3.1-.7s2 .7 3.1.7c1.7 0 3.2-1.4 3.2-3.4C18.3 14 15.3 11 12 11z" />
    </Sprite>
  );
}

/** The star-shaped hunt mat (6 rounded lobes) with its hub. Fill it via `fill-tint` / `fill-white/15`. */
export function MatBlob(p: SpriteProps) {
  return (
    <Sprite box={48} {...p}>
      <path d="M24 3C26.5 3 27 10.7 30.5 12.7C34 14.7 40.9 11.3 42.2 13.5C43.4 15.7 37 20 37 24C37 28 43.4 32.3 42.2 34.5C40.9 36.7 34 33.3 30.5 35.3C27 37.3 26.5 45 24 45C21.5 45 21 37.3 17.5 35.3C14 33.3 7.1 36.7 5.8 34.5C4.6 32.3 11 28 11 24C11 20 4.6 15.7 5.8 13.5C7.1 11.3 14 14.7 17.5 12.7C21 10.7 21.5 3 24 3Z" />
      <circle cx="24" cy="24" r="4.5" />
    </Sprite>
  );
}

/** The logo star as an outline. */
export function Star(p: SpriteProps) {
  return (
    <Sprite box={24} {...p}>
      <path d="M12 2.2l2.7 5.7 6.2.8-4.5 4.3 1.2 6.2L12 16.2l-5.6 3 1.2-6.2L3.1 8.7l6.2-.8z" />
      <circle cx="12" cy="11" r="2.4" />
    </Sprite>
  );
}
