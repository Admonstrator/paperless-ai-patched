<div align="center">

<img src="./logo.png" alt="Paperless-AI Patched Logo" style="border-radius: 10px; margin: 20px 0;">

# 📄 Paperless-AI Patched

**An integration fork of Paperless-AI – picking up where the original left off.**

[![Latest Release](https://img.shields.io/badge/release-v2026--02--27--01-blue?style=for-the-badge&logo=github)](https://github.com/Admonstrator/paperless-ai-patched/releases/latest)
[![Docker Pulls](https://img.shields.io/badge/docker%20pulls-1.5k-brightgreen?style=for-the-badge&logo=docker)](https://hub.docker.com/r/admonstrator/paperless-ai-patched)
[![License](https://img.shields.io/github/license/Admonstrator/paperless-ai-patched?style=for-the-badge)](LICENSE)
[![Stars](https://img.shields.io/badge/stars-0-orange?style=for-the-badge&logo=github)](https://github.com/Admonstrator/paperless-ai-patched/stargazers)

</div>

---

## 📖 About

**Paperless-AI** is an AI-powered extension for [Paperless-ngx](https://github.com/paperless-ngx/paperless-ngx) that brings automatic document classification, smart tagging, and semantic search using OpenAI-compatible APIs and Ollama.

This fork started as a personal tinkering project – collecting pending upstream PRs, applying security patches, and testing improvements before they (hopefully) land upstream. Since the upstream project is no longer actively maintained (at least it does not look like it), it has grown into the most up-to-date version available.

To be transparent: many fixes here are the result of AI-assisted analysis, manual testing, and careful review. Not magic – just methodical patching.

> 🔧 **Integration Fork** – Collects, tests, and applies upstream PRs and community fixes  
> 📦 **Current Version** – `v2026-02-27-01`  
> 🔒 **Security First** – Regular dependency updates and vulnerability patches  
> ⚠️ **Upstream Credit** – All original work belongs to [clusterzx](https://github.com/clusterzx)

**Want to contribute or report issues?** → [Open an Issue](https://github.com/Admonstrator/paperless-ai-patched/issues)

---

## ✨ Features

### 🔄 Automated Document Processing

- 🤖 Detects new documents in Paperless-ngx automatically
- 🏷️ Assigns title, tags, document type, and correspondent via AI
- 🌍 Multilingual document analysis
- 🔁 Smart retry logic with exponential backoff (no infinite loops)

### 🧠 RAG-Based AI Chat

- 💬 Natural language document search and Q&A
- 🧩 Understands full document context (not just keywords)
- 🔍 Semantic memory powered by your own data
- ⚡ Fast, intelligent, privacy-friendly document queries

### 🤝 AI Provider Support

- OpenAI (GPT-4, GPT-4o, ...)
- Ollama (Mistral, Llama, Phi-3, Gemma-2, ...)
- DeepSeek.ai, OpenRouter.ai, Perplexity.ai, Together.ai
- LiteLLM, VLLM, Fastchat, Gemini (Google)
- Azure OpenAI
- Any OpenAI-compatible API endpoint

### ⚙️ Additional Capabilities

- 🖥️ Web interface for manual AI tagging (`/manual`)
- 📜 Tag rules and filters for selective document processing
- 📊 Usage tracking and token metrics
- 🌓 Dark mode support
- 📱 Responsive mobile-friendly UI

---

## 🛠️ What's Been Fixed & Improved

This fork integrates all community improvements with full documentation in [`Included_Fixes/`](Included_Fixes/):

| Category         | Fix ID                                                         | Description                                               | Status    |
| ---------------- | -------------------------------------------------------------- | --------------------------------------------------------- | --------- |
| **Bug Fixes**    | [PR-772](Included_Fixes/PR-772-infinite-retry-fix/)            | Fix infinite retry loop                                   | ✅ Applied |
|                  | [PR-747](Included_Fixes/PR-747-history-cleanup/)               | History validation tool with real-time progress           | ✅ Applied |
| **Performance**  | [PERF-001](Included_Fixes/PERF-001-history-pagination/)        | SQL pagination (~25–50× faster with 1000+ docs)           | ✅ Applied |
|                  | [PERF-002](Included_Fixes/PERF-002-tag-caching/)               | Tag cache with configurable TTL (90–98% fewer API calls)  | ✅ Applied |
| **Security**     | [SEC-001](Included_Fixes/SEC-001-ssrf-code-injection/)         | SSRF & code injection prevention                          | ✅ Applied |
|                  | [SEC-002](Included_Fixes/SEC-002-urllib3-cve-2026-21441/)      | Fix urllib3 CVE-2026-21441                                | ✅ Applied |
|                  | [SEC-003](Included_Fixes/SEC-003-global-rate-limiting/)        | Global rate limiting for API endpoints                    | ✅ Applied |
| **Docker**       | [DOCKER-001](Included_Fixes/DOCKER-001-optimize-images/)       | Optimized multi-stage builds (Lite ~500 MB, Full ~1.5 GB) | ✅ Applied |
|                  | [DOCKER-002](Included_Fixes/DOCKER-002-upgrade-nodejs-24-lts/) | Upgrade to Node.js 24 LTS                                 | ✅ Applied |
| **UI/UX**        | [UI-002](Included_Fixes/UI-002-date-boolean-custom-fields/)    | Date/Boolean custom field types in settings               | ✅ Applied |
| **Dependencies** | [DEP-001](Included_Fixes/DEP-001-remove-sqlite3/)              | Remove unused sqlite3 dependency                          | ✅ Applied |
| **CI/CD**        | [CI-001](Included_Fixes/CI-001-auto-version-tagging/)          | Automatic version tagging via GitHub Actions              | ✅ Applied |

---

## 📋 Requirements

| Requirement       | Details                                                 |
| ----------------- | ------------------------------------------------------- |
| **Paperless-ngx** | Any recent version with API access                      |
| **AI Provider**   | OpenAI API key, Ollama instance, or compatible endpoint |
| **Docker**        | Docker & Docker Compose (recommended)                   |
| **Architecture**  | amd64 or arm64                                          |
| **RAM**           | ≥ 512 MB (Lite) / ≥ 2 GB (Full with RAG)                |

---

## 🚀 Quick Start

### Docker Compose (Recommended)

**Lite version** – AI tagging only (~500–700 MB):

```yaml
services:
  paperless-ai:
    image: admonstrator/paperless-ai-patched:latest-lite
    container_name: paperless-ai
    restart: unless-stopped
    ports:
      - "3000:3000"
    volumes:
      - ./data:/app/data
    environment:
      - PAPERLESS_AI_INITIAL_SETUP=yes
```

**Full version** – AI tagging + RAG semantic search (~1.5–2 GB):

```yaml
services:
  paperless-ai:
    image: admonstrator/paperless-ai-patched:latest-full
    container_name: paperless-ai
    restart: unless-stopped
    ports:
      - "3000:3000"
    volumes:
      - ./data:/app/data
    environment:
      - PAPERLESS_AI_INITIAL_SETUP=yes
```

Then open [http://localhost:3000](http://localhost:3000) to complete setup.

> ⚠️ **First-time install:** Restart the container **after completing setup** to build the RAG index (Full version only).

### Container Images

```bash
# Lite version (~500–700 MB) – AI tagging only
docker pull admonstrator/paperless-ai-patched:latest-lite

# Full version (~1.5–2 GB) – AI tagging + RAG semantic search
docker pull admonstrator/paperless-ai-patched:latest-full
```

**Docker Hub:** [admonstrator/paperless-ai-patched](https://hub.docker.com/r/admonstrator/paperless-ai-patched)

---

## 🔧 Local Development

```bash
# Install dependencies
npm install

# Start in development mode (auto-reload)
npm run test
```

---

## 💡 Getting Help

- 🐛 [Report issues on GitHub](https://github.com/Admonstrator/paperless-ai-patched/issues) – Bug reports and feature requests
- 💬 [Join the upstream Discord](https://discord.gg/AvNekAfK38) – Community chat
- 📚 [Developer Documentation](COPILOT.md) – Architecture, API reference, and more

---

## ⚠️ Disclaimer

This is an **unofficial community fork** of [Paperless-AI](https://github.com/clusterzx/paperless-ai). All original development credit belongs to [clusterzx](https://github.com/clusterzx).

Use at your own risk. While every effort is made to ensure stability and security, no warranty is provided. Always back up your data before updating.

---

## 👥 Contributors

- [clusterzx](https://github.com/clusterzx) – Original author of Paperless-AI
- [Admonstrator](https://github.com/Admonstrator) – Fork maintainer, fixes & improvements
- All community contributors who opened issues, tested fixes, and submitted PRs
- GitHub Copilot – AI-assisted development (all code reviewed and tested)

Want to contribute? Pull requests are welcome! See [`CONTRIBUTING.md`](CONTRIBUTING.md).

---

## 📜 License

This project is licensed under the **MIT License** – see the [LICENSE](LICENSE) file for details.

Original work Copyright © [clusterzx](https://github.com/clusterzx)  
Community Edition maintained by [Admonstrator](https://github.com/Admonstrator)

---

## 💖 Support

If you find this fork useful, consider supporting its continued development:

[![GitHub Sponsors](https://img.shields.io/badge/GitHub-Sponsors-EA4AAA?style=for-the-badge&logo=github)](https://github.com/sponsors/admonstrator)
[![Buy Me A Coffee](https://img.shields.io/badge/Buy%20Me%20A%20Coffee-FFDD00?style=for-the-badge&logo=buy-me-a-coffee&logoColor=black)](https://buymeacoffee.com/admon)
[![Ko-fi](https://img.shields.io/badge/Ko--fi-FF5E5B?style=for-the-badge&logo=ko-fi&logoColor=white)](https://ko-fi.com/admon)
[![PayPal](https://img.shields.io/badge/PayPal-00457C?style=for-the-badge&logo=paypal&logoColor=white)](https://paypal.me/aaronviehl)

Also consider supporting the **original author** of Paperless-AI:

[![Patreon](https://img.shields.io/badge/Patreon-F96854?style=for-the-badge&logo=patreon&logoColor=white)](https://www.patreon.com/c/clusterzx)
[![PayPal](https://img.shields.io/badge/PayPal-00457C?style=for-the-badge&logo=paypal&logoColor=white)](https://www.paypal.com/paypalme/bech0r)
[![BuyMeACoffee](https://img.shields.io/badge/Buy%20Me%20a%20Coffee-ffdd00?style=for-the-badge&logo=buy-me-a-coffee&logoColor=black)](https://www.buymeacoffee.com/clusterzx)

---

<div align="center">

**Made with ❤️ by the community, for the community**

⭐ If you find this useful, please star the repository!

</div>

<div align="center">

_Last updated: 2026-02-27_

</div>
