# UI-004: History Modal – Restore Original, Document Type & Language

## 📌 Overview

**Type**: UI Enhancement + Database Infrastructure  
**Status**: ✅ Applied  
**Integration Date**: 2026-02-27  
**Upstream Status**: ⏳ Not submitted (fork-specific)  
**Depends on**: [UI-003](../UI-003-history-info-modal/README.md) (History Info-Modal)

## 🐛 Problem

The History Info-Modal introduced in UI-003 showed tags, correspondent, custom fields, and token usage — but was missing two important pieces of information:

1. **Document Type and Language** — both are detected by the AI and sent to Paperless-ngx, yet were never stored in the history nor shown in the modal.
2. **No way to undo AI changes** — once the AI had processed a document there was no mechanism to revert the title, tags, correspondent, document type, and language back to their original (pre-AI) values. The `original_documents` table already stored some of these values but they were never exposed or used for recovery.

## ✅ Solution

1. **DB Migration v2** — adds four new columns via the existing migration system:
   - `history_documents.document_type_name TEXT DEFAULT NULL`
   - `history_documents.language TEXT DEFAULT NULL`
   - `original_documents.document_type INTEGER DEFAULT NULL`
   - `original_documents.language TEXT DEFAULT NULL`
2. **Document Classification section** in the modal — shows the AI-detected Document Type and Language as pills.
3. **Original State section** in the modal — collapsible section listing the pre-AI title, correspondent, tag count, document type and language.
4. **Restore Original button** — one-click restore of the document in Paperless-ngx to its exact state before AI processing, using a dedicated `restoreDocument()` method that bypasses the tag-merge and skip-correspondent logic of the normal update path.

## 📝 Changes

### `models/document.js`

- **Migration v2** added to the `MIGRATIONS` array:
  ```javascript
  {
    version: 2,
    description: 'Add document_type_name and language to history_documents; add document_type and language to original_documents',
    up: (database) => {
      database.exec('ALTER TABLE history_documents ADD COLUMN document_type_name TEXT DEFAULT NULL');
      database.exec('ALTER TABLE history_documents ADD COLUMN language TEXT DEFAULT NULL');
      database.exec('ALTER TABLE original_documents ADD COLUMN document_type INTEGER DEFAULT NULL');
      database.exec('ALTER TABLE original_documents ADD COLUMN language TEXT DEFAULT NULL');
    }
  }
  ```
  Existing rows silently receive `NULL` — zero data loss.
- **`saveOriginalData(docId, tags, correspondent, title, documentType, language)`** — two new optional parameters added; `INSERT` statement extended to store both.
- **`addToHistory(docId, tagIds, title, correspondent, customFields, documentTypeName, language)`** — two new optional parameters added; `INSERT` statement extended.

### `services/paperlessService.js`

- New method **`restoreDocument(documentId, original)`**:
  - Accepts `{ tags, title, correspondent, documentType, language }`
  - Sends a raw `PATCH /documents/{id}/` without merging tags or skipping the correspondent field (unlike `updateDocument()`)
  - Only includes fields that are not `undefined` — safe to call with partial originals

### `server.js` + `routes/setup.js` (duplicate function)

Both `saveDocumentChanges()` copies updated:
- Pass `originalData.document_type` and `originalData.language` to `saveOriginalData()`
- Pass `analysis.document.document_type` and `analysis.document.language` to `addToHistory()`

### `routes/setup.js`

- **`GET /api/history/:id/detail`** extended:
  - `history` block now includes `document_type_name` and `language`
  - New `original` block loaded from `getOriginalData()`: `{ title, correspondent, tags, documentType, language }`
  - `original` is `null` for documents with no saved original data

- **New `POST /api/history/:id/restore`**:
  - Loads `original_documents` row for the given document ID
  - Calls `paperlessService.restoreDocument()` with parsed original values
  - Returns `{ success: true, message }` or appropriate error

### `views/history.ejs`

- **Document Classification section** (between Correspondent and Custom Fields):
  - "Type" pill (`#infoModalDocType`) — blue, shows AI-detected document type name
  - "Language" pill (`#infoModalLanguage`) — purple, shows AI-detected language
  - Both fall back to "–" for pre-migration entries
- **Original State section** (collapsible, before footer):
  - Toggle button with animated chevron (`#infoModalOriginalToggle`)
  - Lists original title, correspondent (ID), tag count, document type (ID), language
  - Hidden (`display:none`) when no original data available
- **"Restore Original" button** (red, `#infoModalRestoreBtn`) in modal footer:
  - Shown only when `data.original` is present
  - Positioned between Rescan and Close

### `public/js/history.js`

- `openInfoModal()` renders two new sections:
  - Document Classification: sets `#infoModalDocType` and `#infoModalLanguage` text
  - Original State: builds HTML from `data.original`, shows/hides restoreBtn accordingly
- `_handleRestoreClick()` — delegates to `restoreDocument()` for the current modal doc
- `restoreDocument(documentId)`:
  - Shows `confirm()` dialog with clear warning text
  - `POST /api/history/:id/restore`
  - On success: closes modal, toast, reloads DataTable
  - On error: shows error toast, re-enables button
- **`initializeModals()`** extended:
  - Restore button click → `_handleRestoreClick()`
  - Original-toggle click → animate chevron + toggle `hidden` class on body

## 🧪 Testing

### Migration

```bash
# Start app — should see migration log:
# [DB Migration] Running migration v2: Add document_type_name and language...
# [DB Migration] Migration v2 completed successfully
sqlite3 data/documents.db ".schema history_documents"
# Should show: document_type_name TEXT DEFAULT NULL, language TEXT DEFAULT NULL
sqlite3 data/documents.db ".schema original_documents"
# Should show: document_type INTEGER DEFAULT NULL, language TEXT DEFAULT NULL
```

### Document Classification

1. Process a document that has a detectable type (e.g. "Invoice") and identifiable language (e.g. "de")
2. Open History → Details button
3. **Expected**: Document Classification section shows correct type and language pills

### Restore Original

1. Open History → Details for any processed document
2. "Original State" section should be visible (collapsed by default); click to expand
3. Click "Restore Original" → confirm dialog
4. **Expected**: Paperless-ngx document reverts to original title, tags, correspondent, document type, language
5. Verify in Paperless-ngx UI that values match the pre-AI state

### Edge Cases

- Documents processed before UI-004: Doc Type and Language show "–"; Restore button hidden if original_documents row exists (legacy rows without documentType/language restore title/tags/correspondent only)
- Documents with no `original_documents` row: Restore button hidden, Original State section hidden

## 📊 Impact

- **Functionality**: Full round-trip visibility — AI input vs. AI output, with one-click revert
- **Data integrity**: Restore bypasses the standard update path to ensure exact state recovery
- **Schema**: Backward-compatible — migration adds nullable columns, no existing data affected
- **Performance**: No impact — one extra DB read per modal open (`getOriginalData`)

## Upstream Status

- [ ] Not submitted — fork-specific feature
