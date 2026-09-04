'use client';
import { useEffect } from 'react';
import { track } from '@/lib/analytics';
import { product } from '@/content/product';

export function ViewItem() {
  useEffect(() => { track('view_item', { value: product.prices.solo, items: [{ item_id: product.sku.fish, item_name: product.name, price: product.prices.solo }] }); }, []);
  return null;
}
