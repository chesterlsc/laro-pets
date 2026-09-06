import { Icon, Stars, type IconName } from '@/components/icons';
import { Container } from '@/components/ui';
import { copy } from '@/content/copy';
import type { Summary } from '@/lib/review-schema';
import type { PublicStats } from '@/lib/orders';
import { SHOW_ORDERS_FROM, SHOW_RATING_FROM } from '@/lib/social-shared';

/** Slim trust strip under the hero. Facts that are true today; rating and order count appear once real data exists. */
export function TrustBar({ summary, stats }: { summary: Summary; stats: PublicStats }) {
  const t = copy.trust;
  const rated = summary.count >= SHOW_RATING_FROM;
  const ordered = stats.orders >= SHOW_ORDERS_FROM;
  return (
    <div className="border-y border-border bg-surface" aria-label="Why cat parents trust Laro">
      <Container className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 py-3 text-[13px] font-extrabold text-ink">
        {rated ? (
          <a href="#reviews" className="inline-flex items-center gap-2 text-ink no-underline hover:text-cta"><Stars count={Math.round(summary.average)} size={15} label={t.rating(summary.average, summary.count)} />{t.rating(summary.average, summary.count)}</a>
        ) : (
          <span className="inline-flex items-center gap-2 text-primary"><Icon name="sparkle" size={16} />{t.newStore}</span>
        )}
        {ordered && <span className="inline-flex items-center gap-2"><Icon name="box" size={16} className="text-primary" />{t.orders(stats.orders)}</span>}
        {t.items.map((it) => (
          <span key={it.text} className="inline-flex items-center gap-2 text-muted"><Icon name={it.icon as IconName} size={16} className="text-primary" />{it.text}</span>
        ))}
      </Container>
    </div>
  );
}
