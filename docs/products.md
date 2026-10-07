# Product catalog

`src/content/apps/feelory.json` is the only marketed product. Store availability
is separate from marketing visibility. The site may show an unreleased product;
it may not show a fake or disabled download badge.

## Add a public-safe draft

Use a unique lowercase, hyphen-separated slug that is not a reserved route.
Supply all required copy, icon path, platform, status, image names, natural
dimensions and descriptive alt text. `visibility: draft` must exclude it from
homepage, navigation, product/support/privacy routes and sitemap. Do not commit
confidential future products: a draft flag does not hide public repository files.

When changing to `marketed`, add `policies/<slug>/privacy.md` and `support.md`,
approved optimized media and provenance. The current product template uses
Feelory's specific privacy/feature closing copy: adapt that content before
marketing a second app, rather than presenting Feelory capabilities as universal.
Generalize those product-specific sections into catalog fields when a second
product is actually approved. Do not create speculative empty platform pages.

## Availability

`coming-soon` forbids a store object. `available` requires a credential-free
HTTPS listing on a platform-compatible verified store host and a valid
verification date. Visit the public listing, verify title/publisher/region and
actual availability, then review the catalog change. Apple ID **6819497727**
alone is not verification, a release date, or a usable download link.

The available component currently renders a clear text store link. If adding
an official badge, verify the current Apple/Microsoft license and marketing
guidelines, retain notices and document provenance. Never draw a counterfeit
badge. No store badges are shipped in the coming-soon site.

## Navigation

No platform headings appear for Apple-only or Windows-only catalogs. Apple and
Windows groups appear only when marketed products genuinely span both. Drafts
do not affect grouping. Header/footer policy targets must remain app-specific.

## Tests

`npm test` checks hidden drafts, platform grouping, coming-soon/live transition,
missing store fields, duplicate/reserved slugs, dimensions/alt metadata and
unsafe URL rejection. `npm run validate:site` checks missing documents/assets,
all rendered internal links, sitemap/robots, canonical metadata and budgets.
