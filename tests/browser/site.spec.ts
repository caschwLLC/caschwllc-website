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
  '/apps/feelory/accessibility/',
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
    await expect(page.locator('footer')).toContainText('Feelory accessibility');
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
        await expect(page.locator('body')).toContainText(
          'Effective: 2026-10-12',
        );
        await expect(page.locator('body')).toContainText('Delete iCloud Data…');
        await expect(page.locator('body')).toContainText(
          'Guilt maps to Guilty, Jealousy to Jealous, and Relief to Relieved.',
        );
        await expect(page.locator('body')).toContainText(
          'Deleting Feelory’s iCloud data does not erase local data.',
        );
        await expect(page.locator('body')).toContainText(
          'Deleting Feelory from your device does not erase its iCloud data.',
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
    if (route === '/apps/feelory/accessibility/') {
      await expect(page.locator('#main')).toHaveCSS('outline-style', 'solid');
    }
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
      route === '/apps/feelory/privacy/' ||
      route === '/apps/feelory/accessibility/'
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
    page.getByText('screen examples use synthetic content', { exact: false }),
  ).toBeVisible();
});

test('Feelory marketing and support describe current features and screenshot variants', async ({
  page,
}) => {
  await page.goto(pathFor('/apps/feelory/'));
  await expect(page.locator('.device img')).toHaveCount(7);
  await expect(page.locator('main')).toContainText(
    '128 emotions across eight families',
  );
  await expect(page.locator('main')).toContainText(
    'one gentle reminder each evening at 8 PM local time',
  );
  await expect(page.locator('main')).toContainText('no remote fallback');
  await expect(page.locator('main')).toContainText('Face ID or Touch ID');
  await expect(
    page.getByRole('link', { name: 'Feelory accessibility information' }),
  ).toHaveAttribute('href', pathFor('/apps/feelory/accessibility/'));
  for (const image of await page.locator('.device img').all()) {
    await expect(image).toHaveAttribute('alt', /.+/);
  }
  const firstImage = page.locator('.device img').first();
  await page.emulateMedia({ colorScheme: 'dark' });
  await expect
    .poll(() =>
      firstImage.evaluate((image: HTMLImageElement) => image.currentSrc),
    )
    .toContain('phone-journal-dark-');

  await page.goto(pathFor('/apps/feelory/support/'));
  await expect(page.locator('main')).toContainText('apps@caschw.com');
  await expect(page.locator('main')).toContainText(
    'turn off sync on every device',
  );
  await expect(page.locator('main')).toContainText(
    'one gentle reminder each evening at 8 PM local time',
  );
  await expect(page.locator('main')).toContainText('no remote fallback');
  await expect(
    page.getByRole('link', { name: 'Read the Feelory accessibility page' }),
  ).toHaveJSProperty('pathname', pathFor('/apps/feelory/accessibility/'));
});

test('Feelory accessibility page covers assistive use and adapts to viewport, text, and appearance', async ({
  page,
}, testInfo) => {
  await page.goto(pathFor('/apps/feelory/accessibility/'));
  const screenshot = page.locator('.a11y-example img');
  await screenshot.scrollIntoViewIfNeeded();
  await expect(screenshot).toHaveJSProperty('complete', true);

  if (process.env.CAPTURE_VISUAL_REVIEW === '1') {
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.screenshot({
      path: testInfo.outputPath(
        `accessibility-light-${testInfo.project.name}.png`,
      ),
      fullPage: true,
      animations: 'disabled',
    });
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.screenshot({
      path: testInfo.outputPath(
        `accessibility-dark-${testInfo.project.name}.png`,
      ),
      fullPage: true,
      animations: 'disabled',
    });
    await page.emulateMedia({ colorScheme: 'light' });
  }

  await page.setViewportSize({ width: 320, height: 720 });
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    'Feelory accessibility',
  );
  await expect(page.locator('time')).toHaveAttribute('datetime', '2026-10-12');
  await expect(page.locator('.a11y-updated')).toContainText(
    'Last updated: 2026-10-12',
  );
  await expect(page.locator('main')).toContainText('VoiceOver');
  await expect(page.locator('main')).toContainText('Dynamic Type');
  await expect(page.locator('main')).toContainText('Reduce Motion');
  await expect(
    page.getByRole('heading', { name: 'Voice Control' }),
  ).toHaveCount(0);
  await expect(
    page.getByRole('heading', { name: 'Contrast', exact: true }),
  ).toHaveCount(0);
  expect(
    await screenshot.evaluate((image: HTMLImageElement) => image.naturalWidth),
  ).toBeGreaterThan(0);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth,
    ),
  ).toBe(false);

  await page.emulateMedia({ colorScheme: 'dark' });
  await expect
    .poll(() =>
      screenshot.evaluate((image: HTMLImageElement) => image.currentSrc),
    )
    .toContain('feelory-serenity-detail-ax5-dark.webp');
  await expect(page.locator('body')).toHaveCSS(
    'background-color',
    'rgb(23, 24, 26)',
  );
  const darkAccessibility = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
    .analyze();
  expect(darkAccessibility.violations).toEqual([]);

  await page.addStyleTag({ content: 'html { font-size: 200% !important; }' });
  const zoomOverflow = await page.evaluate(() =>
    [...document.querySelectorAll('body *')]
      .map((element) => {
        const bounds = element.getBoundingClientRect();
        return {
          tag: element.tagName,
          className: String(element.className),
          right: bounds.right,
          width: bounds.width,
          scrollWidth: element.scrollWidth,
          clientWidth: element.clientWidth,
        };
      })
      .filter(
        (element) =>
          element.right > window.innerWidth + 1 ||
          element.scrollWidth > element.clientWidth + 1,
      )
      .slice(0, 15),
  );
  expect(zoomOverflow).toEqual([]);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth,
    ),
  ).toBe(false);
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
