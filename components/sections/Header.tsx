import Link from 'next/link';
import { Icon, Logo, Stars } from '@/components/icons';
import type { Summary } from '@/lib/review-schema';
import { SHOW_RATING_FROM } from '@/lib/social-shared';
import { ButtonLink } from '@/components/ui';
import { copy } from '@/content/copy';
import { CartBadge, MobileMenu } from './HeaderClient';

export function Header({ summary }: { summary?: Summary }) {
  const rated = !!summary && summary.count >= SHOW_RATING_FROM;
  return (
    <header className="sticky top-0 z-40 bg-bg">
      <div className="flex items-center justify-between px-5 py-[14px] md:px-10 xl:px-[120px] xl:py-[18px]">
        <MobileMenu />
        <Link href="/" className="no-underline lg:hidden"><Logo size={28} /></Link>
        <Link href="/" className="hidden no-underline lg:block"><Logo size={32} /></Link>
        <nav aria-label="Main" className="hidden items-center gap-8 lg:flex">
          {copy.nav.map((l) => (
            <a key={l.href} href={l.href} className="text-[15px] font-bold text-ink no-underline">{l.label}</a>
          ))}
        </nav>
        <div className="flex items-center gap-4">
          {rated && (
            <a href="#reviews" className="hidden items-center gap-2 rounded-full border border-border bg-surface px-3 py-[6px] text-[13px] font-extrabold text-ink no-underline hover:border-primary xl:flex">
              <Stars count={Math.round(summary!.average)} size={13} label={copy.trust.rating(summary!.average, summary!.count)} />{summary!.average.toFixed(1)} <span className="font-bold text-muted">({summary!.count})</span>
            </a>
          )}
          <div className="hidden lg:block">
            <ButtonLink href="/checkout" size="md">{copy.header.buyNow}</ButtonLink>
          </div>
          <Link href="/checkout" className="-mr-2 flex h-11 w-11 items-center justify-center text-ink">
            <span className="sr-only">Cart</span><span className="relative"><Icon name="cart" size={26} /><CartBadge /></span>
          </Link>
        </div>
      </div>
    </header>
  );
}
