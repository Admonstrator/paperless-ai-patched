---
title: "Changelog"
---


All improvements and fixes included in this fork, compared to [clusterzx/paperless-ai](https://github.com/clusterzx/paperless-ai).

---

## Bug Fixes

| ID | What was fixed | Date |
| --- | --- | --- |
| [NEXT-008](fixes/next-008-infinite-retry-fix/) | Documents that couldn't be processed were retried indefinitely, blocking the queue | 2025-12-03 |
| [NEXT-007](fixes/next-007-history-cleanup/) | Added a history validation tool to detect and clean up inconsistent entries | 2025-12-03 |

---

## Performance

| ID | What changed | Impact | Date |
| --- | --- | --- | --- |
| [NEXT-005](fixes/next-005-history-pagination/) | History page now uses database-level pagination | Much faster with many documents | 2025-12-03 |
| [NEXT-006](fixes/next-006-tag-caching/) | Tag list is cached for 5 minutes instead of fetched every time | ~95% fewer API calls to Paperless-ngx | 2026-02-24 |

---

## Security

| ID | What was fixed | Date |
| --- | --- | --- |
| [NEXT-009](fixes/next-009-ssrf-code-injection/) | Prevented SSRF attacks and code injection through untrusted input | 2025-12-03 |
| [NEXT-010](fixes/next-010-urllib3-cve-2026-21441/) | Fixed urllib3 decompression-bomb vulnerability (CVE-2026-21441) | 2026-01-09 |
| [NEXT-011](fixes/next-011-global-rate-limiting/) | Added rate limiting to all API and streaming endpoints | 2026-02-25 |

---

## User Interface

| ID | What was added | Date |
| --- | --- | --- |
| [NEXT-012](fixes/next-012-hide-rag-menu-lite/) | RAG / AI Chat menu is hidden in the Lite image (where the feature isn't available) | 2025-12-04 |
| [NEXT-013](fixes/next-013-date-boolean-custom-fields/) | Date and Boolean field types are now available in the settings UI | 2026-02-27 |
| [NEXT-014](fixes/next-014-history-info-modal/) | History entries now show a detail modal with tag changes, token usage, and a Rescan button | 2026-02-27 |
| [NEXT-015](fixes/next-015-history-restore-doctype-language/) | History modal: restore original metadata, including document type and language | 2026-02-27 |
| [NEXT-016](fixes/next-016-mistral-ocr-queue/) | New Mistral OCR queue for documents that were poorly scanned | 2026-02-28 |
| [NEXT-017](fixes/next-017-ignore-tags-processing/) | Added ignore-tags filtering for regular scans and adjusted dashboard totals accordingly | 2026-02-28 |
| [NEXT-018](fixes/next-018-terminal-failed-queue/) | Added permanently failed queue with manual reset after AI/OCR hard failures | 2026-02-28 |

---

## Infrastructure

| ID | What changed | Date |
| --- | --- | --- |
| [NEXT-003](fixes/next-003-optimize-images/) | Smaller and faster Docker images | 2025-12-03 |
| [NEXT-004](fixes/next-004-upgrade-nodejs-24-lts/) | Upgraded to Node.js 24 LTS | 2025-12-18 |
| [NEXT-002](fixes/next-002-remove-sqlite3/) | Removed unused `sqlite3` dependency | 2025-12-03 |
| [NEXT-001](fixes/next-001-auto-version-tagging/) | Automatic version tagging in CI/CD builds | 2025-12-04 |

---

> Click any fix ID to see the full technical details.
