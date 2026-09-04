import Image from 'next/image';
import { copy } from '@/content/copy';
import { images } from '@/content/images';
import { Icon } from '@/components/icons';
import { Section } from '@/components/ui';

const c = copy.specs;
const heading = 'text-[28px] leading-[1.1] text-pretty';

export function Specs() {
  return (
    <Section>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7 flex flex-col gap-[14px]">
          <h2 className={heading}>{c.h2}</h2>
          <div>
            {c.rows.map(([label, value]) => (
              <div key={label} className="grid grid-cols-3 gap-4 py-3 border-b border-border">
                <span className="text-[14px] font-extrabold text-ink">{label}</span>
                <span className="col-span-2 text-[14px] leading-[1.5] text-muted">{value}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="lg:col-span-5">
          <div className="flex flex-col gap-4 p-6 bg-surface rounded-card border border-border">
            <h3 className={heading}>{c.boxH2}</h3>
            <ul className="flex flex-col gap-[10px] list-none m-0 p-0">
              {c.box.map((item) => (
                <li key={item} className="flex items-center gap-[10px] text-[15px] text-ink">
                  <Icon name="check" size={18} className="text-primary" />
                  {item}
                </li>
              ))}
            </ul>
            <div className="flex items-center gap-3 pt-[6px]">
              <Image {...images.patternFish} alt={images.patternFish.alt} sizes="64px" className="w-16 h-16 rounded-full object-cover" />
              <Image {...images.patternDuck} alt={images.patternDuck.alt} sizes="64px" className="w-16 h-16 rounded-full object-cover" />
              <span className="text-[14px] text-muted">{c.printNote}</span>
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
}
