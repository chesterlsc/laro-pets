import { CatPounce, MatBlob } from '@/components/fx/sprites';

export default function Loading() {
  return (
    <div aria-busy="true" className="flex min-h-screen flex-col items-center justify-center gap-5 bg-bg px-5 text-ink">
      <div aria-hidden="true" className="relative h-[120px] w-[120px]">
        <MatBlob size={120} className="fx-float absolute inset-0 fill-tint" />
        <CatPounce size={72} className="fx-loading-cat absolute left-[22px] top-[18px]" />
      </div>
      <p className="font-display text-[22px] font-semibold">Fetching the feather…</p>
    </div>
  );
}
