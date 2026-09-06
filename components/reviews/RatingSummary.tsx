import { Star } from '@/components/icons';
import { copy } from '@/content/copy';
import type { Summary } from '@/lib/review-schema';

/** Average, animated star fill, count line and a 5→1 distribution with growing bars. */
export function RatingSummary({ summary }: { summary: Summary }) {
  const e = copy.reviewsEngine;
  const pct = (summary.average / 5) * 100;
  return (
    <div className="grid gap-6 rounded-card border border-border bg-surface p-6 md:grid-cols-[auto_1fr] md:items-center xl:p-7">
      <div className="flex flex-col items-start gap-2">
        <div className="flex items-baseline gap-2">
          <span className="font-display text-[52px] font-bold leading-none">{summary.average.toFixed(1)}</span>
          <span className="text-[14px] font-bold text-muted">{e.outOf5}</span>
        </div>
        <span className="relative inline-flex" role="img" aria-label={`${summary.average.toFixed(1)} ${e.outOf5}`}>
          <span className="flex gap-[2px]">{[0, 1, 2, 3, 4].map((i) => <Star key={i} size={24} on={false} />)}</span>
          <span className="fx-grow absolute inset-y-0 left-0 flex gap-[2px] overflow-hidden" style={{ width: `${pct}%` }}>{[0, 1, 2, 3, 4].map((i) => <Star key={i} size={24} />)}</span>
        </span>
        <span className="text-[14px] text-muted">{e.countLine(summary.count, summary.verifiedCount)}</span>
      </div>
      <ul className="m-0 flex list-none flex-col gap-2 p-0">
        {([5, 4, 3, 2, 1] as const).map((s) => {
          const n = summary.distribution[s];
          const w = summary.count ? (n / summary.count) * 100 : 0;
          return (
            <li key={s} className="grid grid-cols-[52px_1fr_36px] items-center gap-3 text-[13px] font-bold">
              <span className="flex items-center gap-1 text-muted">{s} <Star size={13} /></span>
              <span className="h-[10px] overflow-hidden rounded-full bg-border"><span className="fx-grow block h-full rounded-full bg-accent2" style={{ width: `${w}%`, animationDelay: `${(5 - s) * 80}ms` }} /></span>
              <span className="text-right text-muted tabular-nums">{n}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
