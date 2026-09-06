import type { Metadata } from 'next';
import { createElement } from 'react';
import { copy } from '@/content/copy';
import { images } from '@/content/images';
import { product } from '@/content/product';
import type { Summary } from '@/lib/reviews';
import { peso } from '@/lib/pricing';

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
const abs = (path: string) => `${SITE_URL}${path}`;

const title = 'Automatic Hide-and-Seek Cat Teaser Toy (Laro Hunt Mat) — COD, Free Shipping PH';
const description =
  `Laro Hunt Mat is an automatic cat teaser: a feather hides under a 60 cm mat and sweeps around like real prey. 3 speeds, USB-C, spare feathers included. ${peso(product.prices.solo)}, free shipping on ${peso(product.shipping.freeFrom)}+, Cash on Delivery available.`;

export const homeMetadata: Metadata = {
  title: { absolute: title },
  description,
  alternates: { canonical: '/' },
  openGraph: { type: 'website', locale: 'en_PH', siteName: product.brand, url: '/', title, description },
  twitter: { card: 'summary_large_image', title, description },
};

export function productJsonLd(summary?: Pick<Summary, 'count' | 'average'>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    image: [images.heroWhite, images.catsCarpet, images.floorTopdown].map((i) => abs(i.src)),
    description,
    brand: { '@type': 'Brand', name: product.brand },
    sku: product.sku.fish,
    additionalProperty: [{ '@type': 'PropertyValue', name: 'Duck print SKU', value: product.sku.duck }],
    offers: {
      '@type': 'Offer',
      price: product.prices.solo,
      priceCurrency: 'PHP',
      availability: 'https://schema.org/InStock',
      url: SITE_URL,
      itemCondition: 'https://schema.org/NewCondition',
      shippingDetails: {
        '@type': 'OfferShippingDetails',
        shippingRate: { '@type': 'MonetaryAmount', value: product.shipping.fee, currency: 'PHP' },
        shippingDestination: { '@type': 'DefinedRegion', addressCountry: 'PH' },
      },
      hasMerchantReturnPolicy: {
        '@type': 'MerchantReturnPolicy',
        applicableCountry: 'PH',
        returnPolicyCategory: 'https://schema.org/MerchantReturnFiniteReturnWindow',
        merchantReturnDays: 30,
        returnMethod: 'https://schema.org/ReturnByMail',
        returnFees: 'https://schema.org/FreeReturn',
      },
    },
    // Only real, approved customer reviews feed the rating Google sees.
    ...(summary && summary.count >= 1 && {
      aggregateRating: { '@type': 'AggregateRating', ratingValue: summary.average, reviewCount: summary.count, bestRating: 5, worstRating: 1 },
    }),
  };
}

export function videoJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'VideoObject',
    name: 'Laro Hunt Mat — 20-second demo',
    description: copy.action.pDesktop,
    thumbnailUrl: abs(images.videoPounce.src),
    uploadDate: product.demoVideo.uploadDate,
    duration: 'PT20S',
    contentUrl: abs(product.demoVideo.src),
  };
}

export function JsonLd({ data }: { data: object }) {
  return createElement('script', { type: 'application/ld+json', dangerouslySetInnerHTML: { __html: JSON.stringify(data) } });
}
