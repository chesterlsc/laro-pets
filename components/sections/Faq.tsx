'use client';
import { useState } from 'react';
import { copy } from '@/content/copy';
import { Icon } from '@/components/icons';
import { Eyebrow, H2, Section } from '@/components/ui';

const c = copy.faq;

export function Faq() {
  const [open, setOpen] = useState<Set<number>>(() => new Set([0]));
  const toggle = (i: number) =>
    setOpen((prev) => {
      const next = new Set(prev);
      if (!next.delete(i)) next.add(i);
      return next;
    });

  return (
    <Section id="faq">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-4 flex flex-col gap-3">
          <Eyebrow>{c.eyebrow}</Eyebrow>
          <H2 size="xl:text-[40px]">{c.h2}</H2>
          <p className="text-[15px] leading-[1.6] text-muted text-pretty">{c.side}</p>
        </div>
        <div className="lg:col-span-8">
          {c.items.map((item, i) => {
            const isOpen = open.has(i);
            const panelId = `faq-panel-${i}`;
            return (
              <div key={item.q} className="flex flex-col gap-[10px] py-[18px] border-b border-border">
                <h3 className="text-[17px] leading-[1.3]">
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    onClick={() => toggle(i)}
                    className="flex w-full items-center justify-between gap-4 min-h-[44px] text-left font-display font-bold text-ink bg-transparent border-0 p-0 cursor-pointer"
                  >
                    {item.q}
                    <Icon name="chevron" size={20} className={`text-primary transition-transform motion-reduce:transition-none ${isOpen ? 'rotate-180' : ''}`} />
                  </button>
                </h3>
                <p id={panelId} hidden={!isOpen} className="text-[15px] leading-[1.6] text-muted pb-1">
                  {item.a}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </Section>
  );
}
