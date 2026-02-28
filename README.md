<div align="center">

<img src="./logo.png" alt="Paperless-AI Patched Logo" style="border-radius: 10px; margin: 20px 0;">

# 📄 Paperless-AI Patched

**An integration fork of Paperless-AI – picking up where the original left off.**

[![Latest Release](https://img.shields.io/github/v/release/admonstrator/paperless-ai-patched?style=for-the-badge&logo=github)](https://github.com/admonstrator/paperless-ai-patched/releases/latest)
[![Docker Pulls](https://img.shields.io/docker/pulls/admonstrator/paperless-ai-patched?style=for-the-badge&logo=docker)](https://hub.docker.com/r/admonstrator/paperless-ai-patched)
[![License](https://img.shields.io/github/license/admonstrator/paperless-ai-patched?style=for-the-badge)](LICENSE)
[![Stars](https://img.shields.io/github/stars/admonstrator/paperless-ai-patched?style=for-the-badge&logo=github)](https://github.com/admonstrator/paperless-ai-patched/stargazers)
[![Docs](https://img.shields.io/badge/docs-admonstrator.github.io-blue?style=for-the-badge&logo=readthedocs)](https://admonstrator.github.io/paperless-ai-patched/)

</div>

---

## 📖 About

**Paperless-AI** is an AI-powered extension for [Paperless-ngx](https://github.com/paperless-ngx/paperless-ngx) that brings automatic document classification, smart tagging, and semantic search using OpenAI-compatible APIs and Ollama.

This fork collects pending upstream PRs, applies security patches, and tests improvements. Since the upstream project is no longer actively maintained, it has grown into the most up-to-date version available.

> ⚠️ **Upstream Credit** – All original work belongs to [clusterzx](https://github.com/clusterzx)

📖 **[Full documentation →](https://admonstrator.github.io/paperless-ai-patched/)**

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

| Image Tag | Size | RAG |
|---|---|---|
| `admonstrator/paperless-ai-patched:latest-lite` | ~500–700 MB | ❌ |
| `admonstrator/paperless-ai-patched:latest-full` | ~1.5–2 GB | ✅ |

**Docker Hub:** [admonstrator/paperless-ai-patched](https://hub.docker.com/r/admonstrator/paperless-ai-patched)

---

## ℹ️ More

| | |
|---|---|
| 📖 Full documentation | [admonstrator.github.io/paperless-ai-patched](https://admonstrator.github.io/paperless-ai-patched/) |
| 🐛 Report issues | [GitHub Issues](https://github.com/admonstrator/paperless-ai-patched/issues) |
| 💬 Community chat | [upstream Discord](https://discord.gg/AvNekAfK38) |
| 📜 License | MIT – original work © [clusterzx](https://github.com/clusterzx) |

---

## 💖 Support

[![GitHub Sponsors](https://img.shields.io/badge/GitHub-Sponsors-EA4AAA?style=for-the-badge&logo=github)](https://github.com/sponsors/admonstrator)
[![Buy Me A Coffee](https://img.shields.io/badge/Buy%20Me%20A%20Coffee-FFDD00?style=for-the-badge&logo=buy-me-a-coffee&logoColor=black)](https://buymeacoffee.com/admon)

Also consider supporting the **original author**: [![Patreon](https://img.shields.io/badge/Patreon-F96854?style=flat&logo=patreon&logoColor=white)](https://www.patreon.com/c/clusterzx)

---

<div align="center">

**Made with ❤️ by the community, for the community**

⭐ If you find this useful, please star the repository!

</div>
