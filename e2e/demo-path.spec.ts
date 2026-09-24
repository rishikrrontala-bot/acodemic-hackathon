import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

/** Collect console errors and uncaught exceptions for the whole test. */
function watchErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push(m.text());
  });
  page.on('pageerror', (e) => errors.push(e.message));
  return errors;
}

test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
});

test('first visit: Mopti, the year headline, the pot and twelve months, with no console errors', async ({ page }) => {
  const errors = watchErrors(page);
  await page.goto('./');
  await expect(page.locator('.headline')).toContainText('In Mopti, a clay-pot cooler works');
  await expect(page.locator('.pot')).toBeVisible();
  await expect(page.getByRole('radio')).toHaveCount(12);
  await expect(page.getByRole('radio', { checked: true })).toHaveCount(1);
  await expect(page.locator('meta[name="author"]')).toHaveAttribute('content', 'Rishik Rontala');
  await expect(page.getByText('Built by Rishik Rontala')).toBeVisible();
  expect(errors).toEqual([]);
});

test('search a town by typing, pick it with the keyboard', async ({ page }) => {
  await page.goto('./');
  const town = page.getByRole('combobox');
  await town.fill('kass');
  await expect(page.getByRole('listbox')).toBeVisible();
  await expect(page.getByRole('option').first()).toContainText('Kassala');
  await town.press('Enter');
  await expect(page.locator('.headline')).toContainText('In Kassala');
  await expect(page).toHaveURL(/#t=\d+&m=\d+/);
});

test('August in Mopti is honestly too humid', async ({ page }) => {
  await page.goto('./');
  await page.getByRole('radio', { name: /^August/ }).click();
  await expect(page.locator('.month-name')).toHaveText('August');
  await expect(page.locator('.verdict-chip')).toContainText('Too humid');
});

test('arrow keys move through the months', async ({ page }) => {
  await page.goto('./#m=3');
  const checked = page.getByRole('radio', { checked: true });
  await checked.focus();
  await page.keyboard.press('ArrowRight');
  await expect(page.getByRole('radio', { checked: true })).toHaveAccessibleName(/^April/);
  await page.keyboard.press('End');
  await expect(page.getByRole('radio', { checked: true })).toHaveAccessibleName(/^December/);
});

test('a humid coastal city never "works"', async ({ page }) => {
  await page.goto('./');
  await page.getByRole('combobox').fill('lagos');
  await page.getByRole('option', { name: /Lagos/ }).first().click();
  await expect(page.locator('.headline')).toContainText('too humid');
});

test('French and °F', async ({ page }) => {
  await page.goto('./');
  await page.getByRole('button', { name: 'FR' }).click();
  await expect(page.locator('html')).toHaveAttribute('lang', 'fr');
  await expect(page.locator('.headline')).toContainText('À Mopti, un canari-frigo fonctionne');
  const before = await page.locator('.big-num').textContent();
  await page.getByRole('button', { name: '°F' }).click();
  const after = await page.locator('.big-num').textContent();
  expect(Number.parseInt(after!)).toBeGreaterThan(Number.parseInt(before!));
});

test('deep link restores town, month and language', async ({ page }) => {
  await page.goto('./');
  await page.getByRole('combobox').fill('kano');
  await page.getByRole('option', { name: /Kano/ }).first().click();
  const url = page.url();
  const id = new URL(url).hash.match(/t=(\d+)/)![1];
  await page.goto(`./#t=${id}&m=3&l=es`);
  await page.reload();
  await expect(page.locator('.headline')).toContainText('En Kano');
  await expect(page.locator('.month-name')).toHaveText('Marzo');
});

test('crop calendar: pick okra, set my own shelf life, see days in the pot', async ({ page }) => {
  await page.goto('./#m=3');
  // desktop: a button in the calendar table; phone: a row in the month list (shows its days)
  await page.getByRole('button', { name: /^Okra/ }).click();
  await expect(page.locator('.crop-name')).toContainText('Okra');
  await page.getByLabel(/On the table, my okra last/).fill('4');
  await expect(page.locator('.gain-days')).toHaveText(/^\d+(–\d+)? days$/);
  await expect(page.locator('.gain-times')).toContainText('as long as on the table');
  await expect(page.locator('.keep-list')).toContainText('Medicines and vaccines');
});

test('a humid month says "not worth building" before the steps, and offers the good month', async ({ page }) => {
  await page.goto('./#m=8'); // Mopti, August
  await expect(page.locator('.build-advice')).toContainText('Not worth building for August');
  await page.locator('.build-advice').getByRole('button', { name: /Plan for/ }).click();
  await expect(page.locator('.build-advice')).toBeHidden();
  await expect(page.locator('.month-name')).not.toHaveText('August');
});

test('a town where it never works says so and folds the steps away', async ({ page }) => {
  await page.goto('./');
  await page.getByRole('combobox').fill('lagos');
  await page.getByRole('option', { name: /Lagos/ }).first().click();
  await expect(page.locator('.build-advice')).toContainText('doesn’t recommend building one in Lagos');
  await expect(page.locator('.steps')).toBeHidden();
  await page.getByText('Show the steps anyway').click();
  await expect(page.locator('.steps')).toBeVisible();
});

test('the now line names this month and can jump to it', async ({ page }) => {
  await page.goto('./#m=3');
  const month = new Intl.DateTimeFormat('en', { month: 'long' }).format(new Date());
  await expect(page.locator('.now-line')).toContainText(`It’s ${month} now`);
  const jump = page.locator('.now-btn');
  if (new Date().getMonth() !== 2) {
    await jump.click();
    await expect(page.locator('.month-name')).toHaveText(month);
  }
});

test('the hero number, the pot and the year strip agree (hottest hours)', async ({ page }) => {
  await page.goto('./#m=4');
  const air = (await page.locator('.pot-tag-air-value').textContent())!.replace('°', '');
  const inside = (await page.locator('.pot-tag-in-value').textContent())!.replace('°', '');
  await expect(page.getByRole('radio', { checked: true })).toHaveAccessibleName(new RegExp(`Air ${air}°, inside ${inside}°`));
});

test('check my pot: readings in the calibrated range read as working', async ({ page }) => {
  await page.goto('./#m=3');
  await page.getByLabel('Air next to the pot').fill('38');
  await page.getByLabel('Inside the inner pot').fill('29');
  await page.getByRole('button', { name: 'Check my pot' }).click();
  await expect(page.locator('.diag')).toBeVisible();
  await expect(page.locator('.check-score')).toContainText('%');
});

test('check my pot: missing number is an error, not a crash', async ({ page }) => {
  await page.goto('./');
  await page.getByRole('button', { name: 'Check my pot' }).click();
  await expect(page.getByRole('alert')).toContainText('Enter both temperatures');
});

test('build card resizes with capacity', async ({ page }) => {
  await page.goto('./');
  const first = await page.locator('.steps li').first().textContent();
  await page.getByLabel('How much the inner pot holds').fill('100');
  await expect(page.locator('.cap-out')).toHaveText('100 litres');
  expect(await page.locator('.steps li').first().textContent()).not.toEqual(first);
});

test('the map loads when scrolled to and a dot selects a town', async ({ page }) => {
  await page.goto('./');
  await page.locator('.where').scrollIntoViewIfNeeded();
  await expect(page.locator('.map-dot')).toHaveCount(492);
  await page.locator('.map-dot[data-verdict="works"]').first().click({ force: true });
  await expect(page.locator('.headline')).toBeVisible();
});

test('no horizontal scrolling on a phone', async ({ page }, info) => {
  test.skip(info.project.name !== 'phone');
  await page.goto('./');
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(0);
});

test('no serious or critical accessibility violations (axe, WCAG 2.2 AA)', async ({ page }) => {
  await page.goto('./');
  await page.locator('.where').scrollIntoViewIfNeeded();
  await page.waitForSelector('.map-dot');
  const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']).analyze();
  const bad = results.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical');
  expect(bad.map((v) => `${v.id}: ${v.nodes.length} × ${v.help}`)).toEqual([]);
});

test('works offline after the first visit (service worker)', async ({ page, context }) => {
  await page.goto('./');
  await page.evaluate(async () => {
    const reg = await navigator.serviceWorker.ready;
    return reg.active?.state;
  });
  await page.reload(); // now controlled by the service worker
  await context.setOffline(true);
  await page.reload();
  await expect(page.locator('.headline')).toContainText('Mopti');
  await context.setOffline(false);
});
