# Paperless-AI next

**Automatically tag, sort, and search your documents using AI – no cloud required.**

[![Latest Release](https://img.shields.io/github/v/release/admonstrator/paperless-ai-next?style=for-the-badge&logo=github&color=blue)](https://github.com/admonstrator/paperless-ai-next/releases/latest)
[![Docker Pulls](https://img.shields.io/docker/pulls/admonstrator/paperless-ai-next?style=for-the-badge&logo=docker)](https://hub.docker.com/r/admonstrator/paperless-ai-next)
[![License](https://img.shields.io/github/license/admonstrator/paperless-ai-next?style=for-the-badge)](LICENSE)
[![Stars](https://img.shields.io/github/stars/admonstrator/paperless-ai-next?style=for-the-badge)](https://github.com/admonstrator/paperless-ai-next/stargazers)
[![Docs](https://img.shields.io/badge/docs-paperless--ai--next.admon.me-blue?style=for-the-badge&logo=readthedocs)](https://paperless-ai-next.admon.me/)

[![GitHub Sponsors](https://img.shields.io/badge/GitHub-Sponsors-EA4AAA?style=for-the-badge&logo=github)](https://github.com/sponsors/admonstrator) [![Buy Me A Coffee](https://img.shields.io/badge/Buy%20Me%20A%20Coffee-FFDD00?style=for-the-badge&logo=buy-me-a-coffee&logoColor=black)](https://buymeacoffee.com/admon) [![Ko-fi](https://img.shields.io/badge/Ko--fi-FF5E5B?style=for-the-badge&logo=ko-fi&logoColor=white)](https://ko-fi.com/admon) [![PayPal](https://img.shields.io/badge/PayPal-00457C?style=for-the-badge&logo=paypal&logoColor=white)](https://paypal.me/aaronviehl)

Also consider supporting the **original author**: [![Patreon](https://img.shields.io/badge/Patreon-F96854?style=flat&logo=patreon&logoColor=white)](https://www.patreon.com/c/clusterzx)

---

Paperless-AI next connects to your [Paperless-ngx](https://github.com/paperless-ngx/paperless-ngx) instance and uses an AI of your choice to automatically read, understand, and classify your documents.

Every time a new document lands in Paperless-ngx, Paperless-AI next picks it up, figures out what it is, and assigns the right tags, title, document type, and correspondent – so you don't have to.

---

## What it does

**Automatic tagging** – New documents get analyzed and tagged automatically. You define the rules; the AI does the work.

**Smart search** – Ask questions like *"What did I pay for electricity last March?"* and get an answer based on your actual documents.

**Manual control** – Process any document on demand through the web interface, tweak results, or revert AI changes with one click.

**OCR rescue** – Poorly scanned documents can be sent through Mistral's OCR API to extract readable text before tagging.

---

## Supported AI providers

Works with OpenAI, Ollama (local), Azure OpenAI, DeepSeek, OpenRouter, Perplexity, Google Gemini (via compatibility layer), LiteLLM, and any OpenAI-compatible endpoint. Full local operation is supported via Ollama.

---

## Two image variants

| | **Lite** | **Full** |
|---|---|---|
| AI auto-tagging | ✅ | ✅ |
| Manual processing | ✅ | ✅ |
| OCR rescue with Mistral | ✅ | ✅ |
| RAG semantic search | ❌ | ✅ |
| Image size | ~500–700 MB | ~1.5–2 GB |

---

## Quick Start

```yaml
services:
  paperless-ai:
    image: admonstrator/paperless-ai-next:latest-lite
    container_name: paperless-ai
    restart: unless-stopped
    ports:
      - "3000:3000"
    volumes:
      - ./data:/app/data
    environment:
      - PAPERLESS_AI_INITIAL_SETUP=yes
```

Open [http://localhost:3000](http://localhost:3000) and follow the setup wizard.

→ [Full installation guide](getting-started/installation.md)
