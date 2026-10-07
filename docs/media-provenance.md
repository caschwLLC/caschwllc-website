# Media provenance and rights

Only approved Feelory captures with synthetic content and public-safe icon
artwork were imported. No app code, real journal writing, internal planning
documents or model response transcripts are included.

## Captures

The approved source set contains 24 PNGs: six scenes each for iPhone/iPad in
light/dark appearance under `docs/assets/app-store/` in the separate Feelory
project. This site uses **six** of those captures, not all 24. SHA-256 source
hashes, relative names, natural dimensions and output bytes are recorded in
[`public/media/manifest.json`](../public/media/manifest.json).

| Site name         | Approved source                | Natural dimensions |
| ----------------- | ------------------------------ | ------------------ |
| phone-emotion     | iphone/light/06-emotion.png    | 1320 × 2868        |
| phone-reflection  | iphone/light/02-reflection.png | 1320 × 2868        |
| phone-explore     | iphone/light/05-explore.png    | 1320 × 2868        |
| tablet-reflection | ipad/light/02-reflection.png   | 2064 × 2752        |
| phone-practice    | iphone/light/04-practice.png   | 1320 × 2868        |
| phone-insights    | iphone/dark/03-insights.png    | 1320 × 2868        |

Reflection text, multiple tags, check-ins and chart data are synthetic fixture
content. The AI sparkle/dashed tag styling demonstrates a **saved AI-tag
provenance fixture**, not output observed from a live model during the capture.
Visible site captions and alt text preserve this distinction. Product AI copy
describes optional on-device behavior without suggesting the fixture is proof
of live inference.

`scripts/prepare-media.mjs` resizes and encodes without cropping, retouching,
changing screen features or compositing fake UI. iPhone variants: 320/640/960px;
iPad: 480/960/1440px. WebP quality 82, natural proportions preserved. Originals
are not stored here. Reproduction requires a separately authorized copy of the
approved directories:

```sh
node scripts/prepare-media.mjs /approved/Feelory/docs/assets/app-store /approved/Feelory/App/Resources/AppIcon.icon
```

The script reads only the six named PNGs and three named SVG icon layers.
Review resulting source hashes before accepting changed media.

## Icon

`src/assets/icon/{Spark,Cool,Warm}.svg` are the genuine public-safe layers from
Feelory `App/Resources/AppIcon.icon/Assets/`. `feelory-icon.png` is a flat,
192px composition of those layers on the resource's light background color.
It is a marketing rendition, **not** a claim to reproduce Icon Composer's
glass/specular output. No private source code is required to produce it.

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

All 18 WebP files total 793,790 bytes. Largest single variant: 98,276 bytes.
Default 640px two-screen hero: 91,170 bytes combined. Even the largest two hero
variants total 148,888 bytes, below the 500,000-byte combined hero ceiling.
The build validates every recorded file size, metadata/proportion, and budget.
Browser measurements include actual responsive selection and all initial
network requests; see [validation](validation.md).
