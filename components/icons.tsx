import type { SVGProps } from 'react';

// Inline SVG icons, 24-grid, stroke 1.8, currentColor — paths copied from the mockup. No emoji, no icon fonts.
const paths = {
  cart: <><path d="M3 4h2l2 12h11l2-8H6" /><circle cx="9" cy="20" r="1.5" /><circle cx="17" cy="20" r="1.5" /></>,
  play: <path d="M8 5v14l11-7z" fill="currentColor" stroke="none" />,
  truck: <><path d="M3 7h11v9H3z" /><path d="M14 10h4l3 3v3h-7z" /><circle cx="7" cy="18" r="1.8" /><circle cx="17" cy="18" r="1.8" /></>,
  feather: <><path d="M20 4c-4.5 0-9 2.5-12 6.5S5 19 5 19s4.5-.5 8.5-3.5S20 8.5 20 4z" /><path d="M5 19l9-9" /></>,
  shield: <><path d="M12 3l7 3v5c0 5-3.5 8.5-7 10-3.5-1.5-7-5-7-10V6z" /><path d="M9 12l2 2 4-4" /></>,
  cod: <><rect x="3" y="7" width="18" height="10" rx="2" /><circle cx="12" cy="12" r="2.5" /><path d="M6 10h.01M18 14h.01" /></>,
  sparkle: <path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z" />,
  paw: <><circle cx="7" cy="8.5" r="1.7" /><circle cx="12" cy="6.5" r="1.7" /><circle cx="17" cy="8.5" r="1.7" /><path d="M12 11.5c-3 0-6 3-6 5.4 0 1.9 1.4 3.1 3 3.1 1.1 0 2-.6 3-.6s1.9.6 3 .6c1.6 0 3-1.2 3-3.1 0-2.4-3-5.4-6-5.4z" /></>,
  speed: <><path d="M4 15a8 8 0 0116 0" /><path d="M12 15l4-5" /><circle cx="12" cy="15" r="1.5" /></>,
  random: <><path d="M20 12a8 8 0 01-14 5.3M4 12a8 8 0 0114-5.3" /><path d="M4 8v4h4M20 16v-4h-4" /></>,
  auto: <path d="M20 14.5A8 8 0 019.5 4a8 8 0 1010.5 10.5z" />,
  usbc: <><rect x="5" y="10" width="14" height="5" rx="2.5" /><path d="M12 15v5M9 10V7M15 10V7" /></>,
  quiet: <><path d="M4 10v4h3l4 3V7l-4 3z" /><path d="M16 9.5l4 5M20 9.5l-4 5" /></>,
  bolt: <path d="M13 2L4 14h7l-1 8 9-12h-7l1-8z" />,
  check: <path d="M5 12l4 4L19 7" />,
  chevron: <path d="M6 9l6 6 6-6" />,
  user: <><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4 3.6-7 8-7s8 3 8 7" /></>,
  arrow: <path d="M5 12h14M13 6l6 6-6 6" />,
  plus: <path d="M12 5v14M5 12h14" />,
  minus: <path d="M5 12h14" />,
  menu: <path d="M4 7h16M4 12h16M4 17h16" />,
  close: <path d="M6 6l12 12M18 6L6 18" />,
  lock: <><rect x="5" y="11" width="14" height="10" rx="2" /><path d="M8 11V7a4 4 0 018 0v4" /></>,
  box: <><path d="M3 7l9-4 9 4v10l-9 4-9-4z" /><path d="M3 7l9 4 9-4M12 11v10" /></>,
} as const;

export type IconName = keyof typeof paths;

export function Icon({ name, size = 20, strokeWidth = 1.8, className, ...rest }: { name: IconName; size?: number; strokeWidth?: number } & SVGProps<SVGSVGElement>) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={className} style={{ flex: '0 0 auto', display: 'block' }} {...rest}>
      {paths[name]}
    </svg>
  );
}

/** Five-pointed filled star used for ratings. */
export function Star({ size = 16, on = true }: { size?: number; on?: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" style={{ display: 'block' }}>
      <path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z" fill={on ? '#F5A623' : '#D9D4C7'} />
    </svg>
  );
}

export function Stars({ count = 5, size = 16, label }: { count?: number; size?: number; label?: string }) {
  return (
    <span className="flex items-center gap-[2px]" role="img" aria-label={label ?? `${count} out of 5 stars`}>
      {Array.from({ length: 5 }, (_, i) => <Star key={i} size={size} on={i < count} />)}
    </span>
  );
}

/** Star mark + "laro" + "PETS" wordmark. */
export function Logo({ size = 32 }: { size?: 32 | 28 | 26 }) {
  const word = size === 32 ? 'text-[32px]' : size === 28 ? 'text-[28px]' : 'text-[26px]';
  const pets = size === 32 ? 'text-[12px]' : size === 28 ? 'text-[10px]' : 'text-[9px]';
  return (
    <span className="flex items-center gap-2 text-primary">
      <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" style={{ display: 'block', flex: '0 0 auto' }}>
        <path d="M12 2.2l2.7 5.7 6.2.8-4.5 4.3 1.2 6.2L12 16.2l-5.6 3 1.2-6.2L3.1 8.7l6.2-.8z" fill="#0F5C6B" stroke="#0F5C6B" strokeWidth="2.2" strokeLinejoin="round" />
        <circle cx="12" cy="11" r="2.4" fill="#FFFFFF" />
      </svg>
      <span className="flex items-baseline gap-[6px]">
        <span className={`font-display font-bold leading-none tracking-[-0.02em] ${word}`}>laro</span>
        <span className={`font-body font-extrabold uppercase tracking-[0.18em] mt-[2px] ${pets}`}>Pets</span>
      </span>
      <span className="sr-only">Laro Pets</span>
    </span>
  );
}
