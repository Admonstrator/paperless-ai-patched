---
title: "DOCKER-001: Docker Image Optimization"
---

Use this page as the canonical template for documenting any new fix.

## Feature / Problem Description

Image size and build characteristics were too heavy for many deployments, resulting in slower pulls and reduced usability.

## Implementation

- Introduced optimized image strategy with clear variant targeting.
- Reduced unnecessary build/runtime components and improved layering.
- Improved Docker build exclusions to lower transfer and storage cost.
- Preserved expected functionality for standard deployment paths.

## Testing

This fix was verified with the standard project checks:

```bash
npm run test
npm run docs:build
```

## Impact

- Operations: Smaller and better-structured images improve build, pull, and deployment efficiency.
- Functionality / UX: Deployment behavior remains consistent while runtime artifacts are optimized.

## Further Links

| Type | Link |
| --- | --- |
| Previous ID | DOCKER-001 |
| Build file | [Dockerfile](https://github.com/admonstrator/paperless-ai-next/blob/main/Dockerfile) |
| Build file | [Dockerfile.lite](https://github.com/admonstrator/paperless-ai-next/blob/main/Dockerfile.lite) |
| Build file | [.dockerignore](https://github.com/admonstrator/paperless-ai-next/blob/main/.dockerignore) |

## Implementation Record

| Field | Value |
| --- | --- |
| ID | NEXT-003 |
| Author | admonstrator |
| Date | 2025-12-03 |
