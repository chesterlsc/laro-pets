import Image from 'next/image';
import { copy } from '@/content/copy';
import { images } from '@/content/images';
import { Chip, Eyebrow, H2, Section } from '@/components/ui';

export function HowItWorks() {
  const { eyebrow, h2, p, steps, chips } = copy.how;
  return (
    <Section id="how-it-works" bg="bg-bg">
      <div className="flex flex-col gap-7 xl:gap-10">
        <div className="flex flex-col items-start gap-3 text-left xl:items-center xl:text-center">
          <Eyebrow>{eyebrow}</Eyebrow>
          <H2>{h2}</H2>
          <p className="max-w-[620px] text-[16px] leading-[1.6] text-muted text-pretty xl:text-[18px]">{p}</p>
        </div>

        <div className="grid grid-cols-1 gap-7 pt-2 md:grid-cols-2 xl:grid-cols-3">
          {steps.map((step, i) => (
            <div key={step.title} className="relative flex flex-col gap-4 rounded-card border border-border bg-surface p-5 xl:p-7">
              <span className="absolute -top-[14px] left-5 flex h-10 w-10 items-center justify-center rounded-full bg-cta font-display text-[18px] font-bold text-white shadow-step" aria-hidden="true">
                {i + 1}
              </span>
              <div className="relative h-[200px] overflow-hidden rounded-inner xl:h-[220px]">
                <Image src={images[step.image].src} alt={images[step.image].alt} fill sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 400px" className="object-cover" />
              </div>
              <h3 className="text-[22px] xl:text-[24px]">
                <span className="sr-only">Step {i + 1}: </span>
                {step.title}
              </h3>
              <p className="text-[15px] leading-[1.6] text-muted text-pretty">{step.body}</p>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap justify-start gap-[10px] xl:justify-center">
          {chips.map((c) => (
            <Chip key={c.label} icon={c.icon}>{c.label}</Chip>
          ))}
        </div>
      </div>
    </Section>
  );
}
