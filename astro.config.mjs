import { defineConfig } from 'astro/config';
import { siteConfig } from './site.config.mjs';
const target = siteConfig();

export default defineConfig({
  site: target.site,
  base: target.base,
  trailingSlash: 'always',
  output: 'static',
  build: { format: 'directory' },
});
