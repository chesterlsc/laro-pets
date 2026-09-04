# Laro Pets — Laro Hunt Mat store

Single-product Next.js 15 store (App Router, TypeScript, Tailwind v4) selling the Laro Hunt Mat in the Philippines: landing page, guest checkout with COD / GCash / Maya / cards via PayMongo, order storage in Supabase (or a Google Sheet), confirmation emails via Resend.

## Prerequisites

- Node 20+
- pnpm (`corepack enable` gives you the pinned version from `package.json`)
- `ffmpeg` only if you re-encode the demo video (see [Demo video](#demo-video))

## Run it

```bash
pnpm install
cp .env.example .env.local   # fill in what you have; everything is optional in dev
pnpm dev                     # http://localhost:3000
```

## Scripts

| Script | What it does |
|---|---|
| `pnpm dev` | Dev server |
| `pnpm build` | Production build. `prebuild` runs `scripts/check-placeholders.mjs` and logs unfilled placeholders (warns, never fails) |
| `pnpm start` | Serve the production build |
| `pnpm lint` | ESLint (`next/core-web-vitals` + TypeScript rules) |
| `pnpm typecheck` | `tsc --noEmit` |
| `pnpm test` | Vitest — `lib/pricing.test.ts` covers the pricing table below |
| `pnpm test:e2e` | Playwright smoke test: Mat + Refill → checkout → COD → thank-you page with order number and ₱899 |

## Environment variables

Copy `.env.example` to `.env.local`. Every variable is optional locally; the feature it powers simply switches off when blank.

| Variable | Used for | Public? |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | Canonical URL, Open Graph / JSON-LD absolute URLs, sitemap, PayMongo redirect URLs. No trailing slash. | yes |
| `PAYMONGO_SECRET_KEY` | Creating PayMongo checkout sessions (`sk_test_…` in test mode, `sk_live_…` in production) | server only |
| `PAYMONGO_WEBHOOK_SECRET` | Verifying the `Paymongo-Signature` header on `/api/webhooks/paymongo` | server only |
| `SUPABASE_URL` | Supabase project URL | server only |
| `SUPABASE_SERVICE_ROLE_KEY` | Writes orders from API routes. Service role bypasses RLS — never expose it to the browser, never prefix it `NEXT_PUBLIC_` | server only |
| `ORDERS_WEBHOOK_URL` | Fallback order storage when Supabase vars are blank (see below) | server only |
| `RESEND_API_KEY` | Sending order emails | server only |
| `STORE_OWNER_EMAIL` | Where the "new order" email goes | server only |
| `NEXT_PUBLIC_GA4_ID` | GA4 measurement ID (`G-…`) — script loads only when set | yes |
| `NEXT_PUBLIC_META_PIXEL_ID` | Meta Pixel ID — script loads only when set | yes |
| `NEXT_PUBLIC_TIKTOK_PIXEL_ID` | TikTok Pixel ID — script loads only when set | yes |

## Orders: Supabase

1. Create a Supabase project.
2. Open **SQL editor**, paste `supabase/schema.sql`, run it. It creates the `orders` table (order number, tier, refills, prints, customer, address, totals, payment method, status, PayMongo IDs) and its indexes.
3. Copy **Project settings → API → Project URL** to `SUPABASE_URL` and the **service_role** key to `SUPABASE_SERVICE_ROLE_KEY`.

The service role key is only read inside API routes. Do not use the anon key here — the browser never talks to Supabase directly.

## Orders: Google Sheet fallback

If `SUPABASE_URL` is blank, each order is `POST`ed as JSON to `ORDERS_WEBHOOK_URL`. Point it at anything that appends a row to a Sheet:

- Google Apps Script: `Extensions → Apps Script`, a `doPost(e)` that `JSON.parse(e.postData.contents)` and `appendRow`s, deployed as a Web app (execute as you, access "Anyone").
- Make / Zapier: a Webhook trigger → Google Sheets "Add row".

Payment status updates from the PayMongo webhook are also posted there, with the same order number, so you can match rows by hand. Move to Supabase before volume grows — the Sheet path has no updates, only appends.

## Checkout & payments


Copy `.env.example` → `.env.local` and fill what you have. Everything degrades gracefully: with no keys at all, COD orders are written to `.data/orders.json` (git-ignored) and emails are logged to the console.

## Order storage (first match wins)

1. **Supabase** — set `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` (Project settings → API; the *service role* key, never the anon key — it stays server-side). Run `supabase/schema.sql` in the SQL editor once. RLS is on with no policies, so only the service role can read/write.
2. **Webhook** — set `ORDERS_WEBHOOK_URL` (Google Apps Script / Make / Zapier). Each order is POSTed as JSON (`{ event: 'order.created' | 'order.updated', ...row }`). This backend is write-only: the thank-you page and the PayMongo webhook only see orders created since the last server restart (in-process cache). Fine for a Sheet-backed COD launch; use Supabase before enabling online payments.
3. **Local file** — `.data/orders.json`. Dev and Playwright only.

## PayMongo (GCash, Maya, cards)

- `PAYMONGO_SECRET_KEY` — `sk_test_…` while testing (Developers → API keys). Without it, `POST /api/checkout/paymongo` returns 503 and the UI tells the customer to pick COD.
- `PAYMONGO_WEBHOOK_SECRET` — create a webhook (Developers → Webhooks, or the API) pointing at `https://<your-domain>/api/webhooks/paymongo` with event **`checkout_session.payment.paid`**; copy its `secret_key` (`whsk_…`).
- `NEXT_PUBLIC_SITE_URL` must be the public origin — it builds `success_url` (`/thank-you/<id>?paid=1`) and `cancel_url` (`/checkout?cancelled=1`).

Flow: `POST /api/checkout/paymongo` → order saved as `pending_payment` → Checkout Session created with `metadata.orderId` → customer redirected to `checkout_url`. The webhook verifies the `Paymongo-Signature` header, sets `status = 'paid'` + `payment_ref`, and sends the emails. Replays are idempotent.

### Test the webhook locally with a mock signature

With the dev server running and `PAYMONGO_WEBHOOK_SECRET=whsk_test_local` in `.env.local`, take an `orderId` from `.data/orders.json` (or Supabase) and run:

```bash
ORDER_ID=<uuid> SECRET=whsk_test_local node -e '
const { createHmac } = require("crypto");
const body = JSON.stringify({ data: { id: "evt_test", attributes: { type: "checkout_session.payment.paid",
  data: { id: "cs_test", attributes: { metadata: { orderId: process.env.ORDER_ID }, payments: [{ id: "pay_test_123" }] } } } } });
const t = Math.floor(Date.now() / 1000);
const sig = createHmac("sha256", process.env.SECRET).update(`${t}.${body}`).digest("hex");
console.log(`curl -s -X POST http://localhost:3000/api/webhooks/paymongo -H "content-type: application/json" -H "paymongo-signature: t=${t},te=${sig},li=" -d ${JSON.stringify(body)}`);
' | sh
```

Expect `{"ok":true}`; a second run returns `{"ok":true,"already":true}`. For real events, point a tunnel (`ngrok http 3000`) at the route and register the tunnel URL as the webhook.

## Resend (emails)

`RESEND_API_KEY` + `STORE_OWNER_EMAIL`. The owner gets every order (items, totals, full address, mobile); the customer gets a receipt only if they entered an email. Sender is `Laro Pets <orders@<host of NEXT_PUBLIC_SITE_URL>>` — verify that domain in Resend first. On localhost it falls back to `onboarding@resend.dev`. Without a key, sends are logged with `console.info`.

## Routes

| Route | Does |
|---|---|
| `POST /api/orders` | COD only. Validates (`lib/order-schema.ts`), recomputes totals server-side (`lib/pricing.ts`), saves `pending_cod`, emails. 201 `{ orderId, orderNo, total }`. |
| `POST /api/checkout/paymongo` | GCash/Maya/card. Saves `pending_payment`, returns `{ url }`. |
| `POST /api/webhooks/paymongo` | Signature-verified; marks paid; emails. |
| `/checkout` | Step 1 (bundle/refills/prints from the cart) + Step 2 (delivery form + payment radios). |
| `/thank-you/[orderId]` | Confirmation; `?paid=1` shows "Confirming your payment…" until the webhook lands. |

Tests: `pnpm test` (schema, order-no format, signature) · `pnpm test:e2e` (COD smoke test in `tests/checkout.spec.ts`, needs the dev server; uses the local file store).


### PayMongo quick reference

- Keys: PayMongo dashboard → **Developers → API keys**. Use the test pair (`sk_test_…`) until you are ready to go live.
- Webhook: **Developers → Webhooks → Add**, URL `https://<your-domain>/api/webhooks/paymongo`, event `checkout_session.payment.paid`. Copy the webhook secret to `PAYMONGO_WEBHOOK_SECRET`.
- Test mode: start a checkout, pick GCash/Maya/card, and use PayMongo's test payment methods (test card `4343 4343 4343 4345`, any future expiry, any CVC; test e-wallets authorise with one click). PayMongo then calls the webhook and the order flips to `paid`.
- Local webhook testing: PayMongo only calls public URLs, so either tunnel your dev server (`ngrok http 3000`, `cloudflared tunnel --url http://localhost:3000`) and register that URL as a test-mode webhook, or `curl` the route with a payload and a signature you compute yourself with `PAYMONGO_WEBHOOK_SECRET` (HMAC-SHA256 of `timestamp.payload`, sent as `Paymongo-Signature: t=<ts>,te=<sig>`).
- COD orders never touch PayMongo: they are stored as `pending_cod` and confirmed by you.

## Emails: Resend

1. Create an API key at resend.com → `RESEND_API_KEY`.
2. Verify your sending domain (DNS records in the Resend dashboard). Until then Resend only delivers to your own account email — fine for testing.
3. `STORE_OWNER_EMAIL` receives the "new order" email; the customer gets the confirmation at the email they typed (optional at checkout — no email, no customer mail).

Blank `RESEND_API_KEY` = emails are skipped, orders still save.

## Prices and bundles

All prices, tiers, savings, shipping fee and the free-shipping threshold live in **`content/product.ts`**. Never type a peso amount in a component — everything reads from there through `lib/pricing.ts` (`quote()`, `peso()`).

After changing a number, update `lib/pricing.test.ts` and run `pnpm test`. The table it enforces:

| Tier | Extra refills | Subtotal | Shipping | Total |
|---|---|---|---|---|
| Solo Play | 0 | 799 | 79 | 878 |
| Solo Play | 1 | 948 | 0 | 948 |
| Solo Play | 3 | 1,246 | 0 | 1,246 |
| Mat + Refill | 0 | 899 | 0 | 899 |
| Mat + Refill | 2 | 1,197 | 0 | 1,197 |
| Multi-Cat Home | 0 | 1,679 | 0 | 1,679 |
| Multi-Cat Home | 3 | 2,126 | 0 | 2,126 |

Shipping is ₱79 and flips to free at exactly ₱899. Savings copy: Mat + Refill saves ₱128, Multi-Cat saves ₱147. Limits (max 2 mats, max 3 extra refill packs) are in the same file.

## Reviews

`content/reviews.ts` ships four **sample** reviews with `sample: true`. While it is true:

- every review card shows the "Sample review" tag,
- the hero rating shows the bracketed placeholder,
- the Product JSON-LD omits `aggregateRating` (Google penalises fake ratings).

To go live: connect a reviews app (Judge.me, Loox, …), replace `items` with real reviews (or a fetch from the app), and set `sample: false`. That one flag removes the tags, shows the real average, and adds `aggregateRating` to the structured data. Also replace `placeholders.rating` / `reviewCount` in `content/placeholders.ts`.

## Demo video

- `public/video/laro-hunt-mat-demo.mp4` — 1080×1440 H.264, ≈7 MB, what the modal player uses. Loads only when someone clicks Play (`preload="none"`), so it does not count toward first-load weight.
- `public/video/laro-hunt-mat-demo-720.mp4` — the original 720×960 reference clip (2.8 MB), served as fallback.
- Poster / still images: `public/images/laro-hunt-mat-demo-{press,stalk,pounce}.jpg` (720×960). The hero poster is the LCP element, so keep it a real JPEG with those dimensions.
- Metadata (path, dimensions, duration, `uploadDate`) is in `content/product.ts → demoVideo`; the VideoObject JSON-LD reads from there.

### Video quality

The reference clip is only 720×960, so the site serves an upscaled 1080×1440 (lanczos + light sharpen) H.264 built with `scripts/upscale-video.sh`. It looks acceptable in the modal but it is still an upscale.

The real fix is your own footage:

1. Record vertical, 1080×1440 (3:4) or 1080×1920 (9:16), ≤ 25 seconds, sound on (the feather rustle matters), on tile or wood floor.
2. `./scripts/upscale-video.sh path/to/your-clip.mp4` — re-encodes to the site's settings (needs `ffmpeg`). If the source is already 1080×1440 it just normalises the encode; for 9:16 change the `scale=` in the script.
3. Export three stills (press / stalk / pounce) at 720×960 and overwrite the poster JPEGs in `public/images`.
4. Update `demoVideo.uploadDate` (and `durationSeconds` if it changed) in `content/product.ts`.

## UGC slots

`content/ugc.ts` exports an empty `ugc` array. While it is empty, "See it in action" renders the three dashed placeholder slots with the hook lines from the mockup. Add entries (`handle`, `platform`, `views`, `hook`, `src`, `poster`) to replace them with real creator clips — only with the creator's written permission.

## Placeholders

Every unconfirmed fact is in **`content/placeholders.ts`** and renders verbatim, brackets included, until you fill it in: rating and review count, delivery days (Metro Manila / provinces), battery mAh and play time, feather count in the box, DTI reg. no., BIR TIN, registered business name and address, contact email, domain.

- In dev, a banner at the top of the page lists every key that still contains `[`.
- `pnpm build` prints the same list (via `scripts/check-placeholders.mjs`) so it cannot be forgotten. It never fails the build — launching is your call.

Full list: SPEC.md, Appendix C.

## Policies

`content/policies.ts` holds the 30-day Cat-Approved Guarantee, 6-month motor warranty, shipping, returns, privacy (RA 10173) and terms pages. The guarantee and warranty carry a `label: '[Proposed policy]'` that renders on the page; delete the label once you have decided the policy is real. The build warning flags it until then.

## Analytics

Set any of `NEXT_PUBLIC_GA4_ID`, `NEXT_PUBLIC_META_PIXEL_ID`, `NEXT_PUBLIC_TIKTOK_PIXEL_ID` and `components/Analytics.tsx` injects that script; blank = nothing loads. `lib/analytics.ts → track()` fans out one call to all three.

Events fired (GA4 name → Meta / TikTok mapping):

| Event | When | Params |
|---|---|---|
| `view_item` → ViewContent | landing page load | — |
| `select_bundle` | bundle card chosen | tier id |
| `add_refill` | refill stepper changed | count |
| `select_print` | fish / duck chosen | print |
| `play_demo` | demo modal opened | — |
| `begin_checkout` → InitiateCheckout | checkout page | value |
| `add_payment_info` → AddPaymentInfo | payment method picked | method |
| `purchase` → Purchase / CompletePayment | thank-you page | order_no, value, currency PHP, items |

## SEO

- `lib/seo.ts`: `homeMetadata` (title, description, canonical, Open Graph, Twitter), `productJsonLd()`, `videoJsonLd()`, `<JsonLd data={…} />`. Absolute URLs use `NEXT_PUBLIC_SITE_URL`.
- `app/opengraph-image.tsx` (+ `twitter-image.tsx`) generates the 1200×630 share card from `public/images/laro-hunt-mat-two-cats-white.jpg` at build time. `app/icon.tsx` / `app/apple-icon.tsx` generate the favicons from the logo star.
- Alt text and image dimensions are fixed in `content/images.ts` — never hand-write an alt.
- No FAQPage schema on purpose (Google no longer shows FAQ rich results).

## Deploy to Vercel

1. Push the repo, import it in Vercel (framework auto-detected, build `pnpm build`).
2. Add every variable from `.env.example` in **Settings → Environment Variables**. Set `NEXT_PUBLIC_SITE_URL` to the final `https://` domain — it is baked into canonical URLs, OG image URLs and the PayMongo success/cancel redirects, so a wrong value breaks sharing and payments.
3. Add your domain under **Settings → Domains** and replace `placeholders.domain` in `content/placeholders.ts`.
4. Switch PayMongo keys to live and register the live webhook URL (`https://<domain>/api/webhooks/paymongo`).
5. Verify the Resend sending domain.

Preview deployments get the same env vars; use test PayMongo keys there.

## Definition of done

- [ ] `pnpm install && pnpm dev` runs; `pnpm build` passes with zero type errors and zero ESLint errors.
- [ ] `/` matches the mockup at 390 and 1440 (spacing, order, copy, colours).
- [ ] `pnpm test` green — every row of the pricing table above.
- [ ] `pnpm test:e2e` green — Mat + Refill → checkout → COD → thank-you page with order number and ₱899.
- [ ] PayMongo test-mode session creates and the webhook marks an order paid.
- [ ] Dev banner lists every unfilled placeholder; `pnpm build` logs them.
- [ ] Lighthouse mobile ≥ 90 Performance / 95 Accessibility / 95 SEO; no console errors; no third-party logos; no emoji.
- [ ] This README kept current when env vars, prices or content files change.
