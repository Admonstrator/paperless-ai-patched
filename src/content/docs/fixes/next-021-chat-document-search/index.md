---
title: "NEXT-021: Searchable Document Chat selector"
sidebar:
  hidden: true
---

## Feature / Problem Description

The Document Chat page used a static dropdown with all documents rendered server-side.

With larger installations this became hard to navigate, slow to open, and impractical to find a specific document quickly.

## Implementation

The chat selector now uses API-backed search instead of rendering the full list up front.

- Added `GET /api/chat/documents` to provide compact search results for chat.
- Added endpoint-specific rate limiting on `/api/chat/documents` in addition to the global limiter.
- Reused Paperless document search (`/api/documents`) via a dedicated `paperlessService.searchDocumentsForChat()` method.
- Kept CSRF behavior unchanged: state-changing methods remain protected globally, while the read-only `GET` endpoint follows existing `ignoredMethods` behavior.
- Updated chat UI (`views/chat.ejs`, `public/js/chat.js`, `public/css/chat.css`) with:
  - Search input with debounce
  - Dynamic option loading
  - Loading/empty/error status text
- Reduced initial `/chat` payload by preloading only the optionally requested `open` document.

## Testing

```bash
node tests/test-chat-document-search.js
node tests/test-ignore-tags-filter.js
```

## Impact

- Functionality / UX:
  - Faster document lookup in Document Chat
  - Better usability for instances with many documents
- Performance:
  - Smaller initial chat page payload
  - Targeted API calls with bounded result size (`limit`)
- Security:
  - Additional endpoint-level rate limit
  - Existing CSRF model remains intact

## Further Links

| Type | Link |
| --- | --- |
| Related issue | https://github.com/admonstrator/paperless-ai-next/issues/30 |

## Implementation Record

| Field | Value |
| --- | --- |
| ID | NEXT-021 |
| Date | 2026-03-04 |
