import { Suspense } from 'react';
import { copy } from '@/content/copy';
import { Reveal } from '@/components/fx/Reveal';
import { Eyebrow, H2, Section } from '@/components/ui';
import { RatingSummary } from '@/components/reviews/RatingSummary';
import { ReviewsClient } from '@/components/reviews/ReviewsClient';
import { getApprovedReviewsCached, getReviewSummaryCached } from '@/lib/reviews';

// Real customer reviews only (moderated in Supabase). With none approved yet, the client shows an attributed
// summary of public feedback on comparable mats plus a "be the first" call to action — never invented reviews.
export async function Reviews() {
  const r = copy.reviews;
  const [summary, items] = await Promise.all([getReviewSummaryCached(), getApprovedReviewsCached(40)]);
  return (
    <Section id="reviews" bg="bg-bg">
      <div className="flex flex-col gap-[22px] xl:gap-8">
        <div className="flex flex-col gap-3">
          <Eyebrow>{r.eyebrow}</Eyebrow>
          <H2>{r.h2}</H2>
        </div>
        {summary.count > 0 && <Reveal><RatingSummary summary={summary} /></Reveal>}
        <Suspense fallback={null}>
          <ReviewsClient items={items} summary={summary} />
        </Suspense>
      </div>
    </Section>
  );
}
