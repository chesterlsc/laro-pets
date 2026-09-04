// Full-page screenshots of the live page and the mockup artboards for side-by-side comparison.
// usage: node scripts/shots.mjs <outDir> [url]
import { chromium } from '@playwright/test';
import path from 'node:path';
const out = process.argv[2] ?? 'shots';
const url = process.argv[3] ?? 'http://localhost:3000/';
const mock = 'file://' + path.resolve('design/laro-mockup-a-pounce.html');
const browser = await chromium.launch();
async function shot(w, h, target, file, prep) {
  const page = await browser.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
  await page.goto(target, { waitUntil: 'networkidle' });
  if (prep) await prep(page);
  await page.waitForTimeout(800);
  await page.screenshot({ path: path.join(out, file), fullPage: true });
  await page.close();
}
await shot(1440, 900, url, 'site-1440.png');
await shot(390, 844, url, 'site-390.png');
await shot(1480, 900, mock, 'mock-1440.png', async (p) => p.addStyleTag({ content: '.viewer-bar{display:none}.frame{padding:0}' }));
await shot(430, 844, mock, 'mock-390.png', async (p) => { await p.click('#tab-mobile'); await p.addStyleTag({ content: '.viewer-bar{display:none}.frame{padding:0}' }); });
await browser.close();
console.log('done');
