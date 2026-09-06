// Client-safe social-proof helpers: thresholds and time formatting. No Node or Supabase imports.
export const SHOW_RATING_FROM = 3;   // approved reviews before stars appear in the hero/header
export const SHOW_ORDERS_FROM = 10;  // live orders before "N cat parents ordered" appears
export const SHOW_TOASTS_FROM = 3;   // live orders in the last 14 days before "someone just ordered" toasts appear
export const TOAST_WINDOW_DAYS = 14;

export function timeAgo(iso: string, now = Date.now()) {
  const m = Math.max(1, Math.round((now - new Date(iso).getTime()) / 60_000));
  if (m < 60) return `${m} min ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h} h ago`;
  const d = Math.round(h / 24);
  return d === 1 ? 'yesterday' : `${d} days ago`;
}
