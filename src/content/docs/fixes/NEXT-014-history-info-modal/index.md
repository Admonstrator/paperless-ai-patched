---
title: "UI-003: History Info Modal and Detail Visibility"
---

Use this page as the canonical template for documenting any new fix.

## Feature / Problem Description

History entries lacked a focused detail view for AI outputs and processing metrics, making review and troubleshooting harder for users.

## Implementation

- Added a dedicated history info modal with structured sections.
- Added API detail endpoint to expose history metadata and token metrics.
- Replaced crowded inline table tag rendering with compact detail actions.
- Added rescan action from modal and supporting backend flow.

## Testing

This fix was verified with the standard project checks:

```bash
npm run test
npm run docs:build
```

## Impact

- Functionality / UX: History inspection is clearer through a dedicated modal with focused details and direct follow-up actions.

## Further Links

| Type | Link |
| --- | --- |
| Previous ID | UI-003 |
| Related UI file | [views/history.ejs](https://github.com/admonstrator/paperless-ai-next/blob/main/views/history.ejs) |
| Related UI file | [public/js/history.js](https://github.com/admonstrator/paperless-ai-next/blob/main/public/js/history.js) |

## Implementation Record

| Field | Value |
| --- | --- |
| ID | NEXT-014 |
| Author | admonstrator |
| Date | 2026-02-27 |
