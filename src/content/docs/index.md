---
title: "Paperless-AI next"
---

<style>
main > .content-panel:first-of-type {
  display: none;
}
</style>

![Paperless AI next logo with text Paperless AI and next, beside a smiling gray seal hugging and stamping a stack of glowing digital documents marked PDF, on a clean transparent background with a friendly playful tone](./assets/logo.png)

<div class="badges-row not-content">
<b>Automatically tag, sort, and search your documents using local or hosted AI</b>

  <a href="https://github.com/admonstrator/paperless-ai-next/releases/latest">
  <img src="https://img.shields.io/github/v/release/admonstrator/paperless-ai-next?style=for-the-badge&logo=github&color=blue" alt="Latest Release" />
  </a>
  <a href="https://hub.docker.com/r/admonstrator/paperless-ai-next">
    <img src="https://img.shields.io/docker/pulls/admonstrator/paperless-ai-next?style=for-the-badge&logo=docker" alt="Docker Pulls" />
  </a>
  <a href="https://github.com/admonstrator/paperless-ai-next/stargazers">
    <img src="https://img.shields.io/github/stars/admonstrator/paperless-ai-next?style=for-the-badge" alt="Stars" />
  </a>
  <a href="https://github.com/admonstrator/paperless-ai-next/blob/main/LICENSE">
    <img src="https://img.shields.io/github/license/admonstrator/paperless-ai-next?style=for-the-badge" alt="License" />
  </a>
</div>

***

## About Paperless-AI next

Paperless-AI next is a fork of the original [Paperless-AI](https://github.com/clusterzx/paperless-ai) project, created to build on its foundation with many new features and ongoing maintenance. The goal is to continue development in an open and community-driven way, with regular updates, cool features, and a strong focus on user feedback. 

It connects to your [Paperless-ngx](https://github.com/paperless-ngx/paperless-ngx) instance and uses an AI of your choice to automatically read, understand, and classify your documents.

Every time a new document lands in Paperless-ngx, Paperless-AI next picks it up, figures out what it is, and assigns the right tags, title, document type, and correspondent – so you don't have to. And if OCR quality is poor, it can even send the document through a dedicated Mistral OCR queue before tagging.

***

## Support the project

If Paperless-AI next saves you time, consider supporting development:

<div class="badges-row not-content">
  <a href="https://github.com/sponsors/admonstrator">
    <img src="https://img.shields.io/badge/GitHub-Sponsors-EA4AAA?style=for-the-badge&logo=github" alt="GitHub Sponsors" />
  </a>
  <a href="https://buymeacoffee.com/admon">
    <img src="https://img.shields.io/badge/Buy%20Me%20A%20Coffee-FFDD00?style=for-the-badge&logo=buy-me-a-coffee&logoColor=black" alt="Buy Me A Coffee" />
  </a>
  <a href="https://ko-fi.com/admon">
    <img src="https://img.shields.io/badge/Ko--fi-FF5E5B?style=for-the-badge&logo=ko-fi&logoColor=white" alt="Ko-fi" />
  </a>
  <a href="https://paypal.me/aaronviehl">
    <img src="https://img.shields.io/badge/PayPal-00457C?style=for-the-badge&logo=paypal&logoColor=white" alt="PayPal" />
  </a>
</div>

### Support the original author

If you want to support the original project that laid the foundation for this fork, consider supporting [**clusterzx**](https://github.com/clusterzx) via Patreon:

<div class="badges-row not-content">
  <a href="https://www.patreon.com/c/clusterzx">
    <img src="https://img.shields.io/badge/Patreon-F96854?style=for-the-badge&logo=patreon&logoColor=white" alt="Patreon" />
  </a>
</div>

***

## Core features

### Automatic tagging

New documents get analyzed and tagged automatically. You define the rules; the AI does the work.

### Smart search

Ask questions like *"What did I pay for electricity last March?"* and get an answer based on your actual documents.

### Manual control

Process any document on demand through the web interface, tweak results, or revert AI changes with one click.

## Exclusive to Paperless-AI next

### OCR rescue queue (Mistral)

Poorly scanned documents can be sent through a dedicated OCR queue before tagging.

### History info modal + rescan

Detailed history view with metadata/tag diff, token stats, and one-click rescan.

### Restore original metadata

Restore original title, tags, correspondent, plus document type and language from history.

### Ignore tags processing filter

Exclude selected documents from AI processing and keep dashboard stats consistent.

### Permanently failed queue

Documents with hard AI/OCR failures are tracked separately with manual reset flow.

### Date/Boolean custom fields

Settings UI supports additional custom field types (Date and Boolean).

***

## Supported AI providers

Works with OpenAI, Ollama (local), Azure OpenAI, DeepSeek, OpenRouter, Perplexity, Google Gemini (via compatibility layer), LiteLLM, and any OpenAI-compatible endpoint. Full local operation is supported via Ollama.

***

## Two image variants

| | **Lite** | **Full** |
|---|---|---|
| AI auto-tagging | ✅ | ✅ |
| Manual processing | ✅ | ✅ |
| OCR rescue with Mistral | ✅ | ✅ |
| RAG semantic search | ❌ | ✅ |
| Image size | ~500–700 MB | ~1.5–2 GB |

***

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

→ [Full installation guide](getting-started/installation/)
