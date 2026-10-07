import type { APIRoute } from 'astro';
import { localPath } from '../lib/catalog';
export const GET: APIRoute = ({ site }) => {
  if (!site) throw new Error('Canonical site URL must be configured');
  return new Response(
    `User-agent: *\nAllow: /\nSitemap: ${new URL(localPath('/sitemap.xml', import.meta.env.BASE_URL), site).href}\n`,
    { headers: { 'Content-Type': 'text/plain' } },
  );
};
