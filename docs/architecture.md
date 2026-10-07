# Architecture

Astro statically renders all pages. The browser receives HTML, one local CSS
bundle and local images; no hydration, runtime application JavaScript, external
fonts, backend, tracking or forms. Structured WebPage data describes the pages,
not an available store product. No invented price, rating or review fields.

## Sources and flow

- `src/content/apps/*.json`: public-safe catalog, validated through shared
  Zod schemas in `src/lib/catalog.ts` and Astro's supported content loader API.
- `src/content/policies/**`: Markdown read through Astro content collections.
  Missing privacy/support content fails the build, rather than returning an
  empty successful page.
- `getApps()` filters marketed products before homepage, routes and navigation.
  `publicRoutes()` supplies sitemap discovery. Slugs, metadata, platform/store
  invariants and unsafe URLs fail loudly.
- Catalog-driven `getStaticPaths()` generates product/privacy/support routes.
  404 is accessible, noindex, and excluded from sitemap. Robots points to sitemap.
- `Site.astro`: shared brand, navigation, footer, canonical/social metadata.
  Product routes explicitly pass app context for their privacy/support footer.
- `Reading.astro`: bounded reading measure and optional confirmed publisher/date.
- `Device.astro`: genuine proportional media in original illustrative surrounds.
- `src/content/publication.json`: independent, default-incomplete launch facts.

Catalog data and content are English initially; fields and separate documents
keep future localization isolated from page layout. No locale or legal facts
are inferred from the app name.

## Boundaries

The website owns marketing and support presentation only. It neither stores
reflections nor authenticates users. Apple iCloud/Health and app permissions
are app behavior; the site describes, but cannot administer, those choices.
Email support is a mail link, not a data-collection endpoint.

GitHub Actions validates pull requests with read-only repository permissions.
Only a successful trusted main push can enter the separately gated production
workflow. Production jobs never execute PR code. Settings/protections are an
owner prerequisite, not something the code can claim to have enforced.
