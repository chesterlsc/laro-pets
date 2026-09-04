import { Logo } from '@/components/icons';
import { ButtonLink } from '@/components/ui';

export default function NotFound() {
  return (
    <main className="min-h-screen bg-bg flex flex-col items-center justify-center text-center gap-5 px-5">
      <Logo size={32} />
      <h1 className="text-[32px] xl:text-[40px] leading-[1.1]">Page not found</h1>
      <p className="text-[17px] text-muted">The mat is empty here. Head back to the Laro Hunt Mat.</p>
      <ButtonLink href="/" variant="primary">Back to the Laro Hunt Mat</ButtonLink>
    </main>
  );
}
