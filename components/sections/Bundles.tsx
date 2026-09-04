'use client';
import Image from 'next/image';
import { copy } from '@/content/copy';
import { images } from '@/content/images';
import { product } from '@/content/product';
import { Icon } from '@/components/icons';
import { Button, ButtonLink, Eyebrow, H2, Section } from '@/components/ui';
import { useCart } from '@/lib/cart';
import { peso, quote } from '@/lib/pricing';
import { track } from '@/lib/analytics';

const imgCls = 'relative h-[150px] overflow-hidden rounded-inner xl:h-[170px]';
const sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 400px';

export function Bundles() {
  const { cart, setTier, setExtraRefills } = useCart();
  const b = copy.bundles;
  const q = quote({ tier: cart.tier, extraRefills: cart.extraRefills });
  const max = product.limits.maxExtraRefills;

  const setRefills = (n: number) => {
    setExtraRefills(n);
    track('add_refill', { count: n });
  };

  return (
    <Section id="bundles" bg="bg-bg">
      <div className="flex flex-col gap-6 xl:gap-9">
        <div className="flex flex-col items-start gap-3 text-left xl:items-center xl:text-center">
          <Eyebrow>{b.eyebrow}</Eyebrow>
          <H2>{b.h2}</H2>
          <p className="max-w-[640px] text-[16px] leading-[1.6] text-muted text-pretty xl:text-[18px]">{b.p}</p>
        </div>

        <div className="grid grid-cols-1 gap-7 pt-[14px] md:grid-cols-2 xl:grid-cols-3">
          {product.tiers.map((tier) => {
            const selected = cart.tier === tier.id;
            const featured = tier.id === 'bundle';
            const free = quote({ tier: tier.id, extraRefills: 0 }).shipping === 0;
            return (
              <div
                key={tier.id}
                className={`relative flex flex-col gap-[14px] rounded-card border-2 bg-surface p-[22px] xl:p-[26px] ${selected ? 'border-cta' : 'border-border'} ${featured ? 'shadow-card xl:-translate-y-2' : ''}`}
              >
                {tier.tag && (
                  <span className="absolute -top-[14px] left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-cta px-[14px] py-[6px] text-[12px] font-extrabold uppercase tracking-[0.08em] text-white">
                    {tier.tag}
                  </span>
                )}
                {tier.mats === 1 ? (
                  <div className={imgCls}>
                    <Image src={images.heroWhite.src} alt={images.heroWhite.alt} fill sizes={sizes} className="object-cover" />
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    <div className={imgCls}><Image src={images.heroWhite.src} alt={images.heroWhite.alt} fill sizes={sizes} className="object-cover" /></div>
                    <div className={imgCls}><Image src={images.catsCarpet.src} alt={images.catsCarpet.alt} fill sizes={sizes} className="object-cover" /></div>
                  </div>
                )}
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-[22px]">{tier.name}</h3>
                  {tier.save > 0 ? (
                    <span className="text-[13px] font-extrabold text-cta">Save {peso(tier.save)}</span>
                  ) : (
                    <span className="text-[13px] font-bold text-muted">{b.singleMat}</span>
                  )}
                </div>
                <p className="text-[14px] leading-[1.5] text-muted">{tier.contents}</p>
                <span className="font-display text-[36px] font-bold leading-none">{peso(tier.price)}</span>
                <span className={`inline-flex items-center gap-[6px] text-[13px] font-extrabold ${free ? 'text-primary' : 'text-muted'}`}>
                  <Icon name="truck" size={18} />
                  {free ? b.freeShipping : `+ ${peso(product.shipping.fee)} shipping`}
                </span>
                <Button
                  size="md"
                  full
                  variant={selected ? 'primary' : 'secondary'}
                  aria-pressed={selected}
                  onClick={() => { setTier(tier.id); track('select_bundle', { tier: tier.id }); }}
                >
                  Choose {tier.name}
                </Button>
              </div>
            );
          })}
        </div>

        <div className="flex flex-col items-stretch gap-[18px] rounded-card border border-dashed border-[#FF6A45] bg-tint2 p-5 xl:flex-row xl:items-center xl:justify-between xl:p-6">
          <div className="flex items-center gap-4">
            <Image {...images.feathers} alt={images.feathers.alt} width={72} height={72} className="h-[72px] w-[72px] shrink-0 rounded-full object-cover" />
            <div className="flex flex-col gap-1">
              <span className="font-display text-[20px] font-bold">{b.addon.title}</span>
              <span className="text-[14px] text-muted">{b.addon.sub}</span>
            </div>
          </div>
          <div className="flex items-center justify-between gap-[18px]">
            <div className="flex items-center gap-3">
              <button
                type="button"
                aria-label="Remove one refill pack"
                disabled={cart.extraRefills <= 0}
                onClick={() => setRefills(cart.extraRefills - 1)}
                className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-border bg-surface text-ink disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Icon name="minus" size={20} />
              </button>
              <span className="min-w-6 text-center font-display text-[22px] font-bold" aria-live="polite">{cart.extraRefills}</span>
              <button
                type="button"
                aria-label="Add one refill pack"
                disabled={cart.extraRefills >= max}
                onClick={() => setRefills(cart.extraRefills + 1)}
                className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-cta bg-surface text-cta disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Icon name="plus" size={20} />
              </button>
            </div>
            <span className="font-display text-[22px] font-bold">{b.addon.plus}</span>
          </div>
        </div>

        <div className="flex flex-col items-center gap-3">
          <ButtonLink href="/checkout" variant="ink" icon="arrow" className="w-full md:w-auto" onClick={() => track('begin_checkout', { value: q.total })}>
            {b.cta}
          </ButtonLink>
          <span className="text-center text-[13px] text-muted">{b.ctaNote}</span>
          {q.remaining > 0 && <span className="text-center text-[13px] font-bold text-primary">{peso(q.remaining)} more for free shipping</span>}
        </div>
      </div>
    </Section>
  );
}
