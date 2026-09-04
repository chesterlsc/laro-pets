import { z } from 'zod';
import { product, tierById, type TierId } from '@/content/product';

/** "0917 123 4567" / "+639171234567" → "+639171234567"; null when not a PH mobile. */
export function normalizeMobile(raw: string): string | null {
  const d = raw.replace(/[\s\-().]/g, '');
  if (/^09\d{9}$/.test(d)) return '+63' + d.slice(1);
  if (/^\+639\d{9}$/.test(d)) return d;
  return null;
}

const TIER_IDS = product.tiers.map((t) => t.id) as [TierId, ...TierId[]];
const req = (label: string, max = 120) => z.string().trim().min(1, `${label} is required`).max(max);

export const orderSchema = z
  .object({
    tier: z.enum(TIER_IDS),
    extraRefills: z.number().int().min(0).max(product.limits.maxExtraRefills),
    prints: z.array(z.enum(product.prints)),
    customer: z.object({
      name: z.string().trim().min(2, 'Enter your full name').max(80),
      mobile: z.string().trim().transform((v, ctx) => {
        const n = normalizeMobile(v);
        if (!n) ctx.addIssue({ code: 'custom', message: 'Enter a PH mobile like 09171234567' });
        return n ?? z.NEVER;
      }),
      email: z.union([z.literal('').transform(() => undefined), z.string().trim().email('Enter a valid email')]).optional(),
    }),
    address: z.object({
      line1: req('House/unit + street'),
      barangay: req('Barangay', 80),
      city: req('City/Municipality', 80),
      province: req('Province', 80),
      zip: z.string().trim().regex(/^\d{4}$/, 'ZIP is 4 digits'),
    }),
    notes: z.string().trim().max(300, 'Keep notes under 300 characters').optional(),
    paymentMethod: z.enum(['cod', 'gcash', 'maya', 'card']),
  })
  .refine((o) => o.prints.length === tierById(o.tier).mats, { path: ['prints'], message: 'Choose a print for each mat' });

export type OrderInput = z.infer<typeof orderSchema>;
export type PaymentMethod = OrderInput['paymentMethod'];
