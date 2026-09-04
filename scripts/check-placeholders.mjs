// Runs before `next build`: lists every bracketed placeholder still in content/placeholders.ts
// and the "[Proposed policy]" labels in content/policies.ts. Warns, never fails — launch is the owner's call.
import { readFileSync } from 'node:fs';
const src = readFileSync(new URL('../content/placeholders.ts', import.meta.url), 'utf8');
const found = [...src.matchAll(/(\w+):\s*'([^']*\[[^']*\][^']*)'/g)].map((m) => `${m[1]} = ${m[2]}`);
const policies = readFileSync(new URL('../content/policies.ts', import.meta.url), 'utf8');
if (/\[Proposed policy\]/.test(policies)) found.push('policies: guarantee / warranty still marked "[Proposed policy]"');
if (found.length) {
  console.warn('\n⚠  Laro Pets — unfilled placeholders (see SPEC.md Appendix C):');
  for (const f of found) console.warn('   • ' + f);
  console.warn('');
}
