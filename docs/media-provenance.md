# Media provenance and rights

Only owner-approved Feelory captures with synthetic content and public-safe
icon artwork are used here. The recaptured screenshots came from
`caschwLLC/Feelory`, branch `z-02/app-store-readiness`, under
`docs/assets/app-store/`. No app code, real journal writing, internal planning
documents or model response transcripts are included.

## Captures

The approved source set contains 28 PNGs: seven scenes each for iPhone/iPad in
light/dark appearance. The captures are from iPhone 18 Pro and iPad Pro
13-inch. This site uses iPhone captures except for the iPad reflection; the
matching dark capture is selected when the visitor prefers dark appearance.
SHA-256 source hashes, relative names, natural dimensions and output bytes are
recorded in
[`public/media/manifest.json`](../public/media/manifest.json).

| Site name         | Light source                 | Dark source                 | Natural dimensions |
| ----------------- | ---------------------------- | --------------------------- | ------------------ |
| phone-journal     | iphone/light/01-journal.png  | iphone/dark/01-journal.png  | 1206 × 2622        |
| tablet-reflection | ipad/light/02-reflection.png | ipad/dark/02-reflection.png | 2064 × 2752        |
| phone-insights    | iphone/light/03-insights.png | iphone/dark/03-insights.png | 1206 × 2622        |
| phone-practice    | iphone/light/04-practice.png | iphone/dark/04-practice.png | 1206 × 2622        |
| phone-explore     | iphone/light/05-explore.png  | iphone/dark/05-explore.png  | 1206 × 2622        |
| phone-wheel       | iphone/light/06-wheel.png    | iphone/dark/06-wheel.png    | 1206 × 2622        |
| phone-emotion     | iphone/light/07-emotion.png  | iphone/dark/07-emotion.png  | 1206 × 2622        |

Reflection text, multiple tags, check-ins and chart data are synthetic fixture
content. The AI sparkle/dashed tag styling demonstrates a **saved AI-tag
provenance fixture**, not output observed from a live model during the capture.
Visible site captions and alt text preserve this distinction. Product AI copy
describes optional on-device behavior without suggesting the fixture is proof
of live inference.

`scripts/prepare-media.mjs` reads only the listed screenshot files, then resizes
and encodes without cropping, retouching, changing screen features or
compositing fake UI. iPhone variants: 320/640/960px; iPad: 480/960/1440px. WebP
quality 82, natural proportions preserved. Originals are not stored here.
Reproduction requires a separately authorized copy of the approved screenshot
directory:

```sh
node scripts/prepare-media.mjs /approved/Feelory/docs/assets/app-store
```

The Feelory icon artwork is unchanged by the screenshot preparation script.
Review resulting source hashes before accepting changed media.

## Accessibility illustration

The optional AX5 illustration comes from the owner-authorized light and dark
simulator captures
`feelory-serenity-detail-ax5-light.png` and
`feelory-serenity-detail-ax5-dark.png` in the approved
`website-a11y-candidate` session artifact directory. The raw screenshots were
captured on iPhone 18 Pro at 1206 × 2622, with synthetic bundled catalog
phrases and an empty in-memory store; they contain no journal entries or
account data. Each was resized proportionally to 620 × 1348 and encoded as
WebP without cropping or retouching. The page selects the matching appearance
using `prefers-color-scheme`.

| Source appearance | Source SHA-256                                                     | Website file                             | Output bytes |
| ----------------- | ------------------------------------------------------------------ | ---------------------------------------- | ------------ |
| Light             | `d38899bb95428d03062feda2c76b6854ef0826e0be74403f38b1f081499d13a7` | `feelory-serenity-detail-ax5-light.webp` | 54,298       |
| Dark              | `0db23a0c05e669c61df6a5cf82c1f3b64d075c2bce6842e770e9d0958e43d23f` | `feelory-serenity-detail-ax5-dark.webp`  | 53,816       |

The screenshot demonstrates larger-text wrapping only. It is not evidence of
VoiceOver, Voice Control, or contrast behavior.

## Icon

`src/assets/icon/{Spark,Cool,Warm}.svg` are the genuine public-safe layers from
Feelory `App/Resources/AppIcon.icon/Assets/`. `feelory-icon.png` is a flat,
192px composition of those layers on the resource's light background color.
It is a marketing rendition, **not** a claim to reproduce Icon Composer's
glass/specular output. No private source code is required to produce it.
The genuine resource's `icon.json` lists foreground `Spark` above the `Heart`
group (`Cool`, `Warm`). Sharp composites back-to-front, so the script paints
`Warm`, then `Cool`, then `Spark`. Painting the resource's foreground-first list
directly previously hid the pale neutral middle under the warm lobe.
The original SVG geometry, gradients and clip path are unchanged. All product
icon uses share the generated PNG; the website's separate caschw LLC favicon
is not the Feelory icon. `tests/icon.test.ts` checks the complete rendered
pixels against the genuine layer composition and checks the neutral middle.

## Device and typography rights

Graphite CSS surrounds are original illustrations, not official Apple device
renders and not claims of a particular hardware model. No licensed third-party
device frames or store badges are needed. Screens retain the full capture.
Typography uses local OS system stacks; no fonts are downloaded or distributed.
This replaces the plan's possible self-hosted font option without network or
font-license overhead.

Captures, icon layers, favicon, product names, artwork and marketing copy are
reserved rights, **excluded from MIT**. Third-party tool notices remain under
their own licenses; see [THIRD_PARTY_NOTICES.md](../THIRD_PARTY_NOTICES.md).
Final publication approval remains required; implementation authorization is
not an unrestricted reuse license.

## Budgets

The 42 WebP files total 1,978,964 bytes. File sizes are recorded in the manifest
and checked by the site validator. The default 640px two-screen hero and each
larger responsive variant remain below the 500,000-byte combined hero ceiling.
The build validates every recorded file size, metadata/proportion, and budget.
Browser measurements include actual responsive selection and all initial
network requests; see [validation](validation.md).
