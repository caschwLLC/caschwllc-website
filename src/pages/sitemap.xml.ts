import type { APIRoute } from 'astro';
import { getApps } from '../lib/content';
import { localPath, publicRoutes } from '../lib/catalog';

export const GET: APIRoute = async ({ site }) => {
  if (!site) throw new Error('Canonical site URL must be configured');
  const urls = publicRoutes(await getApps()).map(
    (path) =>
      `<url><loc>${new URL(localPath(path, import.meta.env.BASE_URL), site).href}</loc></url>`,
  );
  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.join('')}</urlset>`,
    { headers: { 'Content-Type': 'application/xml' } },
  );
};
