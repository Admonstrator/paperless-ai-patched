---
title: "Installation"
---


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
    container_name: paperless-ai-next
    restart: unless-stopped
    ports:
      - "3000:3000"
    volumes:
      - data:/app/data
    environment:
      - PAPERLESS_AI_INITIAL_SETUP=yes
      # Required to access the setup wizard from a remote browser.
      # Remove this line after completing the initial setup.
      - ALLOW_REMOTE_SETUP=yes

volumes:
  data:
```

### Full – AI tagging + semantic search

Larger image (~1.5–2 GB). Includes everything from Lite plus the RAG AI chat that lets you ask questions about your documents.

```yaml
services:
  paperless-ai:
    image: admonstrator/paperless-ai-next:latest-full
    container_name: paperless-ai-next
    restart: unless-stopped
    ports:
      - "3000:3000"
    volumes:
      - data:/app/data
    environment:
      - PAPERLESS_AI_INITIAL_SETUP=yes
      # Required to access the setup wizard from a remote browser.
      # Remove this line after completing the initial setup.
      - ALLOW_REMOTE_SETUP=yes

volumes:
  data:
```

---

## Start it up

:::caution[Important]
It is highly recommended to use an reverse proxy (e.g. Nginx, Caddy) in front of Paperless-AI next for security and performance, especially if you expose it to the internet - which is not a recommended practice at this time.
:::

```bash
docker compose up -d
```

Then open `http://<your-host>:3000` in your browser and follow the [First Setup](/getting-started/first-setup/) guide.

:::caution[Remote setup access]
By default, the setup wizard is only accessible from **localhost**. When running in Docker, your browser connects through the Docker bridge network and is not considered local. The `ALLOW_REMOTE_SETUP=yes` variable above lifts this restriction so you can complete the initial setup from any machine.

Once setup is finished, **remove `ALLOW_REMOTE_SETUP=yes`** from your Compose file and redeploy — the protection is restored automatically as soon as setup is marked complete, regardless.
:::

Need all available Docker environment variables? See the [Configuration reference](/getting-started/configuration/#docker-environment-variables).

:::note[Local HTTP without TLS]
If you run Paperless-AI locally over plain HTTP (no reverse proxy/TLS), set `COOKIE_SECURE_MODE=never`.
For details and all supported cookie/proxy flag values, see [Configuration](/getting-started/configuration/#cookie-and-proxy-flags-all-supported-values).
:::

:::note[Installer + env workflow]
The new installer covers the complete first-run path (admin, optional MFA, Paperless test, metadata rules, AI test, optional OCR, and review/finish).

For reproducible infrastructure (CI/CD, GitOps, immutable deployments), you can still pre-seed values via environment variables and use the installer mainly as a validation and bootstrap UI.
:::

:::tip[Same Docker network as Paperless-ngx?]
If you run both containers in the same Docker Compose project or network, use the service name as the Paperless-ngx URL (e.g. `http://paperless-ngx:8000`) instead of `localhost`.
:::

---

## Updates

```bash
docker compose pull
docker compose up -d
```

Your data (in `./data`) is preserved across updates.
