import Link from 'next/link';
import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { Icon, type IconName } from './icons';

const cx = (...c: (string | false | null | undefined)[]) => c.filter(Boolean).join(' ');

/* ---------- Buttons: pill, 800 weight, min-height 44, lg = 18px/28px, md = 14px/22px ---------- */
type Variant = 'primary' | 'secondary' | 'ink';
type Size = 'lg' | 'md';
const variants: Record<Variant, string> = {
  primary: 'bg-cta text-white border-cta hover:bg-[#B93520] hover:border-[#B93520]',
  secondary: 'bg-transparent text-primary border-primary hover:bg-primary/5',
  ink: 'bg-ink text-white border-ink hover:bg-[#0F141C] hover:border-[#0F141C]',
};
const sizes: Record<Size, string> = { lg: 'px-7 py-[18px] text-[18px]', md: 'px-[22px] py-[14px] text-[16px]' };
const base = 'inline-flex items-center justify-center gap-[10px] rounded-full border-2 font-body font-extrabold leading-none min-h-[44px] no-underline transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed';

type ButtonProps = { variant?: Variant; size?: Size; icon?: IconName; iconSize?: number; full?: boolean; className?: string; children: ReactNode };

export function Button({ variant = 'primary', size = 'lg', icon, iconSize, full, className, children, ...rest }: ButtonProps & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button type="button" className={cx(base, variants[variant], sizes[size], full && 'w-full', className)} {...rest}>
      {icon && <Icon name={icon} size={iconSize ?? (size === 'lg' ? 20 : 18)} />}
      <span>{children}</span>
    </button>
  );
}

export function ButtonLink({ href, variant = 'primary', size = 'lg', icon, iconSize, full, className, children, ...rest }: ButtonProps & { href: string; onClick?: () => void; 'aria-label'?: string }) {
  return (
    <Link href={href} className={cx(base, variants[variant], sizes[size], full && 'w-full', className)} {...rest}>
      {icon && <Icon name={icon} size={iconSize ?? (size === 'lg' ? 20 : 18)} />}
      <span>{children}</span>
    </Link>
  );
}

/* ---------- Layout ---------- */
/** 20px gutters on mobile → 120px at 1440 (content 1200). */
export function Container({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cx('mx-auto w-full max-w-[1440px] px-5 md:px-10 xl:px-[120px]', className)}>{children}</div>;
}

export function Section({ id, bg = 'bg-bg', className, children }: { id?: string; bg?: string; className?: string; children: ReactNode }) {
  return (
    <section id={id} className={cx(bg, 'py-12 xl:py-[88px] scroll-mt-16', className)}>
      <Container>{children}</Container>
    </section>
  );
}

export function Eyebrow({ children, color = 'text-primary' }: { children: ReactNode; color?: string }) {
  return <span className={cx('text-[13px] font-extrabold uppercase tracking-[0.14em]', color)}>{children}</span>;
}

/** Section H2: 32px mobile → 44px desktop unless overridden. */
export function H2({ children, className, size = 'xl:text-[44px]' }: { children: ReactNode; className?: string; size?: string }) {
  return <h2 className={cx('text-[32px] leading-[1.1] text-pretty', size, className)}>{children}</h2>;
}

/* ---------- Small pieces ---------- */
/** Sky-blue chip (hero h1, feature chips). */
export function Chip({ icon, children, className, iconSize = 17 }: { icon?: IconName; children: ReactNode; className?: string; iconSize?: number }) {
  return (
    <span className={cx('inline-flex items-center gap-[6px] rounded-full bg-tint px-3 py-[6px] text-[14px] font-bold leading-[1.2] text-primary whitespace-nowrap', className)}>
      {icon && <Icon name={icon} size={iconSize} />}
      {children}
    </span>
  );
}

/** Text pill for payment / courier names — never a logo. */
export function Pill({ children, tone = 'light' }: { children: ReactNode; tone?: 'light' | 'dark' }) {
  return (
    <span className={cx('inline-flex items-center whitespace-nowrap rounded-[8px] px-3 py-[7px] text-[12px] xl:text-[13px] font-bold tracking-[0.02em] border', tone === 'dark' ? 'bg-white/12 text-white border-white/30' : 'bg-white text-ink border-border')}>
      {children}
    </span>
  );
}

/** Rotated sticker badge (hero). */
export function Sticker({ tone, rotate, className, children }: { tone: 'yellow' | 'white' | 'teal' | 'coral'; rotate: number; className?: string; children: ReactNode }) {
  const tones = { yellow: 'bg-accent2 text-ink', white: 'bg-white text-primary', teal: 'bg-primary text-white', coral: 'bg-cta text-white' };
  return (
    <span className={cx('sticker absolute z-[3] rounded-[12px] px-[14px] py-[10px] font-display font-bold whitespace-nowrap shadow-sticker', tones[tone], className)} style={{ ['--r' as string]: `${rotate}deg` }}>
      {children}
    </span>
  );
}

export function IconTile({ icon, size = 48, radius = 14, iconSize = 24, className }: { icon: IconName; size?: number; radius?: number; iconSize?: number; className?: string }) {
  return (
    <span className={cx('flex items-center justify-center bg-tint text-primary shrink-0', className)} style={{ width: size, height: size, borderRadius: radius }}>
      <Icon name={icon} size={iconSize} />
    </span>
  );
}
