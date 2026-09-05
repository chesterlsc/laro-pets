import type { MetadataRoute } from 'next';
import { policyPages } from '@/content/policies';
import { SITE_URL } from '@/lib/seo';

export default function sitemap(): MetadataRoute.Sitemap {
  return ['/', ...policyPages.map((p) => `/policies/${p.slug}`)].map((path) => ({ url: `${SITE_URL}${path}` }));
}
