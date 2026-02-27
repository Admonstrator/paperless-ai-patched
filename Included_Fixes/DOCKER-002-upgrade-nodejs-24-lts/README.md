# DOCKER-002: Upgrade Node.js from 23 to 24 LTS

## Background
This fix upgrades the Node.js base images in our Dockerfiles from version 23 to version 24 LTS ("Krypton"). Node.js 23 is a "Current" release with a shorter support cycle, while Node.js 24 is the active Long-Term Support (LTS) version with extended maintenance until April 2027.

The upgrade ensures better long-term stability, production readiness, and aligns with Node.js best practices for enterprise deployments.

## Changes

### Modified Files:
- `Dockerfile`: Updated both Node.js build stage and runtime stage
  - Line 27: `FROM node:23-slim AS node-builder` → `FROM node:24-slim AS node-builder`
  - Line 35: `FROM node:23-slim` → `FROM node:24-slim`
- `Dockerfile.lite`: Updated base image
  - Line 2: `FROM node:23-slim` → `FROM node:24-slim`

### Key Differences:
| Aspect | Node.js 23 | Node.js 24 LTS |
|--------|------------|----------------|
| Release Type | Current | Long-Term Support |
| Support Until | June 2025 | April 2027 |
| Production Ready | Yes | Yes (Preferred) |
| V8 Engine | 13.0+ | 13.6 |
| Active LTS Phase | N/A | Until October 2025 |

## Testing

### Compatibility Verification
All critical dependencies verified as Node.js 24 compatible:
```bash
npm view express engines.node
# Output: >= 18

npm view openai engines.node  
# Output: 20.x || 22.x || 23.x || 24.x || 25.x

npm view better-sqlite3 engines.node
# No engine restrictions

npm view axios engines.node
# Output: >= 12
```

### Build Testing
```bash
# Test main Dockerfile build
docker build -t paperless-ai-patched:test .

# Test lite version build
docker build -f Dockerfile.lite -t paperless-ai-patched:lite-test .

# Verify Node.js version in images
docker run --rm paperless-ai-patched:test node --version
# Expected output: v24.x.x

# Run basic functionality test
docker run --rm -e PAPERLESS_AI_PORT=3000 paperless-ai-patched:test npm --version
```

### Runtime Verification
```bash
# Start container and check health
docker-compose up -d
docker-compose logs -f

# Verify no compatibility errors in logs
# Test document processing workflow
# Confirm AI services work correctly
```

## Impact

### Benefits:
- ✅ **Extended Support**: Maintenance until April 2027 (vs June 2025)
- ✅ **Production Stability**: LTS branch receives more testing and bugfixes
- ✅ **Security Updates**: Longer security patch window
- ✅ **V8 13.6**: Latest stable JavaScript engine features
- ✅ **Explicit Compatibility**: OpenAI SDK officially supports Node.js 24

### Performance:
- No significant performance differences expected
- V8 13.6 includes minor optimizations
- Same npm version (11.6.2)

### Breaking Changes:
- ❌ **None affecting our codebase**: All SEMVER-MAJOR changes in Node.js 24 are internal V8/C++ API updates
- ❌ **No code modifications needed**: Pure infrastructure upgrade
- ✅ **Backward Compatible**: All Express/Node.js APIs remain stable

## Rollback Plan
If issues arise (unlikely), rollback is simple:
```bash
git revert e6b9820  # Revert commit hash
docker-compose build --no-cache
docker-compose up -d
```

Or manually edit Dockerfiles:
- Change `FROM node:24-slim` back to `FROM node:23-slim`

## Upstream Status
- [x] Not applicable (infrastructure maintenance)
- This is a proactive maintenance upgrade
- Follows Node.js release schedule best practices

## References
- [Node.js 24 Release Notes](https://nodejs.org/en/blog/release/v24.0.0)
- [Node.js Release Schedule](https://github.com/nodejs/release#release-schedule)
- [OpenAI Node.js SDK Compatibility](https://github.com/openai/openai-node)

## Integration Date
18. Dezember 2025

## Related Issues
- Improves long-term maintainability
- Aligns with Docker best practices for LTS base images
- Complements DOCKER-001 optimization efforts
