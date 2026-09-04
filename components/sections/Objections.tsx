import { copy } from '@/content/copy';
import { Eyebrow, H2, IconTile, Section } from '@/components/ui';

const c = copy.objections;

export function Objections() {
  return (
    <Section bg="bg-tint2">
      <div className="flex flex-col gap-8">
        <div className="flex flex-col gap-3">
          <Eyebrow>{c.eyebrow}</Eyebrow>
          <H2>{c.h2}</H2>
        </div>
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-[18px]">
          {c.cards.map((card) => (
            <div key={card.title} className="flex flex-col gap-3 p-4 xl:p-[22px] bg-surface rounded-card border border-border">
              <IconTile icon={card.icon} />
              <h3 className="text-[16px] xl:text-[19px]">{card.title}</h3>
              <p className="text-[13px] xl:text-[14px] leading-[1.6] text-muted text-pretty">{card.body}</p>
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
}
