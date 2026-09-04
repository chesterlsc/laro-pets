import type { Metadata } from 'next';
import { homeMetadata, productJsonLd, videoJsonLd, JsonLd } from '@/lib/seo';
import { AnnouncementBar } from '@/components/sections/AnnouncementBar';
import { Header } from '@/components/sections/Header';
import { Hero } from '@/components/sections/Hero';
import { VideoModalProvider } from '@/components/sections/VideoModal';
import { StickyBuyBar } from '@/components/sections/StickyBuyBar';
import { Marquee } from '@/components/sections/Marquee';
import { SeeItInAction } from '@/components/sections/SeeItInAction';
import { HowItWorks } from '@/components/sections/HowItWorks';
import { Bundles } from '@/components/sections/Bundles';
import { ShippingBand } from '@/components/sections/ShippingBand';
import { Reviews } from '@/components/sections/Reviews';
import { Objections } from '@/components/sections/Objections';
import { Specs } from '@/components/sections/Specs';
import { Faq } from '@/components/sections/Faq';
import { FinalCta } from '@/components/sections/FinalCta';
import { Footer } from '@/components/sections/Footer';
import { ViewItem } from '@/components/ViewItem';

export const metadata: Metadata = homeMetadata;

export default function Home() {
  return (
    <VideoModalProvider>
      <JsonLd data={productJsonLd()} />
      <JsonLd data={videoJsonLd()} />
      <ViewItem />
      <AnnouncementBar />
      <Header />
      <main>
        <Hero />
        <Marquee />
        <SeeItInAction />
        <HowItWorks />
        <Bundles />
        <ShippingBand />
        <Reviews />
        <Objections />
        <Specs />
        <Faq />
        <FinalCta />
      </main>
      <Footer />
      <StickyBuyBar />
    </VideoModalProvider>
  );
}
