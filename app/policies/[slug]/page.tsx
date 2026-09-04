import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { policyPages } from '@/content/policies';
import { Logo } from '@/components/icons';
import { Container } from '@/components/ui';
import { Footer } from '@/components/sections/Footer';

export const dynamicParams = false;

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return policyPages.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const page = policyPages.find((p) => p.slug === slug);
  return page ? { title: page.title, description: page.description } : {};
}

export default async function PolicyPage({ params }: Props) {
  const { slug } = await params;
  const page = policyPages.find((p) => p.slug === slug);
  if (!page) notFound();

  return (
    <>
      <header className="py-[18px]">
        <Container>
          <Link href="/" className="inline-flex no-underline">
            <Logo size={28} />
          </Link>
        </Container>
      </header>
      <main>
        <Container className="max-w-[760px] py-12 flex flex-col gap-8">
          <div className="flex flex-col gap-3">
            <h1 className="text-[32px] xl:text-[40px] leading-[1.1] text-pretty">{page.title}</h1>
            <p className="text-[17px] text-muted">{page.description}</p>
          </div>
          {page.sections.map((s) => (
            <section key={s.heading} className="flex flex-col gap-3">
              <h2 className="text-[22px] leading-[1.2]">{s.heading}</h2>
              {s.body.map((para) => (
                <p key={para} className="text-[16px] leading-[1.7] text-muted">{para}</p>
              ))}
            </section>
          ))}
        </Container>
      </main>
      <Footer />
    </>
  );
}
