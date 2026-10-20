# Product catalog

`src/content/apps/feelory.json` and `override.json` are the marketed products.
Availability is separate from marketing visibility. The site may show an
unreleased product; it may not show a fake or disabled download badge.

Every record declares a `presentation` and explicit `pages` for privacy,
support and accessibility. Support is required; undeclared pages have no route
or discovery link. Missing declared content fails rather than rendering an
empty page. Feelory's accessibility page retains its dedicated implementation.
Override has support, permission and owner-confirmed privacy pages. All marketed
apps require an app privacy policy with its own effective date and a final shared
Web privacy link to the separate website policy.

## Add a public-safe draft

Use a unique lowercase, hyphen-separated slug that is not a reserved route.
Supply all required common copy, platform, status and page declarations.
`screens` entries require icon, hero and feature media, natural dimensions and
descriptive alt text. `utility` entries require feature copy and verified
distribution metadata, not placeholder media. `visibility: draft` must exclude it from
homepage, navigation, product/support/privacy routes and sitemap. Do not commit
confidential future products: a draft flag does not hide public repository files.

When changing to `marketed`, add every declared reading document under
`policies/<slug>/`. Privacy text needs its own owner approval before its page is
declared. Screen-led products require approved optimized media and provenance.
`ScreenProduct.astro` retains Feelory's specific presentation;
`UtilityProduct.astro` provides Override's text-led presentation. A different
product needs its own verified content rather than reusing either product's
claims. Do not create speculative empty platform pages.

## Availability

For screen-led store apps, `coming-soon` forbids a store object. `available` requires a credential-free
HTTPS listing on a platform-compatible verified store host and a valid
verification date. Visit the public listing, verify title/publisher/region and
actual availability, then review the catalog change. Apple ID **6819497727**
alone is not verification, a release date, or a usable download link.

### Override beta DMG

Override's optional `iconVariants` declares complete `light` and `dark` objects,
each with exact `1x`/`2x`/`3x` paths to approved 64/128/192px PNGs. Partial sets,
swapped density paths, external sources and undeclared keys fail validation.
The shared app-icon component keeps 64px layout dimensions and the native mask.
The optional `socialImage` declares a local PNG, 1200×630 dimensions and alt
text. The shared layout uses it for an active marketed app's Open Graph and
large Twitter preview, respecting configured review/production URL bases.
Absent artwork metadata retains existing behavior; malformed metadata never
silently falls back. Asset identity is recorded in [media provenance](media-provenance.md).

Override's utility distribution is restricted to
`caschwLLC/caschwllc-website`, the `override-v<version>` tag, and matching
`Override-<version>.dmg` asset. The channel is explicitly beta, independent of
download availability. Store objects, arbitrary download URLs, wrong filenames,
temporary draft tags and inconsistent draft/available states are rejected.

Before changing distribution data, verify authenticated release metadata:

```sh
gh api repos/caschwLLC/caschwllc-website/releases/tags/override-v0.1.1
curl --head --location --fail 'https://github.com/caschwLLC/caschwllc-website/releases/download/override-v0.1.1/Override-0.1.1.dmg'
```

On 2026-10-19 release `417587950` was verified public (`draft: false`,
`prerelease: true`); the anonymous final DMG request returned HTTP 200.
Asset `657022500` is 3,268,580 bytes, SHA-256
`0393b1d1bde0d93e1843d5ce3474aa8f043c43e4be658e7da53e2c25f94e307c`.
This inspection did not publish or modify the release. No earlier ZIP or
temporary `untagged-...` URL is used.

Record a valid `verifiedOn` date only after verification. `status: available`
with `draft: false` produces **Download beta 0.1.1**; `status: coming-soon`
with `draft: true` produces text only and no download href. If public access
fails, stop and investigate rather than asserting availability from an API
name alone. Maintainers must reverify before updating the static catalog;
builds and visitors do not query GitHub or silently activate new downloads.
Never publish a release as a side effect of website work.

The available component currently renders a clear text store link. If adding
an official badge, verify the current Apple/Microsoft license and marketing
guidelines, retain notices and document provenance. Never draw a counterfeit
badge. No store badges are shipped in the coming-soon site.

## Navigation

No platform headings appear for Apple-only or Windows-only catalogs. Apple and
Windows groups appear only when marketed products genuinely span both. Drafts
do not affect grouping. Header Support targets the current app where present;
the shared footer remains email and website privacy. Product-specific reading
links must respect the app's declared pages.

## Tests

`npm test` checks hidden drafts, platform grouping, coming-soon/live transition,
missing store fields, duplicate/reserved slugs, dimensions/alt metadata and
unsafe URL rejection. `npm run validate:site` checks missing documents/assets,
all rendered internal links, sitemap/robots, canonical metadata and budgets.
