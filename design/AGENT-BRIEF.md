# Shared brief for build agents (Laro Pets)

Project root: /Users/macbookairm3/Laro Pets — Next.js 15 App Router, TypeScript, Tailwind CSS v4, pnpm. Already installed and compiling.

## Read first
- `SPEC.md` — the full spec (sections, copy, rules). Your section numbers refer to §5 of it.
- `design/mockup-readable.html` — the design source of truth with base64 images stripped and one tag per line so you can grep it. Desktop 1440 artboard = lines 44–1110, mobile 390 artboard = lines 1115–2050. It uses inline styles: copy the exact px values, colours, gaps, radii, font sizes and weights for BOTH views.
- Existing foundation (USE these, do not re-create):
  - `content/copy.ts` — all copy verbatim (Appendix A). Never retype copy; import it.
  - `content/product.ts` (prices, tiers, limits, demo video), `content/images.ts` (every image with exact alt text + dimensions), `content/placeholders.ts`, `content/reviews.ts`, `content/ugc.ts`, `content/policies.ts`.
  - `components/icons.tsx` — `<Icon name="cart" size={20} />` (names: cart, play, truck, feather, shield, cod, sparkle, paw, speed, random, auto, usbc, quiet, bolt, check, chevron, user, arrow, plus, minus, menu, close, lock, box), `<Star/>`, `<Stars count size/>`, `<Logo size={32|28|26}/>`.
  - `components/ui.tsx` — `Button` / `ButtonLink` (variant primary|secondary|ink, size lg|md, icon, full), `Container` (20px gutter → 120px at xl), `Section` (id, bg, py-12 xl:py-[88px]), `Eyebrow`, `H2`, `Chip`, `Pill` (tone light|dark), `Sticker` (tone, rotate), `IconTile`.
  - `lib/cart.tsx` — `useCart()` → `{ cart: {tier, extraRefills, prints[]}, ready, setTier, setExtraRefills, setPrint, reset }` (client only; `CartProvider` is already in `app/layout.tsx`).
  - `lib/pricing.ts` — `quote({tier, extraRefills})` → `{subtotal, shipping, total, remaining}`, `peso(n)` → "₱1,679".
  - `lib/analytics.ts` — `track(event, params)`.
  - `app/globals.css` — Tailwind v4 `@theme` tokens. Colour classes: `bg-bg text-ink text-muted bg-surface bg-primary text-primary bg-cta text-cta bg-accent2 bg-tint bg-tint2 border-border bg-sample`. Radii: `rounded-card` (22px) `rounded-inner` (14px). Fonts: `font-display` (Fredoka) `font-body` (Nunito). Shadows: `shadow-card shadow-sticker shadow-step shadow-play`. Breakpoints: `md` 768, `lg` 900, `xl` 1200 (`xl` = the 1440 desktop layout; `lg` = where two-column grids un-collapse). Helpers: `.marquee-track`, `.sticker`, `.scroll-snap-x`, `.text-pretty`.

## Rules
- Pixel fidelity to the mockup at 390 and 1440; interpolate sensibly between (3-card rows go 1 → 2 (md) → 3 (xl); two-column grids collapse below lg).
- Use arbitrary values freely (`text-[44px] leading-[1.1] gap-[18px] px-[120px]`) so numbers match the mockup exactly. Mobile-first classes, then `xl:` overrides for the desktop values.
- All images via `next/image` with `sizes`; `import { images } from '@/content/images'` and spread `{...images.heroWhite}` for src/alt/width/height. Never write alt text by hand.
- Icons: only `components/icons.tsx`. No emoji, no icon fonts, no third-party logos (payments/couriers are text `Pill`s).
- Section `id`s for nav anchors: `how-it-works`, `see-it-in-action`, `bundles`, `reviews`, `faq`.
- Headings: only ONE `<h1>` on the page (the hero chip). One `<h2>` per section. Bracketed placeholders render verbatim.
- Every interactive element: 44px min hit target, keyboard operable, visible focus (global `:focus-visible` exists).
- Server components by default; add `'use client'` only where state/effects are needed and keep those files small.
- Keep it lean: no new dependencies, no wrapper abstractions beyond what's needed. Prefer one file per section in `components/sections/`.
- Do NOT run `pnpm dev` or `pnpm build` (other agents share the tree and port). Verify with `pnpm typecheck && pnpm lint` only. Do not commit; the integrator commits.
- Do not edit foundation files listed above except to ADD an icon path to `components/icons.tsx` if truly missing. Do not touch `app/page.tsx` or `app/layout.tsx`.
- When done, reply with: the files you created, the exported component names + props, and anything the integrator must wire up.
