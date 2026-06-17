import { chromium } from 'playwright';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const OUT = join(dirname(fileURLToPath(import.meta.url)), '..', 'New SS');
const BASE = process.env.EXPO_PORT ? `http://localhost:${process.env.EXPO_PORT}` : 'http://localhost:8083';

async function wait(page, ms = 2000) {
  await page.waitForTimeout(ms);
}

async function shot(page, name) {
  await page.screenshot({ path: join(OUT, name), fullPage: true });
  console.log(`Saved ${name}`);
}

async function answerMorningTask(page) {
  const dismiss = page.getByRole('button', { name: 'Dismiss alarm' });
  for (let attempt = 0; attempt < 8; attempt++) {
    if (await dismiss.isVisible().catch(() => false)) return;
    const boxes = await page.evaluate(() =>
      [...document.querySelectorAll('div')].filter((el) => {
        const r = el.getBoundingClientRect();
        const t = (el.textContent ?? '').trim();
        return r.height >= 44 && r.height <= 90 && r.width > 200 && t.length > 3 && t.length < 80;
      }).map((el) => el.textContent?.trim()),
    );
    for (const text of boxes) {
      if (!text) continue;
      await page.getByText(text, { exact: true }).first().click({ timeout: 3000 }).catch(() => {});
      await wait(page, 800);
      if (await dismiss.isVisible().catch(() => false)) return;
    }
  }
}

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
await page.goto(BASE);
await page.evaluate(() => {
  localStorage.setItem('zazu:hasOnboarded', 'true');
  localStorage.setItem('zazu:isAnonymous', 'true');
});
await page.reload();
await wait(page, 3500);

await page.getByRole('button', { name: 'Try the alarm' }).click();
await wait(page, 2000);
await page.getByRole('button', { name: "I'm awake. Let's go." }).click();
await wait(page, 1500);
await page.getByRole('button', { name: 'Continue' }).click();
await wait(page, 2500);
await shot(page, '04-morning-task-light.png');

await answerMorningTask(page);
await page.getByRole('button', { name: 'Dismiss alarm' }).click({ timeout: 15000 });
await wait(page, 3000);
await shot(page, '05-success-light.png');

await browser.close();
