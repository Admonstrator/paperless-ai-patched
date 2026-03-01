---
title: "SEC-003: Global Rate Limiting for API and Streaming Endpoints"
---

Use this page as the canonical template for documenting any new fix.

## Feature / Problem Description

Only a small subset of endpoints had rate limiting, leaving major API and streaming routes vulnerable to request flooding.

## Implementation

- Added global rate limiter middleware for key API and streaming route groups.
- Introduced hybrid identity keying (API key, user identity, fallback IP).
- Added central configuration for rate window and limits.
- Aligned route-level checks with shared API key configuration.

## Testing

This fix was verified with the standard project checks:

```bash
npm run test
npm run docs:build
```

## Impact

- Security: Global request throttling reduces endpoint flooding and abuse risk across API and streaming routes.
- Functionality / UX: Legitimate users get more stable behavior under load due to consistent traffic shaping.

## Further Links

| Type | Link |
| --- | --- |
| Previous ID | SEC-003 |
| Related test | [tests/test-rate-limiting.js](https://github.com/admonstrator/paperless-ai-next/blob/main/tests/test-rate-limiting.js) |

## Implementation Record

| Field | Value |
| --- | --- |
| ID | NEXT-011 |
| Author | admonstrator |
| Date | 2026-02-25 |
