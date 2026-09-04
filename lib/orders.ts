// Order persistence. Backend picked once from env: Supabase → webhook (write-only) → local JSON file.
import { randomInt, randomUUID } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { createClient } from '@supabase/supabase-js';
import { product, tierById, type Print, type TierId } from '@/content/product';
import type { OrderInput } from './order-schema';
import { quote } from './pricing';

export type OrderStatus = 'pending_cod' | 'pending_payment' | 'paid' | 'fulfilled' | 'cancelled';
export type Order = {
  id: string;
  order_no: string;
  created_at: string;
  status: OrderStatus;
  customer: { name: string; mobile: string; email?: string };
  address: OrderInput['address'];
  items: { tier: TierId; mats: number; prints: Print[]; extraRefills: number };
  subtotal: number;
  shipping: number;
  total: number;
  payment_method: OrderInput['paymentMethod'];
  payment_ref: string | null;
  notes: string | null;
};

type Store = {
  insert(o: Order): Promise<void>;
  get(id: string): Promise<Order | null>;
  update(id: string, patch: Partial<Order>): Promise<Order | null>;
};

const cache = new Map<string, Order>();

function supabaseStore(url: string, key: string): Store {
  const sb = createClient(url, key, { auth: { persistSession: false } });
  const fail = (e: { message: string } | null) => { if (e) throw new Error(`Supabase: ${e.message}`); };
  return {
    async insert(o) { fail((await sb.from('orders').insert(o)).error); },
    async get(id) { const r = await sb.from('orders').select('*').eq('id', id).maybeSingle(); fail(r.error); return (r.data as Order | null) ?? null; },
    async update(id, patch) { const r = await sb.from('orders').update(patch).eq('id', id).select('*').maybeSingle(); fail(r.error); return (r.data as Order | null) ?? null; },
  };
}

// ponytail: webhook backend is write-only (Sheets/Zapier); reads come from the in-process cache, which is empty after a restart.
function webhookStore(url: string): Store {
  const post = async (o: Order, event: string) => {
    const res = await fetch(url, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ event, ...o }) });
    if (!res.ok) throw new Error(`Orders webhook ${res.status}`);
    cache.set(o.id, o);
  };
  return {
    insert: (o) => post(o, 'order.created'),
    get: async (id) => cache.get(id) ?? null,
    async update(id, patch) { const cur = cache.get(id); if (!cur) return null; const next = { ...cur, ...patch }; await post(next, 'order.updated'); return next; },
  };
}

function fileStore(): Store {
  // On Vercel the project dir is read-only, so fall back to the ephemeral /tmp — orders survive only
  // until the function is recycled. Configure SUPABASE_* or ORDERS_WEBHOOK_URL before taking real orders.
  const dir = process.env.VERCEL ? path.join(os.tmpdir(), 'laro-orders') : path.join(process.cwd(), '.data');
  const file = path.join(dir, 'orders.json');
  const readAll = async (): Promise<Order[]> => { try { return JSON.parse(await readFile(file, 'utf8')); } catch { return []; } };
  const writeAll = async (rows: Order[]) => { await mkdir(path.dirname(file), { recursive: true }); await writeFile(file, JSON.stringify(rows, null, 2)); };
  return {
    async insert(o) { const rows = await readAll(); rows.push(o); await writeAll(rows); },
    async get(id) { return (await readAll()).find((o) => o.id === id) ?? null; },
    async update(id, patch) {
      const rows = await readAll(); const i = rows.findIndex((o) => o.id === id); if (i < 0) return null;
      rows[i] = { ...rows[i], ...patch }; await writeAll(rows); return rows[i];
    },
  };
}

let store: Store | undefined;
function getStore(): Store {
  if (store) return store;
  const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, ORDERS_WEBHOOK_URL } = process.env;
  if (SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) store = supabaseStore(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
  else if (ORDERS_WEBHOOK_URL) store = webhookStore(ORDERS_WEBHOOK_URL);
  else { console.warn(`[orders] no SUPABASE_* or ORDERS_WEBHOOK_URL — writing to ${process.env.VERCEL ? 'EPHEMERAL /tmp (orders will be lost!)' : '.data/orders.json'}`); store = fileStore(); }
  return store;
}

/** LP-YYMMDD-XXXX */
export function generateOrderNo(now = new Date()) {
  const ymd = now.toISOString().slice(2, 10).replace(/-/g, '');
  const A = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  return `LP-${ymd}-${Array.from({ length: 4 }, () => A[randomInt(A.length)]).join('')}`;
}

/** Totals are always recomputed here from lib/pricing — never trusted from the client. */
export async function createOrder(input: OrderInput, status: OrderStatus): Promise<Order> {
  const { subtotal, shipping, total } = quote(input);
  const order: Order = {
    id: randomUUID(),
    order_no: generateOrderNo(),
    created_at: new Date().toISOString(),
    status,
    customer: input.customer,
    address: input.address,
    items: { tier: input.tier, mats: tierById(input.tier).mats, prints: input.prints, extraRefills: input.extraRefills },
    subtotal, shipping, total,
    payment_method: input.paymentMethod,
    payment_ref: null,
    notes: input.notes || null,
  };
  await getStore().insert(order);
  return order;
}

export const getOrder = (id: string) => getStore().get(id);

export async function markPaid(id: string, paymentRef: string): Promise<Order | null> {
  const cur = await getStore().get(id);
  if (!cur) return null;
  if (cur.status === 'paid') return cur;
  return getStore().update(id, { status: 'paid', payment_ref: paymentRef });
}

/** Human-readable lines shared by emails, PayMongo and the thank-you page. Amounts in pesos per unit. */
export function lineItems(o: Order): { name: string; amount: number; quantity: number }[] {
  const tier = tierById(o.items.tier);
  const lines: { name: string; amount: number; quantity: number }[] = [{ name: `${tier.name} — ${product.name} (${o.items.prints.join(', ')} print)`, amount: tier.price, quantity: 1 }];
  if (o.items.extraRefills > 0) lines.push({ name: '3-feather refill pack', amount: product.prices.refill, quantity: o.items.extraRefills });
  if (o.shipping > 0) lines.push({ name: 'Shipping', amount: o.shipping, quantity: 1 });
  return lines;
}
