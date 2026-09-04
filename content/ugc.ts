// Creator clips (with written permission). While this array is empty the "See it in action"
// section renders the three dashed UGC placeholder slots from the mockup. Add entries to
// replace them with real embedded clips:
//   { handle: '@creator', platform: 'TikTok', views: '1.2M', hook: '…', src: '/video/ugc-1.mp4', poster: '/images/ugc-1.jpg' }
export type UgcClip = { handle: string; platform: string; views: string; hook: string; src: string; poster: string };
export const ugc: UgcClip[] = [];

export const ugcSlotHooks = [
  '“Something was hiding under there… I had to investigate”',
  '“My cat is OBSESSED with this”',
  '“Held her attention for an hour — I had to turn it off”',
] as const;
