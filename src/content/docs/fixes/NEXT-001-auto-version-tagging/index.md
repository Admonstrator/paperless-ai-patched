---
title: "CI-001: Automatic Version Tagging for Docker Builds"
---

Use this page as the canonical template for documenting any new fix.

## Feature / Problem Description

Docker build workflows required manual version tags for each run. This introduced release friction and increased the risk of inconsistent tagging.

## Implementation

- Added automated version generation in CI based on base version and existing tags.
- Integrated generated version into Docker build and publish workflows.
- Removed manual version tag entry as a required release step.
- Kept deterministic tag format for reliable traceability.

## Testing

This fix was verified with the standard project checks:

```bash
npm run test
npm run docs:build
```

## Impact

- Operations: CI tagging is automated and consistent, reducing manual release work and mismatch risk.
- Functionality / UX: Build and publish workflows remain predictable with deterministic version output.

## Further Links

| Type | Link |
| --- | --- |
| Previous ID | CI-001 |
| Workflow file | [.github/workflows/docker-build-push.yml](https://github.com/admonstrator/paperless-ai-next/blob/main/.github/workflows/docker-build-push.yml) |
| Workflow file | [.github/workflows/docker-ghcr.yml](https://github.com/admonstrator/paperless-ai-next/blob/main/.github/workflows/docker-ghcr.yml) |

## Implementation Record

| Field | Value |
| --- | --- |
| ID | NEXT-001 |
| Author | admonstrator |
| Date | 2025-12-04 |
