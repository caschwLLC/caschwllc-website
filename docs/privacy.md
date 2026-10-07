# Policy review and launch gates

Public Markdown in `src/content/policies/` is adapted from owner-authorized draft
copy, with internal preparation notes removed. It is **not a legally confirmed
published policy**. No legal identity, effective date, postal address, universal
deletion guarantee or artificial deletion deadline has been invented.

Confirmed support address: **apps@caschw.com**, hosted by Outlook.com/Microsoft.
The different email domain is intentional. Correspondence is kept only while
needed to resolve requests, with regular review/deletion of resolved mail.
Provider-held copies follow provider controls and retention policies.

## Owner confirmations before launch

- Confirm the responsible publisher's exact identity, not just the display brand.
- Set the actual effective date and approve final copy, assets and providers.
- Confirm Outlook.com/Microsoft, TestFlight/Apple, iCloud and actual hosting
  disclosures and retention practice.
- Verify deletion/permission instructions on supported devices. Individual
  entry deletion is not erase-all; check-ins, practice and settings are separate.
- Verify iCloud offline/deletion/restart behavior, Health samples, backups and
  export limitations. Do not promise developer deletion of private Apple data.
- If hosted on GitHub Pages, convert conditional hosting wording to the verified
  present-tense disclosure. GitHub IP security logs are separate from Feelory's
  no-developer-collection design.

Record confirmations in `src/content/publication.json` via a reviewed change.
Review the build dependency findings in [dependencies.md](dependencies.md);
`dependencyRiskReviewed` is an additional explicit first-launch gate.
The reading layout shows publisher/date only when values are supplied.
`npx tsx scripts/check-launch.ts` must fail while these gates remain incomplete.
Final production also requires separately authorized `PAGES_LAUNCH_APPROVED=true`;
content confirmations cannot themselves activate it. The user separately
authorized a public **review** site at the repository Pages URL, admitted through
`PAGES_REVIEW_APPROVED=true` in review mode. Review pages are noindex and carry a
site-wide review banner; policies explicitly say **Draft policy for review**.
Missing publisher/date are not invented, and no final facts are marked approved.
`check-launch.ts --review` validates only this narrow review authorization.

## Out-of-scope app follow-up

After policies are approved and live, a separate Feelory change must expose
`https://caschwllc.org/apps/feelory/privacy/` and
`https://caschwllc.org/apps/feelory/support/` inside the app and in App Store
Connect as appropriate. The website implementation does not modify Feelory.
Its existing privacy promise is not a substitute for an accessible full policy.
