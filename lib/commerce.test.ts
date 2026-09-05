import { createHmac } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import { normalizeMobile, orderSchema } from './order-schema';
import { generateOrderNo } from './orders';
import { verifyWebhookSignature } from './paymongo';

const base = {
  tier: 'bundle', extraRefills: 1, prints: ['fish'],
  customer: { name: 'Test Cat Parent', mobile: '0917 123 4567', email: '' },
  address: { line1: '12 Sampaguita St', barangay: 'Bagong Pag-asa', city: 'Quezon City', province: 'Metro Manila', zip: '1100' },
  notes: '', paymentMethod: 'cod',
};

describe('order schema', () => {
  it('normalises PH mobiles', () => {
    expect(normalizeMobile('09171234567')).toBe('+639171234567');
    expect(normalizeMobile('+63 917 123 4567')).toBe('+639171234567');
    expect(normalizeMobile('9171234567')).toBeNull();
  });
  it('accepts a valid COD order and normalises fields', () => {
    const r = orderSchema.parse(base);
    expect(r.customer.mobile).toBe('+639171234567');
    expect(r.customer.email).toBeUndefined();
  });
  it('requires one print per mat', () => {
    expect(orderSchema.safeParse({ ...base, tier: 'multi' }).success).toBe(false);
    expect(orderSchema.safeParse({ ...base, tier: 'multi', prints: ['fish', 'duck'] }).success).toBe(true);
  });
  it('rejects a filled honeypot', () => {
    expect(orderSchema.safeParse({ ...base, website: '' }).success).toBe(true);
    expect(orderSchema.safeParse({ ...base, website: 'http://spam.example' }).success).toBe(false);
  });
  it('rejects bad zip / refills / mobile', () => {
    expect(orderSchema.safeParse({ ...base, address: { ...base.address, zip: '110' } }).success).toBe(false);
    expect(orderSchema.safeParse({ ...base, extraRefills: 4 }).success).toBe(false);
    expect(orderSchema.safeParse({ ...base, customer: { ...base.customer, mobile: '12345' } }).success).toBe(false);
  });
});

it('order numbers look like LP-YYMMDD-XXXX', () => {
  expect(generateOrderNo(new Date('2026-09-04T00:00:00Z'))).toMatch(/^LP-260904-[A-Z0-9]{4}$/);
});

describe('paymongo signature', () => {
  const secret = 'whsk_test_secret';
  const body = '{"data":{"id":"evt_1"}}';
  const now = 1_700_000_000_000;
  const t = String(now / 1000);
  const sig = createHmac('sha256', secret).update(`${t}.${body}`).digest('hex');
  it('accepts a valid test signature', () => expect(verifyWebhookSignature(body, `t=${t},te=${sig},li=`, secret, now)).toBe(true));
  it('accepts a valid live signature', () => expect(verifyWebhookSignature(body, `t=${t},te=,li=${sig}`, secret, now)).toBe(true));
  it('rejects tampered body / missing header', () => {
    expect(verifyWebhookSignature(body + ' ', `t=${t},te=${sig},li=`, secret, now)).toBe(false);
    expect(verifyWebhookSignature(body, null, secret, now)).toBe(false);
    expect(verifyWebhookSignature(body, `t=${t},te=${sig},li=`, secret, undefined as unknown as number)).toBe(false);
  });
  it('rejects a stale timestamp (replay)', () => {
    expect(verifyWebhookSignature(body, `t=${t},te=${sig},li=`, secret, now + 6 * 60 * 1000)).toBe(false);
    expect(verifyWebhookSignature(body, `t=${t},te=${sig},li=`, secret, now + 4 * 60 * 1000)).toBe(true);
  });
});
