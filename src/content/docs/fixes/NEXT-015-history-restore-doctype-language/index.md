---
title: "UI-004: History Restore with Document Type and Language"
---

Use this page as the canonical template for documenting any new fix.

## Feature / Problem Description

History detail lacked document type/language persistence and offered no complete restore path to return documents to pre-AI state.

## Implementation

- Extended history/original data model with document type and language fields.
- Added restore endpoint and service method for exact original state restoration.
- Extended history modal to display classification details and original snapshot.
- Added restore action in UI with safe confirmation flow.

## Testing

This fix was verified with the standard project checks:

```bash
npm run test
npm run docs:build
```

## Impact

- Functionality / UX: Users can inspect and restore document type and language as part of a complete pre-AI restore workflow.

## Further Links

| Type | Link |
| --- | --- |
| Previous ID | UI-004 |
| Depends on | [UI-003](../next-014-history-info-modal/) |

## Implementation Record

| Field | Value |
| --- | --- |
| ID | NEXT-015 |
| Author | admonstrator |
| Date | 2026-02-27 |
