// Shown only while the store has no approved reviews of its own. These are THEMES from public reviews of
// comparable automatic hide-and-seek cat mats (Walmart Foolala 3-in-1, Potaroma, Amazon COCOING — see
// research/pricing.md), not reviews of the Laro Hunt Mat, and the section says so. Delete once real reviews exist.
export const categoryFeedback = {
  attribution: 'Themes from public reviews of comparable automatic hide-and-seek cat mats on Amazon and Walmart — not reviews of the Laro Hunt Mat. Real reviews from Laro customers replace this block as they come in.',
  pros: [
    'Cats that ignore other toys react to the rustle and the feather peeking out at the edges.',
    'Three speed modes and USB charging are the reasons owners keep it in daily rotation.',
    'People use it to keep a cat busy and calm while they are out.',
  ],
  cons: [
    { text: 'Feathers wear out and a few hubs had charging trouble in the first months.', answer: 'Spare feathers ship in every box, refills are ₱149, and the hub is covered by the motor warranty [Proposed policy].' },
    { text: 'It works best on tile or wood; thick carpets slow the feather down.', answer: 'We say so on the specs: tile, wood, laminate or thin rugs.' },
  ],
} as const;
