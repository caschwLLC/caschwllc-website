import { getCollection, getEntry } from 'astro:content';
import { marketedApps, parseCatalog } from './catalog';

export async function getApps() {
  const all = await getCollection('apps');
  const apps = marketedApps(parseCatalog(all.map((entry) => entry.data)));
  for (const app of apps)
    if (!app.pages.privacy)
      throw new Error(
        `Missing approved privacy policy declaration: ${app.slug}`,
      );
  return apps;
}

export async function policyFor(
  slug: string,
  kind: 'privacy' | 'support' | 'accessibility',
) {
  const entry = await getEntry('policies', `${slug}/${kind}`);
  if (!entry) throw new Error(`Missing ${kind} content for ${slug}`);
  if (kind === 'privacy' && !entry.data.effectiveDate)
    throw new Error(`Missing privacy effective date for ${slug}`);
  return entry;
}
