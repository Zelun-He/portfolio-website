# Project evidence register

Updated 2026-11-10. This is a source review for portfolio claims, not a new run
of the application suites or a live-site performance benchmark.

## Scribsy

Reviewed revision: b6f572765efbd0a304a13ec00a6cf0f0a5d36d62

- Sample editing flow: scribsy-frontend/src/app/sample-visit/page.tsx.
- Sample export reads the current SOAP state: scribsy-frontend/src/lib/sample-export.ts.
- Saved corrections, account isolation and finalization locks: tests/test_dashboard_workflow.py.
- Exported text, draft/finalized labels and long-note pagination: tests/test_note_pdf.py.
- Evaluation boundaries: docs/dashboard.md. Workflow tests substitute AI responses.
  They do not measure clinical accuracy or establish minutes saved per note.

Public case study links use revision-pinned test URLs. Readers can inspect the
fictional sample separately from the authenticated backend workflow.

## Narrator

The case study added in task 3 already links to its worker-recovery and export-retry
test scenarios and recorded backend verification. It describes recoverable
processing rather than making an unmeasured throughput claim.

## Eastern Asteria

Copy review, 2026-11-10: the published /Images/eastern-asteria-home.webp delivery
capture shows separate Our Coffee, Deep Thrill and Investors header entries.
This supports the case study's content/navigation decision. The responsibility
statement retains the existing attribution to responsive page implementation
within the Arrows Up team; private client source was not available to verify
authorship independently. No new framework, CMS or route-architecture claim was
added. The external website could not be loaded through the public page reader.

## Holcomb Tree Service

Copy review, 2026-11-10: the published /holcomb-tree-service.webp delivery capture
shows the consultation form beside the service introduction. The official
https://www.holcombtreeservice.com/ page was read on the same date and includes
property/contact fields, an estimate action and the phone number. These support
the case study's form-placement decision and input constraint, not a conversion
claim. The responsibility and SvelteKit statements retain existing portfolio
attribution; no private client source was reviewed. The public link now points
to the official website rather than the old staging preview.

## Measurement limits

The original 2026-11-05 review could not load the external client sites through
the public page reader. The 2026-11-10 copy review adds the Holcomb public-page
inspection described above. Neither review establishes successful form submission,
responsive behavior of the client sites, analytics or performance results. The
delivery captures were already portfolio assets; no private client source or
analytics were published.

Future quantitative outcomes require retained evidence: an exact before/after
revision, the same test conditions, the measured result and collection date.
Conversion outcomes also require a defined event, observation window and
traffic/sample context. Do not turn an intended benefit into a measured result.
