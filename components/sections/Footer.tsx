import Link from 'next/link';
import { copy } from '@/content/copy';
import { couriers, paymentMethods } from '@/content/policies';
import { Logo } from '@/components/icons';
import { Container, Pill } from '@/components/ui';

const c = copy.footer;
const label = 'text-[12px] font-extrabold uppercase tracking-[0.1em] text-muted';

export function Footer() {
  return (
    <footer className="bg-surface border-t border-border pt-10 pb-7 xl:pt-16 xl:pb-8">
      <Container className="flex flex-col gap-7">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-7">
          <div className="flex flex-col gap-3">
            <Link href="/" className="self-start no-underline">
              <Logo size={26} />
            </Link>
            <p className="text-[14px] leading-[1.5] text-muted">{c.tagline}</p>
          </div>
          {c.columns.map((col) => (
            <div key={col.title} className="flex flex-col gap-2">
              <span className="text-[13px] font-extrabold uppercase tracking-[0.1em]">{col.title}</span>
              {col.links.map((l) => (
                <Link key={l.label} href={l.href} className="text-[14px] leading-[1.4] text-muted no-underline hover:text-cta">
                  {l.label}
                </Link>
              ))}
            </div>
          ))}
        </div>
        <div className="flex flex-col gap-[10px]">
          <span className={label}>{c.weAccept}</span>
          <div className="flex flex-wrap items-center gap-2">
            {paymentMethods.map((m) => <Pill key={m}>{m}</Pill>)}
          </div>
          <span className={`${label} mt-[6px]`}>{c.deliveredBy}</span>
          <div className="flex flex-wrap items-center gap-2">
            {couriers.map((m) => <Pill key={m}>{m}</Pill>)}
          </div>
        </div>
        <p className="text-[13px] leading-[1.6] text-muted">{c.seo}</p>
        <p className="text-[12px] text-muted">{c.legal}</p>
      </Container>
    </footer>
  );
}
