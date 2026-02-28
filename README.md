<div align="center">

<img src="./logo.png" alt="Paperless-AI Next Logo" weight="200" style="border-radius: 10px; margin: 20px 0;">

# 📄 Paperless-AI Next

**An integration fork of Paperless-AI – picking up where the original left off.**

[![Latest Release](https://img.shields.io/github/v/release/admonstrator/paperless-ai-next?style=for-the-badge&logo=github&color=blue)](https://github.com/admonstrator/paperless-ai-next/releases/latest)
[![Docker Pulls](https://img.shields.io/badge/docker%20pulls-40-yellow?style=for-the-badge&logo=docker)](https://hub.docker.com/r/admonstrator/paperless-ai-next)
[![License](https://img.shields.io/github/license/admonstrator/paperless-ai-next?style=for-the-badge)](LICENSE)
[![Stars](https://img.shields.io/github/stars/admonstrator/paperless-ai-next?style=for-the-badge)](https://github.com/admonstrator/paperless-ai-next/stargazers)
[![Docs](https://img.shields.io/badge/docs-paperless--ai--next.admon.me-blue?style=for-the-badge&logo=readthedocs)](https://paperless-ai-next.admon.me/)

</div>

---

## 📖 About

**Paperless-AI** is an AI-powered extension for [Paperless-ngx](https://github.com/paperless-ngx/paperless-ngx) that brings automatic document classification, smart tagging, and semantic search using OpenAI-compatible APIs and Ollama.

This fork collects pending upstream PRs, applies security patches, and tests improvements. Since the upstream project is no longer actively maintained, it has grown into the most up-to-date version available.

> ⚠️ **Upstream Credit** – All original work belongs to [clusterzx](https://github.com/clusterzx)  
> 📦 **Current Version** – `v2026-02-28-01`

📖 **[Full documentation →](https://paperless-ai-next.admon.me/)**

---

## 🚀 Quick Start

### Docker Compose (Recommended)

**Lite version** – AI tagging & OCR only (~500–700 MB):

```yaml
services:
  paperless-ai:
    image: admonstrator/paperless-ai-next:latest-lite
    container_name: paperless-ai-next
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
    image: admonstrator/paperless-ai-next:latest-full
    container_name: paperless-ai-next
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
| `admonstrator/paperless-ai-next:latest-lite` | ~500–700 MB | ❌ |
| `admonstrator/paperless-ai-next:latest-full` | ~1.5–2 GB | ✅ |

**Docker Hub:** [admonstrator/paperless-ai-next](https://hub.docker.com/r/admonstrator/paperless-ai-next)

---

## ℹ️ More

| | |
|---|---|
| 📖 Full documentation | [paperless-ai-next.admon.me](https://paperless-ai-next.admon.me/) |
| 🐛 Report issues | [GitHub Issues](https://github.com/admonstrator/paperless-ai-next/issues) |
| 📜 License | MIT – original work by [clusterzx](https://github.com/clusterzx) |

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

<div align="center">

_Last updated: 2026-02-28_

</div>
