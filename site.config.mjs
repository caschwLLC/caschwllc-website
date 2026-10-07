export function siteConfig(mode = process.env.WEBSITE_MODE ?? 'review') {
  if (!['review', 'production'].includes(mode))
    throw new Error(`Invalid WEBSITE_MODE: ${mode}`);
  return mode === 'review'
    ? { mode, site: 'https://caschwllc.github.io', base: '/caschwllc-website/' }
    : { mode, site: 'https://caschwllc.org', base: '/' };
}
