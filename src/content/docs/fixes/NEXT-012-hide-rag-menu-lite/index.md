---
title: "UI-001: Hide RAG Menu in Lite Image"
---

Use this page as the canonical template for documenting any new fix.

## Feature / Problem Description

The Lite image displayed navigation entries for RAG features that were intentionally disabled, causing UX confusion and dead-end navigation.

## Implementation

- Added a `ragEnabled` render flag in affected routes.
- Updated sidebar/menu templates to conditionally render RAG links.
- Aligned UI feature visibility with backend capability toggles.

## Testing

This fix was verified with the standard project checks:

```bash
npm run test
npm run docs:build
```

## Impact

- Functionality / UX: Lite deployments no longer expose unavailable RAG navigation paths, reducing user confusion.

## Further Links

| Type | Link |
| --- | --- |
| Previous ID | UI-001 |
| Related route wiring | [routes/setup.js](https://github.com/admonstrator/paperless-ai-next/blob/main/routes/setup.js) |

## Implementation Record

| Field | Value |
| --- | --- |
| ID | NEXT-012 |
| Author | admonstrator |
| Date | 2025-12-04 |
