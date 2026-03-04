---
title: "NEXT-021: Searchable document selectors"
sidebar:
  hidden: true
---

## Feature / Problem Description

The Document Chat and Manual Review pages used static dropdown selectors with all documents rendered client-side or loaded as full lists.

With larger installations this became hard to navigate and impractical for quickly locating a specific document.

## Implementation

Document selection now uses API-backed omni-search instead of classic long dropdowns.

- Added `GET /api/chat/documents` to provide compact search results for chat.
- Added endpoint-specific rate limiting on `/api/chat/documents` in addition to the global limiter.
- Reused Paperless document search (`/api/documents`) via a dedicated `paperlessService.searchDocumentsForChat()` method.
- Kept CSRF behavior unchanged: state-changing methods remain protected globally, while the read-only `GET` endpoint follows existing `ignoredMethods` behavior.
- Updated chat UI (`views/chat.ejs`, `public/js/chat.js`, `public/css/chat.css`) with:
  - Search input with debounce
  - Dynamic option loading
  - Keyboard navigation
  - Loading/empty/error status text
- Updated manual review UI (`views/manual.ejs`, `views/partials/scripts/manual-scripts.ejs`, `public/css/dashboard.css`) with the same omni-search pattern and metadata pills (correspondent, date, ID).
- Reduced initial `/chat` payload by preloading only the optionally requested `open` document.

## Testing

```bash
node tests/test-chat-document-search.js
node tests/test-chat-documents-service-search.js
node tests/test-ignore-tags-filter.js
```

## Impact

- Functionality / UX:
  - Faster document lookup in Document Chat and Manual Review
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
| Related issue | [Issue #30](https://github.com/admonstrator/paperless-ai-next/issues/30) |

## Implementation Record

| Field | Value |
| --- | --- |
| ID | NEXT-021 |
| Date | 2026-03-04 |
