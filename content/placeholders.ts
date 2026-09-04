// Every unconfirmed fact. Rendered verbatim (brackets included) until the owner fills it in.
// scripts/check-placeholders.mjs warns at build time while any value still contains "[".
export const placeholders = {
  rating: '[4.8]',
  reviewCount: '[000]',
  deliveryDaysMetroManila: '[2–4]',
  deliveryDaysProvinces: '[4–8]',
  batteryMah: '[X mAh]',
  playtimePerCharge: '[X h]',
  feathersInBox: '2 [confirm count]',
  dtiRegNo: '[•]',
  birTin: '[•]',
  businessName: '[Registered business name]',
  businessAddress: '[Business address, Metro Manila]',
  contactEmail: '[hello@laropets.ph]',
  domain: '[yourdomain].ph',
} as const;

export type PlaceholderKey = keyof typeof placeholders;

/** Keys whose value still contains a bracket — used by the dev banner and the build warning. */
export const unfilledPlaceholders = (): PlaceholderKey[] =>
  (Object.keys(placeholders) as PlaceholderKey[]).filter((k) => placeholders[k].includes('['));
