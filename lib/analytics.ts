// Fires only when the matching env ID exists (the scripts are injected by components/Analytics.tsx).
type Params = Record<string, unknown>;
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

export function track(event: AnalyticsEvent, params: Params = {}) {
  if (typeof window === 'undefined') return;
  window.gtag?.('event', event, { currency: 'PHP', ...params });
  if (window.fbq) window.fbq('track', META[event] ?? event, { currency: 'PHP', ...params });
  window.ttq?.track(TIKTOK[event] ?? event, { currency: 'PHP', ...params });
}
