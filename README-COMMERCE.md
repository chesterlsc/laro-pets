# Commerce setup (checkout, orders, payments, emails)

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
