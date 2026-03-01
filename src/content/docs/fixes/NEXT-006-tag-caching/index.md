---
title: "PERF-002: Centralized Tag Cache Optimization"
---

Use this page as the canonical template for documenting any new fix.

## Feature / Problem Description

Tag metadata was refreshed too frequently and inconsistently across services, causing excessive API calls and slower document processing.

## Implementation

- Centralized tag caching with configurable TTL in the service layer.
- Removed duplicate cache logic from routes and secondary services.
- Added manual cache clear controls and operational endpoint support.
- Hardened cache-clear endpoints with rate-limiting and clearer behavior.

## Testing

This fix was verified with the standard project checks:

```bash
npm run test
npm run docs:build
```

## Impact

- Performance: Centralized caching with TTL significantly lowers repeated tag-fetch overhead.
- Functionality / UX: Tag-driven flows stay consistent while cache behavior is easier to control operationally.

## Further Links

| Type | Link |
| --- | --- |
| Previous ID | PERF-002 |
| Related test | [tests/test-rate-limiting.js](https://github.com/admonstrator/paperless-ai-next/blob/main/tests/test-rate-limiting.js) |

## Implementation Record

| Field | Value |
| --- | --- |
| ID | NEXT-006 |
| Author | admonstrator |
| Date | 2026-02-24 |
