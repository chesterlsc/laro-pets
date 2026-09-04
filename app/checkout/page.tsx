import type { Metadata } from 'next';
import Link from 'next/link';
import { Icon, Logo } from '@/components/icons';
import { Container } from '@/components/ui';
import { DeliveryForm } from '@/components/checkout/DeliveryForm';
import { OrderStep } from '@/components/checkout/OrderStep';
import { OrderSummary } from '@/components/checkout/OrderSummary';

export const metadata: Metadata = { title: 'Checkout', robots: { index: false } };

const card = 'rounded-card border border-border bg-white p-6 xl:p-7';

export default async function CheckoutPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const cancelled = (await searchParams).cancelled === '1';
  return (
    <>
      <header className="border-b border-border bg-white">
        <Container className="flex items-center justify-between py-[18px]">
          <Link href="/" aria-label="Laro Pets home"><Logo size={28} /></Link>
          <span className="flex items-center gap-[6px] text-[13px] text-muted"><Icon name="lock" size={16} />Secure guest checkout</span>
        </Container>
      </header>
      <main className="py-8 xl:py-12">
        <Container>
          <h1 className="mb-6 text-[32px] xl:text-[40px]">Checkout</h1>
          {cancelled && <p role="status" className="mb-6 rounded-inner border-2 border-accent2 bg-sample px-4 py-3 text-[15px] font-bold">Payment cancelled — your order was not placed.</p>}
          <div className="grid gap-6 lg:grid-cols-12 lg:items-start">
            <div className="lg:hidden"><OrderSummary /></div>
            <div className="flex flex-col gap-6 lg:col-span-7">
              <section className={card} aria-labelledby="step1">
                <h2 id="step1" className="mb-5 text-[24px]"><span className="text-primary">1.</span> Your order</h2>
                <OrderStep />
              </section>
              <section className={card} aria-labelledby="step2">
                <h2 id="step2" className="mb-5 text-[24px]"><span className="text-primary">2.</span> Delivery &amp; payment</h2>
                <DeliveryForm />
              </section>
            </div>
            <div className="hidden lg:col-span-5 lg:block"><OrderSummary /></div>
          </div>
        </Container>
      </main>
    </>
  );
}
