import { getCollection, getEntry } from 'astro:content';
import { marketedApps, parseCatalog } from './catalog';

export async function getApps() {
  const all = await getCollection('apps');
  return marketedApps(parseCatalog(all.map((entry) => entry.data)));
}

export async function policyFor(slug: string, kind: 'privacy' | 'support') {
  const entry = await getEntry('policies', `${slug}/${kind}`);
  if (!entry) throw new Error(`Missing ${kind} content for ${slug}`);
  return entry;
}
