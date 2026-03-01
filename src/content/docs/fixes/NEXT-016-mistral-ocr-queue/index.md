---
title: "UI-005: Mistral OCR Queue for Low-Quality Documents"
---

Use this page as the canonical template for documenting any new fix.

## Feature / Problem Description

Documents with poor OCR text were skipped silently during processing and had no dedicated recovery workflow for OCR re-extraction and re-analysis.

## Implementation

- Added OCR queue database model and migration-backed persistence.
- Implemented Mistral OCR service integration with optional AI follow-up analysis.
- Added OCR queue UI page, queue management API, and SSE progress updates.
- Added automatic queueing for low-content and OCR/AI fallback scenarios.

## Testing

This fix was verified with the standard project checks:

```bash
npm run test
npm run docs:build
```

## Impact

- Functionality / UX: Low-quality documents now follow a visible recovery path through OCR queueing and controlled reprocessing.

## Further Links

| Type | Link |
| --- | --- |
| Previous ID | UI-005 |
| Service implementation | [services/mistralOcrService.js](https://github.com/admonstrator/paperless-ai-next/blob/main/services/mistralOcrService.js) |

## Implementation Record

| Field | Value |
| --- | --- |
| ID | NEXT-016 |
| Author | admonstrator |
| Date | 2026-02-28 |
