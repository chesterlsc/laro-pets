import { copy } from '@/content/copy';
import { couriers } from '@/content/policies';
import { Icon } from '@/components/icons';
import { Container, Pill } from '@/components/ui';

export function ShippingBand() {
  const s = copy.shippingBand;
  return (
    <section className="bg-primary py-8 text-white lg:py-9">
      <Container>
        <div className="flex flex-col gap-[14px] lg:flex-row lg:items-center lg:justify-between lg:gap-10">
          <div className="grid grid-cols-[auto_1fr] items-center gap-x-3 gap-y-[14px] lg:gap-x-5 lg:gap-y-[6px]">
            <Icon name="truck" className="h-[30px] w-[30px] text-accent2 lg:row-span-2 lg:h-11 lg:w-11" />
            <h2 className="text-[24px] text-white lg:text-[30px]">
              <span className="lg:hidden">{s.h2Mobile}</span>
              <span className="hidden lg:inline">{s.h2Desktop}</span>
            </h2>
            <p className="col-span-2 text-[14px] leading-[1.5] text-white/85 lg:col-span-1 lg:col-start-2 lg:text-[15px]">
              {s.line}<span className="lg:hidden">.</span>
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {couriers.map((c) => <Pill key={c} tone="dark">{c}</Pill>)}
          </div>
        </div>
      </Container>
    </section>
  );
}
