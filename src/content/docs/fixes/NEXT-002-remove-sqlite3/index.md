---
title: "DEP-001: Remove Unused sqlite3 Dependency"
---

Use this page as the canonical template for documenting any new fix.

## Feature / Problem Description

The project depended on `sqlite3` although runtime code used `better-sqlite3`. This introduced unnecessary dependencies and avoidable build overhead.

## Implementation

- Removed `sqlite3` from dependencies and refreshed lockfile state.
- Verified there were no runtime imports of `sqlite3`.
- Kept database runtime behavior unchanged using `better-sqlite3`.

## Testing

This fix was verified with the standard project checks:

```bash
npm run test
npm run docs:build
```

## Impact

- Operations: Dependency footprint and installation complexity are reduced by removing an unused native package.
- Functionality / UX: Runtime behavior remains unchanged while builds are simpler to maintain.

## Further Links

| Type | Link |
| --- | --- |
| Previous ID | DEP-001 |
| Database model reference | [models/document.js](https://github.com/admonstrator/paperless-ai-next/blob/main/models/document.js) |

## Implementation Record

| Field | Value |
| --- | --- |
| ID | NEXT-002 |
| Author | admonstrator |
| Date | 2025-12-03 |
