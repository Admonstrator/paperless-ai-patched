---
title: "Configuration"
---


The setup assistant is currently not fully aligned with all available options.

For Docker deployments, environment variables should be treated as the primary configuration method (especially for initial setup and automation).

The settings are saved in `data/.env` inside your mounted data directory.

---

## Connection

| Setting | What it does |
|---|---|
| **Paperless-ngx URL** | The address of your Paperless-ngx server |
| **Paperless-ngx API Token** | Found in Paperless-ngx under *Settings → API Tokens* |

---

## AI Provider

Choose the AI that reads and classifies your documents.

### OpenAI
Enter your API key and choose a model (e.g. `gpt-4o`, `gpt-4`). Requires an account at [platform.openai.com](https://platform.openai.com).

### Ollama
Enter the URL of your Ollama instance and the model name (e.g. `mistral`, `llama3`). Everything runs locally, no data leaves your network.

### Azure OpenAI variables
Requires your Azure endpoint, deployment name, API key, and API version.

### Custom / Compatible endpoint
For DeepSeek, OpenRouter, Perplexity, Gemini, LiteLLM, and others: enter the base URL, model name, and API key.

---

## Processing

| Setting | What it does |
|---|---|
| **Scan interval** | How often to check for new documents (default: every 5 minutes) |
| **Assign tags** | Whether the AI assigns tags |
| **Assign correspondent** | Whether the AI assigns a correspondent |
| **Restrict to existing tags** | AI only uses tags that already exist in Paperless-ngx |
| **Restrict to existing correspondents** | AI only uses correspondents that already exist |
| **Process only tagged documents** | If enabled, only documents with a specific tag are processed |

---

## Mistral OCR Queue

| Setting | What it does |
|---|---|
| **Enable OCR Queue** | Activates the OCR rescue feature for poorly scanned documents |
| **Mistral API Key** | Your [Mistral AI](https://mistral.ai) API key |

See [OCR Queue](../features/ocr-queue/) for details.

---

## Docker Environment Variables

Most settings are stored in `data/.env`.

For Docker setups, you should pre-seed/manage configuration via environment variables using this reference:

### Core connection & auth

| Variable | Description |
|---|---|
| `PAPERLESS_API_URL` | Base URL of your Paperless-ngx instance (for example `http://paperless-ngx:8000`) |
| `PAPERLESS_API_TOKEN` | API token used to access Paperless-ngx |
| `PAPERLESS_USERNAME` | Optional Paperless username used in user-specific lookups |
| `API_KEY` | Static API key for external integrations (`x-api-key` header) |
| `JWT_SECRET` | Secret used to sign and verify JWT login cookies |
| `PAPERLESS_AI_PORT` | Port the Paperless-AI web app listens on |
| `PAPERLESS_AI_INITIAL_SETUP` | Enables first-run setup mode (`yes`/`no`) |

### AI provider selection & shared behavior

| Variable | Description |
|---|---|
| `AI_PROVIDER` | Active provider: `openai`, `ollama`, `custom`, or `azure` |
| `SYSTEM_PROMPT` | Base system prompt used for document analysis instructions |
| `TOKEN_LIMIT` | Max input token budget used for prompt/document content |
| `RESPONSE_TOKENS` | Max output tokens requested from the AI model |
| `USE_EXISTING_DATA` | Include existing Paperless metadata in analysis (`yes`/`no`) |
| `DISABLE_AUTOMATIC_PROCESSING` | Disables scheduled background processing (`yes`/`no`) |
| `SCAN_INTERVAL` | Cron expression for document scan frequency |

### Processing scope, tagging & prompt restrictions

| Variable | Description |
|---|---|
| `PROCESS_PREDEFINED_DOCUMENTS` | Process only documents that match predefined tag rules (`yes`/`no`) |
| `TAGS` | Comma-separated tags used when predefined processing is enabled |
| `ADD_AI_PROCESSED_TAG` | Add a marker tag after processing (`yes`/`no`) |
| `AI_PROCESSED_TAG_NAME` | Name of the marker tag (default commonly `ai-processed`) |
| `USE_PROMPT_TAGS` | Restrict AI output tags to `PROMPT_TAGS` (`yes`/`no`) |
| `PROMPT_TAGS` | Allowed tags passed into the prompt (comma-separated list) |
| `ACTIVATE_TAGGING` | Enable/disable AI assignment of tags (`yes`/`no`) |
| `ACTIVATE_CORRESPONDENTS` | Enable/disable correspondent assignment (`yes`/`no`) |
| `ACTIVATE_DOCUMENT_TYPE` | Enable/disable document type assignment (`yes`/`no`) |
| `ACTIVATE_TITLE` | Enable/disable title generation (`yes`/`no`) |
| `ACTIVATE_CUSTOM_FIELDS` | Enable/disable AI population of custom fields (`yes`/`no`) |
| `CUSTOM_FIELDS` | Custom field mapping/payload used for AI-assisted field filling |

### Custom / compatible AI provider

| Variable | Description |
|---|---|
| `CUSTOM_BASE_URL` | Base URL for OpenAI-compatible endpoints (DeepSeek, OpenRouter, LiteLLM, etc.) |
| `CUSTOM_API_KEY` | API key for the custom provider |
| `CUSTOM_MODEL` | Model name used with the custom provider |

### Azure OpenAI

| Variable | Description |
|---|---|
| `AZURE_ENDPOINT` | Azure OpenAI endpoint URL |
| `AZURE_API_KEY` | Azure OpenAI API key |
| `AZURE_DEPLOYMENT_NAME` | Azure deployment/model deployment name |
| `AZURE_API_VERSION` | Azure OpenAI API version |

### RAG & OCR

| Variable | Description |
|---|---|
| `RAG_SERVICE_ENABLED` | Enables/disables the RAG chat feature |
| `MISTRAL_OCR_ENABLED` | Enables OCR fallback queue for low-quality scans (`yes`/`no`) |
| `MISTRAL_API_KEY` | API key for Mistral OCR |
| `MISTRAL_OCR_MODEL` | Mistral OCR model (default: `mistral-ocr-latest`) |

## Advanced tuning

These are useful mostly for scaling and hardening.

| Variable | Default | Description |
|---|---|---|
| `TAG_CACHE_TTL_SECONDS` | `300` | How long to cache the tag list from Paperless-ngx (seconds) |
| `GLOBAL_RATE_LIMIT_MAX` | `1000` | Max requests per 15-minute window per user |
| `GLOBAL_RATE_LIMIT_WINDOW_MS` | `900000` | Rate limit window in milliseconds |

:::note
Many boolean-style variables accept `yes/no`, `true/false`, and `1/0`. For consistency, prefer `yes` or `no`.
:::

