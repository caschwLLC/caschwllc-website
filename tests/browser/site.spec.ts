import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { siteConfig } from '../../site.config.mjs';
import { localPath } from '../../src/lib/catalog';
const pathFor = (path: string) => localPath(path, siteConfig().base);

const routes = [
  '/',
  '/apps/feelory/',
  '/apps/feelory/privacy/',
  '/apps/feelory/support/',
  '/privacy/',
  '/404.html',
];
for (const route of routes) {
  test(`${route} accessible, responsive, private and connected`, async ({
    page,
  }, testInfo) => {
    const external: string[] = [];
    const failures: string[] = [];
    page.on('request', (request) => {
      if (!request.url().startsWith('http://127.0.0.1:4321/'))
        external.push(request.url());
    });
    page.on('pageerror', (error) => failures.push(error.message));
    await page.goto(pathFor(route));
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(
      page.locator('nav[aria-label="Main navigation"]'),
    ).not.toContainText('Windows');
    await expect(
      page.locator('nav[aria-label="Main navigation"]'),
    ).not.toContainText('Apple');
    await expect(page.locator('footer')).toContainText('Feelory privacy');
    await expect(page.locator('footer')).toContainText('Feelory support');
    await expect(page.locator('a[href*="apps.apple.com"]')).toHaveCount(0);
    await expect(page.locator('form, iframe')).toHaveCount(0);
    if (route.endsWith('/privacy/')) {
      await expect(page.locator('.review-banner, .policy-draft')).toHaveCount(
        0,
      );
      await expect(page.locator('body')).not.toContainText(
        /Draft policy|unapproved|approvals remain unconfirmed/i,
      );
      expect(await page.locator('head').innerHTML()).not.toMatch(
        /draft policy|public review|unapproved/i,
      );
      if (route === '/apps/feelory/privacy/') {
        await expect(page.locator('.policy-availability')).toHaveText(
          'Feelory is coming soon. This policy describes how Feelory handles your information.',
        );
      } else {
        await expect(page.locator('.policy-availability')).toHaveCount(0);
      }
    }
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth,
    );
    expect(overflow).toBe(false);
    await page.keyboard.press('Tab');
    await expect(page.locator('.skip-link')).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(page.locator('#main')).toBeFocused();
    for (const link of await page
      .locator('a[href^="/"]')
      .evaluateAll((links) =>
        links.map((link) => link.getAttribute('href')!),
      )) {
      const response = await page.request.get(link);
      expect(response.ok(), link).toBe(true);
    }
    const accessibility = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
      .analyze();
    expect(accessibility.violations).toEqual([]);
    expect(external).toEqual([]);
    expect(failures).toEqual([]);
    if (
      route === '/' ||
      route === '/apps/feelory/' ||
      route === '/apps/feelory/privacy/'
    ) {
      for (const image of await page.locator('.device img').all()) {
        await image.scrollIntoViewIfNeeded();
        await expect(image).toHaveJSProperty('complete', true);
        expect(
          await image.evaluate(
            (element: HTMLImageElement) => element.naturalWidth,
          ),
        ).toBeGreaterThan(0);
      }
      await page.evaluate(() => window.scrollTo(0, 0));
      if (process.env.CAPTURE_VISUAL_REVIEW === '1') {
        await page.screenshot({
          path: testInfo.outputPath(`visual-${testInfo.project.name}.png`),
          fullPage: true,
          animations: 'disabled',
        });
      }
    }
  });
}

test('product anchors, honest availability and reduced motion', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(pathFor('/apps/feelory/'));
  await expect(page.locator('.hero-actions')).toContainText('Coming soon');
  await page.getByRole('link', { name: 'Take a closer look' }).click();
  await expect(page).toHaveURL(/#explore$/);
  expect(
    await page
      .locator('.device-pair')
      .evaluate((element) => getComputedStyle(element).animationName),
  ).toBe('none');
  await expect(
    page.getByText('This is not a live AI result.', { exact: false }),
  ).toBeVisible();
});

test('unknown routes return the accessible 404, including at narrow width', async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 720 });
  const response = await page.goto(pathFor('/not-a-real-page/'));
  expect(response?.status()).toBe(404);
  await expect(page.getByRole('heading', { level: 1 })).toContainText(
    'isn’t here',
  );
  await expect(page.getByRole('link', { name: 'Back to home' })).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth,
    ),
  ).toBe(false);
});
