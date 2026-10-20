---
name: caschw LLC software showroom
description: Genuine software screens in a crisp, neutral studio.
colors:
  paper: '#f5f5f2'
  ink: '#22252b'
  secondary: '#555960'
  line: '#d9dad8'
  lavender: '#e7e4f5'
  mint: '#e3ede5'
  sky: '#e3edf4'
  accent: '#51419c'
typography:
  display:
    fontFamily: '-apple-system, BlinkMacSystemFont, Segoe UI, Helvetica, Arial, sans-serif'
    fontSize: 'clamp(3rem, 6.3vw, 6rem)'
    fontWeight: 650
    lineHeight: 1.04
    letterSpacing: '-0.04em'
  body:
    fontFamily: '-apple-system, BlinkMacSystemFont, Segoe UI, Helvetica, Arial, sans-serif'
    fontSize: '1.0625rem'
    lineHeight: 1.6
rounded:
  stage: '2rem'
  pill: '99px'
spacing:
  gutter: 'clamp(1.25rem, 4.5vw, 5rem)'
components:
  button-primary:
    backgroundColor: '{colors.ink}'
    textColor: '#ffffff'
    rounded: '{rounded.pill}'
    padding: '0.85rem 1.5rem'
  button-primary-hover:
    backgroundColor: '{colors.accent}'
    textColor: '#ffffff'
---

# Design system: caschw LLC

## Overview

The approved **crisp software showroom** makes the app itself the proof.
Neutral studio chrome, confident local system typography, large genuine screen
compositions and product-specific color carry the identity. No empty portfolio
cards, stock illustrations, clinical imagery or fabricated social proof.
This record describes the rendered implementation, not an unbuilt proposal.

## Colors

Paper and ink frame the studio. Lavender carries Feelory's opening and Explorer
chapter; mint supports reflection; sky supports practice. The dark insights
chapter uses a graphite field with light text and an actual dark-mode capture.
Accent is used for interactive hover/focus and reading-page links, not for
invented app UI. Screen colors remain the genuine capture's colors.

## Typography

Local OS system faces connect the showroom to software without downloading
fonts. Display weight is 650 with tight, bounded tracking; body is 17px at
1.6 line height. Headings balance with `text-wrap: balance`. Product h1 tops out
at 5.5rem; studio h1 at 6rem. Reading headings are smaller and measured.
Brand keeps lowercase `caschw` and the exact uppercase `LLC`.

## Layout

Content wraps at 1440px, header/footer at 1600px. Fluid gutters start at 20px.
Desktop presents substantial two-column showroom/feature compositions, not a
same-size feature-card grid. Chapters alternate the proof/copy relationship.
At 1000px the layout tightens; at 700px it becomes one column.
The mobile homepage moves genuine screens ahead of the detailed summary.
The product hero keeps promise and availability together before the screens.
Privacy/support use a maximum 72ch article with generous heading separation.

## Elevation & Depth

Only device surrounds carry a soft offset shadow:
`0 22px 34px -18px rgb(24 26 36 / 35%)`.
Fields create chapter hierarchy; text and content are not nested inside
decorative raised cards. No glass/blur halos.

## Shapes

Showroom stage corners are 32px desktop, 24px mobile. Action/status pills are
fully rounded. Graphite phone/tablet surrounds are original illustrative frames,
not official device renders; full capture proportions are retained.
Paired opening screens lean ±5 degrees without changing their content.

## Components

The header exposes home, marketed products and contextual support; platform
headings are data-derived.
Primary links use a dark pill and a directional arrow. Coming soon is a
noninteractive outlined text status, never a disabled download button.
Button hovers retain Feelory's purple accent (`#51419c`); Override uses the
equivalent blue accent (`#416e9c`) on its sky showcase and product pages.
The footer links to email support and website privacy. App-specific privacy,
support and accessibility links live on the relevant product pages. Product
features use semantic figures, descriptions and honest synthetic-content
captions.

Override extends the showroom with a text-led sky field, an open capability
index and full-width lavender, mint and sky feature chapters with Feelory's
shared section spacing, not simulated application windows or placeholder media.
Its beta label and versioned DMG action remain explicit on
the homepage, product page and support page. The approved native-rendered Override
W2 lilac-glass and gold-enamel split O icon displays at 64px, using the supplied
64/128/192px light and dark assets at 1x/2x/3x. It has no extra rounding, effects
or padding; its own transparent mask is preserved. Dark artwork follows the
visitor's appearance preference without changing the existing page theme.
An open menu bar definition list uses the supplied M2 currentColor glyphs and
explains Accessibility-missing, paused, stashed and ready priority. Compact
reading-page variants connect status to permission and troubleshooting guidance.
Guide headings reuse the utility 1.75–3rem ramp, with 1.75rem reading headings.
Override social previews use the supplied 1200×630 card, not the small app icon;
the global favicon stays caschw LLC. No screenshot is fabricated. Utility pages do
not inherit Feelory's screen or privacy chapters.
The header wraps on narrow screens to accommodate multiple product links.
The homepage closes with studio-wide copy rather than Feelory policy/support
links. Its capture note identifies sample data. Review banners appear only on
non-policy app pages, with app-specific wording; the developer homepage has none.

One 850ms device-composition settle animation runs only with no motion preference;
the default remains visible. Reduced motion removes it. Focus rings are 3px,
offset 5px; the skip link becomes visible on focus. Reading links are underlined.

## Do's and Don'ts

- Lead with genuine proportional captures and confirmed product language.
- Keep availability, optional features and privacy distinctions explicit.
- Preserve semantic headings, keyboard access, contrast and reduced motion.
- Do not add fake UI, AI answers, reviews, prices, awards, badge affordances,
  external font requests, unapproved tracking or empty platform navigation.
- Keep the optional production-only Umami integration invisible and nonblocking;
  new pages/actions inherit shared coverage, never per-app trackers. Preserve
  ordinary links even when analytics is blocked. See `docs/analytics.md`.
