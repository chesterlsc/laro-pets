import { ImageResponse } from 'next/og';
import { StarMark } from './icon';

export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

export default function AppleIcon() {
  return new ImageResponse(
    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FFF6E9' }}>
      <StarMark px={132} />
    </div>,
    size,
  );
}
