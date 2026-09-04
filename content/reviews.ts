// SAMPLE REVIEWS — not real customers.
// When the owner connects a reviews app (Judge.me, Loox, etc.), replace this file with a fetch
// from that app and set `sample: false`. While `sample` is true every card shows the
// "Sample review" tag, the hero rating shows the bracketed placeholder, and JSON-LD omits aggregateRating.
export const reviews = {
  sample: true,
  items: [
    { name: 'Maria S.', city: 'Quezon City', stars: 5, text: 'Si Mochi never plays with toys. First time I pressed the button she stalked it for ten minutes. Ang quiet din, so hindi siya natakot.' },
    { name: 'Jed R.', city: 'Cebu City', stars: 5, text: 'Two cats, one mat. They take turns pouncing. The spare feathers in the box were a big plus because my orange boy shreds them.' },
    { name: 'Kat D.', city: 'Davao City', stars: 4, text: 'Ordered Tuesday via COD, arrived Thursday. Charges with the same cable as my phone. Wish the mat were a bit bigger for two cats.' },
    { name: 'Anne L.', city: 'Makati', stars: 4, text: 'Works best on tiles or wood. On my thick rug it slowed down, so I moved it to the floor and it was perfect.' },
  ],
} as const;
