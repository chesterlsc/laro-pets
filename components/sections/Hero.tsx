import { Icon, Stars } from '@/components/icons';
import { ButtonLink, Container, Sticker } from '@/components/ui';
import { copy } from '@/content/copy';
import { product } from '@/content/product';
import { peso } from '@/lib/pricing';
import { DemoButton, DemoCard } from './VideoModal';

const { hero } = copy;
const solo = peso(product.prices.solo);
const bundle = peso(product.prices.bundle);

export function Hero() {
  return (
    <section className="bg-bg pt-2 pb-10 xl:pt-10 xl:pb-[72px]">
      <Container>
        {/* Mobile: one column in mockup order (via `contents` + `order`). lg+: 7/5 grid. */}
        <div className="flex flex-col gap-[18px] lg:grid lg:grid-cols-12 lg:items-center lg:gap-10">
          <div className="contents lg:relative lg:z-[1] lg:col-span-7 lg:flex lg:flex-col lg:gap-[22px]">
            <h1 className="flex">
              <span className="inline-flex items-center gap-[6px] whitespace-nowrap rounded-full bg-tint px-3 py-[6px] text-[13px] font-bold leading-[1.2] text-primary xl:text-[14px]">
                <Icon name="sparkle" size={17} />{product.h1}
              </span>
            </h1>
            <p className="font-display text-[38px] font-bold leading-[1.05] tracking-[-0.02em] text-ink text-pretty xl:text-[62px]">
              {hero.tagline.a}<br className="hidden xl:inline" /> {hero.tagline.b}<span className="text-cta">{hero.tagline.accent}</span>
            </p>
            <p className="text-[15px] leading-[1.6] text-muted text-pretty lg:max-w-[560px] xl:text-[19px]">
              <span className="lg:hidden">{hero.leadMobile}</span>
              <span className="hidden lg:inline">{hero.leadDesktop}</span>
            </p>

            {/* Price row — mobile */}
            <div className="flex flex-wrap items-center justify-between gap-3 lg:hidden">
              <span className="flex flex-col gap-1">
                <span className="font-display text-[40px] font-bold leading-none text-ink">{solo}</span>
                <span className="text-[13px] font-bold text-muted">{hero.priceNoteMobile.pre}<span className="text-primary">{bundle}</span>{hero.priceNoteMobile.post}</span>
              </span>
              <span className="flex flex-col items-end gap-1">
                <Stars size={15} label={hero.ratingMobile} />
                <span className="text-[11px] font-bold text-muted">{hero.ratingMobile}</span>
              </span>
            </div>
            {/* Price row — desktop */}
            <div className="hidden flex-wrap items-center gap-[18px] lg:flex">
              <span className="font-display text-[52px] font-bold leading-none text-ink">{solo}</span>
              <span className="flex flex-col gap-1">
                <span className="text-[15px] font-extrabold text-primary">{hero.priceNoteDesktop}</span>
                <span className="flex items-center gap-2">
                  <Stars size={15} label={hero.ratingDesktop} />
                  <span className="text-[13px] font-bold text-muted">{hero.ratingDesktop}</span>
                </span>
              </span>
            </div>

            <div className="contents lg:flex lg:flex-wrap lg:items-center lg:gap-[14px]">
              <div id="hero-buy">
                <ButtonLink href="/checkout" icon="cart" full className="lg:w-auto">{hero.buyNow}</ButtonLink>
              </div>
              <div className="order-2 lg:order-none">
                <DemoButton variant="secondary" size="md" icon="play" full className="lg:w-auto lg:px-7 lg:py-[18px] lg:text-[18px]">
                  <span className="lg:hidden">{hero.watchDemoMobile}</span>
                  <span className="hidden lg:inline">{hero.watchDemoDesktop}</span>
                </DemoButton>
              </div>
            </div>

            <ul className="order-3 grid grid-cols-2 gap-[14px] pt-[6px] lg:order-none lg:max-w-[600px] lg:gap-x-6 lg:gap-y-4 lg:pt-2">
              {hero.trust.map((t) => (
                <li key={t.title} className="flex items-center gap-[10px] lg:gap-3">
                  <span className="shrink-0 text-primary lg:flex lg:h-10 lg:w-10 lg:items-center lg:justify-center lg:rounded-[12px] lg:bg-tint">
                    <Icon name={t.icon} size={22} />
                  </span>
                  <span className="flex flex-col lg:gap-[2px]">
                    <span className="text-[13px] font-extrabold text-ink lg:text-[14px]">{t.title}</span>
                    <span className="text-[12px] text-muted lg:text-[13px]">{t.sub}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Video card + blob + stickers */}
          <div className="relative order-1 flex justify-center pt-3 pb-2 lg:order-none lg:col-span-5 lg:min-h-[620px] lg:items-center lg:p-0">
            <svg width="560" height="560" viewBox="0 0 200 200" aria-hidden="true" className="absolute top-10 left-[30px] z-0 h-[300px] w-[300px] rotate-[12deg] lg:top-5 lg:left-[-40px] lg:h-[560px] lg:w-[560px] lg:rotate-[18deg]">
              <path d="M45 30c30-25 80-25 110 0s45 70 25 105-70 55-110 40S5 120 10 80 15 55 45 30z" className="fill-tint" />
            </svg>
            <div className="relative z-[1] lg:rotate-[-2deg]">
              <DemoCard image="videoPounce" label={hero.videoLabel} time={product.demoVideo.durationLabel} priority sizes="(max-width: 900px) 300px, 380px" aria-label="Play the 20-second demo" className="h-[400px] w-[300px] lg:h-[520px] lg:w-[380px]" captionClass="text-[18px] xl:text-[22px]" caption={<>{hero.videoHook.pre}<span className="text-accent2">{hero.videoHook.accent}</span></>} />
              {/* mobile stickers */}
              <Sticker tone="yellow" rotate={-8} className="top-[118px] left-[-4px] text-[14px] lg:hidden">{hero.stickers.speeds}</Sticker>
              <Sticker tone="white" rotate={6} className="top-[214px] right-[-2px] text-[14px] lg:hidden">{hero.stickers.quietMobile}</Sticker>
              <Sticker tone="teal" rotate={-4} className="bottom-[118px] left-[-8px] text-[13px] lg:hidden">{hero.stickers.typeC}</Sticker>
              {/* desktop stickers */}
              <Sticker tone="yellow" rotate={-10} className="hidden top-[130px] left-[-14px] text-[16px] lg:block">{hero.stickers.speeds}</Sticker>
              <Sticker tone="white" rotate={7} className="hidden top-[120px] right-[-6px] text-[15px] lg:block">{hero.stickers.quietDesktop}</Sticker>
              <Sticker tone="teal" rotate={-5} className="hidden bottom-[70px] left-[-4px] text-[15px] lg:block">{hero.stickers.typeC}</Sticker>
              <Sticker tone="coral" rotate={4} className="hidden right-2 bottom-6 text-[15px] lg:block">{hero.stickers.feathers}</Sticker>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
