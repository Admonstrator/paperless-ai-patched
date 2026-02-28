# Configuration

All settings can be changed through the web interface at **/settings**. You don't need to edit files manually.

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

### Azure OpenAI
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

See [OCR Queue](../features/ocr-queue.md) for details.

---

## Advanced

These settings are configured via environment variables in your `docker-compose.yml`:

| Variable | Default | Description |
|---|---|---|
| `TAG_CACHE_TTL_SECONDS` | `300` | How long to cache the tag list from Paperless-ngx (seconds) |
| `GLOBAL_RATE_LIMIT_MAX` | `120` | Max requests per 15-minute window per user |
| `GLOBAL_RATE_LIMIT_WINDOW_MS` | `900000` | Rate limit window in milliseconds |
| `API_KEY` | _(empty)_ | Static API key for external integrations |

