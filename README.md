# 📄 Paperless-AI Patched

[![Docker Pulls](https://img.shields.io/docker/pulls/admonstrator/paperless-ai-patched)](https://hub.docker.com/r/admonstrator/paperless-ai-patched)
[![GitHub Stars](https://img.shields.io/github/stars/Admonstrator/paperless-ai-patched)](https://github.com/Admonstrator/paperless-ai-patched)
[![License](https://img.shields.io/github/license/Admonstrator/paperless-ai-patched)](LICENSE)
[![Upstream](https://img.shields.io/badge/upstream-clusterzx%2Fpaperless--ai-blue)](https://github.com/clusterzx/paperless-ai)

> **⚠️ Community Integration Fork** | All credit goes to [clusterzx](https://github.com/clusterzx) for the original [Paperless-AI](https://github.com/clusterzx/paperless-ai) project.

---

**Paperless-AI** is an AI-powered extension for [Paperless-ngx](https://github.com/paperless-ngx/paperless-ngx) created by [clusterzx](https://github.com/clusterzx) that brings automatic document classification, smart tagging, and semantic search using OpenAI-compatible APIs and Ollama.

## 🔧 About This Fork

This is a **community-maintained integration fork** that:
- 🧪 Tests and merges pending upstream pull requests
- 📦 Provides optimized Docker images (Lite & Full variants)
- 🔒 Applies security updates and dependency maintenance
- 🐛 Integrates community bug fixes
- 📝 Offers additional documentation

**Important:** This fork exists purely for experimentation and integration testing. All development credit belongs to the original author. Think of this as a "tinkering workshop" where community fixes are tested before potentially flowing back upstream.

**Want the official version?** → [clusterzx/paperless-ai](https://github.com/clusterzx/paperless-ai)

### 🆕 What's Different in This Fork?

**Performance Enhancements**:
- ⚡ **PERF-001**: History table with SQL pagination (~25-50x faster with 1000+ documents)
- 🎯 Tag caching with 5-minute TTL (95% reduction in API calls)
- 🔄 Force reload button to bypass cache when needed

**Bug Fixes**:
- ✅ **PR-772**: Fixed infinite retry loop with exponential backoff
- ✅ **PR-747**: History validation tool with real-time progress indicators
- ✅ SSE buffering fix for instant progress feedback
- ✅ Security: Authentication added to all history endpoints

**Docker Optimizations**:
- 📦 **DOCKER-001**: Optimized images (Lite ~400MB, Full ~1.2GB)
- 🏗️ Separate build/push workflow for reliability
- 🔧 Multi-stage builds with clean dependency installation

**Documentation**:
- 📚 Comprehensive COPILOT.md for developers and AI assistants
- 📋 Detailed fix documentation in `Included_Fixes/`
- 🔗 Swagger API documentation improvements

**UI/UX**:
- 🌓 Enhanced dark mode support
- 📱 Responsive mobile menu
- ⏱️ Real-time progress bars with step counts
- 🎨 Improved loading indicators

### 📋 Integrated Fixes

All fixes are documented in [`Included_Fixes/`](Included_Fixes/) with detailed implementation notes:

| Category | Fix ID | Description | Status |
|----------|--------|-------------|--------|
| **Upstream PRs** | [PR-772](Included_Fixes/PR-772-infinite-retry-fix/) | Fix infinite retry loop | ✅ Merged |
| | [PR-747](Included_Fixes/PR-747-history-cleanup/) | History validation tool | ✅ Merged |
| **Performance** | [PERF-001](Included_Fixes/PERF-001-history-pagination/) | SQL pagination & tag caching | ✅ Applied |
| **Security** | [SEC-001](Included_Fixes/SEC-001-ssrf-code-injection/) | SSRF & code injection fixes | ✅ Applied |
| **Security** | [SEC-002](Included_Fixes/SEC-002-urllib3-cve-2026-21441/) | Fix urllib3 decompression-bomb (CVE-2026-21441) | ✅ Applied |
| **Security** | [SEC-003](Included_Fixes/SEC-003-fix-codeql-security-alerts/) | CodeQL Security Audit (61/119 fixed - 51%) | 🚧 In Progress |
| **Docker** | [DOCKER-001](Included_Fixes/DOCKER-001-optimize-images/) | Optimized Docker images | ✅ Applied |
| **Docker** | [DOCKER-002](Included_Fixes/DOCKER-002-upgrade-nodejs-24-lts/) | Upgrade to Node.js 24 LTS | ✅ Applied |
| **Dependencies** | [DEP-001](Included_Fixes/DEP-001-remove-sqlite3/) | Remove unused sqlite3 | ✅ Applied |
| **CI/CD** | [CI-001](Included_Fixes/CI-001-auto-version-tagging/) | Automatic version tagging | ✅ Applied |

Full details: [`Included_Fixes/README.md`](Included_Fixes/README.md)

---

It enables **fully automated document workflows**, **contextual chat**, and **powerful customization** — all via an intuitive web interface.

> 💡 Just ask:  
> “When did I sign my rental agreement?”  
> “What was the amount of the last electricity bill?”  
> “Which documents mention my health insurance?”  

Powered by **Retrieval-Augmented Generation (RAG)**, you can now search semantically across your full archive and get precise, natural language answers.

---

## ✨ Features

### 🔄 Automated Document Processing
- Detects new documents in Paperless-ngx automatically
- Analyzes content using OpenAI API, Ollama, and other compatible backends
- Assigns title, tags, document type, and correspondent
- Built-in support for:
  - Ollama (Mistral, Llama, Phi-3, Gemma-2)
  - OpenAI
  - DeepSeek.ai
  - OpenRouter.ai
  - Perplexity.ai
  - Together.ai
  - LiteLLM
  - VLLM
  - Fastchat
  - Gemini (Google)
  - ...and more!

### 🧠 RAG-Based AI Chat
- Natural language document search and Q&A
- Understands full document context (not just keywords)
- Semantic memory powered by your own data
- Fast, intelligent, privacy-friendly document queries  
![RAG_CHAT_DEMO](https://raw.githubusercontent.com/clusterzx/paperless-ai/refs/heads/main/ppairag.png)

### ⚙️ Manual Processing
- Web interface for manual AI tagging
- Useful when reviewing sensitive documents
- Accessible via `/manual`

### 🧩 Smart Tagging & Rules
- Define rules to limit which documents are processed
- Disable prompts and apply tags automatically
- Set custom output tags for tracked classification  
![PPAI_SHOWCASE3](https://github.com/user-attachments/assets/1fc9f470-6e45-43e0-a212-b8fa6225e8dd)

---

## 🚀 Installation

> ⚠️ **First-time install:** Restart the container **after completing setup** (API keys, preferences) to build RAG index.  
> 🔁 Not required for updates.

📘 [Installation Wiki](https://github.com/clusterzx/paperless-ai/wiki/2.-Installation)

### 📦 Container Images

**All images are hosted on Docker Hub** for easy access and reliability.

```bash
# Lite version (~500-700 MB) - AI tagging only
docker pull admonstrator/paperless-ai-patched:latest

# Full version (~1.5-2 GB) - AI tagging + RAG search
docker pull admonstrator/paperless-ai-patched:latest-full
```

**Docker Hub Repository:** [admonstrator/paperless-ai-patched](https://hub.docker.com/r/admonstrator/paperless-ai-patched)

Images are automatically built and published via GitHub Actions on every push to `main`.

---

## 🐳 Docker Support

- Multi-stage optimized builds for smaller image sizes
- Health monitoring and auto-restart
- Persistent volumes and graceful shutdown
- Works out of the box with minimal setup
- Multi-arch support (amd64, arm64)

---

## 🔧 Local Development

```bash
# Install dependencies
npm install

# Start development/test mode
npm run test
```

---

## 🧭 Roadmap Highlights

- ✅ Multi-AI model support
- ✅ Multilingual document analysis
- ✅ Tag rules and filters
- ✅ Integrated document chat with RAG
- ✅ Responsive web interface

---

## 🤝 Contributing

**Note:** This is an unofficial community fork. For core features and major changes, please contribute to the [upstream project](https://github.com/clusterzx/paperless-ai).

For this fork specifically:
- 🐛 Bug reports for integration issues
- 📦 Docker-related improvements
- 📝 Documentation enhancements
- 🧪 Testing feedback

Open an issue or PR if you have improvements to share!

---

## 🆘 Support & Community

- **Upstream Issues:** [clusterzx/paperless-ai/issues](https://github.com/clusterzx/paperless-ai/issues)
- **Upstream Discord:** [Join Community](https://discord.gg/AvNekAfK38)
- **Fork Issues:** [Admonstrator/paperless-ai-patched/issues](https://github.com/Admonstrator/paperless-ai-patched/issues)

---

## 📄 License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.

Original work Copyright © [clusterzx](https://github.com/clusterzx)  
Fork maintained by [Admonstrator](https://github.com/Admonstrator)

---

## 🙏 Support the Original Developer

[![Patreon](https://img.shields.io/badge/Patreon-F96854?style=for-the-badge&logo=patreon&logoColor=white)](https://www.patreon.com/c/clusterzx)
[![PayPal](https://img.shields.io/badge/PayPal-00457C?style=for-the-badge&logo=paypal&logoColor=white)](https://www.paypal.com/paypalme/bech0r)
[![BuyMeACoffee](https://img.shields.io/badge/Buy%20Me%20a%20Coffee-ffdd00?style=for-the-badge&logo=buy-me-a-coffee&logoColor=black)](https://www.buymeacoffee.com/clusterzx)
[![Ko-Fi](https://img.shields.io/badge/Ko--fi-F16061?style=for-the-badge&logo=ko-fi&logoColor=white)](https://ko-fi.com/clusterzx)
