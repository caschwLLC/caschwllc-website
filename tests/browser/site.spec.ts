import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { siteConfig } from '../../site.config.mjs';
import { localPath } from '../../src/lib/catalog';
import { readFile } from 'node:fs/promises';
const pathFor = (path: string) => localPath(path, siteConfig().base);

for (const colorScheme of ['light', 'dark'] as const) {
  for (const deviceScaleFactor of [1, 2, 3]) {
    test(`Override ${colorScheme} artwork selects exact ${deviceScaleFactor}x source`, async ({
      browser,
    }, testInfo) => {
      const context = await browser.newContext({
        colorScheme,
        deviceScaleFactor,
        viewport:
          testInfo.project.name === 'mobile'
            ? { width: 390, height: 844 }
            : { width: 1440, height: 1000 },
      });
      try {
        const page = await context.newPage();
        for (const route of ['/', '/apps/override/']) {
          await page.goto(pathFor(route));
          const icon = page.locator('.override-icon');
          const expected = `override-icon-${colorScheme === 'dark' ? 'dark-' : ''}${deviceScaleFactor * 64}.png`;
          await expect
            .poll(() =>
              icon.evaluate((img: HTMLImageElement) => img.currentSrc),
            )
            .toBe(
              new URL(pathFor(`/media/${expected}`), 'http://127.0.0.1:4321')
                .href,
            );
          await expect(icon).toHaveJSProperty('complete', true);
          const dimensions = await icon.evaluate(
            async (img: HTMLImageElement) => {
              const bitmap = await createImageBitmap(
                await (await fetch(img.currentSrc)).blob(),
              );
              const size = [bitmap.width, bitmap.height];
              bitmap.close();
              return { size, natural: [img.naturalWidth, img.naturalHeight] };
            },
          );
          expect(dimensions.size).toEqual([
            deviceScaleFactor * 64,
            deviceScaleFactor * 64,
          ]);
          expect(dimensions.natural).toEqual([64, 64]);
          for (const [property, value] of Object.entries({
            width: '64px',
            height: '64px',
            'border-radius': '0px',
            padding: '0px',
            'box-shadow': 'none',
            filter: 'none',
            'clip-path': 'none',
            'mask-image': 'none',
            'border-width': '0px',
          }))
            await expect(icon).toHaveCSS(property, value);
          if (process.env.CAPTURE_VISUAL_REVIEW === '1') {
            await icon.screenshot({
              path: testInfo.outputPath(
                `${route === '/' ? 'home' : 'product'}-${colorScheme}-${deviceScaleFactor}x.png`,
              ),
            });
          }
        }
      } finally {
        await context.close();
      }
    });
  }

  test(`Override ${colorScheme} state guides and social previews preserve artwork and site identity`, async ({
    page,
  }, testInfo) => {
    await page.emulateMedia({ colorScheme, reducedMotion: 'reduce' });
    for (const route of [
      '/apps/override/',
      '/apps/override/support/',
      '/apps/override/accessibility/',
    ]) {
      await page.goto(pathFor(route));
      const states = route.endsWith('/accessibility/')
        ? ['accessibility-missing', 'paused']
        : ['ready', 'accessibility-missing', 'paused', 'stashed'];
      await expect(page.locator('[data-menu-bar-state]')).toHaveCount(
        states.length,
      );
      await expect(page.locator('.menu-bar-priority')).toContainText(
        'Accessibility missing → paused → stashed → ready.',
      );
      for (const state of states) {
        const glyph = page.locator(`[data-menu-bar-state="${state}"] svg`);
        await expect(glyph).toHaveAttribute('aria-hidden', 'true');
        await expect(glyph).toHaveAttribute('viewBox', '0 0 26 20');
        const source = await readFile(
          `src/assets/override/menubar/override-menubar-${state}.svg`,
          'utf8',
        );
        const expected = [...source.matchAll(/<path[^>]*>/g)].map(
          (match) => match[0],
        );
        expect(
          await glyph
            .locator('path')
            .evaluateAll((paths) =>
              paths.map((path) => path.outerHTML.replace(/><\/path>$/, '/>')),
            ),
        ).toEqual(expected);
        const clipReferencesResolve = await glyph.evaluate((svg) =>
          [...svg.querySelectorAll('[clip-path]')].every((element) => {
            const id = element
              .getAttribute('clip-path')
              ?.match(/^url\(#(.+)\)$/)?.[1];
            return (
              id &&
              [...svg.querySelectorAll('clipPath')].some(
                (clip) => clip.id === id,
              )
            );
          }),
        );
        expect(clipReferencesResolve).toBe(true);
      }
      const ids = await page
        .locator('[id]')
        .evaluateAll((nodes) => nodes.map((node) => node.id));
      expect(new Set(ids).size).toBe(ids.length);
      const links = page.locator('.menu-bar-guide a');
      for (const link of await links.all()) {
        const target = new URL((await link.getAttribute('href'))!, page.url());
        if (target.pathname === new URL(page.url()).pathname && target.hash)
          await expect(page.locator(target.hash)).toHaveCount(1);
      }
      const social = new URL(
        pathFor('/media/override-social-card.png'),
        siteConfig().site,
      ).href;
      await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
        'content',
        social,
      );
      await expect(page.locator('meta[name="twitter:image"]')).toHaveAttribute(
        'content',
        social,
      );
      await expect(
        page.locator('meta[property="og:image:width"]'),
      ).toHaveAttribute('content', '1200');
      await expect(
        page.locator('meta[property="og:image:height"]'),
      ).toHaveAttribute('content', '630');
      await expect(
        page.locator('meta[property="og:image:alt"]'),
      ).toHaveAttribute('content', /lilac glass and gold enamel/);
      await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute(
        'content',
        'summary_large_image',
      );
      await expect(page.locator('link[rel="icon"]')).toHaveAttribute(
        'href',
        pathFor('/favicon.svg'),
      );
      expect(await page.locator('head').innerHTML()).not.toMatch(
        /caschw\/Override|Resources\/Website|manifest\.webmanifest/,
      );
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= window.innerWidth,
        ),
      ).toBe(true);
      expect(
        (
          await new AxeBuilder({ page })
            .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
            .analyze()
        ).violations,
      ).toEqual([]);
      if (process.env.CAPTURE_VISUAL_REVIEW === '1')
        await page.screenshot({
          path: testInfo.outputPath(
            `${route.includes('/support/') ? 'support' : route.includes('/accessibility/') ? 'accessibility' : 'product'}-${colorScheme}-${testInfo.project.name}.png`,
          ),
          fullPage: true,
        });
    }
    await page.goto(pathFor('/'));
    await expect(page.locator('link[rel="icon"]')).toHaveAttribute(
      'href',
      pathFor('/favicon.svg'),
    );
    await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute(
      'content',
      'summary',
    );
    if (process.env.CAPTURE_VISUAL_REVIEW === '1')
      await page.screenshot({
        path: testInfo.outputPath(
          `home-${colorScheme}-${testInfo.project.name}.png`,
        ),
        fullPage: true,
      });
  });
}

const routes = [
  '/',
  '/apps/feelory/',
  '/apps/feelory/privacy/',
  '/apps/feelory/support/',
  '/apps/feelory/accessibility/',
  '/apps/override/',
  '/apps/override/support/',
  '/apps/override/accessibility/',
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
    await expect(page.locator('footer')).not.toContainText('Feelory privacy');
    await expect(page.locator('footer')).not.toContainText('Feelory support');
    await expect(page.locator('footer')).not.toContainText(
      'Feelory accessibility',
    );
    await expect(page.locator('a[href*="apps.apple.com"]')).toHaveCount(0);
    await expect(
      page.locator('a[href*="/apps/override/privacy/"]'),
    ).toHaveCount(0);
    await expect(page.locator('form, iframe')).toHaveCount(0);
    const expectedBanner =
      siteConfig().mode === 'review' && !route.endsWith('/privacy/')
        ? route.startsWith('/apps/override/')
          ? 'Public Preview -- Coming soon.'
          : route.startsWith('/apps/feelory/')
            ? 'Coming soon.'
            : null
        : null;
    if (expectedBanner)
      await expect(page.locator('.review-banner')).toHaveText(expectedBanner);
    else await expect(page.locator('.review-banner')).toHaveCount(0);
    if (route === '/') {
      await expect(
        page.locator(
          'a[href*="/apps/feelory/privacy/"], a[href*="/apps/feelory/support/"]',
        ),
      ).toHaveCount(0);
      await expect(page.locator('.studio-note')).toContainText(
        'Thoughtful tools.',
      );
      await expect(page.locator('.studio-note')).not.toContainText('Feelory');
      await expect(page.locator('.image-note')).toHaveText(
        'Genuine app captures , any content shown is using sample data.',
      );
    }
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
      route === '/apps/feelory/accessibility/' ||
      route.startsWith('/apps/override/')
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

test('product button hovers match their showcase colors', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(pathFor('/'));
  const feelory = page.getByRole('link', { name: 'Explore Feelory' });
  await feelory.hover();
  await expect(feelory).toHaveCSS('background-color', 'rgb(81, 65, 156)');
  const override = page.locator('.utility-showcase .button');
  for (const button of await override.all()) {
    await button.hover();
    await expect(button).toHaveCSS('background-color', 'rgb(65, 110, 156)');
    await expect(button).toHaveCSS('color', 'rgb(255, 255, 255)');
  }
  for (const route of [
    '/apps/override/',
    '/apps/override/support/',
    '/apps/override/accessibility/',
  ]) {
    await page.goto(pathFor(route));
    for (const button of await page.locator('.button').all()) {
      await button.hover();
      await expect(button).toHaveCSS('background-color', 'rgb(65, 110, 156)');
      await expect(button).toHaveCSS('color', 'rgb(255, 255, 255)');
    }
  }
});

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

test('Override beta connects download, setup, support and permission guidance', async ({
  page,
}) => {
  const download =
    'https://github.com/caschwLLC/caschwllc-website/releases/download/override-v0.1.1/Override-0.1.1.dmg';
  await page.goto(pathFor('/'));
  const showcase = page.locator('.utility-showcase');
  await expect(showcase).toContainText('Beta 0.1.1');
  await expect(showcase).toContainText(
    'Apple silicon Macs running macOS 27 or later',
  );
  await expect(
    showcase.getByRole('link', { name: 'Download beta 0.1.1' }),
  ).toHaveAttribute('href', download);
  await showcase.getByRole('link', { name: 'Explore Override' }).click();
  await expect(page).toHaveURL(new RegExp(`${pathFor('/apps/override/')}$`));
  await expect(
    page
      .locator('.hero-actions')
      .getByRole('link', { name: 'Download beta 0.1.1' }),
  ).toHaveAttribute('href', download);
  await expect(page.locator('main')).toContainText(
    'This is prerelease software',
  );
  await expect(page.locator('main')).not.toContainText(
    /Feelory|iCloud|Apple Health|VoiceOver|Coming soon/,
  );
  await expect(page.locator('main img')).toHaveCount(1);
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
    'content',
    /\/media\/override-social-card\.png$/,
  );
  const icon = page.locator('.product-name .override-icon');
  await expect(icon).toHaveCSS('width', '64px');
  await expect(icon).toHaveCSS('height', '64px');
  await expect(icon).toHaveCSS('border-radius', '0px');
  await expect(icon).toHaveCSS('padding', '0px');
  await expect(icon).toHaveCSS('box-shadow', 'none');
  await expect(icon).toHaveCSS('filter', 'none');
  await expect(page.locator('a[href*="/apps/override/privacy/"]')).toHaveCount(
    0,
  );
  await page.getByRole('link', { name: 'Take a closer look' }).click();
  await expect(page).toHaveURL(/#explore$/);
  await expect(page.locator('.install-steps li')).toHaveText([
    'Download Override-0.1.1.dmg.',
    'Open the DMG.',
    'Drag Override to Applications.',
    'Eject the DMG.',
    'Launch Override from Applications.',
  ]);
  await page
    .getByRole('link', { name: 'Override support', exact: false })
    .click();
  await expect(page.locator('.back-link')).toHaveText('← Back to Override');
  await expect(page.locator('.back-link')).toHaveAttribute(
    'href',
    pathFor('/apps/override/'),
  );
  await expect(
    page.getByRole('link', { name: 'Download beta 0.1.1' }),
  ).toHaveAttribute('href', download);
  await expect(page.locator('main')).toContainText(
    'Quit Override from the menu bar before replacing',
  );
  await expect(page.locator('main')).toContainText(
    'it does not erase every stored preference',
  );
  await expect(page.locator('main')).toContainText(
    'remove Override from Applications',
  );
  await expect(page.locator('.prose ol').first().locator('li')).toHaveText([
    'Download Override-0.1.1.dmg.',
    'Open the DMG.',
    'Drag Override to Applications.',
    'Eject the DMG.',
    'Launch Override from Applications.',
  ]);
  await page
    .getByRole('link', { name: 'Read Accessibility & permissions' })
    .click();
  await expect(page.locator('.back-link')).toHaveAttribute(
    'href',
    pathFor('/apps/override/'),
  );
  await expect(page.locator('main')).toContainText(
    'System Settings → Privacy & Security → Accessibility',
  );
  await expect(page.locator('main')).toContainText(
    'Override cannot grant it for you',
  );
  await expect(page.locator('main')).toContainText(
    'previously granted access is revoked',
  );
  await expect(page.locator('main')).toContainText('Pause All Overrides');
  const response = await page.request.get(pathFor('/apps/override/privacy/'));
  expect(response.status()).toBe(404);
});

test('Override feature chapters share Feelory’s full-width color fields', async ({
  page,
}) => {
  await page.goto(pathFor('/apps/override/'));
  const chapters = page.locator('.utility-features > section');
  await expect(chapters).toHaveCount(3);
  const colors = [
    'rgb(231, 228, 245)',
    'rgb(227, 237, 229)',
    'rgb(227, 237, 244)',
  ];
  for (const [index, color] of colors.entries()) {
    const chapter = chapters.nth(index);
    await expect(chapter).toHaveCSS('background-color', color);
    const bounds = await chapter.boundingBox();
    expect(bounds?.x).toBe(0);
    expect(bounds?.width).toBe(await page.evaluate(() => window.innerWidth));
    await expect(chapter.locator('.utility-feature-inner')).toHaveCSS(
      'padding-left',
      await page
        .locator('.closing')
        .evaluate((element) => getComputedStyle(element).paddingLeft),
    );
  }
});

test('Override reading and product layouts fit narrow and enlarged text views', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.setViewportSize({ width: 320, height: 720 });
  for (const colorScheme of ['light', 'dark'] as const) {
    await page.emulateMedia({ colorScheme });
    for (const route of [
      '/',
      '/apps/override/',
      '/apps/override/support/',
      '/apps/override/accessibility/',
    ]) {
      await page.goto(pathFor(route));
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= window.innerWidth,
        ),
      ).toBe(true);
      await page.addStyleTag({ content: 'body { font-size: 212.5%; }' });
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= window.innerWidth,
        ),
      ).toBe(true);
    }
  }
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
    page
      .locator('.privacy-feature')
      .getByRole('link', { name: 'Feelory accessibility information' }),
  ).toHaveAttribute('href', pathFor('/apps/feelory/accessibility/'));
  const privacyLink = page.getByRole('link', {
    name: 'Read the full privacy policy',
  });
  const accessibilityLink = page.getByRole('link', {
    name: 'Feelory accessibility information',
  });
  const privacyBounds = await privacyLink.boundingBox();
  const accessibilityBounds = await accessibilityLink.boundingBox();
  expect(privacyBounds).not.toBeNull();
  expect(accessibilityBounds).not.toBeNull();
  expect(accessibilityBounds!.y).toBeGreaterThan(privacyBounds!.y);
  await expect(
    page.locator('.hero-copy').getByRole('link', {
      name: 'Feelory accessibility information',
    }),
  ).toHaveCount(0);
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
  await expect(page.locator('.a11y-example')).toContainText(
    'An AX5 example from the emotion detail card for Serenity, not a journal entry.',
  );
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
