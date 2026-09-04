'use client';
import { useEffect } from 'react';
import { track } from '@/lib/analytics';

export function PurchaseTracker({ orderNo, value, items }: { orderNo: string; value: number; items: unknown }) {
  useEffect(() => {
    const key = `laro-purchase-${orderNo}`;
    try { if (sessionStorage.getItem(key)) return; sessionStorage.setItem(key, '1'); } catch {}
    track('purchase', { order_no: orderNo, value, currency: 'PHP', items });
  }, [orderNo, value, items]);
  return null;
}
