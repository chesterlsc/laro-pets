// Single source of truth for product data. Never hardcode a price in a component.
export const product = {
  name: 'Laro Hunt Mat',
  h1: 'Laro Hunt Mat · automatic hide-and-seek cat teaser',
  brand: 'Laro Pets',
  prices: { solo: 799, bundle: 899, multi: 1679, refill: 149 },
  shipping: { fee: 79, freeFrom: 899 },
  prints: ['fish', 'duck'] as const,
  tiers: [
    { id: 'solo',   name: 'Solo Play',      mats: 1, refillsIncluded: 0, price: 799,  tag: '',                 save: 0,   contents: '1 Hunt Mat · spare feathers in the box' },
    { id: 'bundle', name: 'Mat + Refill',   mats: 1, refillsIncluded: 1, price: 899,  tag: 'Most popular',     save: 128, contents: '1 Hunt Mat + 3-feather refill pack' },
    { id: 'multi',  name: 'Multi-Cat Home', mats: 2, refillsIncluded: 1, price: 1679, tag: 'Best for 2+ cats', save: 147, contents: '2 Hunt Mats + 3-feather refill pack' },
  ],
  limits: { maxMatsPerOrder: 2, maxExtraRefills: 3 },
  sku: { fish: 'LARO-HM-FISH', duck: 'LARO-HM-DUCK' },
  demoVideo: {
    src: '/video/laro-hunt-mat-demo.mp4',
    fallbackSrc: '/video/laro-hunt-mat-demo-720.mp4',
    width: 1080,
    height: 1440,
    durationSeconds: 20,
    durationLabel: '0:20',
    uploadDate: '2026-09-04',
  },
} as const;

export type TierId = (typeof product.tiers)[number]['id'];
export type Print = (typeof product.prints)[number];
export type Tier = (typeof product.tiers)[number];

export const tierById = (id: TierId): Tier => product.tiers.find((t) => t.id === id)!;
export const DEFAULT_TIER: TierId = 'bundle';
