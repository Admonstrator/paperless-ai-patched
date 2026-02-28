# UI-005: Mistral OCR Queue for Poorly Scanned Documents

## 📌 Overview

**Type**: New Feature – UI + Backend + Service  
**Status**: ✅ Applied  
**Integration Date**: 2026-02-28  
**Upstream Status**: ⏳ Not submitted (fork-specific)

## 🐛 Problem

Paperless-ngx uses OCR to extract text from scanned documents. When scan quality is poor (e.g. carbon copies, skewed pages, low resolution), Paperless produces no or barely usable OCR text — the `content` field is empty or below the minimum length threshold.

In that case the AI analysis silently aborts — the document is skipped (`return null`) and stays unprocessed indefinitely. There is no indication for the user that a document is permanently stuck.

This caused two problems:

1. **No visibility** – Documents with insufficient OCR text disappear silently during the scan cycle without any queue entry or log message.
2. **No recovery path** – There was no mechanism to extract OCR text for such documents after the fact and re-trigger the normal AI pipeline.

## ✅ Solution

Integration of the **Mistral OCR API** (`mistral-ocr-latest`) as an optional post-processing step:

1. Documents with too little OCR text (`content < MIN_CONTENT_LENGTH`) or a failed AI analysis (`Insufficient content`) are automatically added to a new **`ocr_queue` database table**.
2. Documents can also be **added manually by document ID**.
3. A new **"OCR Queue" tab** in the web UI shows the queue with status, reason, and action buttons.
4. Clicking "Process" downloads the PDF, sends it to the Mistral OCR API, attempts to write the extracted text back to Paperless-ngx via PATCH (fallback: stored locally), and optionally triggers the full AI pipeline.
5. Progress is streamed in real time via **Server-Sent Events (SSE)**.

## 📝 Changes

### `models/document.js`

- **Migration v3** – Creates the `ocr_queue` table:
  ```sql
  CREATE TABLE IF NOT EXISTS ocr_queue (
    id INTEGER PRIMARY KEY,
    document_id INTEGER UNIQUE,
    title TEXT,
    reason TEXT DEFAULT 'manual',   -- 'short_content' | 'ai_failed' | 'manual'
    status TEXT DEFAULT 'pending',  -- 'pending' | 'processing' | 'done' | 'failed'
    ocr_text TEXT DEFAULT NULL,
    added_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    processed_at DATETIME DEFAULT NULL
  )
  ```
- New methods: `addToOcrQueue()`, `getOcrQueue()`, `getOcrQueuePaginated()`, `getOcrQueueItem()`, `updateOcrQueueStatus()`, `removeFromOcrQueue()`, `getOcrQueueCount()`

### `services/mistralOcrService.js` *(new)*

Singleton service encapsulating the full OCR pipeline:

- `downloadDocumentAsBase64(documentId)` – Downloads the document via `PaperlessService.client` as an ArrayBuffer and converts it to base64
- `performOcr(base64, mimeType)` – POSTs to `https://api.mistral.ai/v1/ocr` using model `mistral-ocr-latest`; concatenates all `pages[].markdown` fields into a single string
- `writeBackContent(documentId, ocrText)` – PATCHes `/documents/{id}/` with `{content: ocrText}`; falls back to storing the text locally in the queue's `ocr_text` field on HTTP error
- `processQueueItem(documentId, opts)` – Orchestrates the full flow including optional AI analysis; emits progress events via a callback
- `_runAiAnalysis(documentId, ocrText)` – Mirrors the `processDocument` pipeline from `server.js` but uses the locally available OCR text instead of fetching content from Paperless

### `config/config.js`

New `mistralOcr` block:
```javascript
mistralOcr: {
  enabled: parseEnvBoolean(process.env.MISTRAL_OCR_ENABLED, 'no'),
  apiKey: process.env.MISTRAL_API_KEY || '',
  model: process.env.MISTRAL_OCR_MODEL || 'mistral-ocr-latest'
}
```

### `server.js`

- Imports `mistralOcrService`
- **Trigger 1** when `content < MIN_CONTENT_LENGTH`: calls `addToOcrQueue(doc.id, doc.title, 'short_content')` (only if OCR is enabled)
- **Trigger 2** after a failed AI analysis with `'Insufficient content for AI analysis'`: calls `addToOcrQueue(doc.id, doc.title, 'ai_failed')`

### `routes/setup.js`

New routes:

| Route | Auth | Description |
|---|---|---|
| `GET /ocr` | `protectApiRoute` | Render OCR queue page |
| `GET /api/ocr/queue` | `isAuthenticated` | Paginated queue list (DataTables-compatible) |
| `POST /api/ocr/queue/add` | `isAuthenticated` | Add a document manually |
| `DELETE /api/ocr/queue/:id` | `isAuthenticated` | Remove from queue |
| `POST /api/ocr/process/:id` | `isAuthenticated` | Process a single document (SSE) |
| `POST /api/ocr/process-all` | `isAuthenticated` | Process all pending items (SSE) |
| `GET /api/ocr/stats` | `isAuthenticated` | Queue statistics (pending/done/failed counts) |

### `views/ocr.ejs` *(new)*

Full EJS page using the existing design system:
- Sidebar with active "OCR Queue" entry (`/ocr`, icon `fa-eye`)
- Status badges (pending/processing/done/failed) with dark mode support
- Toolbar: manual document ID input, status filter, "AI analysis after OCR" toggle, "Process All Pending" button
- Table: Doc ID (linked to Paperless-ngx), title, reason, status, date added, action buttons
- SSE progress overlay with color-coded log output and progress bar
- Informational banner when the feature is disabled (including configuration instructions)

### `public/js/ocr.js` *(new)*

Frontend logic:
- Load, paginate, and filter the queue
- SSE via `fetch` + `ReadableStream` (native `EventSource` is not used as it does not support POST requests)
- Real-time log output per SSE event
- Toast notifications for add/remove operations

### Views (sidebar update)

`/ocr` link inserted between History and Settings in all 6 views:
`dashboard.ejs`, `chat.ejs`, `history.ejs`, `playground.ejs`, `manual.ejs`, `settings.ejs`

### `docker-compose.yml`

Commented-out example configuration:
```yaml
# - MISTRAL_OCR_ENABLED=yes
# - MISTRAL_API_KEY=your_key_here
# - MISTRAL_OCR_MODEL=mistral-ocr-latest
```

## ⚙️ Configuration

Add the following variables to `data/.env`:

```env
MISTRAL_OCR_ENABLED=yes
MISTRAL_API_KEY=your_key_here
MISTRAL_OCR_MODEL=mistral-ocr-latest    # optional, default: mistral-ocr-latest
```

Obtain an API key at [console.mistral.ai](https://console.mistral.ai).

> **Note**: `MISTRAL_API_KEY` is completely independent from `OPENAI_API_KEY` or any other AI provider key.

## 🧪 Testing

```bash
# 1. Enable the feature
echo "MISTRAL_OCR_ENABLED=yes" >> data/.env
echo "MISTRAL_API_KEY=sk-..." >> data/.env

# 2. Restart the app
npm run test

# 3. Add a document with empty content to Paperless-ngx
#    → It will appear in the OCR queue automatically on the next scan

# 4. Open the OCR Queue page
# http://localhost:3000/ocr

# 5. Add a document manually by ID and click "Process"
#    → The SSE log shows: Download → OCR → Write-back → (optional) AI analysis
```

## 📊 Impact

- **New functionality**: Documents with missing or incomplete OCR text can now be fully re-processed
- **Visibility**: All previously unprocessable documents are now visible in the UI instead of being silently skipped
- **No breaking change**: The feature is fully disabled by default (`MISTRAL_OCR_ENABLED=no`); existing installations are unaffected
- **DB migration**: Applied automatically via the migration system (v3); no manual database action required
- **Paperless write-back**: A PATCH of the `content` field is attempted first; if Paperless rejects it, the OCR text is stored locally in the queue DB and used for AI analysis from there

## 🔗 Upstream Status

- [ ] Not submitted (fork-specific feature)
