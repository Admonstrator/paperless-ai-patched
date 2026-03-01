---
title: "UI-002: Date and Boolean Custom Field Types"
---

Use this page as the canonical template for documenting any new fix.

## Feature / Problem Description

Settings UI offered fewer custom field types than backend processing supported, creating a mismatch and limiting field configuration options.

## Implementation

- Added `date` and `boolean` to custom field type options in settings UI.
- Aligned available selector values with setup and backend-supported data types.
- Kept existing serialization and storage behavior unchanged.

## Testing

This fix was verified with the standard project checks:

```bash
npm run test
npm run docs:build
```

## Impact

- Functionality / UX: Users can configure date and boolean custom fields directly in the UI, matching backend capabilities.

## Further Links

| Type | Link |
| --- | --- |
| Previous ID | UI-002 |
| UI source | [views/settings.ejs](https://github.com/admonstrator/paperless-ai-next/blob/main/views/settings.ejs) |

## Implementation Record

| Field | Value |
| --- | --- |
| ID | NEXT-013 |
| Author | admonstrator |
| Date | 2026-02-27 |
