---
title: "PERF-001: History Table Performance Optimization"
---

Use this page as the canonical template for documenting any new fix.

## Feature / Problem Description

History rendering and interactions became slow with larger datasets because data operations were performed in memory instead of at the database layer.

## Implementation

- Moved pagination, sorting, and filtering to SQL queries.
- Added paginated model methods and filtered count retrieval.
- Reduced redundant metadata refreshes in history data loading.
- Updated history endpoints/UI integration for server-side pagination.

## Testing

This fix was verified with the standard project checks:

```bash
npm run test
npm run docs:build
```

## Impact

- Performance: SQL pagination, filtering, and sorting reduce memory pressure and improve response time on large history datasets.
- Functionality / UX: History interactions stay responsive and predictable as document volume grows.

## Further Links

| Type | Link |
| --- | --- |
| Previous ID | PERF-001 |
| Main route integration | [routes/setup.js](https://github.com/admonstrator/paperless-ai-next/blob/main/routes/setup.js) |

## Implementation Record

| Field | Value |
| --- | --- |
| ID | NEXT-005 |
| Author | admonstrator |
| Date | 2025-12-03 |
