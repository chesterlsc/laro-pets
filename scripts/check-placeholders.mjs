// Runs before `next build`. Lists every bracketed placeholder still in content/placeholders.ts and the
// "[Proposed policy]" labels in content/policies.ts. Warns everywhere; on a Vercel PRODUCTION build it fails
// so an unfilled store can't go live by accident (bypass for a staging deploy with LARO_ALLOW_PLACEHOLDERS=1).
import { readFileSync } from 'node:fs';
const read = (p) => readFileSync(new URL(p, import.meta.url), 'utf8');
const src = read('../content/placeholders.ts');
const found = [...src.matchAll(/(\w+):\s*'([^']*\[[^']*\][^']*)'/g)].map((m) => `${m[1]} = ${m[2]}`);
if (/\[Proposed policy\]/.test(read('../content/policies.ts'))) found.push('policies: guarantee / warranty still marked "[Proposed policy]"');
if (/sample:\s*true/.test(read('../content/reviews.ts'))) found.push('reviews: sample reviews still enabled (content/reviews.ts sample: true)');
const site = process.env.NEXT_PUBLIC_SITE_URL ?? '';
if (!site || /localhost/.test(site)) found.push(`NEXT_PUBLIC_SITE_URL is ${site ? site : 'unset'} — canonical, OG and PayMongo redirects will point at localhost`);

if (found.length) {
  console.warn('\n⚠  Laro Pets — not ready for launch (see SPEC.md Appendix C):');
  for (const f of found) console.warn('   • ' + f);
  console.warn('');
  if (process.env.VERCEL_ENV === 'production' && !process.env.LARO_ALLOW_PLACEHOLDERS) {
    console.error('✖ Refusing a PRODUCTION build with unfilled placeholders. Fill them, or set LARO_ALLOW_PLACEHOLDERS=1 for a staging deploy.\n');
    process.exit(1);
  }
}
