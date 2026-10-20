import { createHash } from 'node:crypto';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { siteConfig } from './site.config.mjs';

export const analyticsPractices = Object.freeze({
  hostname: 'caschwllc.org',
  events: { download_click: ['app', 'version'], store_click: ['app'] },
  page: ['website', 'hostname', 'url', 'title', 'referrer-origin'],
  doNotTrack: true,
  queryAndFragment: false,
  identification: false,
  automaticTracking: false,
  retentionMonths: 6,
});

function policyFiles(root, directory) {
  return readdirSync(join(root, directory), { withFileTypes: true }).flatMap(
    (entry) =>
      entry.isDirectory()
        ? policyFiles(root, `${directory}/${entry.name}`)
        : [`${directory}/${entry.name}`],
  );
}

export function analyticsPolicyDigest(root = process.cwd()) {
  const files = [
    'analytics.config.mjs',
    'src/scripts/analytics.js',
    'src/components/Analytics.astro',
    'src/components/Availability.astro',
    'src/components/WebsitePrivacyNotice.astro',
    'src/components/WebsiteAnalyticsDisclosure.astro',
    'src/layouts/Site.astro',
    'src/layouts/Reading.astro',
    'src/lib/content.ts',
    ...policyFiles(root, 'src/content/policies'),
  ].sort();
  const hash = createHash('sha256').update(JSON.stringify(analyticsPractices));
  for (const file of files)
    hash
      .update(file)
      .update('\0')
      .update(readFileSync(join(root, file)));
  return hash.digest('hex');
}

export function analyticsConfig(env = process.env, root = process.cwd()) {
  if (![undefined, '', 'true', 'false'].includes(env.UMAMI_ENABLED))
    throw new Error('UMAMI_ENABLED must be true, false or unset');
  if (
    siteConfig(env.WEBSITE_MODE ?? 'review').mode !== 'production' ||
    env.UMAMI_ENABLED !== 'true'
  )
    return null;
  if (
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      env.UMAMI_WEBSITE_ID ?? '',
    )
  )
    throw new Error('Active analytics requires a valid UMAMI_WEBSITE_ID');
  if (!['https://cloud.umami.is/script.js'].includes(env.UMAMI_SCRIPT_URL))
    throw new Error(
      'UMAMI_SCRIPT_URL must be the approved Umami Cloud endpoint',
    );
  const approval = JSON.parse(
    readFileSync(join(root, 'src/content/analytics-publication.json'), 'utf8'),
  );
  if (
    approval.approved !== true ||
    approval.digest !== analyticsPolicyDigest(root) ||
    approval.websiteId !== env.UMAMI_WEBSITE_ID ||
    approval.scriptUrl !== env.UMAMI_SCRIPT_URL
  )
    throw new Error('Analytics policy approval is missing or stale');
  for (const file of readdirSync(join(root, 'src/content/apps'))) {
    if (!file.endsWith('.json')) continue;
    const app = JSON.parse(
      readFileSync(join(root, 'src/content/apps', file), 'utf8'),
    );
    if (app.visibility === 'marketed' && !app.pages.privacy)
      throw new Error(
        `Analytics requires an approved privacy policy: ${app.slug}`,
      );
  }
  return {
    websiteId: env.UMAMI_WEBSITE_ID,
    scriptUrl: env.UMAMI_SCRIPT_URL,
    hostname: analyticsPractices.hostname,
  };
}
