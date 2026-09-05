// Fires only when the matching env ID exists (the scripts are injected by components/Analytics.tsx).
type Params = Record<string, unknown>;
type Item = { item_id: string; item_name: string; price: number; quantity: number };
declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    fbq?: (...args: unknown[]) => void;
    ttq?: { track: (event: string, params?: Params) => void };
  }
}

const META: Record<string, string> = { view_item: 'ViewContent', begin_checkout: 'InitiateCheckout', purchase: 'Purchase', add_payment_info: 'AddPaymentInfo' };
const TIKTOK: Record<string, string> = { view_item: 'ViewContent', begin_checkout: 'InitiateCheckout', purchase: 'CompletePayment', add_payment_info: 'AddPaymentInfo' };

export type AnalyticsEvent = 'view_item' | 'select_bundle' | 'add_refill' | 'select_print' | 'play_demo' | 'begin_checkout' | 'add_payment_info' | 'purchase';

/** GA4 gets the params as-is (GA4 shape: value, currency, transaction_id, items[]); Meta and TikTok get their own shapes. */
export function track(event: AnalyticsEvent, params: Params = {}) {
  if (typeof window === 'undefined') return;
  const p: Params = { currency: 'PHP', ...params };
  const items = (Array.isArray(p.items) ? p.items : []) as Item[];
  window.gtag?.('event', event, p);
  if (window.fbq) {
    const meta = items.length
      ? { value: p.value, currency: 'PHP', content_type: 'product', content_ids: items.map((i) => i.item_id), num_items: items.reduce((n, i) => n + i.quantity, 0) }
      : p;
    window.fbq('track', META[event] ?? event, meta);
  }
  if (window.ttq) {
    const tt = items.length
      ? { value: p.value, currency: 'PHP', content_type: 'product', contents: items.map((i) => ({ content_id: i.item_id, content_name: i.item_name, price: i.price, quantity: i.quantity })) }
      : p;
    window.ttq.track(TIKTOK[event] ?? event, tt);
  }
}
