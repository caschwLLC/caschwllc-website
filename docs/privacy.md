# Policy approval and deployment gates

## Optional website analytics revision

The optional production-only Umami implementation is staged disabled. Existing
`policyTextApproved: true` does not automatically activate analytics.
The owner separately approved the documented analytics behavior and disclosure
on 2026-10-20. `src/content/analytics-publication.json` records its fingerprint
and configured website ID/script URL. Enabled production builds still reject
missing/stale behavior/policy approval or missing marketed-app privacy declarations.

Website privacy describes actual build-selected behavior: untracked review/
disabled builds, or explicitly approved production analytics. App policies end
with a short Web privacy section linking to it, without repeating its provider
or analytics details. Feelory's app-level data promises are unchanged. Override
support/Accessibility link to its app policy; shared website privacy links remain
distinct. The owner confirmed Override's app facts on 2026-10-19; its policy is
now included in the catalog. The owner authorized narrowly scoped read-only
Override fact verification; no app source or internal documents are imported here.

The final analytics disclosure approval is recorded; activation and deployment
remain separate from that approval.
Publisher and support-handling facts carry forward from the existing record.
The owner authorizes dating created/changed pages with the actual change date,
without further reconfirmation. See
[analytics.md](analytics.md) for manual account/Variables steps and maintenance.

## Override policy boundary

Override has a separate app privacy policy at `/apps/override/privacy/`, declared
by its catalog entry and linked from the product and support pages. The owner
confirmed no update checks, remote services, crash reporting service, telemetry
or third-party SDKs. Diagnostics generate privacy-safe descriptions of Override's
own actions only when enabled, stay in memory until quit, and are copied only
when the user chooses the button. Previously exported copies remain separate.
These owner-confirmed facts resolve the earlier source-review questions;
incomplete source evidence must not override the owner's explicit confirmation.

Website, Feelory and Override privacy policies use individual effective dates
of 2026-10-19 for this change. Override support/Accessibility carry the same
last-updated date. Unchanged Feelory support/Accessibility and the global
publication record keep their earlier dates. App policies end with a short
Web privacy link, not detailed website analytics statements.

## Existing approved policies

The owner explicitly approved the public policy text and directed removal of
policy draft/review notifications on 2026-10-07. Approval is recorded separately
in `src/content/policy-publication.json`. The app is still **Coming soon**:
policy approval does not release it or activate download links.
No legal identity, effective date, postal address, universal
deletion guarantee or artificial deletion deadline has been invented.

Confirmed support address: **apps@caschw.com**, hosted by Outlook.com/Microsoft.
The different email domain is intentional. Correspondence is kept only while
needed to resolve requests, with regular review/deletion of resolved mail.
Provider-held copies follow provider controls and retention policies.

## Owner-confirmed publication facts

On 2026-10-08 the owner confirmed **caschw LLC** as the legal publisher and
directed that the remaining publication flags be true. The owner subsequently
directed a Feelory retention and deletion update; the revised policy effective
date is 2026-10-12. These facts are recorded in
`src/content/publication.json`: content/assets, provider disclosures, deletion
guidance, domain/hosting, and dependency-risk review. GitHub Pages hosting has
also been checked directly, and the website policy now states it in the present
tense. These confirmations do not authorize deployment or release Feelory.

The owner accepted the remaining build-tool dependency risk and requested a
mitigation investigation, tracked in
[issue #1](https://github.com/caschwLLC/caschwllc-website/issues/1).
The unresolved advisory remains documented in [dependencies.md](dependencies.md);
approval does not mean the advisory is fixed.
The owner separately authorized completing production publication on 2026-10-08.
The reading layout shows publisher/date only when values are supplied.
`npx tsx scripts/check-launch.ts` must fail while these gates remain incomplete.
Final production also requires separately authorized `PAGES_LAUNCH_APPROVED=true`;
content confirmations cannot themselves activate it. The user separately
authorized a public **review** site at the repository Pages URL, admitted through
`PAGES_REVIEW_APPROVED=true` in review mode. Review pages are noindex and carry a
product-specific banner on non-policy app pages only: Override says
**Public Preview -- Coming soon.**, and Feelory says **Coming soon.**
The developer homepage has no banner and keeps its closing copy studio-wide,
without Feelory privacy/support links. These preview labels do not change
Override's public beta download availability.
Privacy pages have no review banner or
policy draft label in either build mode. The Feelory policy instead states:
**Feelory is coming soon. This policy describes how Feelory handles your information.**
Website privacy carries no app availability notice. Unknown publisher/date values
remain omitted rather than invented; separate final-domain facts are unchanged.
`check-launch.ts --review` validates only this narrow review authorization.

## Out-of-scope app follow-up

After the approved policy correction is deployed, a separate Feelory change must expose
`https://caschwllc.org/apps/feelory/privacy/` and
`https://caschwllc.org/apps/feelory/support/` inside the app and in App Store
Connect as appropriate. The website implementation does not modify Feelory.
Its existing privacy promise is not a substitute for an accessible full policy.
