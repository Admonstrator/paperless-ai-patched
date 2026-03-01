---
title: "UI-007: Permanently Failed Queue for AI and OCR Failures"
---

Use this page as the canonical template for documenting any new fix.

## Feature / Problem Description

Repeatedly failing documents could be retried endlessly in normal scans, increasing noise and obscuring which items require manual intervention.

## Implementation

- Added permanent failure table and migration-backed tracking methods.
- Added scan-time skip logic for permanently failed documents.
- Added failed-queue API and dedicated UI with manual reset actions.
- Integrated OCR and AI failure paths with permanent-failure state transitions.

## Testing

This fix was verified with the standard project checks:

```bash
npm run test
npm run docs:build
```

## Impact

- Functionality / UX: Permanently failing items are isolated in a dedicated queue, reducing noise and making manual handling explicit.

## Further Links

| Type | Link |
| --- | --- |
| Previous ID | UI-007 |
| Related test | [tests/test-ocr-fallback-ai-errors.js](https://github.com/admonstrator/paperless-ai-next/blob/main/tests/test-ocr-fallback-ai-errors.js) |

## Implementation Record

| Field | Value |
| --- | --- |
| ID | NEXT-018 |
| Author | admonstrator |
| Date | 2026-02-28 |
