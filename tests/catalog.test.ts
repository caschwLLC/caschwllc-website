import { test } from 'node:test';
import assert from 'node:assert/strict';
import feelory from '../src/content/apps/feelory.json';
import override from '../src/content/apps/override.json';
import {
  appSchema,
  parseCatalog,
  marketedApps,
  navigation,
  publicRoutes,
  storeAction,
  httpsUrl,
  localPath,
  appMedia,
} from '../src/lib/catalog';

const app = appSchema.parse(feelory);

test('Override artwork requires complete local light/dark density sets and valid social metadata', () => {
  assert.doesNotThrow(() => appSchema.parse(override));
  assert.doesNotThrow(() =>
    appSchema.parse({
      ...override,
      iconVariants: undefined,
      socialImage: undefined,
    }),
  );
  for (const iconVariants of [
    { light: override.iconVariants.light },
    {
      ...override.iconVariants,
      dark: { ...override.iconVariants.dark, '3x': undefined },
    },
    {
      ...override.iconVariants,
      light: {
        ...override.iconVariants.light,
        '1x': '/media/override-icon-192.png',
      },
    },
    {
      ...override.iconVariants,
      dark: {
        ...override.iconVariants.dark,
        '2x': 'https://private.test/icon.png',
      },
    },
    {
      ...override.iconVariants,
      dark: { ...override.iconVariants.dark, '1x': '/media/../icon.png' },
    },
  ])
    assert.throws(() => appSchema.parse({ ...override, iconVariants }));
  for (const socialImage of [
    { ...override.socialImage, src: '//private.test/card.png' },
    { ...override.socialImage, src: '/media/../card.png' },
    { ...override.socialImage, width: 0 },
    { ...override.socialImage, height: 1200 },
    { ...override.socialImage, alt: '' },
  ])
    assert.throws(() => appSchema.parse({ ...override, socialImage }));
});

test('coming soon is marketed without a download or store badge', () => {
  assert.equal(marketedApps([app]).length, 1);
  assert.deepEqual(storeAction(app), { label: 'Coming soon', href: null });
  assert.equal(navigation([app])[0]?.label, null);
  assert.deepEqual(publicRoutes([app]), [
    '/',
    '/privacy/',
    '/apps/feelory/',
    '/apps/feelory/privacy/',
    '/apps/feelory/support/',
    '/apps/feelory/accessibility/',
  ]);
});

test('Override exposes a verified beta DMG, not a store listing or borrowed media', () => {
  const beta = appSchema.parse(override);
  assert.deepEqual(storeAction(beta), {
    label: 'Download beta 0.1.1',
    href: 'https://github.com/caschwLLC/caschwllc-website/releases/download/override-v0.1.1/Override-0.1.1.dmg',
  });
  assert.deepEqual(appMedia(beta), []);
  assert.deepEqual(publicRoutes([beta]), [
    '/',
    '/privacy/',
    '/apps/override/',
    '/apps/override/support/',
    '/apps/override/accessibility/',
  ]);
  assert.equal(navigation([app, beta])[0]?.apps.length, 2);
  const withoutPermissionsPage = appSchema.parse({
    ...override,
    pages: { ...override.pages, accessibility: false },
  });
  assert.ok(
    !publicRoutes([withoutPermissionsPage]).includes(
      '/apps/override/accessibility/',
    ),
  );
  const draftRelease = appSchema.parse({
    ...override,
    status: 'coming-soon',
    distribution: { ...override.distribution, draft: true },
  });
  assert.deepEqual(storeAction(draftRelease), {
    label: 'Beta 0.1.1 · Download coming soon',
    href: null,
  });
  const hidden = appSchema.parse({ ...override, visibility: 'draft' });
  assert.deepEqual(publicRoutes([hidden]), ['/', '/privacy/']);
  assert.deepEqual(navigation([hidden])[0]?.apps, []);
});

test('Override rejects unsafe, mismatched, unverified and inconsistent distribution data', () => {
  for (const distribution of [
    { ...override.distribution, draft: true },
    { ...override.distribution, repository: 'untrusted/downloads' },
    { ...override.distribution, tag: 'untagged-placeholder' },
    { ...override.distribution, tag: 'override-v0.2.0' },
    { ...override.distribution, asset: 'Override-0.2.0.dmg' },
    { ...override.distribution, asset: 'Override.0.1.0.developer-id.zip' },
    { ...override.distribution, asset: '../Override-0.1.0.dmg' },
    { ...override.distribution, url: 'javascript:alert(1)' },
    {
      ...override.distribution,
      url: 'https://untrusted.test/Override-0.1.0.dmg',
    },
    { ...override.distribution, verifiedOn: '2026-02-31' },
    { ...override.distribution, verifiedOn: undefined },
    { ...override.distribution, channel: 'stable' },
  ])
    assert.throws(() => appSchema.parse({ ...override, distribution }));
  for (const field of [
    'presentation',
    'distribution',
    'features',
    'pages',
    'icon',
  ]) {
    const input: Record<string, unknown> = { ...override };
    delete input[field];
    assert.throws(() => appSchema.parse(input));
  }
  assert.throws(() => appSchema.parse({ ...override, status: 'coming-soon' }));
  assert.throws(() => appSchema.parse({ ...override, slug: 'other-app' }));
  assert.throws(() => appSchema.parse({ ...override, platforms: ['windows'] }));
  assert.throws(() =>
    appSchema.parse({ ...override, store: { url: 'https://example.com' } }),
  );
  assert.throws(() =>
    appSchema.parse({
      ...override,
      pages: { privacy: false, support: false, accessibility: true },
    }),
  );
});

test('drafts never enter route discovery or navigation, even when available', () => {
  const draft = appSchema.parse({
    ...feelory,
    slug: 'future-tool',
    visibility: 'draft',
    status: 'available',
    platforms: ['windows'],
    store: {
      url: 'https://apps.microsoft.com/detail/ABC123',
      verifiedOn: '2026-10-07',
    },
  });
  assert.deepEqual(marketedApps([app, draft]), [app]);
  assert.deepEqual(navigation([app, draft]), navigation([app]));
  assert.deepEqual(publicRoutes([app, draft]), publicRoutes([app]));
  assert.deepEqual(publicRoutes([draft]), ['/', '/privacy/']);
});

test('platform groups appear only when real marketed products span Apple and Windows', () => {
  const windows = appSchema.parse({
    ...feelory,
    slug: 'windows-tool',
    platforms: ['windows'],
  });
  assert.deepEqual(
    navigation([app, windows]).map((group) => group.label),
    ['Apple', 'Windows'],
  );
  assert.equal(navigation([windows])[0]?.label, null);
  const both = appSchema.parse({ ...feelory, platforms: ['apple', 'windows'] });
  assert.equal(navigation([both]).length, 2);
});

test('available state requires a verified platform store URL; coming soon forbids it', () => {
  const store = {
    url: 'https://apps.apple.com/us/app/feelory/id6819497727',
    verifiedOn: '2026-10-07',
  };
  const live = appSchema.parse({ ...feelory, status: 'available', store });
  assert.equal(storeAction(live).href, store.url);
  assert.throws(() => appSchema.parse({ ...feelory, status: 'available' }));
  assert.throws(() => appSchema.parse({ ...feelory, store }));
  for (const url of [
    'https://evil.test/app/id6819497727',
    'https://apps.apple.com.evil.test/us/app/feelory/id6819497727',
    'https://apps.microsoft.com/detail/ABC123',
    'https://apps.apple.com/us/app/feelory/id6819497727?redirect=evil',
  ]) {
    assert.throws(() =>
      appSchema.parse({
        ...feelory,
        status: 'available',
        store: { ...store, url },
      }),
    );
  }
  assert.throws(() =>
    appSchema.parse({
      ...feelory,
      status: 'available',
      store: { ...store, verifiedOn: '2026-02-31' },
    }),
  );
});

test('invalid and missing catalog fields fail loudly', () => {
  for (const slug of [
    '../secret',
    'UPPER',
    'a/b',
    'privacy',
    'support',
    'accessibility',
    '',
    'x--x',
  ])
    assert.throws(() => appSchema.parse({ ...feelory, slug }));
  for (const key of [
    'name',
    'visibility',
    'status',
    'platforms',
    'hero',
    'features',
    'compatibility',
    'icon',
  ]) {
    const input: Record<string, unknown> = { ...feelory };
    delete input[key];
    assert.throws(() => appSchema.parse(input), key);
  }
  assert.throws(() => parseCatalog([feelory, feelory]));
  assert.throws(() => appSchema.parse({ ...feelory, status: 'released' }));
  assert.throws(() => appSchema.parse({ ...feelory, platforms: ['linux'] }));
  assert.throws(() => appSchema.parse({ ...feelory, platforms: [] }));
  assert.throws(() =>
    appSchema.parse({ ...feelory, platforms: ['apple', 'apple'] }),
  );
  assert.throws(() =>
    appSchema.parse({ ...feelory, hero: { ...feelory.hero, alt: '' } }),
  );
  assert.throws(() =>
    appSchema.parse({
      ...feelory,
      hero: { ...feelory.hero, name: '../secret' },
    }),
  );
  assert.throws(() =>
    appSchema.parse({ ...feelory, hero: { ...feelory.hero, width: 0 } }),
  );
  assert.throws(() =>
    appSchema.parse({ ...feelory, icon: '//evil.test/icon.png' }),
  );
});

test('unsafe URLs and internal paths are rejected', () => {
  for (const value of [
    'javascript:alert(1)',
    'data:text/html,hi',
    'http://example.com',
    '//example.com',
    'https://user:pass@example.com',
    'https://example.com\\evil',
    ' https://example.com',
  ])
    assert.throws(() => httpsUrl.parse(value), value);
  for (const value of [
    '//evil.test',
    'javascript:evil',
    '/foo\\bar',
    '/foo?bar',
  ])
    assert.throws(() => localPath(value));
  assert.equal(
    localPath('/apps/feelory/', '/caschwllc-website/'),
    '/caschwllc-website/apps/feelory/',
  );
});
