import { Icon } from '@/components/icons';
import { copy } from '@/content/copy';
import { CatStalk } from '@/components/fx/sprites';

export function Marquee() {
  return (
    <div className="relative overflow-hidden bg-accent2 py-3 xl:py-4">
      {/* Cat walks the band: outer span crosses (laro-cross), inner span bobs (laro-walk). Hidden under reduced motion. */}
      <span aria-hidden="true" className="pointer-events-none absolute bottom-0 left-0 z-[1] text-cta motion-reduce:hidden" style={{ animation: 'laro-cross 18s linear infinite' }}>
        <span className="block" style={{ animation: 'laro-walk 0.6s ease-in-out infinite' }}><CatStalk size={28} /></span>
      </span>
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
