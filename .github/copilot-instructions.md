# Copilot Instructions for Paperless-AI next

## Project Context
Community fork of [clusterzx/paperless-ai](https://github.com/clusterzx/paperless-ai) - an AI-powered document processing extension for Paperless-ngx. This fork focuses on integration testing, performance optimizations, and Docker improvements. Core development credit belongs to the upstream project.

## Architecture

### Dual Runtime System
- **Node.js (Express)**: Main API server, document processing, UI (`server.js`)
- **Python (FastAPI)**: Optional RAG service for semantic search (`main.py`)
- **Startup**: `start-services.sh` launches both with PM2 + uvicorn
- **Database**: better-sqlite3 with WAL mode (`models/document.js`)

### Service Layer Pattern
All services follow singleton pattern: `class ServiceName { ... }; module.exports = new ServiceName();`

**AI Provider Factory** (`services/aiServiceFactory.js`):
- Returns appropriate service based on `config.aiProvider` (openai|ollama|custom|azure)
- All AI services must implement: `analyzeDocument(content, doc, existingTags, correspondents)`
- Use `RestrictionPromptService.processRestrictionsInPrompt()` for placeholder replacement (`%RESTRICTED_TAGS%`, `%RESTRICTED_CORRESPONDENTS%`)

**Token Management** (`services/serviceUtils.js`):
- `calculateTokens(text, model)` - Uses tiktoken for OpenAI models, character estimation (÷4) for others
- `truncateToTokenLimit(text, maxTokens, model)` - Smart truncation with safety buffer

### Configuration System
All config loads from `data/.env` via `config/config.js`. Key patterns:
- Boolean parsing: `parseEnvBoolean(value, defaultValue)` - handles 'yes'/'no', 'true'/'false', '1'/'0'
- Feature toggles: `activateTagging`, `activateCorrespondents`, etc.
- AI restrictions: `restrictToExistingTags`, `restrictToExistingCorrespondents`

### Database Schema
5 key tables in `data/documents.db` (see `models/document.js`):
- `processed_documents` - Tracks processed docs (document_id, title)
- `history_documents` - UI history with pagination support
- `openai_metrics` - Token usage tracking
- `original_documents` - Pre-AI metadata snapshot
- `users` - Authentication (bcryptjs passwords)

**Performance Pattern**: Use prepared statements for all queries. History pagination uses SQL `LIMIT/OFFSET`, not in-memory filtering.

## Critical Workflows

### Document Processing Flow
1. `node-cron` triggers scan based on `config.scanInterval` (cron format)
2. `scanDocuments()` fetches from Paperless-ngx API
3. Retry tracking: `retryTracker` Map prevents infinite loops (max 3 attempts)
4. Content validation: Documents need ≥ `MIN_CONTENT_LENGTH` chars (default: 10)
5. **Tag filtering**: If `PROCESS_PREDEFINED_DOCUMENTS=yes`, only process docs with tags matching `TAGS` env var
6. AI service processes via factory pattern
7. Results posted back to Paperless-ngx via `paperlessService.updateDocument()`

**Key Files**: `server.js` lines 150-400, `services/paperlessService.js`

### RAG Service Integration
- Python service runs on port 8000 (configurable via `RAG_SERVICE_URL`)
- Node.js proxies requests through `services/ragService.js`
- Embeddings: sentence-transformers with ChromaDB vector store
- Hybrid search: BM25 (keyword) + semantic embeddings, weighted 30/70
- **Important**: RAG endpoints check `RAG_SERVICE_ENABLED` before proxying

### Authentication & Security
- JWT stored in cookies (`jwt` cookie name)
- API key support via `x-api-key` header
- Middleware: `isAuthenticated` checks both JWT and API key
- Protected routes use `protectApiRoute` middleware
- **Pattern**: All `/api/*` routes require authentication, including `/api-docs`

### Server-Side Pagination (PERF-001)
History table uses SQL-based pagination instead of loading all records:
```javascript
// In routes/setup.js - /api/history endpoint
const { start, length, search, order } = req.query; // DataTables params
// Use getPaginatedHistoryDocuments() with LIMIT/OFFSET
```
Tag caching with 5-minute TTL reduces Paperless-ngx API calls by ~95%.

## Development Commands

```bash
# Local development (auto-reload)
npm run test  # Uses nodemon

# Python RAG service
source venv/bin/activate
python main.py --host 127.0.0.1 --port 8000

# Production (Docker uses this)
pm2 start ecosystem.config.js

# Database inspection
sqlite3 data/documents.db "SELECT * FROM processed_documents LIMIT 5;"
```

## Code Conventions

### Language Requirement (MANDATORY)
- English only across the project.
- All source code comments, commit messages, pull requests, issue templates, documentation, UI labels, and user-facing text must be written in English.
- Do not introduce German or mixed-language content in any repository file.

### Error Handling
- Always log to both `htmlLogger` and `txtLogger` for user-facing operations
- Use try-catch in all async routes
- Return meaningful HTTP status codes (400 for validation, 500 for server errors)

### Frontend Integration
- EJS templates in `views/` (no framework)
- DataTables for server-side pagination - expects `{data, recordsTotal, recordsFiltered}` response format
- SSE for progress: Set `X-Accel-Buffering: no` header and call `res.flush()` after each write
- Dark mode: Uses `data-theme` attribute + CSS variables (see `public/css/dashboard.css`)

### API Response Patterns
```javascript
// Success
res.json({ success: true, data: {...}, message: 'Optional' });

// Error
res.status(400).json({ success: false, error: 'Message' });

// SSE Progress
res.writeHead(200, { 'Content-Type': 'text/event-stream', 'X-Accel-Buffering': 'no' });
res.write(`data: ${JSON.stringify({ progress: 50, message: 'Processing...' })}\n\n`);
res.flush();
```

## Testing & Debugging

### Key Test Files
- `tests/test-pr772-fix.js` - Retry logic validation
- `tests/test-restriction-service.js` - Placeholder replacement
- History validation: `/api/history/validate` endpoint (SSE-based)

### Common Issues
1. **Infinite retry loops**: Check `retryTracker` Map, max 3 attempts (PR-772)
2. **Slow history page**: Verify SQL pagination is used, not `getHistoryDocuments()` (PERF-001)
3. **RAG not working**: Check `RAG_SERVICE_ENABLED=true` and Python service is running
4. **Dark mode images**: Add `class="no-invert"` to images that shouldn't be inverted

## Fix Documentation & Workflow

### Documentation Pattern
All integrated fixes live in `src/content/docs/fixes/` with pattern: `NEXT-NNN-short-name/index.md`.
Use `src/content/docs/fixes/NEXT-000-template/index.md` as the canonical template for new entries.

### Change Workflow (IMPORTANT)
**Every change MUST follow this process:**

1. **Create Feature Branch**
   ```bash
   # Pattern: {type}-{number}-{short-description}
   git checkout -b docs-001-next-template
   git checkout -b next-123-improve-history-modal
   git checkout -b next-124-add-new-feature-docs
   ```

2. **Implement Changes**
   - Make code modifications
   - Test thoroughly
   - Commit with descriptive messages

3. **Document the fix**

   Create `src/content/docs/fixes/NEXT-{NNN}-{name}/index.md`:
   ```bash
   mkdir -p src/content/docs/fixes/NEXT-{NNN}-{name}/
   ```

   Structure:
   - **Background**: Why this fix was needed
   - **Changes**: What was modified (file-by-file if complex)
   - **Testing**: How to verify the fix
   - **Impact**: Performance/security/functionality improvements
   - **Upstream Status**: Link to upstream PR if applicable

   See existing fixes for reference:
   - `src/content/docs/fixes/NEXT-000-template/index.md`

4. **Update `src/content/docs/fixes/index.md`**
   - Add entry to the overview table
   - Include fix ID, title, status (✅ Applied), and integration date

5. **Update `src/content/docs/changelog.md`**
   - Add a row to the appropriate table section
   - Format: `| FIX-ID (fixes/NEXT-{NNN}-{name}/) | Description | Date |`
   - Keep Starlight sidebar/autogeneration consistent with folder structure under `src/content/docs/fixes/`
   - **The root `README.md` does NOT contain a fixes table** — it links to the Docs site

6. **Commit Documentation**
   ```bash
   git add src/content/docs/
   git commit -m "docs: document NEXT-{NNN} fix"
   ```

7. **Create Pull Request**
   - Title: `[NEXT-{NNN}] Short description`
   - Link to upstream PR if applicable
   - Reference any related issues

### Fix Type Prefixes
- `NEXT-XXX` - Standardized ID format for all new fix and feature documentation entries

### Example Fix Documentation Structure
```markdown
# NEXT-{NNN}: Short Title

## Background
Explain the problem, bug, or optimization opportunity.

## Changes
- `file1.js`: Modified function X to handle Y
- `file2.js`: Added validation for Z
- `config/config.js`: New environment variable FEATURE_ENABLED

## Testing
\`\`\`bash
npm run test
# OR
node tests/test-new-feature.js
\`\`\`

## Impact
- Performance: 50% faster queries
- Security: Prevents SSRF attacks
- Functionality: Supports new AI provider

## Upstream Status
- [ ] Not submitted
- [ ] PR opened: [#XXX](https://github.com/clusterzx/paperless-ai/pull/XXX)
- [x] Merged upstream
- [ ] Upstream declined (reason)
```

## Documentation Site

This project uses **Astro + Starlight** for user-facing documentation, deployed to GitHub Pages via `.github/workflows/deploy-docs.yml`.

### Structure
- `src/content/docs/index.mdx` – Landing page (About + Features)
- `src/content/docs/getting-started/` – Installation, First Setup, Configuration
- `src/content/docs/features/` – Auto-tagging, AI Chat, Manual Tagging, OCR Queue, History
- `src/content/docs/fixes/` – One subdirectory per fix (`NEXT-NNN-name/index.md`) plus `index.md` overview table
- `src/content/docs/how-it-works.md` – Simple "How it works" overview
- `src/content/docs/changelog.md` – Compact table of all fixes, links to `src/content/docs/fixes/` pages
- `src/content/docs/contributing.md` – Contribution guide
- `src/content/docs/security.md` – Security policy and fixed vulnerabilities
- `astro.config.mjs` – Starlight site config (sidebar, integrations, branding)

### Local Preview
```bash
npm ci
npm run docs:dev        # → http://localhost:4321
npm run docs:build      # CI check
```

### Single Source of Truth Rules
- `src/content/docs/fixes/*/index.md` = authoritative fix record
- `src/content/docs/fixes/index.md` = the fixes overview table
- `src/content/docs/changelog.md` = compact user-facing overview with links to fix pages
- Root `README.md` = minimal (~80 lines): badges, Quick Start Docker Compose, link to Docs site

> For comprehensive architecture details, API reference and configuration options see the live Docs site at `https://paperless-ai-next.admon.me/` or run `npm run docs:dev` locally.
