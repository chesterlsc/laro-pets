import { Icon } from '@/components/icons';
import { copy } from '@/content/copy';

export function Marquee() {
  return (
    <div className="overflow-hidden bg-accent2 py-3 xl:py-4">
      {/* Two identical lists; the track slides -50% so the loop is seamless. Static under reduced motion (globals.css). */}
      <div className="marquee-track flex w-max">
        {[false, true].map((dup) => (
          <ul key={String(dup)} aria-hidden={dup || undefined} className="flex gap-7 pr-7 xl:gap-10 xl:pr-10">
            {copy.marquee.map((item) => (
              <li key={item} className="inline-flex items-center gap-3 whitespace-nowrap font-display text-[15px] font-bold text-ink xl:text-[18px]">
                <Icon name="paw" size={18} className="text-cta" />{item}
              </li>
            ))}
          </ul>
        ))}
      </div>
    </div>
  );
}
