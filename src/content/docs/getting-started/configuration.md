---
title: "Configuration"
---

The initial installer now covers the main first-run configuration flow and writes values to `data/.env`.

For Docker automation (CI/CD, GitOps, immutable deployments), environment variables remain the preferred source of truth.

The settings are saved in `data/.env` inside your mounted data directory.

---

## Installer coverage (first run)

The installer configures:

- Admin account and optional MFA onboarding
- Paperless connection test
- Metadata-driven processing rules (include/exclude tags, processed tag, scan behavior)
- AI provider preset + connection test
- Optional Mistral OCR fallback
- Final `.env` preview and setup completion

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

See [OCR Queue](/features/ocr-queue/) for details.

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
| `TRUST_PROXY` | Express proxy trust setting (controls `X-Forwarded-*` handling) |
| `COOKIE_SECURE_MODE` | Controls whether auth/CSRF cookies are set with the `Secure` flag |

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
| `LOG_LEVEL` | Controls log verbosity for Node and Python services (`error`, `warn`, `info`, `debug`) |

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
| `MIN_CONTENT_LENGTH` | `10` | Minimum extracted content length before AI analysis is skipped |

## Cookie and proxy flags (all supported values)

### `COOKIE_SECURE_MODE`

This decides if login cookies are allowed on plain HTTP.

Quick rule:

- Use `never` if you open Paperless-AI with `http://...` in your browser (local LAN, no TLS).
- Use `auto` if you open Paperless-AI with `https://...` (reverse proxy/TLS).
- Use `always` only if your setup is HTTPS-only and you want to enforce it.

:::caution[Common pitfall on local HTTP]
If your instance is reachable via plain HTTP and login fails with `Invalid CSRF token`, do not assume `auto` is correct for your setup.

Use `COOKIE_SECURE_MODE=never` for local HTTP access and restart the service.
:::

| Value | Behavior | Typical use |
|---|---|---|
| `auto` (default) | Use secure cookies only when request is HTTPS (`req.secure` or `X-Forwarded-Proto=https`) | Reverse proxy/TLS setups |
| `always` | Always set secure cookies | Strict HTTPS-only deployments |
| `never` | Never set secure cookies | Local HTTP development without TLS |

### `TRUST_PROXY`

This tells Paperless-AI if it should trust proxy headers (like `X-Forwarded-Proto`).

Quick rule:

- No reverse proxy in front of Paperless-AI: use `false`.
- Reverse proxy in front (Nginx, Traefik, Caddy): use `1` (or another value matching your proxy chain).

Supported values:

- Empty or unset: disabled (`false`)
- Boolean-like: `true`, `false`, `yes`, `no`, `on`, `off`
- Numeric hop count: for example `1`, `2`
- Named/subnet forms supported by Express (for example `loopback`, `linklocal`, `uniquelocal`, or CIDR/ranges)

## Docker Compose examples

### Local HTTP (no TLS)

```yaml
services:
  paperless-ai:
    environment:
      - COOKIE_SECURE_MODE=never
      - TRUST_PROXY=false
```

### Behind HTTPS reverse proxy

```yaml
services:
  paperless-ai:
    environment:
      - COOKIE_SECURE_MODE=auto
      - TRUST_PROXY=1
```

:::note
Many boolean-style variables accept `yes/no`, `true/false`, and `1/0`. For consistency, prefer `yes` or `no`.
:::
