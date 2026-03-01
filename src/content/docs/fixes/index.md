---
title: "Included Fixes & Patches"
---


This directory documents all upstream pull requests, community fixes, and patches that have been integrated into this fork.

## 📋 Structure

Each subdirectory represents an integrated fix with:

- `index.md` - Description, rationale, and status
- Test files or related documentation

## 🔄 Integrated Fixes

### Historical Integrations

| ID | Title | Status | Integration Date |
| --- | --- | --- | --- |
| [NEXT-007](next-007-history-cleanup/) | History validation tool | ✅ Applied | 2025-12-03 |
| [NEXT-008](next-008-infinite-retry-fix/) | Prevent infinite retry loop | ✅ Applied | 2025-12-03 |

### Performance Optimizations

| ID | Title | Status | Integration Date |
| --- | --- | --- | --- |
| [NEXT-005](next-005-history-pagination/) | History table SQL pagination & caching | ✅ Applied | 2025-12-03 |
| [NEXT-006](next-006-tag-caching/) | Centralized tag cache with configurable TTL | ✅ Applied | 2026-02-24 |

### Community Patches

| ID | Title | Status | Integration Date |
| --- | --- | --- | --- |
| [NEXT-001](next-001-auto-version-tagging/) | Automatic version tagging for builds | ✅ Applied | 2025-12-04 |
| [NEXT-002](next-002-remove-sqlite3/) | Remove unused sqlite3 dependency | ✅ Applied | 2025-12-03 |
| [NEXT-003](next-003-optimize-images/) | Docker image optimization | ✅ Applied | 2025-12-03 |
| [NEXT-004](next-004-upgrade-nodejs-24-lts/) | Upgrade Node.js to 24 LTS | ✅ Applied | 2025-12-18 |
| [NEXT-009](next-009-ssrf-code-injection/) | SSRF and code injection hardening | ✅ Applied | 2025-12-03 |
| [NEXT-010](next-010-urllib3-cve-2026-21441/) | Fix urllib3 decompression-bomb (CVE-2026-21441) | ✅ Applied | 2026-01-09 |
| [NEXT-011](next-011-global-rate-limiting/) | Global rate-limiting for API and streaming endpoints | ✅ Applied | 2026-02-25 |
| [NEXT-012](next-012-hide-rag-menu-lite/) | Hide RAG menu in Lite image | ✅ Applied | 2025-12-04 |
| [NEXT-013](next-013-date-boolean-custom-fields/) | Add Date/Boolean custom field types to settings UI | ✅ Applied | 2026-02-27 |
| [NEXT-014](next-014-history-info-modal/) | History info modal with detailed AI insights and rescan | ✅ Applied | 2026-02-27 |
| [NEXT-015](next-015-history-restore-doctype-language/) | Restore original metadata, document type, and language | ✅ Applied | 2026-02-27 |
| [NEXT-016](next-016-mistral-ocr-queue/) | Mistral OCR queue for low-quality scans | ✅ Applied | 2026-02-28 |
| [NEXT-017](next-017-ignore-tags-processing/) | Ignore tags for processing exclusion and statistics cleanup | ✅ Applied | 2026-02-28 |
| [NEXT-018](next-018-terminal-failed-queue/) | Permanently failed queue with reset flow for AI/OCR failures | ✅ Applied | 2026-02-28 |

## 🚀 How to Use

Each fix directory contains:

1. **Background** - Why this fix was needed
2. **Changes** - What was modified
3. **Testing** - How to verify the fix
4. **Upstream Status** - Whether it's been merged upstream

## 📝 Adding New Fixes

When integrating a new fix:

1. Use the new ID scheme: `NEXT-000-short-name/`
2. Add `index.md` with fix details
3. Optionally add `.patch` file: `git format-patch -1 <commit-hash>`
4. Update this table

Use this template to start quickly:

- [`NEXT-000 Template`](next-000-template/)

## 🔗 Links

- **Upstream Repository**: [clusterzx/paperless-ai](https://github.com/clusterzx/paperless-ai)
- **Upstream PRs**: [Pull Requests](https://github.com/clusterzx/paperless-ai/pulls)
- **Our Issues**: [Fork Issues](https://github.com/admonstrator/paperless-ai-next/issues)
