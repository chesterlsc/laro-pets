import Image from 'next/image';
import { copy } from '@/content/copy';
import { images } from '@/content/images';
import { placeholders } from '@/content/placeholders';
import { reviews } from '@/content/reviews';
import { Icon, Stars } from '@/components/icons';
import { Eyebrow, H2, Section } from '@/components/ui';

const photos = [images.floorTopdown, images.catsCarpet, images.videoStalk];

export function Reviews() {
  const r = copy.reviews;
  return (
    <Section id="reviews" bg="bg-bg">
      <div className="flex flex-col gap-[22px] xl:gap-8">
        <div className="flex flex-col items-start gap-[18px] xl:flex-row xl:items-end xl:justify-between">
          <div className="flex flex-col gap-3">
            <Eyebrow>{r.eyebrow}</Eyebrow>
            <H2>{r.h2}</H2>
          </div>
          <div className="flex items-center gap-[14px] rounded-full border border-border bg-surface px-[18px] py-[14px]">
            <Stars size={20} label={`${placeholders.rating} out of 5 stars`} />
            <span className="font-display text-[22px] font-bold">{placeholders.rating}</span>
            <span className="text-[14px] text-muted">{r.summary}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-[18px] md:grid-cols-2 xl:grid-cols-4">
          {reviews.items.map((item) => (
            <div key={item.name} className="flex flex-col gap-3 rounded-card border border-border bg-surface p-[22px]">
              <div className="flex items-center justify-between gap-[10px]">
                <Stars count={item.stars} size={16} />
                {reviews.sample && (
                  <span className="whitespace-nowrap rounded-[6px] bg-sample px-2 py-[3px] text-[10px] font-extrabold uppercase tracking-[0.12em] text-ink">{r.sampleTag}</span>
                )}
              </div>
              <p className="text-[15px] leading-[1.6] text-ink">{item.text}</p>
              <div className="mt-auto flex items-center gap-[10px]">
                <span className="flex h-[34px] w-[34px] items-center justify-center rounded-full bg-tint text-primary">
                  <Icon name="user" size={18} />
                </span>
                <span className="flex flex-col">
                  <span className="text-[14px] font-extrabold">{item.name}</span>
                  <span className="text-[12px] text-muted">{item.city}</span>
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-2 xl:gap-4">
          {photos.map((img) => (
            <div key={img.src} className="relative h-[106px] overflow-hidden rounded-inner xl:h-[240px]">
              <Image src={img.src} alt={img.alt} fill sizes="(max-width: 900px) 33vw, 400px" className="object-cover" />
              <span className="absolute bottom-[10px] left-[10px] rounded-[6px] bg-white/92 px-2 py-1 text-[9px] font-extrabold uppercase tracking-[0.08em] text-ink lg:text-[11px]">
                <span className="lg:hidden">{r.photoSlotMobile}</span>
                <span className="hidden lg:inline">{r.photoSlotDesktop}</span>
              </span>
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
}
