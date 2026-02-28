# Changelog

All improvements and fixes included in this fork, compared to [clusterzx/paperless-ai](https://github.com/clusterzx/paperless-ai).

---

## Bug Fixes

| ID | What was fixed | Date |
|----|----------------|------|
| [PR-772](fixes/PR-772-infinite-retry-fix/README.md) | Documents that couldn't be processed were retried indefinitely, blocking the queue | 2025-12-03 |
| [PR-747](fixes/PR-747-history-cleanup/README.md) | Added a history validation tool to detect and clean up inconsistent entries | 2025-12-03 |

---

## Performance

| ID | What changed | Impact | Date |
|----|--------------|--------|------|
| [PERF-001](fixes/PERF-001-history-pagination/README.md) | History page now uses database-level pagination | Much faster with many documents | 2025-12-03 |
| [PERF-002](fixes/PERF-002-tag-caching/README.md) | Tag list is cached for 5 minutes instead of fetched every time | ~95% fewer API calls to Paperless-ngx | 2026-02-24 |

---

## Security

| ID | What was fixed | Date |
|----|----------------|------|
| [SEC-001](fixes/SEC-001-ssrf-code-injection/README.md) | Prevented SSRF attacks and code injection through untrusted input | 2025-12-03 |
| [SEC-002](fixes/SEC-002-urllib3-cve-2026-21441/README.md) | Fixed urllib3 decompression-bomb vulnerability (CVE-2026-21441) | 2026-01-09 |
| [SEC-003](fixes/SEC-003-global-rate-limiting/README.md) | Added rate limiting to all API and streaming endpoints | 2026-02-25 |

---

## User Interface

| ID | What was added | Date |
|----|----------------|------|
| [UI-001](fixes/UI-001-hide-rag-menu-lite/README.md) | RAG / AI Chat menu is hidden in the Lite image (where the feature isn't available) | 2025-12-04 |
| [UI-002](fixes/UI-002-date-boolean-custom-fields/README.md) | Date and Boolean field types are now available in the settings UI | 2026-02-27 |
| [UI-003](fixes/UI-003-history-info-modal/README.md) | History entries now show a detail modal with tag changes, token usage, and a Rescan button | 2026-02-27 |
| [UI-004](fixes/UI-004-history-restore-doctype-language/README.md) | History modal: restore original metadata, including document type and language | 2026-02-27 |
| [UI-005](fixes/UI-005-mistral-ocr-queue/README.md) | New Mistral OCR queue for documents that were poorly scanned | 2026-02-28 |
| [UI-006](fixes/UI-006-ignore-tags-processing/README.md) | Added ignore-tags filtering for regular scans and adjusted dashboard totals accordingly | 2026-02-28 |

---

## Infrastructure

| ID | What changed | Date |
|----|--------------|------|
| [DOCKER-001](fixes/DOCKER-001-optimize-images/README.md) | Smaller and faster Docker images | 2025-12-03 |
| [DOCKER-002](fixes/DOCKER-002-upgrade-nodejs-24-lts/README.md) | Upgraded to Node.js 24 LTS | 2025-12-18 |
| [DEP-001](fixes/DEP-001-remove-sqlite3/README.md) | Removed unused `sqlite3` dependency | 2025-12-03 |
| [CI-001](fixes/CI-001-auto-version-tagging/README.md) | Automatic version tagging in CI/CD builds | 2025-12-04 |

---

> Click any fix ID to see the full technical details.
