---
title: "Changelog"
---


All improvements and fixes included in this fork, compared to clusterzx/paperless-ai.

---

## Bug Fixes

| ID | What was fixed | Date |
| --- | --- | --- |
| NEXT-008 | Documents that couldn't be processed were retried indefinitely, blocking the queue | 2025-12-03 |
| NEXT-007 | Added a history validation tool to detect and clean up inconsistent entries | 2025-12-03 |

---

## Performance

| ID | What changed | Impact | Date |
| --- | --- | --- | --- |
| NEXT-005 | History page now uses database-level pagination | Much faster with many documents | 2025-12-03 |
| NEXT-006 | Tag list is cached for 5 minutes instead of fetched every time | ~95% fewer API calls to Paperless-ngx | 2026-02-24 |

---

## Security

| ID | What was fixed | Date |
| --- | --- | --- |
| NEXT-009 | Prevented SSRF attacks and code injection through untrusted input | 2025-12-03 |
| NEXT-010 | Fixed urllib3 decompression-bomb vulnerability (CVE-2026-21441) | 2026-01-09 |
| NEXT-011 | Added rate limiting to all API and streaming endpoints | 2026-02-25 |

---

## User Interface

| ID | What was added | Date |
| --- | --- | --- |
| NEXT-012 | RAG / AI Chat menu is hidden in the Lite image (where the feature isn't available) | 2025-12-04 |
| NEXT-013 | Date and Boolean field types are now available in the settings UI | 2026-02-27 |
| NEXT-014 | History entries now show a detail modal with tag changes, token usage, and a Rescan button | 2026-02-27 |
| NEXT-015 | History modal: restore original metadata, including document type and language | 2026-02-27 |
| NEXT-016 | New Mistral OCR queue for documents that were poorly scanned | 2026-02-28 |
| NEXT-017 | Added ignore-tags filtering for regular scans and adjusted dashboard totals accordingly | 2026-02-28 |
| NEXT-018 | Added permanently failed queue with manual reset after AI/OCR hard failures | 2026-02-28 |
| NEXT-019 | Reworked settings into System/AI/OCR/Troubleshooting tabs with runtime ENV hints and extended config coverage | 2026-03-01 |
| NEXT-020 | Added public Paperless URL discovery plus optional `PAPERLESS_PUBLIC_URL` override for reliable external document links | 2026-03-01 |
| NEXT-021 | Document Chat now supports searchable document selection with API-backed filtering and faster initial page load | 2026-03-04 |
| NEXT-022 | Rebuilt initial setup as a login-style multi-step installer with MFA onboarding, Paperless/AI test gates, metadata/tag selection, and docker-compose env preview | 2026-03-07 |

---

## Infrastructure

| ID | What changed | Date |
| --- | --- | --- |
| NEXT-023 | Added unified `LOG_LEVEL` control and reduced noisy AI processing logs with scan summary reporting | 2026-03-15 |
| NEXT-003 | Smaller and faster Docker images | 2025-12-03 |
| NEXT-004 | Upgraded to Node.js 24 LTS | 2025-12-18 |
| NEXT-002 | Removed unused `sqlite3` dependency | 2025-12-03 |
| NEXT-001 | Automatic version tagging in CI/CD builds | 2025-12-04 |