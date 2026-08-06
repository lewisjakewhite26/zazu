/**
 * Screenshot audit of Zazu's mobile web build across the key routes, in both
 * light and dark theme.
 *
 * Prereqs:
 *   1. cd mobile && npm run web   (leave running in another terminal)
 *   2. npx playwright install chromium   (first run only)
 *
 * Usage:
 *   node scripts/capture-screenshots.mjs
 *   EXPO_PORT=8082 node scripts/capture-screenshots.mjs
 *
 * Output: PNGs in screenshots/ at the repo root, named "<route>-<theme>.png".
 *
 * Notes on how routes are reached (not just goto'd):
 *   - /alarm, /morning-task, and /puzzle depend on in-memory session state
 *     (AlarmFlowContext's sessionWord/gymSessionWord) that a real browser
 *     navigation would wipe, so this script clicks through the actual UI
 *     (Try the alarm / Continue / Start practice) instead of visiting those
 *     URLs directly -- a raw goto() would just bounce back to "/".
 *   - Word Gym requires an active Gold entitlement. A fresh guest session is
 *     free-tier, so this script flips the app's own __DEV__-gated "Preview
 *     as: Zazu Gold" toggle on the Calendar screen before visiting Word Gym.
 *     That's an in-memory preview only (SubscriptionContext's
 *     devGoldPreview), which is exactly why everything after it runs as
 *     client-side navigation (clicks), not goto() -- a full page load would
 *     lose it.
 */
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'screenshots');
const BASE_URL = process.env.EXPO_PORT
  ? `http://localhost:${process.env.EXPO_PORT}`
  : (process.env.BASE_URL ?? 'http://localhost:8081');

const VIEWPORT = { width: 390, height: 844 };
const DEVICE_SCALE_FACTOR = 3;

mkdirSync(OUT, { recursive: true });

async function wait(page, ms = 1500) {
  await page.waitForLoadState('domcontentloaded').catch(() => {});
  await page.waitForTimeout(ms);
}

async function gotoApp(page, path = '/') {
  await page.goto(`${BASE_URL}${path}`, { waitUntil: 'domcontentloaded', timeout: 120000 });
}

async function shot(page, name) {
  await page.waitForTimeout(400);
  const path = join(OUT, `${name}.png`);
  await page.screenshot({ path, fullPage: true });
  console.log(`  saved ${name}.png`);
}

/**
 * Bypass onboarding by seeding the same localStorage flags continueAsGuest()
 * would persist, then reload once -- the only reload this script needs.
 */
async function seedGuest(page) {
  await gotoApp(page);
  await page.evaluate(() => {
    for (const key of Object.keys(localStorage)) {
      if (key.startsWith('zazu:') || key.includes('supabase')) {
        localStorage.removeItem(key);
      }
    }
    localStorage.setItem('zazu:hasOnboarded', 'true');
    localStorage.setItem('zazu:isAnonymous', 'true');
  });
  await page.reload();
  await wait(page, 3000);
}

/** Flip the Calendar screen's dev-only Free/Gold preview toggle to Gold. */
async function grantDevGoldPreview(page) {
  await page.getByRole('button', { name: 'Your words' }).click(); // HomeHeader calendar icon
  await wait(page, 1500);
  await page.getByText('Zazu Gold', { exact: true }).first().click();
  await wait(page, 600);
  await page.getByRole('button', { name: 'Go back' }).click(); // ScreenHeader back
  await wait(page, 1000);
}

/** Click the Settings theme toggle until its label reflects `mode`. */
async function setTheme(page, mode) {
  const target = mode === 'light' ? 'Theme: Light' : 'Theme: Dark';
  await page.getByRole('button', { name: 'Settings' }).click(); // HomeHeader gear icon
  await wait(page, 1500);

  const toggle = page.getByRole('button', { name: /^Theme:/ });
  for (let attempt = 0; attempt < 3; attempt += 1) {
    // Read the accessible name (aria-label), not textContent -- the row
    // renders "Theme" and the value as separate <Text> nodes with no
    // ": " separator in the visible DOM text, so textContent() never
    // matches `target` and the loop used to always exhaust and drift.
    const label = await toggle.getAttribute('aria-label');
    if (label?.trim() === target) break;
    await toggle.click();
    await wait(page, 600);
  }

  await shot(page, `settings-${mode}`);
  await page.getByRole('button', { name: 'Go back' }).click();
  await wait(page, 1000);
}

async function captureDemoAlarmFlow(page, suffix) {
  await page.getByRole('button', { name: 'Try the alarm' }).click();
  await wait(page, 2000);
  await shot(page, `alarm-${suffix}`);

  await page.getByRole('button', { name: "I'm awake. Let's go." }).click();
  await wait(page, 1500);

  await page.getByRole('button', { name: 'Continue' }).click();
  await wait(page, 1500);
  await shot(page, `morning-task-${suffix}`);

  // Exit the demo cleanly (isDemo-only close button) rather than answering
  // the MCQ, so we land back on Home instead of falling through to Success.
  const exitDemo = page.getByRole('button', { name: 'Exit demo alarm' });
  if (await exitDemo.isVisible().catch(() => false)) {
    await exitDemo.click();
    await wait(page, 1200);
  }
}

async function capturePuzzle(page, suffix) {
  await page.getByRole('tab', { name: 'Word Gym' }).click();
  await wait(page, 1500);

  const startBtn = page.getByRole('button', { name: /Start practice|Practise again/i });
  await startBtn.waitFor({ state: 'visible', timeout: 15000 });
  await startBtn.click();
  await wait(page, 2000);
  await shot(page, `puzzle-${suffix}`);

  const exitGym = page.getByRole('button', { name: 'Exit Word Gym' });
  if (await exitGym.isVisible().catch(() => false)) {
    await exitGym.click();
    await wait(page, 1000);
  }
  await page.getByRole('tab', { name: 'Home' }).click();
  await wait(page, 1000);
}

async function captureCalendar(page, suffix) {
  await page.getByRole('button', { name: 'Your words' }).click();
  await wait(page, 1500);
  await shot(page, `calendar-${suffix}`);
  await page.getByRole('button', { name: 'Go back' }).click();
  await wait(page, 1000);
}

async function captureThemePass(page, mode) {
  console.log(`\n-- ${mode} theme --`);
  await setTheme(page, mode); // also shoots settings-{mode}

  await shot(page, `home-${mode}`);
  await captureCalendar(page, mode);
  await captureDemoAlarmFlow(page, mode);
  await capturePuzzle(page, mode);
}

async function main() {
  console.log(`Base URL: ${BASE_URL}`);
  console.log(`Output:   ${OUT}`);

  const reachable = await fetch(BASE_URL).then(
    () => true,
    () => false,
  );
  if (!reachable) {
    console.error(
      `\nCould not reach ${BASE_URL}. Start the dev server first:\n  cd mobile && npm run web\n`,
    );
    process.exit(1);
  }

  const browser = await chromium.launch();
  const page = await browser.newPage({
    viewport: VIEWPORT,
    deviceScaleFactor: DEVICE_SCALE_FACTOR,
  });

  await seedGuest(page);
  await grantDevGoldPreview(page);

  await captureThemePass(page, 'light');
  await captureThemePass(page, 'dark');

  await browser.close();
  console.log(`\nDone. Screenshots in ${OUT}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
