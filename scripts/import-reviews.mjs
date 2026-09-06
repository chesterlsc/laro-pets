#!/usr/bin/env node
// Import YOUR OWN customers' reviews from another channel (Shopee / Lazada / TikTok Shop export) as approved reviews.
// Usage: SUPABASE_URL=… SUPABASE_SERVICE_ROLE_KEY=… node scripts/import-reviews.mjs reviews.csv shopee
// CSV columns (header row required): name,city,stars,title,body,date,order_ref  — date = YYYY-MM-DD, stars = 1–5.
// Only import reviews written by real buyers of the Laro Hunt Mat on that channel. Do not import reviews of other sellers' products.
import { readFileSync } from 'node:fs';
import { randomUUID } from 'node:crypto';
import { createClient } from '@supabase/supabase-js';

const [file, source = 'shopee'] = process.argv.slice(2);
if (!file) { console.error('usage: node scripts/import-reviews.mjs <file.csv> <source>'); process.exit(1); }
const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = process.env;
if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) { console.error('Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY'); process.exit(1); }

const parseCsv = (text) => {
  const rows = []; let row = [], cell = '', q = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q) { if (c === '"' && text[i + 1] === '"') { cell += '"'; i++; } else if (c === '"') q = false; else cell += c; }
    else if (c === '"') q = true; else if (c === ',') { row.push(cell); cell = ''; } else if (c === '\n') { row.push(cell); rows.push(row); row = []; cell = ''; } else if (c !== '\r') cell += c;
  }
  if (cell || row.length) { row.push(cell); rows.push(row); }
  const [head, ...body] = rows;
  return body.filter((r) => r.some((v) => v.trim())).map((r) => Object.fromEntries(head.map((h, i) => [h.trim().toLowerCase(), (r[i] ?? '').trim()])));
};

const rows = parseCsv(readFileSync(file, 'utf8'));
const reviews = rows.map((r) => ({
  id: randomUUID(),
  created_at: r.date ? new Date(r.date).toISOString() : new Date().toISOString(),
  status: 'approved', name: r.name, city: r.city || null, stars: Math.min(5, Math.max(1, Number(r.stars) || 5)),
  title: r.title || null, body: r.body, print: null, order_no: r.order_ref || null, verified: !!r.order_ref,
  photo_url: null, helpful: 0, owner_reply: null, source,
})).filter((r) => r.name && r.body && r.body.length >= 20);

const sb = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
const { error } = await sb.from('reviews').insert(reviews);
if (error) { console.error(error.message); process.exit(1); }
console.log(`Imported ${reviews.length} ${source} reviews as approved. The site updates within 5 minutes.`);
