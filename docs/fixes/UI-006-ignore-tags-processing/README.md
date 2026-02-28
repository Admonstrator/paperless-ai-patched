# UI-006: Ignore Tags for Processing and Statistics

## Background

Processing could already be restricted to specific tags (`TAGS` + `PROCESS_PREDEFINED_DOCUMENTS`), but there was no way to explicitly exclude tags.

This is required for many workflows, for example when documents with specific markers should never be processed automatically.

## Changes

- `views/setup.ejs`
  - Added a new **Ignore Tags** input field.
  - Values are stored as CSV in `ignoreTags`.
- `views/settings.ejs`
  - Added a new **Ignore Tags** input field.
  - Values are stored as CSV in `ignoreTags`.
- `public/js/setup.js`
  - Extended the tag manager to also handle the ignore-tag list.
- `public/js/settings.js`
  - Initialized an additional `TagsManager` for ignore tags.
- `routes/setup.js`
  - Setup/Settings GET: loaded `IGNORE_TAGS` and normalized it as an array.
  - Setup/Settings POST: processed `ignoreTags` and persisted it as `IGNORE_TAGS`.
  - Dashboard: switched document count to **effectively processable** documents.
- `services/paperlessService.js`
  - Added include/exclude tag helpers (`parseTagList`, `resolveTagIdsByName`, `filterDocumentsByExcludedTagIds`).
  - `getAllDocuments()` now also filters by `IGNORE_TAGS`.
  - Added `getEffectiveDocumentCount()` (for dashboard statistics).
- `config/config.js`
  - Added `ignoreTags` sourced from `IGNORE_TAGS`.
- `tests/test-ignore-tags-filter.js`
  - Added tests for include+exclude, exclude-only, and no-exclude.

## Testing

```bash
node tests/test-ignore-tags-filter.js
```

Additionally verified manually:

- Setup/Settings display ignore tags and persist them correctly.
- Regular scans do not process documents containing ignored tags.
- Dashboard uses the adjusted effective total.

## Impact

- Functionality: configurable exclusion of tags during regular scans.
- UX: new fields in setup and settings.
- Statistics: dashboard counts processable documents (exclude-adjusted).

## Upstream Status

- [x] Not submitted
- [ ] PR opened
- [ ] Merged upstream
- [ ] Upstream declined
