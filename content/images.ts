// Every product image, with the exact alt text from SPEC.md §7. Import from here, never inline a path.
export const images = {
  heroWhite:   { src: '/images/laro-hunt-mat-two-cats-white.jpg', width: 900, height: 828, alt: 'Two cats pawing at the Laro Hunt Mat automatic cat teaser, green feather wand beside it' },
  catsCarpet:  { src: '/images/laro-hunt-mat-cats-carpet.jpg',    width: 900, height: 799, alt: 'Two cats on a carpet watching the feather peek out of the Laro Hunt Mat' },
  floorTopdown:{ src: '/images/laro-hunt-mat-floor-topdown.jpg',  width: 560, height: 879, alt: 'Top-down view of a tabby cat approaching the Laro Hunt Mat on a tiled floor' },
  hub:         { src: '/images/laro-hunt-mat-motor-hub.jpg',      width: 240, height: 220, alt: 'Close-up of the Laro Hunt Mat motor hub with its one-button control' },
  feathers:    { src: '/images/laro-hunt-mat-feather-refill.jpg', width: 230, height: 230, alt: 'Replacement green feather wand for the Laro Hunt Mat' },
  patternFish: { src: '/images/laro-hunt-mat-fish-print.jpg',     width: 157, height: 124, alt: 'Laro Hunt Mat in the fish print' },
  patternDuck: { src: '/images/laro-hunt-mat-duck-print.jpg',     width: 167, height: 124, alt: 'Laro Hunt Mat in the duck print' },
  videoPounce: { src: '/images/laro-hunt-mat-demo-pounce.jpg',    width: 720, height: 960, alt: 'Video still: a cat pouncing on the feather under the Laro Hunt Mat' },
  videoStalk:  { src: '/images/laro-hunt-mat-demo-stalk.jpg',     width: 720, height: 960, alt: 'Video still: a cat stalking the Laro Hunt Mat on a tiled floor' },
  videoPress:  { src: '/images/laro-hunt-mat-demo-press.jpg',     width: 720, height: 960, alt: 'Video still: a hand pressing the button on the Laro Hunt Mat hub' },
} as const;
export type ImageKey = keyof typeof images;
