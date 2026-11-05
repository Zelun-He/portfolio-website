# Project evidence register

Updated 2026-11-05. This is a source review for portfolio claims, not a new run
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

Evidence: the existing published /Images/eastern-asteria-home.webp delivery
capture and the public website link. The visible case study now offers a review
path through the company narrative and navigation. Attribution remains
professional team work at Arrows Up.

## Holcomb Tree Service

Evidence: the existing published /holcomb-tree-service.webp delivery capture
and the linked staging preview. The review path focuses on service information
and consultation entry points. The preview is explicitly labeled staging.

## Measurement limits

This session could not load the two external client sites through the public
page reader and has no browser runner. No new form, responsive-layout, analytics
or performance result is asserted. The delivery captures were already portfolio
assets; no private client source or analytics were published.

Future quantitative outcomes require retained evidence: an exact before/after
revision, the same test conditions, the measured result and collection date.
Conversion outcomes also require a defined event, observation window and
traffic/sample context. Do not turn an intended benefit into a measured result.
