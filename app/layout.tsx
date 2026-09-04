import type { Metadata } from 'next';
import { Fredoka, Nunito } from 'next/font/google';
import './globals.css';
import { CartProvider } from '@/lib/cart';
import { PlaceholderBanner } from '@/components/PlaceholderBanner';
import { Analytics } from '@/components/Analytics';

const fredoka = Fredoka({ subsets: ['latin'], weight: ['500', '600', '700'], variable: '--font-fredoka', display: 'swap' });
const nunito = Nunito({ subsets: ['latin'], weight: ['400', '600', '700', '800'], variable: '--font-nunito', display: 'swap' });

import { SITE_URL } from '@/lib/seo';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: 'Laro Pets — Laro Hunt Mat', template: '%s · Laro Pets' },
  description: 'Automatic toys for Filipino cats and dogs, shipped from Metro Manila.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-PH" className={`${fredoka.variable} ${nunito.variable}`}>
      <body>
        <PlaceholderBanner />
        <CartProvider>{children}</CartProvider>
        <Analytics />
      </body>
    </html>
  );
}
