import { copy } from '@/content/copy';
import { ButtonLink, Container } from '@/components/ui';
import { CatChase } from '@/components/fx/CatChase';
import { SHOW_ORDERS_FROM } from '@/lib/social-shared';

const c = copy.finalCta;

export function FinalCta({ orders = 0 }: { orders?: number }) {
  return (
    <section className="bg-cta py-10 xl:py-14 text-white">
      <Container>
        <div className="flex flex-col items-stretch xl:flex-row xl:items-center xl:justify-between gap-6">
          <CatChase tone="dark" className="w-[260px] max-w-full shrink-0" />
          <div className="flex flex-col gap-2 xl:flex-1">
            <h2 className="text-[30px] xl:text-[40px] text-white">{c.h2}</h2>
            <p className="text-[15px] xl:text-[17px] text-white">{c.p}</p>
            {orders >= SHOW_ORDERS_FROM && <p className="text-[14px] font-extrabold text-accent2">{copy.trust.ctaSocial(orders)}</p>}
          </div>
          <ButtonLink href="/checkout" variant="ink" size="lg" icon="cart" className="w-full xl:w-auto">
            {c.button}
          </ButtonLink>
        </div>
      </Container>
    </section>
  );
}
