# UI-007: Terminal Failed Queue for AI/OCR Failures

## Background

Some documents repeatedly failed during automatic processing and were retried on later scans.
This created unnecessary repeated attempts and made it hard to clearly separate recoverable OCR queue items from terminal failures.

## Changes

- `models/document.js`
  - Added DB migration `v4` with a new `failed_documents` table.
  - Added methods:
    - `addFailedDocument(...)`
    - `isDocumentFailed(...)`
    - `getFailedDocumentsPaginated(...)`
    - `resetFailedDocument(...)`
    - `clearProcessingStatusByDocumentId(...)`
- `server.js`
  - Main scan path now skips documents that are in `failed_documents`.
  - Marks documents as terminal failed when:
    - AI fails and OCR is disabled.
    - AI fails and no OCR fallback applies.
    - Content is insufficient and OCR is disabled.
- `routes/setup.js`
  - Setup scan path now also skips terminal failed documents and marks the same terminal failure cases.
  - Added API endpoints:
    - `GET /api/failed/queue`
    - `POST /api/failed/reset/:documentId`
  - Extended `GET /api/ocr/stats` with `terminalFailed` count.
- `services/mistralOcrService.js`
  - Marks documents as terminal failed when OCR fails.
  - Marks documents as terminal failed when AI fails after successful OCR.
  - Clears terminal-failed state on successful AI analysis from OCR text.
- `views/ocr.ejs`
  - Added a dedicated **Terminal Failed Documents** table (like OCR queue).
- `public/js/ocr.js`
  - Loads and renders the new terminal failed table.
  - Adds **Reset** action per failed document.
  - Refreshes OCR + failed tables and stats after processing/reset actions.

## Failure Rules Implemented

A document is marked as terminal failed when:

1. OCR succeeded but AI still fails afterwards.
2. AI fails while OCR is disabled.
3. OCR itself fails.

Terminal failed documents are skipped by automatic scans until manually reset.

## Testing

```bash
node tests/test-ocr-fallback-ai-errors.js
```

Additionally verified manually:

- Documents in `failed_documents` are skipped by scan logic.
- Reset endpoint removes failed state and allows re-scan.
- OCR page shows a separate terminal failed table with reset action.

## Impact

- Functionality: introduces a terminal failure lifecycle with explicit user reset.
- Stability: prevents repeated scan attempts for documents known to fail.
- UX: improves transparency with a dedicated failed-documents table.

## Upstream Status

- [x] Not submitted
- [ ] PR opened
- [ ] Merged upstream
- [ ] Upstream declined
