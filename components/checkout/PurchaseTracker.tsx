'use client';
import { useEffect } from 'react';
import { track } from '@/lib/analytics';

type Item = { item_id: string; item_name: string; price: number; quantity: number };

/** Fires `purchase` once per order (guarded by sessionStorage) in the GA4 shape; lib/analytics maps it for Meta/TikTok. */
export function PurchaseTracker({ orderNo, value, items }: { orderNo: string; value: number; items: Item[] }) {
  useEffect(() => {
    const key = `laro-purchase-${orderNo}`;
    try { if (sessionStorage.getItem(key)) return; sessionStorage.setItem(key, '1'); } catch {}
    track('purchase', { transaction_id: orderNo, value, currency: 'PHP', items });
  }, [orderNo, value, items]);
  return null;
}
