# Media provenance and rights

## Override W2 icon and M2 menu bar glyphs

The owner authorized transferring the approved **W2 Clear Glass & Enamel** icon
and **M2 Channel** glyphs from the Override website handoff for this refresh.
They replace the earlier Aligned Panes artwork. Only the required files were
copied, byte-for-byte, from `Resources/Website/Override/` at source revision
`02199ae45afcd7179e9fa734d68b822ae3f24b46` (main after icon PR 136 merged).
Every copied file was verified against the handoff's `provenance.txt`.
No private app source, internal planning, handoff prompt, raw provenance
document, build script, masters or unused platform artwork was copied.

The handoff records Apple's native Icon Composer `ictool` export, design
generation 27, Default and Dark renditions. The lilac clear-glass rear half and
gold-enamel front half form a split-squircle O on plum. Apple's renderer supplies
lighting, glass, shadows and the transparent macOS mask. These are original
project shapes, not SF Symbols, stock imagery or repurposed Apple app icons.
Native Display P3 was converted by the source exporter to embedded sRGB using
Pillow ImageCms/LittleCMS, relative-colorimetric intent and preserved alpha.
Density assets were Lanczos-downsampled from the 1024px sRGB masters.
The website does not resize, re-encode, recolor or recreate these files.

PNG paths below are under `public/media/`; menu bar paths are under
`src/assets/override/menubar/`.

| File                                         | Dimensions | SHA-256                                                            |
| -------------------------------------------- | ---------- | ------------------------------------------------------------------ |
| `override-icon.png`                          | 192 × 192  | `c6b60b35e187baaa8695307e3dded92db3b1ac58f0f88b3b9910251f537714a0` |
| `override-icon-64.png`                       | 64 × 64    | `2865659a256bedb1f339dc60c96c7239f142945908baabd4e2d8b5c9ff733b58` |
| `override-icon-128.png`                      | 128 × 128  | `5bd2609ed86d10edebd63b122dd974cbff10b952a9d19b1d72d349d91e2d2e44` |
| `override-icon-192.png`                      | 192 × 192  | `c6b60b35e187baaa8695307e3dded92db3b1ac58f0f88b3b9910251f537714a0` |
| `override-icon-dark-64.png`                  | 64 × 64    | `b159d40c0c2333e42c18ab3836692fcf196c283fd65fdf1bbf91d082df8bbd1d` |
| `override-icon-dark-128.png`                 | 128 × 128  | `05d59f1497e8b07cffee31919a8c2d64209882ec22d66cd63bba4700f8e8a513` |
| `override-icon-dark-192.png`                 | 192 × 192  | `bd4eaae9186a358d10d0c27f1b301102d7211424e17a7694d3c152e28486f891` |
| `override-social-card.png`                   | 1200 × 630 | `586c7d1b71f6730803bd7c5d2e46a90272593d1296c2c5c46c60404ccf75c741` |
| `override-menubar-ready.svg`                 | 26 × 20    | `54cf9b43e6855ddeebd54979ee41cc326bac6eb5e84f448b15a6b2b400a8df17` |
| `override-menubar-accessibility-missing.svg` | 26 × 20    | `a92f8433d61304cfdd2cb961a8a964fcdbd928a1f0220ef6f7f06c87b299e8b8` |
| `override-menubar-paused.svg`                | 26 × 20    | `2ff6945e4576649498673c77e420f5b8744784f5c2f447aff1acc092c74b7c6f` |
| `override-menubar-stashed.svg`               | 26 × 20    | `60acc9787f56861d803ca7b73fac0242c45eb36c8cf5b5f19b8d709cef6d9f33` |

The shared app-icon renderer displays Override at 64 CSS pixels and uses
64/128/192px files as 1x/2x/3x sources, selecting Dark with
`prefers-color-scheme`. No extra rounding, padding, clipping mask, border,
shadow or recoloring is applied. Feelory's styling is unchanged.
The legacy PNG path contains the same approved W2 bytes as the light 192px file.
Override's three pages use the supplied social card with absolute image URLs;
the site-wide caschw LLC favicon remains unchanged.

The four supplied SVGs are inlined at build time with `currentColor`. Geometry
and viewBox are preserved; only internal IDs/references are namespaced per
instance to avoid clip-path collisions, and decorative accessibility attributes
are added. Adjacent text explains ready, Accessibility missing, paused and
stashed, including priority in that order of precedence: Accessibility missing,
paused, stashed, ready. The source SVG files remain byte-for-byte unchanged and
are excluded from formatting to preserve checksum identity.

No Override screenshots or installation illustrations exist in the website to
refresh. No app UI was fabricated. Branding and state guidance are staged for
the next release in a draft PR; the existing 0.1.0 download is unchanged pending
the owner's end-to-end release verification and publication authorization.

The artwork remains reserved-rights media, excluded from the website's MIT code
license. Owner authorization does not grant unrestricted reuse.

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
