# Included Fixes & Patches

This directory documents all upstream pull requests, community fixes, and patches that have been integrated into this fork.

## 📋 Structure

Each subdirectory represents an integrated fix with:
- `README.md` - Description, rationale, and status
- `*.patch` - Git patch file (if applicable)
- Test files or related documentation

## 🔄 Integrated Fixes

### Upstream PRs

| PR | Title | Status | Integration Date |
|----|-------|--------|------------------|
| [#772](PR-772-infinite-retry-fix/) | Fix infinite retry loop | ✅ Merged | 2025-12-03 |
| [#747](PR-747-history-cleanup/) | History validation tool | ✅ Merged | 2025-12-03 |

### Performance Optimizations

| ID | Title | Status | Integration Date |
|----|-------|--------|------------------|
| [PERF-001](PERF-001-history-pagination/) | History table SQL pagination & caching | ✅ Applied | 2025-12-03 |
| [PERF-002](PERF-002-tag-caching/) | Centralized tag cache with configurable TTL | ✅ Applied | 2026-02-24 |

### Community Patches

| ID | Title | Status | Integration Date |
|----|-------|--------|------------------|
| [DEP-001](DEP-001-remove-sqlite3/) | Remove unused sqlite3 dependency | ✅ Applied | 2025-12-03 |
| [DOCKER-001](DOCKER-001-optimize-images/) | Docker image optimization | ✅ Applied | 2025-12-03 |
| [DOCKER-002](DOCKER-002-upgrade-nodejs-24-lts/) | Upgrade Node.js to 24 LTS | ✅ Applied | 2025-12-18 |
| [UI-001](UI-001-hide-rag-menu-lite/) | Hide RAG menu in Lite image | ✅ Applied | 2025-12-04 |
| [UI-002](UI-002-date-boolean-custom-fields/) | Add Date/Boolean custom field types to settings UI | ✅ Applied | 2026-02-27 |
| [UI-003](UI-003-history-info-modal/) | History Info-Modal with live tag diff, token stats & Rescan | ✅ Applied | 2026-02-27 |
| [UI-004](UI-004-history-restore-doctype-language/) | History Modal: Restore Original + Document Type & Language | ✅ Applied | 2026-02-27 |
| [UI-005](UI-005-mistral-ocr-queue/) | Mistral OCR Queue für schlecht gescannte Dokumente | ✅ Applied | 2026-02-28 |
| [UI-006](UI-006-ignore-tags-processing/) | Ignore Tags for processing exclusion and statistics cleanup | ✅ Applied | 2026-02-28 |
| [CI-001](CI-001-auto-version-tagging/) | Automatic version tagging for builds | ✅ Applied | 2025-12-04 |
| [SEC-001](SEC-001-ssrf-code-injection/) | SSRF & Code Injection Fixes | ✅ Applied | 2025-12-03 |
| [SEC-002](SEC-002-urllib3-cve-2026-21441/) | Fix urllib3 decompression-bomb (CVE-2026-21441) | ✅ Applied | 2026-01-09 |
| [SEC-003](SEC-003-global-rate-limiting/) | Global rate-limiting for API and streaming endpoints | ✅ Applied | 2026-02-25 |

## 🚀 How to Use

Each fix directory contains:
1. **Background** - Why this fix was needed
2. **Changes** - What was modified
3. **Testing** - How to verify the fix
4. **Upstream Status** - Whether it's been merged upstream

## 📝 Adding New Fixes

When integrating a new fix:
1. Create a new directory: `PR-XXX-short-name/` or `PATCH-XXX-short-name/`
2. Add `README.md` with fix details
3. Optionally add `.patch` file: `git format-patch -1 <commit-hash>`
4. Update this table

## 🔗 Links

- **Upstream Repository**: [clusterzx/paperless-ai](https://github.com/clusterzx/paperless-ai)
- **Upstream PRs**: [Pull Requests](https://github.com/clusterzx/paperless-ai/pulls)
- **Our Issues**: [Fork Issues](https://github.com/Admonstrator/paperless-ai-next/issues)
