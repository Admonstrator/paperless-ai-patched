---
title: "PR-747: History Validation & Cleanup Tool"
---

Use this page as the canonical template for documenting any new fix.

## Feature / Problem Description

History data could drift from Paperless-ngx when source documents were deleted, causing stale entries and inaccurate processing counters.

## Implementation

- Added validation flow to detect missing/orphaned history entries.
- Added cleanup actions to remove invalid rows safely.
- Integrated UI controls and API support for validation and cleanup operations.
- Improved user feedback for data consistency checks.

## Testing

This fix was verified with the standard project checks:

```bash
npm run test
npm run docs:build
```

## Impact

- Functionality / UX: Users can validate and clean stale history records with clearer consistency feedback.

## Further Links

| Type | Link |
| --- | --- |
| Previous ID | PR-747 |
| Upstream PR | [clusterzx/paperless-ai#747](https://github.com/clusterzx/paperless-ai/pull/747) |
| Appendix | [PR-747-DOCUMENTATION](pr-747-documentation/) |

## Implementation Record

| Field | Value |
| --- | --- |
| ID | NEXT-007 |
| Author | admonstrator |
| Date | 2025-12-03 |
