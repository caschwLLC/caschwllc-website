import assert from 'node:assert/strict';
import { readFile, readdir, stat } from 'node:fs/promises';
import { join } from 'node:path';
import {
  appMedia,
  appSchema,
  parseCatalog,
  publicRoutes,
  storeAction,
} from '../src/lib/catalog';
import sharp from 'sharp';
import { siteConfig } from '../site.config.mjs';
import { localPath } from '../src/lib/catalog';
import { analyticsConfig } from '../analytics.config.mjs';
const target = siteConfig();
const analytics = analyticsConfig();
const analyticsSource = await readFile('src/scripts/analytics.js', 'utf8');
const urlFor = (route: string) =>
  new URL(localPath(route, target.base), target.site).href;
function diskPath(pathname: string) {
  const prefix = target.base.replace(/\/$/, '');
  assert.ok(
    !prefix || pathname.startsWith(`${prefix}/`),
    `Path escapes configured base: ${pathname}`,
  );
  return `dist${prefix ? pathname.slice(prefix.length) : pathname}`;
}

const files = await readdir('src/content/apps');
const apps = parseCatalog(
  await Promise.all(
    files
      .filter((name) => name.endsWith('.json'))
      .map(async (name) =>
        JSON.parse(await readFile(join('src/content/apps', name), 'utf8')),
      ),
  ),
);
const routes = publicRoutes(apps);
const manifest = JSON.parse(
  await readFile('public/media/manifest.json', 'utf8'),
) as {
  name: string;
  width: number;
  height: number;
  outputs: { file: string; width: number; bytes: number }[];
}[];

for (const app of apps.filter((app) => app.visibility === 'marketed')) {
  appSchema.parse(app);
  for (const kind of ['privacy', 'support', 'accessibility'] as const) {
    if (
      app.pages[kind] &&
      !(kind === 'accessibility' && app.slug === 'feelory')
    )
      await stat(`src/content/policies/${app.slug}/${kind}.md`);
  }
  await stat(`public${app.icon}`);
  if (app.socialImage) {
    const info = await sharp(`public${app.socialImage.src}`).metadata();
    assert.equal(info.width, app.socialImage.width);
    assert.equal(info.height, app.socialImage.height);
  }
  if (app.presentation === 'utility') {
    if (app.iconVariants) {
      for (const sources of Object.values(app.iconVariants))
        for (const [density, path] of Object.entries(sources)) {
          const info = await sharp(`public${path}`).metadata();
          assert.equal(info.width, Number(density[0]) * 64);
          assert.equal(info.height, Number(density[0]) * 64);
        }
    }
    const html = await readFile(`dist/apps/${app.slug}/index.html`, 'utf8');
    const action = storeAction(app);
    assert.ok(html.includes(`Beta ${app.distribution.version}`));
    assert.equal(html.includes('https://github.com/'), action.href !== null);
    if (action.href) assert.ok(html.includes(`href="${action.href}"`));
    assert.ok(
      !/Feelory|Apple Health|iCloud|phone-journal/.test(
        html.slice(html.indexOf('<main'), html.indexOf('</main>')),
      ),
      'Utility product contains another app’s claims',
    );
    if (!app.pages.privacy)
      await assert.rejects(stat(`dist/apps/${app.slug}/privacy/index.html`));
  }
  for (const media of appMedia(app)) {
    for (const name of [
      media.name,
      ...(media.darkName ? [media.darkName] : []),
    ]) {
      const record = manifest.find((item) => item.name === name);
      assert.ok(record, `Missing image manifest: ${name}`);
      assert.equal(media.width, record.width, `Source width mismatch: ${name}`);
      assert.equal(
        media.height,
        record.height,
        `Source height mismatch: ${name}`,
      );
      for (const output of record.outputs) {
        const file = await stat(`public/media/${output.file}`);
        const info = await sharp(`public/media/${output.file}`).metadata();
        assert.equal(file.size, output.bytes);
        assert.equal(info.width, output.width);
        assert.ok(
          info.height &&
            Math.abs(info.width / info.height - media.width / media.height) <
              0.002,
          'Screen proportions changed',
        );
        assert.ok(
          output.bytes <= 500_000,
          `Image exceeds hero budget: ${output.file}`,
        );
      }
    }
  }
  for (const draft of apps.filter((item) => item.visibility === 'draft')) {
    await assert.rejects(stat(`dist/apps/${draft.slug}/index.html`));
  }
}
for (const route of [...routes, '/404.html']) {
  const path =
    route === '/404.html' ? 'dist/404.html' : `dist${route}index.html`;
  const html = await readFile(path, 'utf8');
  if (route.startsWith('/apps/override/')) {
    const override = apps.find((app) => app.slug === 'override');
    assert.ok(override?.socialImage);
    assert.ok(
      html.includes(
        `property="og:image" content="${urlFor(override.socialImage.src)}"`,
      ),
    );
    assert.ok(html.includes('property="og:image:width" content="1200"'));
    assert.ok(html.includes('property="og:image:height" content="630"'));
    assert.ok(
      html.includes('name="twitter:card" content="summary_large_image"'),
    );
    assert.ok(
      html.includes(
        `name="twitter:image" content="${urlFor(override.socialImage.src)}"`,
      ),
    );
    if (!route.endsWith('/privacy/'))
      assert.ok(
        html.includes('Accessibility missing → paused → stashed → ready.'),
      );
  }
  if (route === '/' || route.startsWith('/apps/override/'))
    assert.ok(
      !html.includes('/media/override-icon.png'),
      'Legacy icon reference remains',
    );
  for (const srcset of html.matchAll(/srcset="([^"]+)"/g)) {
    for (const candidate of srcset[1]!.split(',')) {
      const src = candidate.trim().split(/\s+/)[0]!;
      await stat(diskPath(new URL(src, urlFor(route)).pathname));
    }
  }
  assert.equal(
    (html.match(/<h1(?:\s|>)/g) ?? []).length,
    1,
    `${route}: exactly one h1 required`,
  );
  assert.ok(html.includes('<html lang="en">'));
  assert.ok(html.includes('href="#main"'));
  assert.ok(
    html.includes(`rel="canonical" href="${urlFor(route)}"`),
    `Canonical mismatch: ${route}`,
  );
  assert.ok(
    !/Owner-provided|Preparation notes|Publication note|Set when this policy|placeholder address/.test(
      html,
    ),
    'Internal policy notes rendered',
  );
  const policy = route.endsWith('/privacy/');
  if (policy) {
    assert.ok(
      !/Public review preview|Website review status|Draft policy|polic(?:y|ies) (?:are|is|remain) drafts|unapproved|approvals remain unconfirmed|policy-draft/i.test(
        html,
      ),
      `${route}: policy status must not be confused with app availability`,
    );
    if (route === '/apps/feelory/privacy/') {
      assert.ok(html.includes('Feelory is coming soon.'));
      assert.ok(
        html.includes(
          'This policy describes how Feelory handles your information.',
        ),
      );
    }
  }
  if (target.mode === 'review') {
    const expectedBanner =
      !policy && route.startsWith('/apps/override/')
        ? 'Public Preview -- Coming soon.'
        : !policy && route.startsWith('/apps/feelory/')
          ? 'Coming soon.'
          : null;
    const banner =
      html
        .match(/<aside class="review-banner"[^>]*>(.*?)<\/aside>/s)?.[1]
        ?.trim() ?? null;
    assert.equal(
      banner,
      expectedBanner,
      `${route}: unexpected app preview banner`,
    );
    assert.ok(html.includes('noindex, follow'));
  }
  assert.ok(
    !/<form|<iframe|<script[^>]+src=|fonts\.googleapis|gtag/.test(html),
    'Unexpected runtime/tracking/embed',
  );
  const executable = [
    ...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g),
  ].filter((match) => !match[1]!.includes('type="application/ld+json"'));
  assert.equal(
    executable.length,
    analytics && route !== '/404.html' ? 1 : 0,
    `${route}: unexpected executable scripts`,
  );
  if (executable.length) {
    const [script] = executable;
    assert.equal(script![2]!.trim(), analyticsSource.trim());
    assert.ok(script![1]!.includes('data-analytics-loader'));
    assert.ok(
      script![1]!.includes(`data-website-id="${analytics!.websiteId}"`),
    );
    assert.ok(
      script![1]!.includes(`data-script-url="${analytics!.scriptUrl}"`),
    );
    assert.ok(script![1]!.includes(`data-hostname="${analytics!.hostname}"`));
  }
  for (const match of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
    const value = match[1]!;
    if (
      value.startsWith('#') ||
      value.startsWith('mailto:') ||
      value.startsWith('https://')
    )
      continue;
    assert.ok(
      !value.startsWith('//') && !/^[a-z]+:/i.test(value),
      `Unsafe link ${value}`,
    );
    const pathname = new URL(value, urlFor(route)).pathname;
    await stat(
      pathname.endsWith('/')
        ? `${diskPath(pathname)}index.html`
        : diskPath(pathname),
    );
  }
  const eagerMedia = [...html.matchAll(/<img[^>]+loading="eager"[^>]*>/g)];
  let heroBytes = 0;
  for (const match of eagerMedia) {
    const src = match[0].match(/src="([^"]+)"/)?.[1];
    assert.ok(src);
    heroBytes += (await stat(diskPath(src))).size;
  }
  assert.ok(heroBytes <= 500_000, `Combined hero exceeds 500KB: ${route}`);
  assert.ok(
    (await stat(path)).size + heroBytes <= 1_500_000,
    `Initial document and default heroes exceed budget: ${route}`,
  );
}
const sitemap = await readFile('dist/sitemap.xml', 'utf8');
assert.deepEqual(
  [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]).sort(),
  routes.map(urlFor).sort(),
);
assert.ok(!sitemap.includes('404'));
for (const draft of apps.filter((app) => app.visibility === 'draft'))
  assert.ok(!sitemap.includes(`/apps/${draft.slug}/`));
assert.ok(
  (await readFile('dist/robots.txt', 'utf8')).includes(
    `Sitemap: ${urlFor('/sitemap.xml')}`,
  ),
);
console.log(
  `Built-site checks passed: ${routes.length} public routes + 404, links, sitemap, metadata, media proportions and budgets.`,
);
