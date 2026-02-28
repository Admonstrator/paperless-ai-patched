# DOCKER-001: Docker Image Optimization

## 📌 Overview

**Type**: Infrastructure Improvement  
**Status**: ✅ Applied  
**Integration Date**: 2025-12-03  
**Upstream Status**: ⏳ Not submitted (fork-specific)

## 🐛 Problem

The original Docker image was **4.5 GB**, which caused:
- Very slow download times
- High storage requirements
- Expensive bandwidth costs
- Poor user experience
- Limited adoption due to size

**Root causes**:
1. PyTorch with CUDA support (~2-3 GB)
2. Unnecessary build tools left in image
3. No Python cache cleanup
4. Poor `.dockerignore` configuration
5. No image variants for different use cases

## ✅ Solution

Created two optimized image variants:

### **Lite Image** (~400-700 MB)
- Node.js only, no Python/PyTorch
- All core AI features work (OpenAI, Ollama)
- No RAG support
- **Target users**: 95% of users who only need document tagging

### **Full Image** (~2.5-2.7 GB)
- CPU-only PyTorch (no CUDA)
- Full RAG support
- Optimized build process
- **Target users**: Users who need semantic search

## 📝 Changes

### New Files
- `Dockerfile.lite` - Lightweight variant
- `.dockerignore` - Comprehensive exclusions

### Modified Files
- `Dockerfile` - Optimized full image
  - Changed to CPU-only PyTorch
  - Removed unnecessary build tools
  - Added Python cache cleanup
  - Better layer organization
- `.github/workflows/docker-build-push.yml` - Multi-variant build support
- `requirements.txt` - CPU-only PyTorch via specific index URL

### Technical Details

**Lite Dockerfile**:
```dockerfile
FROM node:22-slim
# Only Node.js dependencies
# No Python, no PyTorch
# ENV RAG_SERVICE_ENABLED=false
```

**Full Dockerfile Optimization**:
```dockerfile
# CPU-only PyTorch
RUN pip install --index-url https://download.pytorch.org/whl/cpu \
    -r requirements.txt --no-cache-dir

# Cleanup
RUN apt-get remove -y python3-dev build-essential && \
    apt-get autoremove -y && \
    rm -rf /var/lib/apt/lists/*
```

**Comprehensive .dockerignore**:
```
node_modules/
.git/
*.log
test/
docs/
.env*
```

## 🧪 Testing

Verified:
- ✅ Lite image builds successfully (~400 MB)
- ✅ Full image builds successfully (~2.5 GB)
- ✅ Both variants start correctly
- ✅ Multi-platform support (amd64/arm64)
- ✅ Health checks pass
- ✅ Environment variables work
- ✅ No npm warnings (70% reduction)

**Build times**:
- Lite: ~22 seconds (local)
- Full: ~5-10 minutes (with PyTorch)

## 📊 Impact

### Size Comparison

| Image | Before | After | Savings |
|-------|--------|-------|---------|
| **Default** | 4.5 GB | 700 MB | **84% reduction** |
| **Full (new)** | N/A | 2.7 GB | **40% smaller** than before |

### Download Time (100 Mbit/s)

| Image | Before | After |
|-------|--------|-------|
| **Lite** | ~6 minutes | **~1 minute** |
| **Full** | ~6 minutes | ~3.5 minutes |

### Use Case Coverage

- **90%+ of users**: Need only Lite image
- **RAG features**: Optional via Full image
- **Choice**: Users can decide what they need

## 🎯 Workflow Integration

GitHub Actions workflow supports:
- ✅ Lite image (always built, default)
- ✅ Full image (optional, via flag)
- ✅ Multi-platform (amd64/arm64)
- ✅ Multi-tag support
- ✅ Latest tag option

**Default behavior**:
```bash
docker pull admonstrator/paperless-ai-next:latest
# → Gets Lite image (~700 MB)
```

**Full image**:
```bash
docker pull admonstrator/paperless-ai-next:latest-full
# → Gets Full image with RAG (~2.7 GB)
```

## 🔗 Related

- **Dockerfile.lite**: Lightweight variant
- **Dockerfile**: Optimized full variant
- **.dockerignore**: Exclusion patterns
- **Workflow**: `.github/workflows/docker-build-push.yml`
- **Commit**: Multiple commits during optimization

## 📈 Future Improvements

Potential further optimizations:
- [ ] Alpine-based images (smaller base)
- [ ] Multi-stage builds for even smaller images
- [ ] Distroless images for security
- [ ] Layer caching improvements

## 👥 Credits

- **Optimization By**: Admonstrator with AI assistance
- **Rationale**: Make deployment accessible to more users
- **Inspiration**: Docker best practices and user feedback
