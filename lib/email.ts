// Resend notifications. No-op (console.info) when RESEND_API_KEY is missing.
import { Resend } from 'resend';
import { placeholders } from '@/content/placeholders';
import { lineItems, type Order } from './orders';
import { peso } from './pricing';

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
const METHOD: Record<Order['payment_method'], string> = { cod: 'Cash on Delivery', gcash: 'GCash', maya: 'Maya', card: 'Credit/Debit card' };

function fromAddress() {
  const host = new URL(SITE).hostname;
  return host.includes('localhost') ? 'Laro Pets <onboarding@resend.dev>' : `Laro Pets <orders@${host}>`;
}

const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!);
const row = (k: string, v: string) => `<tr><td style="padding:4px 12px 4px 0;color:#5A6472">${k}</td><td style="padding:4px 0"><b>${v}</b></td></tr>`;

function itemsTable(o: Order) {
  const rows = lineItems(o).map((l) => `<tr><td style="padding:6px 0">${esc(l.name)}${l.quantity > 1 ? ` × ${l.quantity}` : ''}</td><td style="padding:6px 0;text-align:right">${peso(l.amount * l.quantity)}</td></tr>`).join('');
  return `<table style="width:100%;max-width:520px;border-collapse:collapse;font-size:15px">${rows}
<tr><td style="padding:8px 0;border-top:1px solid #F0E4D2">Subtotal</td><td style="padding:8px 0;border-top:1px solid #F0E4D2;text-align:right">${peso(o.subtotal)}</td></tr>
<tr><td>Shipping</td><td style="text-align:right">${o.shipping ? peso(o.shipping) : 'FREE'}</td></tr>
<tr><td style="padding:8px 0;font-size:18px"><b>Total</b></td><td style="padding:8px 0;text-align:right;font-size:18px"><b>${peso(o.total)}</b></td></tr></table>`;
}

const addressBlock = (o: Order) => esc([o.address.line1, o.address.barangay, o.address.city, o.address.province, o.address.zip].join(', '));
const wrap = (body: string) => `<div style="font-family:Nunito,'Segoe UI',sans-serif;color:#1E2430;line-height:1.5;padding:8px">${body}</div>`;

function ownerHtml(o: Order) {
  return wrap(`<h2 style="margin:0 0 12px">New order ${o.order_no}</h2>
<p style="margin:0 0 16px">Status: <b>${o.status}</b> · ${METHOD[o.payment_method]}${o.payment_ref ? ` · ref ${esc(o.payment_ref)}` : ''}</p>
${itemsTable(o)}
<h3 style="margin:20px 0 8px">Deliver to</h3>
<table style="font-size:15px;border-collapse:collapse">${row('Name', esc(o.customer.name))}${row('Mobile', esc(o.customer.mobile))}${o.customer.email ? row('Email', esc(o.customer.email)) : ''}${row('Address', addressBlock(o))}${o.notes ? row('Notes', esc(o.notes)) : ''}</table>`);
}

function customerHtml(o: Order) {
  const cod = o.payment_method === 'cod';
  return wrap(`<h2 style="margin:0 0 12px">Salamat! Order ${o.order_no} is in.</h2>
<p style="margin:0 0 16px">Hi ${esc(o.customer.name.split(' ')[0])}, here's what you ordered:</p>
${itemsTable(o)}
${cod ? `<div style="margin:20px 0;padding:14px 16px;background:#FFE9DD;border-radius:12px"><b>Prepare ${peso(o.total)} in cash</b> for the courier on delivery.</div>` : `<p style="margin:20px 0">Paid via ${METHOD[o.payment_method]}${o.payment_ref ? ` · ref ${esc(o.payment_ref)}` : ''}.</p>`}
<h3 style="margin:20px 0 8px">What happens next</h3>
<ol style="margin:0;padding-left:20px">
<li>We pack your order today.</li>
<li>The courier picks it up.</li>
<li>You get a tracking number by SMS within ${placeholders.deliveryDaysMetroManila} days (Metro Manila) or ${placeholders.deliveryDaysProvinces} days (provinces).</li>
</ol>
<p style="margin:16px 0 0;color:#5A6472;font-size:14px">Delivering to ${addressBlock(o)} · ${esc(o.customer.mobile)}</p>`);
}

export async function sendOrderEmails(order: Order) {
  const key = process.env.RESEND_API_KEY;
  if (!key) { console.info(`[email] RESEND_API_KEY missing — would email owner${order.customer.email ? ' + customer' : ''} for ${order.order_no}`); return; }
  const resend = new Resend(key);
  const from = fromAddress();
  const owner = process.env.STORE_OWNER_EMAIL;
  const jobs: Promise<unknown>[] = [];
  if (owner) jobs.push(resend.emails.send({ from, to: owner, subject: `New order ${order.order_no} · ${peso(order.total)} · ${METHOD[order.payment_method]}`, html: ownerHtml(order) }));
  if (order.customer.email) jobs.push(resend.emails.send({ from, to: order.customer.email, subject: `Your Laro Pets order ${order.order_no}`, html: customerHtml(order) }));
  const results = await Promise.allSettled(jobs);
  for (const r of results) if (r.status === 'rejected') console.error('[email] send failed', r.reason);
}
