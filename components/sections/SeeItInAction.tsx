import { Container, Eyebrow } from '@/components/ui';
import { copy } from '@/content/copy';
import { ugc, ugcSlotHooks } from '@/content/ugc';
import { DemoButton, DemoCard } from './VideoModal';

const ugcCard = 'flex flex-col gap-[10px] rounded-inner border border-white/35 bg-ink/10 p-4';
const ugcLabel = 'text-[11px] font-extrabold uppercase tracking-[0.12em] text-accent2';
const ugcHook = 'font-display text-[16px] font-semibold leading-[1.3] text-white xl:text-[18px]';
const ugcMeta = 'text-[12px] text-white/80';

export function SeeItInAction() {
  const { action } = copy;
  return (
    <section id="see-it-in-action" className="scroll-mt-16 bg-primary py-11 text-white xl:py-[88px]">
      <Container>
        <div className="flex flex-col gap-5 xl:gap-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between lg:gap-10">
            <div className="flex flex-col gap-5 lg:max-w-[640px] lg:gap-3">
              <Eyebrow color="text-accent2">{action.eyebrow}</Eyebrow>
              <h2 className="text-[30px] leading-[1.1] text-white text-pretty xl:text-[44px]">{action.h2}</h2>
              <p className="text-[15px] leading-[1.6] text-white/80 text-pretty xl:text-[17px]">
                <span className="lg:hidden">{action.pMobile}</span>
                <span className="hidden lg:inline">{action.pDesktop}</span>
              </p>
            </div>
            <div className="hidden shrink-0 lg:block">
              <DemoButton size="md" icon="play">{action.playFull}</DemoButton>
            </div>
          </div>

          <div className="scroll-snap-x -mr-5 flex gap-3 overflow-x-auto md:-mr-10 lg:mr-0 lg:justify-between lg:gap-6 lg:overflow-visible">
            {action.clips.map((c) => (
              <DemoCard key={c.label} image={c.image} label={c.label} time={c.time} caption={c.caption} sizes="(max-width: 900px) 230px, 368px" aria-label={`Play the demo: ${c.caption}`} className="h-[330px] w-[230px] shrink-0 xl:h-[480px] xl:w-[368px]" captionClass="text-[17px] xl:text-[22px]" />
            ))}
          </div>

          <div className="grid gap-[10px] lg:grid-cols-3 lg:gap-5">
            {ugc.length === 0
              ? ugcSlotHooks.map((hook) => (
                  <div key={hook} className={`${ugcCard} border-dashed`}>
                    <span className={ugcLabel}>{action.ugcLabel}</span>
                    <span className={ugcHook}>{hook}</span>
                    <span className={ugcMeta}>{action.ugcMeta}</span>
                  </div>
                ))
              : ugc.map((c) => (
                  <div key={c.src} className={ugcCard}>
                    <video controls playsInline preload="none" poster={c.poster} className="aspect-[3/4] w-full rounded-[10px] bg-black object-cover">
                      <source src={c.src} type="video/mp4" />
                    </video>
                    <span className={ugcHook}>{c.hook}</span>
                    <span className={ugcMeta}>{c.handle} · {c.platform} · {c.views}</span>
                  </div>
                ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
