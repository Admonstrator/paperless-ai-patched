---
title: "UI-006: Ignore Tags for Processing and Statistics"
---

Use this page as the canonical template for documenting any new fix.

## Feature / Problem Description

Users could include tags for processing scope but could not explicitly exclude tags, making opt-out workflows and accurate processing totals difficult.

## Implementation

- Added ignore-tag inputs in setup and settings UIs.
- Added parsing and persistence for `IGNORE_TAGS` configuration.
- Added include/exclude filtering helpers in document retrieval flow.
- Updated dashboard effective counts to reflect exclusion rules.

## Testing

This fix was verified with the standard project checks:

```bash
npm run test
npm run docs:build
```

## Impact

- Functionality / UX: Users can define both include and exclude tag scope, producing clearer behavior and more accurate counts.

## Further Links

| Type | Link |
| --- | --- |
| Previous ID | UI-006 |
| Related test | [tests/test-ignore-tags-filter.js](https://github.com/admonstrator/paperless-ai-next/blob/main/tests/test-ignore-tags-filter.js) |

## Implementation Record

| Field | Value |
| --- | --- |
| ID | NEXT-017 |
| Author | admonstrator |
| Date | 2026-02-28 |
