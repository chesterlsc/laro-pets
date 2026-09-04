# Build the Laro Pets store — Mockup A “Pounce”

You are building a single-product e-commerce site for **Laro Pets**, a Philippine pet brand launching with the **Laro Hunt Mat** (an automatic hide-and-seek cat teaser mat). The design is finished: reproduce **Mockup A “Pounce”** exactly, then wire it to a real checkout.

Read this whole file before writing code. Do not invent facts — every unknown is a bracketed placeholder and must stay one (section 4.4).

---

## 0. Files in this folder — read these first

| File | What it is |
|---|---|
| `laro-mockup-a-pounce.html` | **Design source of truth.** Open it in a browser (toggle Desktop 1440 / Mobile 390 at the top). Every color, font, spacing value, section order and line of copy comes from this file. Read its HTML for exact values — it uses inline styles, so the numbers are all there. |
| `assets/*.jpg` | Product photos, already cropped and compressed. Filenames are referenced throughout. |
| `assets/demo-video.mp4` | 20-second reference demo (720×960, 2.9 MB). Use as the placeholder video until the owner replaces it with their own footage. |
| `research/pricing.md`, `research/viral.md`, `research/market-cro-seo.md` | Background research. Context only — this prompt is the spec. |

---

## 1. Decisions (pre-filled defaults — the owner may edit before you start)

| Decision | Default |
|---|---|
| Stack | **Next.js 15 (App Router) + TypeScript + Tailwind CSS**, deployed to Vercel. `pnpm`. |
| Fonts | Google Fonts **Fredoka** (500/600/700) + **Nunito** (400/600/700/800) via `next/font/google`. |
| Payments | **Cash on Delivery** (order form, no gateway) + **PayMongo Checkout Sessions** for GCash, Maya, Visa/Mastercard. |
| Order storage | **Supabase** (Postgres) table `orders`. If no Supabase keys are present, fall back to appending a row to a Google Sheet via a webhook URL (`ORDERS_WEBHOOK_URL`). |
| Notifications | **Resend** email to the store owner and to the customer (if email given). SMS is out of scope for v1. |
| Couriers | J&T Express, Flash Express, LBC (display only; no API integration in v1). |
| Domain | `https://[yourdomain].ph` — placeholder until the owner confirms. |
| Analytics | GA4, Meta Pixel, TikTok Pixel — each enabled only when its env ID is set. |
| Locale | `lang="en-PH"`, currency PHP, prices shown as `₱799` (no decimals). |

---

## 2. Pages and routes

| Route | Purpose |
|---|---|
| `/` | The product landing page = Mockup A, section for section (section 5). |
| `/checkout` | Two steps on one page: (1) order summary with bundle/refill/print controls, (2) delivery details + payment method. Guest only — no accounts. |
| `/thank-you/[orderId]` | Confirmation: order number, what happens next, COD reminder if COD. |
| `/policies/shipping`, `/policies/returns`, `/policies/privacy`, `/policies/terms` | Required by the Internet Transactions Act (RA 11967) and the Data Privacy Act (RA 10173). Draft honest text from `content/policies.ts`; placeholders where facts are missing. |
| `/api/orders` (POST) | Creates a COD order. |
| `/api/checkout/paymongo` (POST) | Creates a PayMongo Checkout Session and returns its URL. |
| `/api/webhooks/paymongo` (POST) | Verifies the signature and marks the order `paid`. |
| `sitemap.xml`, `robots.txt`, `not-found` | Standard. |

---

## 3. Design system (lift exact values from the mockup)

**Palette (Variation A tokens)**

| Token | Hex | Use |
|---|---|---|
| `bg` | `#FFF6E9` | page ground (warm cream) |
| `surface` | `#FFFFFF` | cards |
| `ink` | `#1E2430` | text |
| `muted` | `#5A6472` | secondary text |
| `primary` | `#0F5C6B` | teal — headings accents, icons, secondary buttons, dark bands |
| `cta` | `#D14127` | coral — primary buttons, announcement bar, final CTA band (white text, 18 px bold) |
| `accent` | `#FF6A45` | fold/annotation only in the mockup — do not use on the live site |
| `accent2` | `#FFC857` | sunny yellow — marquee strip, sticker badges (ink text) |
| `tint` | `#CFE9FF` | sky blue — chips, icon tiles, hero blob |
| `tint2` | `#FFE9DD` | peach — objections section background, refill add-on box |
| `border` | `#F0E4D2` | hairlines |

Radii: cards 22 px, inner elements 14 px, buttons pill (999 px). Buttons: 18 px 28 px padding (lg), 14 px 22 px (md), 800 weight, min-height 44 px. Headings in Fredoka 700 with `letter-spacing: -0.02em`; body in Nunito.

**Rules**
- Icons are inline SVG, stroke 1.8, 24-grid, `currentColor` — copy the paths from the mockup. No emoji, no icon fonts.
- Payment and courier names are **text pills** (“Cash on Delivery”, “GCash”, “Maya”, “Visa”, “Mastercard”, “J&T Express”, “Flash Express”, “LBC”). Do not draw or embed third-party logos.
- The hero blob, sticker badges (rotated −10° to +7°), numbered step circles and the yellow marquee are part of the identity — keep them.
- Responsive: mobile-first. The mockup gives you two exact states (390 and 1440); interpolate sensibly at 768 and 1024 (two-column grids collapse to one at < 900 px; the 3-card rows go 1 → 2 → 3).
- **Sticky mobile buy bar**: fixed to the bottom on viewports < 900 px, appears only after the hero “Buy now” button scrolls out of view (IntersectionObserver), shows price + “COD · free ship on ₱899+” + Buy now.
- The dashed “first screen” fold lines and the “sticky buy bar” labels in the mockup are design annotations — **do not build them**.
- `prefers-reduced-motion`: the marquee stops scrolling and the stickers do not animate.

---

## 4. Content and commerce logic

### 4.1 Single source of truth
Put all product data in `content/product.ts` and import it everywhere. Never hardcode a price in a component.

```ts
export const product = {
  name: 'Laro Hunt Mat',
  h1: 'Laro Hunt Mat · automatic hide-and-seek cat teaser',
  prices: { solo: 799, bundle: 899, multi: 1679, refill: 149 },
  shipping: { fee: 79, freeFrom: 899 },
  prints: ['fish', 'duck'] as const,
  tiers: [
    { id: 'solo',   name: 'Solo Play',      mats: 1, refillsIncluded: 0, price: 799,  tag: '',                 save: 0   },
    { id: 'bundle', name: 'Mat + Refill',   mats: 1, refillsIncluded: 1, price: 899,  tag: 'Most popular',     save: 128 },
    { id: 'multi',  name: 'Multi-Cat Home', mats: 2, refillsIncluded: 1, price: 1679, tag: 'Best for 2+ cats', save: 147 },
  ],
  limits: { maxMatsPerOrder: 2, maxExtraRefills: 3 },
} as const;
```

### 4.2 Cart rules
- Exactly one tier is selected (default **bundle**).
- `extraRefills`: 0–3 additional 3-feather packs at ₱149 each (on top of what the tier includes).
- Print (fish/duck) is chosen per mat (Multi-Cat gets two selectors).
- Mats per order are fixed by the tier (1 or 2). No free quantity field — “Max 2 mats per order” is shown as copy.
- `subtotal = tier.price + extraRefills × 149`
- `shipping = subtotal >= 899 ? 0 : 79`
- `total = subtotal + shipping`
- Free-shipping helper: `remaining = max(0, 899 − subtotal)` (used for the “₱100 more for free shipping” line when Solo is selected).

Write these as pure functions in `lib/pricing.ts` and unit-test them (section 10).

### 4.3 Reviews
`content/reviews.ts` exports the four sample reviews from the mockup with `sample: true`. While `sample` is true, every card renders the “Sample review” tag and the hero rating shows the bracketed placeholder. When the owner connects a reviews app (Judge.me, Loox, etc.), this file is replaced — leave a clear comment explaining that.

### 4.4 Placeholders — do not resolve them
Everything in `[brackets]` in the mockup is a fact the owner has not confirmed. Keep them in `content/placeholders.ts`:

```ts
export const placeholders = {
  rating: '[4.8]', reviewCount: '[000]',
  deliveryDaysMetroManila: '[2–4]', deliveryDaysProvinces: '[4–8]',
  batteryMah: '[X mAh]', playtimePerCharge: '[X h]',
  feathersInBox: '2 [confirm count]',
  dtiRegNo: '[•]', birTin: '[•]', businessName: '[Registered business name]',
  businessAddress: '[Business address, Metro Manila]', contactEmail: '[hello@laropets.ph]',
  domain: '[yourdomain].ph',
} as const;
```

Render them verbatim. In development, show a dismissible yellow banner at the top of every page listing which placeholders are still unfilled, so nothing ships by accident. In production, hide the banner but log a build-time warning.

Proposed policies that appear in the copy — **30-day Cat-Approved Guarantee** and **6-month motor warranty** — are marked “[Proposed policy]” in the mockup. Keep that label until the owner removes it in `content/policies.ts`.

---

## 5. The landing page, section by section

Build `/` in this exact order. All copy is in **Appendix A** — use it verbatim (typos included would be a bug; the copy has been proofread).

1. **Announcement bar** — coral, white 14 px 800: “Free nationwide shipping on orders ₱899+ · Cash on Delivery available · Ships from Metro Manila in [2–4] days”.
2. **Header** — logo (star mark + “laro” + small “PETS”), nav: How it works · See it in action · Bundles · Reviews · FAQ, primary button “Buy now — ₱799”, cart icon. Mobile: hamburger, centered logo, cart with count badge.
3. **Hero** — two columns (7/5). Left: the chip is the page’s only `<h1>` (“Laro Hunt Mat · automatic hide-and-seek cat teaser”); the big tagline “Something’s under the mat. Your cat has to know.” is a styled `<p>` (62 px desktop / 38 px mobile) with “has to know.” in coral; lead paragraph; price row (₱799 at 52 px + “or ₱899 with a 3-feather refill — free shipping” + stars + rating placeholder); buttons “Buy now · COD available” (primary, cart icon) and “Watch the 20-sec demo” (secondary, play icon); 2×2 trust grid (COD / Free shipping ₱899+ / Spare feathers in the box / 30-day Cat-Approved). Right: sky-blue blob behind a 380×520 video card (poster `video-pounce.jpg`, “20-SEC DEMO” label, 0:20 chip, play button, hook text “Wait for it… pounce.” with “pounce.” in yellow), rotated −2°, with four sticker badges: “3 speeds” (yellow), “Whisper-quiet motor” (white/teal), “Type-C rechargeable” (teal/white), “Spare feathers included” (coral/white). Mobile order: chip → tagline → lead → price + rating → Buy now → video card → Watch demo → trust grid.
   - The video card opens a modal `<video controls playsinline preload="none" poster>` — never autoplay with sound.
4. **Marquee strip** — yellow band, Fredoka 18 px, paw icon between items: Spare feathers included · 3 speed levels · Auto on/off · 60 cm hunting mat · USB Type-C · COD available · Whisper-quiet (loops; static under reduced motion).
5. **See it in action** — teal band (`primary`), white text. Eyebrow “SEE IT IN ACTION” in yellow; H2 “Twenty seconds. One very serious cat.”; paragraph; “Play full demo” button; three 368×480 clip cards labelled PRESS / STALK / POUNCE with posters `video-press.jpg`, `video-stalk.jpg`, `video-pounce.jpg` and captions “Press once.”, “She hears it. She waits.”, “POUNCE.” (mobile: horizontal scroll-snap row); below, three dashed **UGC slot** cards (“UGC SLOT · CREATOR CLIP WITH PERMISSION”, hook line, “@creator · TikTok · [views]”). The UGC slots render only while `content/ugc.ts` is empty; when filled they become real embedded clips.
6. **How it works** — H2 “Press once. The mat does the rest.”; three cards with coral number circles, images (`video-press.jpg`, `hub.jpg`, `video-pounce.jpg`) and the step copy; chip row: 3 speeds · Random 360° paths · Auto on/off · USB Type-C · Whisper-quiet.
7. **Pick your bundle** — H2; three tier cards (middle elevated with “MOST POPULAR” ribbon, third tagged “BEST FOR 2+ CATS”), each with image(s), name, save/“Single mat” label, contents line, price, shipping line (truck icon; “FREE nationwide shipping” in teal), “Choose …” button (primary on the featured card). Below: the **refill add-on box** (feather photo, “Add feather refill packs”, “3 natural feathers per pack · ₱149 · add up to 3 packs”, − 1 + stepper, “+ ₱149”). Then “Continue to checkout” (ink button, arrow) with “Guest checkout · Cash on Delivery, GCash, Maya, Visa, Mastercard”. Choosing a tier here sets cart state; “Continue” goes to `/checkout`.
8. **Free shipping band** — teal; truck icon in yellow; H2 “Free nationwide shipping on orders ₱899+”; line “Metro Manila [2–4] days · Provinces [4–8] days · Tracking number sent by SMS”; courier pills.
9. **Reviews** — H2 “Cat parents from QC to Davao”; rating summary pill (stars, “[4.8]”, “from [000] verified PH orders — live from your reviews app”); four review cards (stars, “Sample review” tag, text, avatar icon, name, city); three “Customer photo slot” images (`floor-topdown.jpg`, `cats-carpet.jpg`, `video-stalk.jpg`).
10. **Objections** — peach background; eyebrow “WORRIED YOUR CAT WON’T CARE?”; H2 “We took the risk off you”; four cards: 30-day Cat-Approved Guarantee · Spare feathers in every box · Whisper-quiet motor · 6-month motor warranty (copy in Appendix A).
11. **Specs + In the box** — 7/5 grid: spec rows (label / value) and a white card listing the box contents plus fish/duck swatches “Choose fish or duck print at checkout”.
12. **FAQ** — 4/8 grid: eyebrow, H2 “Questions cat parents ask”, “Still unsure? Message us on Facebook or Viber — we reply within the day.”; six accessible accordion items (buttons with `aria-expanded`, first open by default).
13. **Final CTA band** — coral: H2 “Ready for the pounce?”, “₱799 · free shipping on bundles · Cash on Delivery available”, ink button “Buy the Laro Hunt Mat”.
14. **Footer** — white: logo + “Play, delivered. Automatic toys for Filipino cats and dogs, shipped from Metro Manila.”; columns Shop / Help / Legal (links in Appendix A); “We accept” pills; “Delivered by” pills; the SEO paragraph; legal line “© 2026 Laro Pets · [Registered business name] · [Business address, Metro Manila] · [hello@laropets.ph]”.

---

## 6. Checkout

**Step 1 — Your order:** tier radio list (same three tiers), refill stepper, print selector per mat, order summary with subtotal / shipping / total and the free-shipping line.

**Step 2 — Delivery & payment:** one form, ≤ 9 visible fields, `autocomplete` attributes set:
- Full name · Mobile number (PH, `+63` or `09…`, validated) · Email (optional, for the receipt)
- House/unit + street · Barangay · City/Municipality · Province · ZIP
- Delivery notes (optional)
- Payment method radio: **Cash on Delivery** (default) · GCash · Maya · Credit/Debit card

Show the payment block as a visually enclosed panel (border, lock icon, “Secured by PayMongo” text) — perceived security matters here.

**COD flow:** `POST /api/orders` → validate → insert order with `status: 'pending_cod'` → send emails → redirect to `/thank-you/[orderId]`.

**PayMongo flow:** `POST /api/checkout/paymongo` → insert order with `status: 'pending_payment'` → create a Checkout Session (line items from the cart, `metadata.orderId`, `success_url`, `cancel_url`, payment method types per the radio choice) → redirect to `checkout_url`. Webhook `checkout_session.payment.paid` → verify signature (`PAYMONGO_WEBHOOK_SECRET`) → set `status: 'paid'`, store `payment_ref` → emails.

**Order schema (Supabase SQL in `supabase/schema.sql`):**
`id uuid pk default gen_random_uuid()`, `order_no text unique` (format `LP-YYMMDD-XXXX`), `created_at timestamptz`, `status text` (pending_cod | pending_payment | paid | fulfilled | cancelled), `customer jsonb` (name, mobile, email), `address jsonb`, `items jsonb` (tier, mats, prints, extraRefills), `subtotal int`, `shipping int`, `total int`, `payment_method text`, `payment_ref text`, `notes text`.

**Thank-you page:** order number, summary, “What happens next: we pack today, courier picks up, tracking number by SMS within [2–4] days (Metro Manila)”, COD reminder “Prepare ₱X in cash”.

Env vars (`.env.example`): `NEXT_PUBLIC_SITE_URL`, `PAYMONGO_SECRET_KEY`, `PAYMONGO_WEBHOOK_SECRET`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `ORDERS_WEBHOOK_URL`, `RESEND_API_KEY`, `STORE_OWNER_EMAIL`, `NEXT_PUBLIC_GA4_ID`, `NEXT_PUBLIC_META_PIXEL_ID`, `NEXT_PUBLIC_TIKTOK_PIXEL_ID`.

---

## 7. SEO

- `<html lang="en-PH">`. One `<h1>` per page (the hero chip on `/`). One `<h2>` per section, in the wording above.
- Metadata for `/`:
  - title: `Automatic Hide-and-Seek Cat Teaser Toy (Laro Hunt Mat) — COD, Free Shipping PH`
  - description: `Laro Hunt Mat is an automatic cat teaser: a feather hides under a 60 cm mat and sweeps around like real prey. 3 speeds, USB-C, spare feathers included. ₱799, free shipping on ₱899+, Cash on Delivery available.`
  - canonical, Open Graph + Twitter card with a generated 1200×630 image built from `hero-white.jpg`.
- JSON-LD on `/`: `Product` (name, image, description, brand “Laro Pets”, sku `LARO-HM-FISH`/`LARO-HM-DUCK`, `Offer` with `price` 799, `priceCurrency` PHP, `availability` InStock, `shippingDetails` (₱79, PH), `hasMerchantReturnPolicy` (30 days, PH)). Include `aggregateRating` **only** when `reviews.sample === false`. Plus `VideoObject` for the demo (name, description, thumbnailUrl, uploadDate, duration `PT20S`, contentUrl).
- Alt text — use exactly:
  - `hero-white.jpg` → “Two cats pawing at the Laro Hunt Mat automatic cat teaser, green feather wand beside it”
  - `cats-carpet.jpg` → “Two cats on a carpet watching the feather peek out of the Laro Hunt Mat”
  - `floor-topdown.jpg` → “Top-down view of a tabby cat approaching the Laro Hunt Mat on a tiled floor”
  - `hub.jpg` → “Close-up of the Laro Hunt Mat motor hub with its one-button control”
  - `feathers.jpg` → “Replacement green feather wand for the Laro Hunt Mat”
  - `pattern-fish.jpg` / `pattern-duck.jpg` → “Laro Hunt Mat in the fish print” / “… duck print”
  - `video-pounce.jpg` → “Video still: a cat pouncing on the feather under the Laro Hunt Mat”
  - `video-stalk.jpg` → “Video still: a cat stalking the Laro Hunt Mat on a tiled floor”
  - `video-press.jpg` → “Video still: a hand pressing the button on the Laro Hunt Mat hub”
- Rename image files descriptively when you move them into `public/` (e.g. `laro-hunt-mat-two-cats-white.jpg`), serve WebP via `next/image` with `sizes`, keep JPEG fallback.
- The footer SEO paragraph (Appendix A) stays as real, visible text — not hidden.
- FAQ is on-page content; Google no longer shows FAQ rich results, so do not add FAQPage schema.

---

## 8. Performance and accessibility budget

- Lighthouse (mobile, throttled): Performance ≥ 90, Accessibility ≥ 95, SEO ≥ 95. Core Web Vitals: LCP ≤ 2.5 s, INP ≤ 200 ms, CLS ≤ 0.1.
- The hero video **poster** is the LCP element: a real `<Image priority>` with explicit width/height. The `<video>` loads only on click (`preload="none"`).
- Fonts via `next/font` (subset, `display: swap`, fallback metrics). No layout shift from fonts or images.
- Color contrast AA everywhere (the coral CTA passes only with white text ≥ 18 px bold — keep button text at 18 px 800; teal on cream and ink on yellow pass at any size).
- Every interactive element: 44 px minimum hit target, visible focus ring, keyboard operable (accordion, stepper, modal with focus trap and Escape).
- Total page weight for `/` on first load ≤ 1.2 MB excluding the video.

---

## 9. Analytics events (fire only when the env ID exists)

`view_item` (on load), `select_bundle` (tier id), `add_refill` (count), `select_print`, `play_demo`, `begin_checkout` (value), `add_payment_info` (method), `purchase` (order_no, value, currency PHP, items). GA4 via gtag; Meta Pixel (`ViewContent`, `InitiateCheckout`, `Purchase`); TikTok Pixel equivalents.

---

## 10. Definition of done

- [ ] `pnpm install && pnpm dev` runs; `pnpm build` passes with zero type errors and zero ESLint errors.
- [ ] `/` matches `laro-mockup-a-pounce.html` at 390 and 1440 (compare screenshots side by side; spacing, order, copy, colors).
- [ ] `lib/pricing.test.ts` (Vitest) covers: each tier alone; each tier + 0/1/2/3 refills; shipping flips to free at exactly ₱899; Solo + 1 refill = ₱948 free shipping; Multi-Cat total ₱1,679; savings shown = 128 / 147.
- [ ] Playwright smoke test: choose Mat + Refill → checkout → COD → thank-you page shows order number and ₱899 total.
- [ ] PayMongo test-mode session creates and the webhook handler marks an order paid (document how to test with the PayMongo CLI or a mock signature).
- [ ] Dev placeholder banner lists every unfilled `[bracket]`; production build logs them.
- [ ] Lighthouse mobile ≥ 90 / 95 / 95; no console errors; no third-party logos; no emoji.
- [ ] `README.md` explains: env setup, Supabase schema, PayMongo keys + webhook URL, Resend, where to change prices (`content/product.ts`), how to replace sample reviews, the demo video and UGC slots, and how to fill placeholders.

---

## 11. How to work

1. Open `laro-mockup-a-pounce.html`, read it top to bottom (both views), and write a short plan listing components and the order you will build them. Show the plan before coding.
2. Scaffold the project, tokens, fonts and `content/` files first, then build the landing page section by section (1 → 14), checking each against the mockup at 390 and 1440 with a screenshot.
3. Then checkout, APIs, emails, SEO, tests, README.
4. Commit after each section with a clear message.
5. If anything in this prompt is ambiguous or you need a credential, stop and ask — do not guess a fact, a price or a policy.

---

## Appendix A — Copy (verbatim)

**Announcement:** Free nationwide shipping on orders ₱899+ · Cash on Delivery available · Ships from Metro Manila in [2–4] days
Mobile: Free shipping on ₱899+ · COD available · Ships from Metro Manila

**Hero**
- H1 chip: Laro Hunt Mat · automatic hide-and-seek cat teaser
- Tagline: Something’s under the mat. Your cat has to know.
- Lead (desktop): The Laro Hunt Mat hides a feather under a 60 cm mat and sweeps it around in random paths, like real prey. Press once, walk away, and let the hunt begin — quietly, session after session.
- Lead (mobile): A feather hides under a 60 cm mat and sweeps around like real prey. Press once, walk away, let the hunt begin.
- Price line: ₱799 — or ₱899 with a 3-feather refill — free shipping — ★★★★★ [4.8 · 000 reviews — connect live rating]
- Buttons: Buy now · COD available / Watch the 20-sec demo
- Trust grid: Cash on Delivery — or GCash · Maya · cards / Free shipping ₱899+ — J&T · Flash · LBC nationwide / Spare feathers in the box — refills from ₱149 / 30-day Cat-Approved — ignored it? full refund
- Video hook: Wait for it… pounce.  Stickers: 3 speeds · Whisper-quiet motor · Type-C rechargeable · Spare feathers included

**Marquee:** Spare feathers included · 3 speed levels · Auto on/off · 60 cm hunting mat · USB Type-C · COD available · Whisper-quiet

**See it in action**
- Eyebrow: SEE IT IN ACTION · H2: Twenty seconds. One very serious cat.
- Paragraph: Sound on — cats hear the feather rustle under the fabric before they see it. That wait-then-pounce beat is why these clips get shared.
- Clip captions: Press once. / She hears it. She waits. / POUNCE.
- UGC hook lines: “Something was hiding under there… I had to investigate” / “My cat is OBSESSED with this” / “Held her attention for an hour — I had to turn it off”

**How it works**
- Eyebrow: HOW IT WORKS · H2: Press once. The mat does the rest.
- Paragraph: No app, no batteries to buy, no supervising a wand for 20 minutes. It plays the way cats hunt.
- Step 1 — Press once: One button, three speeds. The LED colour shows the mode you picked.
- Step 2 — The feather hides and sweeps: A feather wand darts under the 60 cm mat in random paths, peeking out at the edges like real prey. The motor is whisper-quiet.
- Step 3 — Your cat stalks, waits, pounces: It runs a play session, then rests on its own. Recharge with the Type-C cable you already own.
- Chips: 3 speeds · Random 360° paths · Auto on/off · USB Type-C · Whisper-quiet

**Bundles**
- Eyebrow: BUNDLES · H2: Pick your bundle
- Paragraph: Orders of ₱899 and up ship free anywhere in the Philippines. Max 2 mats per order — message us for multi-cat rescues.
- Solo Play — 1 Hunt Mat · spare feathers in the box — ₱799 — + ₱79 shipping — “Single mat”
- Mat + Refill — 1 Hunt Mat + 3-feather refill pack — ₱899 — FREE nationwide shipping — Save ₱128 — MOST POPULAR
- Multi-Cat Home — 2 Hunt Mats + 3-feather refill pack — ₱1,679 — FREE nationwide shipping — Save ₱147 — BEST FOR 2+ CATS
- Add-on: Add feather refill packs — 3 natural feathers per pack · ₱149 · add up to 3 packs — + ₱149
- CTA: Continue to checkout — Guest checkout · Cash on Delivery, GCash, Maya, Visa, Mastercard

**Free shipping band:** Free nationwide shipping on orders ₱899+ — Metro Manila [2–4] days · Provinces [4–8] days · Tracking number sent by SMS

**Reviews** (all `sample: true`)
- Eyebrow: REVIEWS · H2: Cat parents from QC to Davao · Summary: ★★★★★ [4.8] from [000] verified PH orders — live from your reviews app
- Maria S., Quezon City (5★): Si Mochi never plays with toys. First time I pressed the button she stalked it for ten minutes. Ang quiet din, so hindi siya natakot.
- Jed R., Cebu City (5★): Two cats, one mat. They take turns pouncing. The spare feathers in the box were a big plus because my orange boy shreds them.
- Kat D., Davao City (4★): Ordered Tuesday via COD, arrived Thursday. Charges with the same cable as my phone. Wish the mat were a bit bigger for two cats.
- Anne L., Makati (4★): Works best on tiles or wood. On my thick rug it slowed down, so I moved it to the floor and it was perfect.
- Photo slots label: Customer photo slot

**Objections**
- Eyebrow: WORRIED YOUR CAT WON’T CARE? · H2: We took the risk off you
- 30-day Cat-Approved Guarantee — If your cat ignores it after 30 days, send it back for a full refund. [Proposed policy]
- Spare feathers in every box — Feathers wear out — that is the point. Spares are included and refills are ₱149.
- Whisper-quiet motor — No grinding noise. Skittish cats hear the feather, not the machine.
- 6-month motor warranty — Charging or motor issue? We replace the hub. [Proposed policy]

**Specs**
- Mat — 60 cm star-shaped taffeta cover, fish or duck print
- Hub — ABS plastic motor hub, one-button control, 3 speed levels with LED colours
- Feather wand — Approx. 23 cm natural feather, replaceable
- Power — USB Type-C rechargeable · [X mAh battery, X h per charge — confirm]
- Play cycle — Automatic on/off: plays a session, then rests
- Best surface — Tile, wood or laminate floors; thin rugs
- For — Cats and kittens · supervised play

**In the box:** 1 × Laro Hunt Mat cover (60 cm) · 1 × Motor hub · 2 × Feather wands [confirm count] · 1 × USB Type-C cable · Quick-start guide — “Choose fish or duck print at checkout”

**FAQ**
1. Will it work for a lazy or older cat? — Most cats react to the sound and the peeking feather within a day or two. Start on the slow speed, sprinkle a little catnip on the mat, and keep sessions short. If your cat still ignores it after 30 days, our Cat-Approved Guarantee covers a return.
2. Is it noisy? — The motor is whisper-quiet. Cats hear the soft rustle of the feather under the fabric, which is exactly what triggers the hunt.
3. How do I charge it and how long does it run? — Charge the hub with any USB Type-C cable. [Confirm with supplier: charge time and play time per charge.] It runs a play session, then rests on its own to save battery.
4. Is it safe for my cat? — The mat is taffeta fabric, the hub is ABS plastic, and the feathers are natural. Supervise play like any feather toy, and keep it away from small children.
5. Do you deliver outside Metro Manila? — Yes. We ship nationwide via J&T, Flash Express or LBC — Metro Manila in [2–4] days, provinces in [4–8] days. Cash on Delivery is available wherever our couriers offer it (almost everywhere); GCash, Maya and cards everywhere.
6. What if a feather wears out? — Spare feathers come in the box, and a 3-feather refill pack is ₱149. You can add up to three refill packs to any order.
- Side note: Still unsure? Message us on Facebook or Viber — we reply within the day.

**Final CTA:** Ready for the pounce? — ₱799 · free shipping on bundles · Cash on Delivery available — Buy the Laro Hunt Mat

**Footer**
- Tagline: Play, delivered. Automatic toys for Filipino cats and dogs, shipped from Metro Manila.
- Shop: Laro Hunt Mat · Feather refills · Bundles · Coming soon: dog toys
- Help: Shipping & delivery · Returns & 30-day guarantee · Warranty · Contact us
- Legal: Privacy notice (RA 10173) · Terms of sale · DTI Reg. No. [•] · BIR TIN [•]
- We accept: Cash on Delivery · GCash · Maya · Visa · Mastercard — Delivered by: J&T Express · Flash Express · LBC
- SEO paragraph: Laro Hunt Mat is an automatic hide-and-seek cat teaser toy — an interactive, rechargeable cat hunting mat with a moving feather for indoor cats in the Philippines. Also searched as: automatic cat toy Philippines, cat hunting mat, interactive cat toy, laruan ng pusa.
- Legal line: © 2026 Laro Pets · [Registered business name] · [Business address, Metro Manila] · [hello@laropets.ph]

## Appendix B — Pricing test table

| Tier | Extra refills | Subtotal | Shipping | Total |
|---|---|---|---|---|
| Solo Play | 0 | 799 | 79 | 878 |
| Solo Play | 1 | 948 | 0 | 948 |
| Solo Play | 3 | 1,246 | 0 | 1,246 |
| Mat + Refill | 0 | 899 | 0 | 899 |
| Mat + Refill | 2 | 1,197 | 0 | 1,197 |
| Multi-Cat Home | 0 | 1,679 | 0 | 1,679 |
| Multi-Cat Home | 3 | 2,126 | 0 | 2,126 |

Savings copy: Mat + Refill saves ₱128 vs ₱799 + ₱149 + ₱79; Multi-Cat saves ₱147 vs ₱1,598 + ₱149 + ₱79.

## Appendix C — Placeholders the owner must fill before launch

Rating and review count (connect a reviews app) · delivery days Metro Manila / provinces (courier contract) · battery mAh and play time per charge (supplier) · feather wand count in the box · DTI registration number, BIR TIN, registered business name and address, contact email · domain · guarantee and warranty policies (currently “[Proposed policy]”) · own demo footage and creator permissions for the UGC slots.
