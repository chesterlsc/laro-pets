import { ImageResponse } from 'next/og';

export const size = { width: 32, height: 32 };
export const contentType = 'image/png';

/** Same star mark as `Logo` in components/icons.tsx. */
export const StarMark = ({ px }: { px: number }) => (
  <svg width={px} height={px} viewBox="0 0 24 24">
    <path d="M12 2.2l2.7 5.7 6.2.8-4.5 4.3 1.2 6.2L12 16.2l-5.6 3 1.2-6.2L3.1 8.7l6.2-.8z" fill="#0F5C6B" stroke="#0F5C6B" strokeWidth="2.2" strokeLinejoin="round" />
    <circle cx="12" cy="11" r="2.4" fill="#FFFFFF" />
  </svg>
);

export default function Icon() {
  return new ImageResponse(
    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent' }}>
      <StarMark px={30} />
    </div>,
    size,
  );
}
