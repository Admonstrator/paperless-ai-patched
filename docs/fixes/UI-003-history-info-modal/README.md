# UI-003: History Info-Modal with Rescan & DB Migration System

## 📌 Overview

**Type**: UI Enhancement + Database Infrastructure  
**Status**: ✅ Applied  
**Integration Date**: 2026-02-27  
**Upstream Status**: ⏳ Not submitted (fork-specific)

## 🐛 Problem

The History view displayed all AI-set tags directly as badges in the table, which became cluttered and unreadable with many tags. More importantly, there was no way to inspect *what the AI actually detected* — no custom fields, no token usage, no live comparison with the current state in Paperless-ngx. Re-triggering AI analysis for a single document also required manual steps (reset, then wait for the next scheduled scan).

Additionally, the database schema had no migration system — adding new columns to existing tables on already-deployed instances required manual SQL or caused silent failures.

## ✅ Solution

1. **DB Migration System** — introduces `PRAGMA user_version`-based schema versioning that runs at app startup, applies pending migrations in transactions (with automatic rollback on failure), and logs all activity.
2. **`custom_fields` column** — added to `history_documents` via Migration v1 so AI-detected custom fields are stored alongside every history entry going forward.
3. **Info-Modal** — replaces the raw tag badges in the table with a single "Details" button that opens a well-structured modal showing all AI analysis results.
4. **Rescan button** — one-click reset-and-rescan directly from the modal.

## 📝 Changes

### `models/document.js`

- **DB Migration System** added after `CREATE TABLE` blocks:
  - `PRAGMA user_version` read on startup to determine current schema version
  - `MIGRATIONS` array with `{ version, description, up(db) }` entries — append here for future migrations
  - `runMigrations(db)` iterates pending entries, wraps each in `db.transaction()`, sets `user_version` after success
- **Migration v1**: `ALTER TABLE history_documents ADD COLUMN custom_fields TEXT DEFAULT '[]'` — existing rows receive `'[]'`, no data loss
- **`addToHistory()`** — added optional 5th parameter `customFields` (JSON-serialised before storage)
- **`getHistoryByDocumentId(documentId)`** — returns the most recent history entry for a document
- **`getMetricsByDocumentId(documentId)`** — returns the most recent token metrics entry for a document

### `server.js`

- **`saveDocumentChanges()`** — passes `analysis.document.custom_fields` to `addToHistory()` so custom fields are persisted from the first processing run after the update

### `routes/setup.js`

- **`GET /api/history/:id/detail`** — new endpoint:
  - Loads history entry + token metrics from DB
  - Fetches live document from Paperless-ngx API for tag diff
  - Returns `{ history, tags: { aiSet, external, liveAvailable }, metrics, link }`
  - Each AI-set tag carries a `status`: `active` (still in Paperless), `removed` (AI set, since deleted), `unknown` (live fetch failed)
  - Tags currently in Paperless but not set by AI are returned as `external` with status `added_externally`

- **`POST /api/history/:id/rescan`** — new endpoint:
  - Calls `documentModel.deleteDocumentsIdList([id])` (removes from `processed_documents`, `history_documents`, `original_documents`)
  - Returns `{ success: true }` immediately; caller triggers `/api/scan/now` separately

### `views/history.ejs`

- Table column header `Tags` renamed to `AI Info`
- **`#infoModal`** (Bootstrap-compatible) with sections:
  - Header: document title + direct link to Paperless-ngx
  - **Tags**: AI-set tag badges colour-coded by live diff status (green = active, red = removed) + section for externally-added tags (yellow)
  - **Correspondent**: AI-detected value
  - **Custom Fields**: key/value list; shows "No custom fields stored" for pre-migration entries
  - **Processed At**: formatted timestamp
  - **Token Usage**: Prompt / Completion / Total as stat pills; hidden if no metrics available
  - Footer: "Rescan" button (orange) + "Close" button
- **`#toastNotification`** — fixed-position toast for success/error feedback

### `public/js/history.js`

- Tags column replaced by an indigo **Details** button (`fa-circle-info`) that calls `openInfoModal(id)`
- **`openInfoModal(documentId)`** — fetches `/api/history/:id/detail`, renders all sections with colour-coded tag diff badges and safe HTML escaping
- **`rescanDocument(documentId)`** — `POST /api/history/:id/rescan` → fire-and-forget `/api/scan/now` → toast → `table.ajax.reload()`
- **`showToast(message, type)`** — green/red toast, auto-hides after 4 s
- ESC key closes the info modal alongside existing modals
- `_esc(str)` helper — HTML-encodes all user-supplied strings before rendering

## 🧪 Testing

### DB Migration

```bash
# First start after update — should migrate automatically:
# Console: [DB Migration] Running migration v1: Add custom_fields column to history_documents
# Console: [DB Migration] Migration v1 completed successfully

# Subsequent starts:
# Console: [DB Migration] Schema is up to date at v1

# Verify via sqlite3:
sqlite3 data/documents.db "PRAGMA user_version;"
# → 1

sqlite3 data/documents.db ".schema history_documents"
# → custom_fields TEXT DEFAULT '[]' must appear
```

### API Endpoints

```bash
# Detail endpoint (replace <ID> with a real document_id from history):
curl -b "jwt=<token>" http://localhost:3000/api/history/<ID>/detail
# → JSON with success:true, history, tags.aiSet, tags.external, metrics, link

# Rescan endpoint:
curl -X POST -b "jwt=<token>" http://localhost:3000/api/history/<ID>/rescan
# → {"success":true,"message":"..."}
# Document should disappear from /api/history table after reload
```

### UI

1. Open History page → table loads normally
2. **AI Info column** shows indigo "Details" button instead of tag badges
3. Click Details → loading spinner → modal renders with all sections
4. Tag badges show diff colours if Paperless-ngx is reachable
5. Token section hidden for documents processed before metric tracking was added
6. Click "Rescan" → spinner on button → toast appears → modal closes → row removed from table

## 💡 Impact

- **UX**: Cleaner table — no more sprawling tag badge lists; all details on demand
- **Visibility**: Users can now see exactly what the AI detected (tags, correspondent, custom fields, token cost) and compare it with the live state in Paperless-ngx
- **Maintainability**: DB migration system ensures future schema changes roll out safely to all existing installations without manual intervention
- **Custom Fields**: Stored in history from the first processing run after upgrade; older entries show an informative placeholder

## 🔒 Security Notes

- All user-supplied strings rendered in the modal pass through `_esc()` (HTML entity encoding)
- New API endpoints are protected by `isAuthenticated` middleware

## 🔗 Upstream Status

- [ ] Not submitted — this is a fork-specific enhancement
