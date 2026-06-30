import { chromium } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

(async () => {
  const htmlPath = path.join(__dirname, 'MOCKUP_INSTAGRAM_POST_COACH_FR.html');
  const outPath = path.join(__dirname, 'instagram-post-coach-fr.png');
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1200, height: 1200 } });
  await page.goto(`file:///${htmlPath.replace(/\\/g, '/')}`);
  await page.waitForTimeout(500);
  const canvas = page.locator('.canvas');
  await canvas.screenshot({ path: outPath, type: 'png' });
  await browser.close();
  console.log('Saved:', outPath);
})();
