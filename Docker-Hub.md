# Paperless-AI Patched

**Community Integration Fork** | All credit to [clusterzx](https://github.com/clusterzx) for the original [Paperless-AI](https://github.com/clusterzx/paperless-ai)

This is an **unofficial community fork** maintained as an integration and testing project. It combines pending upstream pull requests, community bug fixes, and optimized Docker builds. Think of it as a "tinkering workshop" where improvements are tested before potentially flowing back to the upstream project.

**⚠️ Not affiliated with the original project.** For official support and core development, visit [clusterzx/paperless-ai](https://github.com/clusterzx/paperless-ai).

---

## 🎯 What is Paperless-AI?

**Paperless-AI** (created by [clusterzx](https://github.com/clusterzx)) is an AI-powered extension for [Paperless-ngx](https://github.com/paperless-ngx/paperless-ngx) that brings:
- 🤖 **Automatic document classification** using OpenAI, Ollama, or compatible APIs
- 🏷️ **Smart tagging** with customizable rules and prompts
- 💬 **RAG-based semantic search** for natural language document queries
- 🔄 **Automated workflows** for hands-free document processing

Ask questions like:
- *"When did I sign my rental agreement?"*
- *"What was the amount of the last electricity bill?"*
- *"Which documents mention my health insurance?"*

---

## 🚀 What's Different in This Fork?

This fork serves as an **integration testing ground** and includes:
- ✅ **Merged upstream PRs** awaiting official review
- ✅ **Optimized Docker images** (Lite: ~400MB, Full: ~2.7GB)
- ✅ **Security updates** with dependency maintenance
- ✅ **Community bug fixes** tested and integrated
- ✅ **Enhanced documentation** for Docker deployment
- 🤖 **AI-assisted integration** and testing

**Who maintains this?**
This fork is maintained as a hobby project by someone who uses Paperless-AI and wanted to:
- Test pending upstream improvements
- Create smaller Docker images
- Keep dependencies up-to-date
- Experiment with community contributions

**All core functionality and features are credited to the original author, [clusterzx](https://github.com/clusterzx).**

---

## 📦 Image Variants

### **Lite Image** (Default, Recommended)
```bash
docker pull admonstrator/paperless-ai-patched:latest
# or
docker pull admonstrator/paperless-ai-patched:latest-lite
```

**Size:** ~500-700 MB  
**Best for:** Standard document processing with OpenAI/Ollama APIs  
**Includes:**
- Full AI tagging and classification
- Manual processing interface
- Multi-provider support (OpenAI, Ollama, DeepSeek, etc.)
- Web interface with all features

**Does NOT include:**
- RAG semantic search (requires Full image)
- Local vector embeddings
- PyTorch dependencies

✅ **Use this if:** You want AI document tagging without the extra bulk of RAG features.

---

### **Full Image** (Optional, RAG-Enabled)
```bash
docker pull admonstrator/paperless-ai-patched:latest-full
```

**Size:** ~2.5-2.7 GB  
**Best for:** Users who need RAG-based semantic search  
**Includes everything from Lite, plus:**
- RAG (Retrieval-Augmented Generation) chat
- Semantic document search
- Local vector embeddings with ChromaDB
- PyTorch (CPU-only) and sentence-transformers

✅ **Use this if:** You want to ask natural language questions about your document archive.

---

## 🐳 Quick Start

### Using Docker Compose (Recommended)

```yaml
version: '3.8'

services:
  paperless-ai-patched:
    image: admonstrator/paperless-ai-patched:latest  # or :latest-full for RAG
    container_name: paperless-ai-patched
    ports:
      - "3000:3000"
    environment:
      # Paperless-ngx connection
      - PAPERLESS_URL=http://paperless-ngx:8000
      - PAPERLESS_API_TOKEN=your_paperless_api_token
      
      # AI Provider (choose one)
      - AI_PROVIDER=openai
      - OPENAI_API_KEY=your_openai_key
      # - AI_PROVIDER=ollama
      # - OLLAMA_BASE_URL=http://ollama:11434
      
      # Optional: RAG settings (Full image only)
      - RAG_SERVICE_ENABLED=false  # set to true for Full image
      
      # Optional: Processing settings
      - CRON_SCHEDULE=*/5 * * * *  # Check every 5 minutes
      - AUTO_TAG=true
      - AUTO_CORRESPONDENT=true
      - AUTO_DOCUMENT_TYPE=true
    volumes:
      - ./data:/app/data
      - ./logs:/app/logs
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "node", "-e", "require('http').get('http://localhost:3000/health')"]
      interval: 30s
      timeout: 10s
      retries: 3
```

### Using Docker Run

**Lite Image:**
```bash
docker run -d \
  --name paperless-ai-patched \
  -p 3000:3000 \
  -e PAPERLESS_URL=http://your-paperless:8000 \
  -e PAPERLESS_API_TOKEN=your_token \
  -e AI_PROVIDER=openai \
  -e OPENAI_API_KEY=your_key \
  -v $(pwd)/data:/app/data \
  -v $(pwd)/logs:/app/logs \
  --restart unless-stopped \
  admonstrator/paperless-ai-patched:latest
```

**Full Image with RAG:**
```bash
docker run -d \
  --name paperless-ai-patched \
  -p 3000:3000 \
  -e PAPERLESS_URL=http://your-paperless:8000 \
  -e PAPERLESS_API_TOKEN=your_token \
  -e AI_PROVIDER=openai \
  -e OPENAI_API_KEY=your_key \
  -e RAG_SERVICE_ENABLED=true \
  -v $(pwd)/data:/app/data \
  -v $(pwd)/logs:/app/logs \
  --restart unless-stopped \
  admonstrator/paperless-ai-patched:latest-full
```

---

## ⚙️ Configuration

### Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `PAPERLESS_URL` | ✅ | - | URL to your Paperless-ngx instance |
| `PAPERLESS_API_TOKEN` | ✅ | - | API token from Paperless-ngx |
| `AI_PROVIDER` | ✅ | `openai` | AI provider (openai, ollama, azure, custom, etc.) |
| `OPENAI_API_KEY` | ⚠️ | - | Required if using OpenAI |
| `OLLAMA_BASE_URL` | ⚠️ | - | Required if using Ollama |
| `RAG_SERVICE_ENABLED` | ❌ | `false` | Enable RAG chat (Full image only) |
| `CRON_SCHEDULE` | ❌ | `*/5 * * * *` | Document processing schedule |
| `AUTO_TAG` | ❌ | `true` | Auto-apply AI-suggested tags |
| `AUTO_CORRESPONDENT` | ❌ | `true` | Auto-apply AI-suggested correspondent |
| `AUTO_DOCUMENT_TYPE` | ❌ | `true` | Auto-apply AI-suggested document type |

### First-Time Setup
1. Start the container
2. Navigate to `http://localhost:3000/setup`
3. Configure your AI provider and preferences
4. **Restart the container** to initialize RAG (Full image only)
5. Access the dashboard at `http://localhost:3000`

---

## 📋 Supported AI Providers

- ✅ **OpenAI** (GPT-4, GPT-3.5-turbo)
- ✅ **Ollama** (Mistral, Llama, Phi-3, Gemma-2, etc.)
- ✅ **Azure OpenAI**
- ✅ **DeepSeek.ai**
- ✅ **OpenRouter.ai**
- ✅ **Perplexity.ai**
- ✅ **Together.ai**
- ✅ **LiteLLM**
- ✅ **VLLM**
- ✅ **Fastchat**
- ✅ **Gemini** (Google)
- ✅ Custom OpenAI-compatible endpoints

---

## 🔧 Platform Support

Both images support:
- ✅ **linux/amd64** (x86_64)
- ✅ **linux/arm64** (ARM v8, Apple Silicon)

---

## 📊 Image Size Comparison

| Image | Compressed | Unpacked | Use Case |
|-------|-----------|----------|----------|
| **Lite** | ~250 MB | ~700 MB | Document tagging only |
| **Full** | ~900 MB | ~2.7 GB | Document tagging + RAG search |

---

## 🔗 Links

- **GitHub:** [Admonstrator/paperless-ai-patched](https://github.com/Admonstrator/paperless-ai-patched)
- **Upstream:** [clusterzx/paperless-ai](https://github.com/clusterzx/paperless-ai)
- **Paperless-ngx:** [paperless-ngx/paperless-ngx](https://github.com/paperless-ngx/paperless-ngx)
- **Issues:** [GitHub Issues](https://github.com/Admonstrator/paperless-ai-patched/issues)
- **Upstream Discord:** [Join Community](https://discord.gg/AvNekAfK38)

---

## 📄 License

MIT License - See [LICENSE](https://github.com/Admonstrator/paperless-ai-patched/blob/main/LICENSE)

---

## ⚠️ Disclaimer

This is an **unofficial community fork** maintained as a hobby/integration project. It is not affiliated with or endorsed by the original Paperless-AI project.

- **All development credit** belongs to [clusterzx](https://github.com/clusterzx)
- **This fork** only integrates, tests, and packages existing improvements
- **Use at your own discretion** - this is experimental
- **For production use**, consider the [official project](https://github.com/clusterzx/paperless-ai)

---

## 🙏 Credits

**All credit goes to:**
- **[clusterzx](https://github.com/clusterzx)** - Original Paperless-AI author and developer
- **Community contributors** - Pull requests and bug fixes
- **[Paperless-ngx](https://github.com/paperless-ngx/paperless-ngx)** - The amazing document management system

This fork is maintained by [Admonstrator](https://github.com/Admonstrator) as an integration/testing project with AI assistance.

**Please support the original developer:**
- [Patreon](https://www.patreon.com/c/clusterzx)
- [PayPal](https://www.paypal.com/paypalme/bech0r)
- [Buy Me a Coffee](https://www.buymeacoffee.com/clusterzx)
- [Ko-Fi](https://ko-fi.com/clusterzx)
