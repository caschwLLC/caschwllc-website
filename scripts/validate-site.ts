import assert from 'node:assert/strict';
import { readFile, readdir, stat } from 'node:fs/promises';
import { join } from 'node:path';
import { appSchema, parseCatalog, publicRoutes } from '../src/lib/catalog';
import sharp from 'sharp';
import { siteConfig } from '../site.config.mjs';
import { localPath } from '../src/lib/catalog';
const target = siteConfig();
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
  for (const kind of ['privacy', 'support'])
    await stat(`src/content/policies/${app.slug}/${kind}.md`);
  await stat(`public${app.icon}`);
  for (const media of [
    app.hero,
    app.secondaryHero,
    ...app.features.map((feature) => feature.media),
  ]) {
    const record = manifest.find((item) => item.name === media.name);
    assert.ok(record, `Missing image manifest: ${media.name}`);
    assert.equal(
      media.width,
      record.width,
      `Source width mismatch: ${media.name}`,
    );
    assert.equal(
      media.height,
      record.height,
      `Source height mismatch: ${media.name}`,
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
  for (const draft of apps.filter((item) => item.visibility === 'draft')) {
    await assert.rejects(stat(`dist/apps/${draft.slug}/index.html`));
  }
}
for (const route of [...routes, '/404.html']) {
  const path =
    route === '/404.html' ? 'dist/404.html' : `dist${route}index.html`;
  const html = await readFile(path, 'utf8');
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
  if (target.mode === 'review') {
    assert.ok(html.includes('Public review preview.'));
    assert.ok(html.includes('noindex, follow'));
    if (route.endsWith('/privacy/'))
      assert.ok(html.includes('Draft policy for review.'));
  }
  assert.ok(
    !/<form|<iframe|<script[^>]+src=|fonts\.googleapis|gtag|analytics\.js/.test(
      html,
    ),
    'Unexpected runtime/tracking/embed',
  );
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
