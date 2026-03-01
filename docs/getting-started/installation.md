# Installation

## Requirements

- Docker and Docker Compose
- A running [Paperless-ngx](https://github.com/paperless-ngx/paperless-ngx) instance
- An AI provider account or local Ollama instance
- ~512 MB RAM (Lite) or ~2 GB RAM (Full with RAG)

---

## Choose your image

**Not sure which to pick?** Start with Lite. You can switch to Full later if you want the semantic search chat.

### Lite – AI tagging only

The smallest image (~500–700 MB). Automatically tags, titles, and classifies documents. No RAG semantic search.

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

### Full – AI tagging + semantic search

Larger image (~1.5–2 GB). Includes everything from Lite plus the RAG AI chat that lets you ask questions about your documents.

```yaml
services:
  paperless-ai:
    image: admonstrator/paperless-ai-next:latest-full
    container_name: paperless-ai
    restart: unless-stopped
    ports:
      - "3000:3000"
    volumes:
      - ./data:/app/data
    environment:
      - PAPERLESS_AI_INITIAL_SETUP=yes
```

---

## Start it up

```bash
docker compose up -d
```

Then open [http://localhost:3000](http://localhost:3000) and follow the [First Setup](first-setup.md) guide.

Need all available Docker environment variables? See the [Configuration reference](configuration.md#docker-environment-variables).

!!! warning "Important"
  Because the setup assistant does not yet cover all options, Docker environment variables are currently near-mandatory for reliable deployments. At minimum, set: `PAPERLESS_API_URL`, `PAPERLESS_API_TOKEN`, `AI_PROVIDER`, and provider-specific credentials (for example `OPENAI_API_KEY`, or `OLLAMA_API_URL` + `OLLAMA_MODEL`, or `AZURE_*`, or `CUSTOM_*`).

!!! tip "Same Docker network as Paperless-ngx?"
    If you run both containers in the same Docker Compose project or network, use the service name as the Paperless-ngx URL (e.g. `http://paperless-ngx:8000`) instead of `localhost`.

---

## Updates

```bash
docker compose pull
docker compose up -d
```

Your data (in `./data`) is preserved across updates.
