import { Logo } from '@/components/icons';
import { ButtonLink } from '@/components/ui';
import { CatSit, MatBlob } from '@/components/fx/sprites';

export default function NotFound() {
  return (
    <main className="min-h-screen bg-bg flex flex-col items-center justify-center text-center gap-5 px-5">
      <Logo size={32} />
      <div className="flex items-end">
        <CatSit size={96} className="fx-float text-primary" />
        <MatBlob size={110} className="-ml-4 text-cta" />
      </div>
      <h1 className="text-[32px] xl:text-[40px] leading-[1.1]">Page not found</h1>
      <p className="text-[17px] text-muted">The mat is empty here. Head back to the Laro Hunt Mat.</p>
      <ButtonLink href="/" variant="primary">Back to the Laro Hunt Mat</ButtonLink>
    </main>
  );
}
