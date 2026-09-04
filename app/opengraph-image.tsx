import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { ImageResponse } from 'next/og';
import { images } from '@/content/images';
import { product } from '@/content/product';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export const alt = 'Laro Hunt Mat — automatic hide-and-seek cat teaser, ₱799, COD and free shipping in the Philippines';

const CREAM = '#FFF6E9';
const TEAL = '#0F5C6B';
const INK = '#1E2430';
const CORAL = '#D14127';
const YELLOW = '#FFC857';

export default async function Image() {
  // ponytail: system sans (Satori's bundled Noto Sans) — fetching Fredoka/Nunito TTFs at build is flaky.
  const jpg = await readFile(join(process.cwd(), 'public', images.heroWhite.src));
  const hero = `data:image/jpeg;base64,${jpg.toString('base64')}`;

  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', background: CREAM, fontFamily: 'sans-serif', color: INK }}>
        <div style={{ width: '55%', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '64px 24px 64px 72px' }}>
          <div style={{ display: 'flex', alignSelf: 'flex-start', padding: '10px 18px', borderRadius: 999, background: TEAL, color: '#fff', fontSize: 18, fontWeight: 800, letterSpacing: 2 }}>
            LARO HUNT MAT · AUTOMATIC CAT TEASER
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', marginTop: 30, fontSize: 64, fontWeight: 700, lineHeight: 1.08, letterSpacing: -1.5 }}>
            <span>Something’s under the mat.</span>
            <span style={{ display: 'flex' }}>
              Your cat&nbsp;<span style={{ color: CORAL }}>has to know.</span>
            </span>
          </div>
          <div style={{ marginTop: 28, fontSize: 28, fontWeight: 700, color: TEAL }}>
            ₱{product.prices.solo} · COD · free shipping on ₱{product.shipping.freeFrom}+
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', marginTop: 'auto', color: TEAL }}>
            <span style={{ fontSize: 40, fontWeight: 700, letterSpacing: -1 }}>laro</span>
            <span style={{ fontSize: 15, fontWeight: 800, letterSpacing: 3, marginLeft: 8 }}>PETS</span>
          </div>
        </div>
        <div style={{ width: '45%', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
          <img
            src={hero}
            alt=""
            width={430}
            height={430}
            style={{ borderRadius: 22, objectFit: 'cover', transform: 'rotate(-2deg)', boxShadow: '0 24px 60px rgba(30,36,48,0.18)' }}
          />
          <div
            style={{
              position: 'absolute', top: 72, right: 40, display: 'flex', padding: '14px 22px', borderRadius: 999,
              background: YELLOW, color: INK, fontSize: 26, fontWeight: 800, transform: 'rotate(6deg)', boxShadow: '0 8px 20px rgba(30,36,48,0.15)',
            }}
          >
            3 speeds
          </div>
        </div>
      </div>
    ),
    size,
  );
}
