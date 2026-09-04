import type { MetadataRoute } from 'next';
import { policyPages } from '@/content/policies';

const base = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

export default function sitemap(): MetadataRoute.Sitemap {
  return ['/', '/checkout', ...policyPages.map((p) => `/policies/${p.slug}`)].map((path) => ({ url: `${base}${path}` }));
}
