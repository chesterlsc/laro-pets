'use client';
import Image from 'next/image';
import { copy } from '@/content/copy';
import { images } from '@/content/images';
import { product, tierById, type Print, type TierId } from '@/content/product';
import { Icon } from '@/components/icons';
import { track } from '@/lib/analytics';
import { useCart } from '@/lib/cart';
import { peso } from '@/lib/pricing';

const swatch = { fish: images.patternFish, duck: images.patternDuck } as const;

export function OrderStep() {
  const { cart, setTier, setExtraRefills, setPrint } = useCart();
  const tier = tierById(cart.tier);

  return (
    <div className="flex flex-col gap-6">
      <fieldset className="m-0 border-0 p-0">
        <legend className="mb-3 text-[14px] font-extrabold text-muted">Bundle</legend>
        <div className="flex flex-col gap-3">
          {product.tiers.map((t) => (
            <label key={t.id} className="relative flex cursor-pointer items-center gap-4 rounded-inner border-2 border-border bg-white p-4 transition-colors has-[:checked]:border-cta has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-accent2 has-[:focus-visible]:outline-offset-3">
              <input type="radio" name="tier" value={t.id} checked={cart.tier === t.id} onChange={() => { setTier(t.id as TierId); track('select_bundle', { tier: t.id }); }} className="size-5 shrink-0 accent-cta" />
              <span className="flex min-w-0 flex-1 flex-col gap-1">
                <span className="flex flex-wrap items-center gap-2">
                  <span className="font-display text-[20px] font-bold leading-none">{t.name}</span>
                  {t.tag && <span className="rounded-full bg-cta px-[10px] py-[4px] text-[11px] font-extrabold uppercase tracking-[0.08em] text-white">{t.tag}</span>}
                </span>
                <span className="text-[14px] leading-[1.5] text-muted">{t.contents}</span>
              </span>
              <span className="flex shrink-0 flex-col items-end gap-1">
                <span className="font-display text-[24px] font-bold leading-none">{peso(t.price)}</span>
                <span className={`text-[13px] font-extrabold ${t.save ? 'text-cta' : 'text-muted'}`}>{t.save ? `Save ${peso(t.save)}` : copy.bundles.singleMat}</span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="flex flex-col gap-4 rounded-card border border-dashed border-[#FF6A45] bg-tint2 p-5 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <Image {...images.feathers} alt={images.feathers.alt} sizes="56px" className="size-14 rounded-full object-cover" />
          <div className="flex flex-col gap-1">
            <span className="font-display text-[18px] font-bold">{copy.bundles.addon.title}</span>
            <span className="text-[13px] text-muted">{copy.bundles.addon.sub}</span>
          </div>
        </div>
        <div className="flex items-center gap-3" role="group" aria-label="Extra refill packs">
          <button type="button" aria-label="Remove a refill pack" disabled={cart.extraRefills === 0} onClick={() => { setExtraRefills(cart.extraRefills - 1); track('add_refill', { count: cart.extraRefills - 1 }); }} className="flex size-11 items-center justify-center rounded-full border-2 border-border bg-white text-ink disabled:opacity-40">
            <Icon name="minus" />
          </button>
          <span className="min-w-6 text-center font-display text-[22px] font-bold" aria-live="polite">{cart.extraRefills}</span>
          <button type="button" aria-label="Add a refill pack" disabled={cart.extraRefills >= product.limits.maxExtraRefills} onClick={() => { setExtraRefills(cart.extraRefills + 1); track('add_refill', { count: cart.extraRefills + 1 }); }} className="flex size-11 items-center justify-center rounded-full border-2 border-cta bg-white text-cta disabled:opacity-40">
            <Icon name="plus" />
          </button>
          <span className="ml-2 font-display text-[22px] font-bold">{copy.bundles.addon.plus}</span>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {Array.from({ length: tier.mats }, (_, i) => (
          <fieldset key={i} className="m-0 flex flex-wrap items-center gap-3 border-0 p-0">
            <legend className="float-left mr-1 min-w-[56px] text-[14px] font-extrabold text-muted">Mat {i + 1}</legend>
            {product.prints.map((p) => (
              <label key={p} className="flex min-h-11 cursor-pointer items-center gap-[10px] rounded-full border-2 border-border bg-white py-1 pl-1 pr-4 text-[15px] font-extrabold capitalize has-[:checked]:border-cta has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-accent2">
                <input type="radio" name={`print-${i}`} value={p} checked={cart.prints[i] === p} onChange={() => { setPrint(i, p as Print); track('select_print', { mat: i + 1, print: p }); }} className="sr-only" />
                <Image {...swatch[p]} alt={swatch[p].alt} sizes="40px" className="size-10 rounded-full object-cover" />
                {p}
              </label>
            ))}
          </fieldset>
        ))}
      </div>
    </div>
  );
}
