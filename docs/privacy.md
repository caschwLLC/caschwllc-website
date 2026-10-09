# Policy approval and deployment gates

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
directed that the remaining publication flags be true, using that day as the
effective date. These confirmations are recorded in
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
review banner on non-policy pages only. Privacy pages have no review banner or
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
