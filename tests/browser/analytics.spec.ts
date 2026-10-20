import { test, expect } from '@playwright/test';
import {
  cp,
  mkdir,
  mkdtemp,
  readFile,
  rm,
  symlink,
  writeFile,
} from 'node:fs/promises';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { parseCatalog, publicRoutes } from '../../src/lib/catalog';
import { analyticsPolicyDigest } from '../../analytics.config.mjs';

const domain = 'https://caschwllc.org';
const websiteId = '00000000-0000-0000-0000-000000000001';
const scriptUrl = 'https://cloud.umami.is/script.js';
const tracker = process.env.UMAMI_TRACKER_TEST_FILE
  ? await readFile(process.env.UMAMI_TRACKER_TEST_FILE, 'utf8')
  : `window.umami = { track: payload => fetch('https://gateway.umami.is/api/send', {
      method: 'POST', body: JSON.stringify({type: 'event', payload}), keepalive: true
    }) };`;
let root: string;
const catalog = parseCatalog([
  JSON.parse(await readFile('src/content/apps/feelory.json', 'utf8')),
  JSON.parse(await readFile('src/content/apps/override.json', 'utf8')),
]);

test.beforeAll(async () => {
  test.setTimeout(120_000);
  await mkdir('test-results', { recursive: true });
  root = await mkdtemp(resolve('test-results/analytics-browser-'));
  for (const path of [
    'src',
    'public',
    'astro.config.mjs',
    'analytics.config.mjs',
    'site.config.mjs',
    'tsconfig.json',
    'package.json',
  ])
    await cp(resolve(path), join(root, path), { recursive: true });
  await symlink(resolve('node_modules'), join(root, 'node_modules'), 'dir');
  const overridePath = join(root, 'src/content/apps/override.json');
  const app = JSON.parse(await readFile(overridePath, 'utf8'));
  app.pages.privacy = true;
  await writeFile(overridePath, JSON.stringify(app));
  const policy = `---\ntitle: Public fixture privacy\ndescription: Test fixture only.\neffectiveDate: '2026-10-19'\n---\nPublic test fixture, not an approved policy.\n`;
  await writeFile(
    join(root, 'src/content/policies/override/privacy.md'),
    policy,
  );
  const futureApp = {
    ...JSON.parse(await readFile('src/content/apps/feelory.json', 'utf8')),
    slug: 'public-analytics-fixture',
    name: 'Public analytics fixture',
    status: 'available',
    store: {
      url: 'https://apps.apple.com/us/app/public-fixture/id123456789',
      verifiedOn: '2026-10-19',
    },
  };
  await writeFile(
    join(root, 'src/content/apps/public-analytics-fixture.json'),
    JSON.stringify(futureApp),
  );
  await mkdir(join(root, 'src/content/policies/public-analytics-fixture'));
  for (const kind of ['privacy', 'support', 'accessibility'])
    await writeFile(
      join(root, `src/content/policies/public-analytics-fixture/${kind}.md`),
      policy,
    );
  await writeFile(
    join(root, 'src/pages/analytics-fixture.astro'),
    `---\nimport Site from '../layouts/Site.astro';\n---\n<Site title="Public fixture" description="Test only"><h1>Public fixture</h1></Site>`,
  );
  const { analyticsPolicyDigest: digest } = await import(
    pathToFileURL(join(root, 'analytics.config.mjs')).href
  );
  await writeFile(
    join(root, 'src/content/analytics-publication.json'),
    JSON.stringify({
      approved: true,
      digest: digest(root),
      websiteId,
      scriptUrl,
    }),
  );
  const env = {
    ...process.env,
    WEBSITE_MODE: 'production',
    UMAMI_ENABLED: 'true',
    UMAMI_WEBSITE_ID: websiteId,
    UMAMI_SCRIPT_URL: scriptUrl,
    ASTRO_TELEMETRY_DISABLED: '1',
  };
  await promisify(execFile)(
    process.execPath,
    [resolve('node_modules/.bin/astro'), 'build'],
    {
      cwd: root,
      env,
    },
  );
  await mkdir(join(root, 'scripts'));
  await cp('scripts/validate-site.ts', join(root, 'scripts/validate-site.ts'));
  await promisify(execFile)(
    process.execPath,
    [resolve('node_modules/tsx/dist/cli.mjs'), 'scripts/validate-site.ts'],
    { cwd: root, env },
  );
});

test.afterAll(async () => {
  if (root) await rm(root, { recursive: true, force: true });
});

test('production pages and future apps inherit one minimal tracker without leaking URL data', async ({
  page,
}) => {
  const events: Record<string, unknown>[] = [];
  const unexpected: string[] = [];
  await page.context().route('**/*', async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    if (request.url() === scriptUrl)
      return route.fulfill({ contentType: 'text/javascript', body: tracker });
    if (
      url.origin === 'https://gateway.umami.is' &&
      url.pathname === '/api/send'
    ) {
      events.push(request.postDataJSON().payload);
      return route.fulfill({ json: { cache: 'public-test-fixture' } });
    }
    if (url.origin === domain) {
      const file = url.pathname.endsWith('/')
        ? `${url.pathname}index.html`
        : url.pathname;
      return route.fulfill({ path: join(root, 'dist', file) });
    }
    if (url.hostname === 'apps.apple.com')
      return route.fulfill({
        contentType: 'text/html',
        body: 'Public store fixture',
      });
    unexpected.push(request.url());
    await route.abort();
  });
  for (const path of [
    ...publicRoutes(catalog),
    '/apps/public-analytics-fixture/',
    '/apps/public-analytics-fixture/privacy/',
    '/analytics-fixture/',
  ]) {
    const start = events.length;
    await page.goto(`${domain}${path}?private-query=secret#private-fragment`, {
      referer: 'https://referrer.example/private/path?token=secret#hidden',
    });
    await expect.poll(() => events.length).toBe(start + 1);
    expect(events.at(-1)).toEqual({
      website: websiteId,
      hostname: 'caschwllc.org',
      url: path,
      title: await page.title(),
      referrer: 'https://referrer.example',
    });
    if (path === '/privacy/') {
      await expect(page.locator('#website-data')).toHaveCount(1);
      await expect(page.locator('#web-privacy')).toHaveCount(0);
      await expect(
        page.locator('section[aria-labelledby="website-data"]'),
      ).toContainText('Umami Cloud');
    } else if (path.endsWith('/privacy/')) {
      const webPrivacy = page.locator('section[aria-labelledby="web-privacy"]');
      await expect(webPrivacy).toHaveCount(1);
      await expect(webPrivacy.locator('a')).toHaveAttribute(
        'href',
        '/privacy/',
      );
      await expect(page.locator('#website-data')).toHaveCount(0);
      expect(
        await page
          .locator('.prose > :last-child')
          .getAttribute('aria-labelledby'),
      ).toBe('web-privacy');
      await expect(page.locator('.prose')).not.toContainText('Umami Cloud');
    }
    if (path === '/apps/public-analytics-fixture/') {
      const before = events.length;
      await page
        .locator('a[data-analytics-event="store_click"]')
        .first()
        .click();
      await expect(page).toHaveURL(/apps.apple.com/);
      await expect.poll(() => events.length).toBe(before + 1);
      expect(events.at(-1)).toMatchObject({
        name: 'store_click',
        data: { app: 'public-analytics-fixture' },
      });
    }
  }
  const before404 = events.length;
  await page.goto(`${domain}/404.html`);
  await expect(page.locator('[data-analytics-loader]')).toHaveCount(0);
  expect(events).toHaveLength(before404);
  expect(unexpected).toEqual([]);
});

for (const failure of ['blocked', 'stalled', 'loaded'] as const) {
  test(`download navigation is native with a ${failure} tracker`, async ({
    page,
  }) => {
    const events: Record<string, unknown>[] = [];
    const destinations: string[] = [];
    await page.context().route('**/*', async (route) => {
      const request = route.request();
      const url = new URL(request.url());
      if (request.url() === scriptUrl) {
        if (failure === 'blocked') return route.abort();
        if (failure === 'stalled') return;
        return route.fulfill({ contentType: 'text/javascript', body: tracker });
      }
      if (url.origin === 'https://gateway.umami.is') {
        events.push(request.postDataJSON().payload);
        return route.fulfill({ json: {} });
      }
      if (url.origin === domain) {
        const file = url.pathname.endsWith('/')
          ? `${url.pathname}index.html`
          : url.pathname;
        return route.fulfill({ path: join(root, 'dist', file) });
      }
      if (url.hostname === 'github.com' || url.hostname === 'apps.apple.com') {
        destinations.push(request.url());
        return route.fulfill({
          contentType: 'text/html',
          body: 'Public destination fixture',
        });
      }
      await route.abort();
    });
    for (const activation of ['nested', 'keyboard', 'modified', 'middle']) {
      const beforeNavigation = events.length;
      await page.goto(`${domain}/apps/override/`, {
        waitUntil: 'domcontentloaded',
      });
      if (failure === 'loaded')
        await expect.poll(() => events.length).toBe(beforeNavigation + 1);
      const link = page
        .locator('a[data-analytics-event="download_click"]')
        .first();
      await expect(link).toHaveAttribute(
        'href',
        'https://github.com/caschwLLC/caschwllc-website/releases/download/override-v0.1.1/Override-0.1.1.dmg',
      );
      const before = events.length;
      const beforeDestination = destinations.length;
      if (activation === 'modified' || activation === 'middle') {
        const popup = page.context().waitForEvent('page');
        await link.click(
          activation === 'middle'
            ? { button: 'middle' }
            : { modifiers: ['ControlOrMeta'] },
        );
        const target = await popup;
        await expect
          .poll(() => destinations.length)
          .toBe(beforeDestination + 1);
        expect(destinations.at(-1)).toBe(await link.getAttribute('href'));
        await target.close();
      } else {
        if (activation === 'keyboard') {
          await link.focus();
          await page.keyboard.press('Enter');
        } else await link.locator('span').click();
        await expect(page).toHaveURL(/github.com.*Override-0.1.1.dmg/);
      }
      if (failure === 'loaded') {
        await expect.poll(() => events.length).toBe(before + 1);
        expect(events.at(-1)).toMatchObject({
          name: 'download_click',
          data: { app: 'override', version: '0.1.1' },
        });
      } else expect(events).toHaveLength(0);
    }
  });
}

test('Do Not Track prevents even downloading the vendor script', async ({
  page,
}) => {
  await page.addInitScript(() =>
    Object.defineProperty(navigator, 'doNotTrack', { value: '1' }),
  );
  const requests: string[] = [];
  await page.route('**/*', async (route) => {
    if (route.request().url() === `${domain}/`)
      return route.fulfill({ path: join(root, 'dist/index.html') });
    requests.push(route.request().url());
    await route.abort();
  });
  await page.goto(domain);
  expect(requests.filter((url) => /umami/.test(url))).toEqual([]);
});

test('production artifacts do not contact Umami on local or review hosts', async ({
  page,
}) => {
  const vendorRequests: string[] = [];
  await page.context().route('**/*', async (route) => {
    const request = route.request();
    if (request.isNavigationRequest())
      return route.fulfill({
        path: join(root, 'dist/apps/override/index.html'),
      });
    if (new URL(request.url()).hostname.endsWith('umami.is'))
      vendorRequests.push(request.url());
    await route.abort();
  });
  for (const url of [
    'http://127.0.0.1:4321/apps/override/',
    'https://caschwllc.github.io/caschwllc-website/apps/override/',
    'https://unapproved.example/apps/override/',
  ]) {
    await page.goto(url);
    await expect(page.locator('[data-analytics-loader]')).toHaveCount(1);
    expect(vendorRequests).toEqual([]);
  }
});

test('downloads remain direct when JavaScript is disabled', async ({
  browser,
}) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  try {
    const page = await context.newPage();
    const requests: string[] = [];
    await context.route('**/*', async (route) => {
      const request = route.request();
      requests.push(request.url());
      if (request.url() === `${domain}/apps/override/`)
        return route.fulfill({
          path: join(root, 'dist/apps/override/index.html'),
        });
      if (new URL(request.url()).hostname === 'github.com')
        return route.fulfill({
          contentType: 'text/html',
          body: 'Download destination fixture',
        });
      await route.abort();
    });
    await page.goto(`${domain}/apps/override/`);
    await page
      .locator('a[data-analytics-event="download_click"]')
      .first()
      .click();
    await expect(page).toHaveURL(/github.com.*Override-0.1.1.dmg/);
    expect(
      requests.some((url) => new URL(url).hostname.endsWith('umami.is')),
    ).toBe(false);
  } finally {
    await context.close();
  }
});

test('fixture approvals never approve the real website', () => {
  expect(analyticsPolicyDigest()).toMatch(/^[a-f0-9]{64}$/);
});
