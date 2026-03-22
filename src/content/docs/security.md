---
title: "Security Policy"
---


## Reporting a vulnerability

Please **do not** open a public issue for security vulnerabilities.

Instead, use [GitHub Security Advisories](https://github.com/admonstrator/paperless-ai-next/security/advisories/new) to report a vulnerability privately. We'll respond as quickly as possible.

---

## Security notes

- Paperless-AI next requires access to your Paperless-ngx API. Use a dedicated API token with the minimum required permissions.
- If you use an external AI provider (OpenAI, Azure, Mistral), your document text is sent to that provider. Review their privacy and data retention policies.
- Using Ollama keeps all data on your own network.
- The web UI should not be exposed to the public internet without additional authentication (reverse proxy with auth, VPN, etc.).

---

## Setup endpoint protection

On a fresh (unconfigured) instance, the setup wizard (`/setup` and `/api/setup/*`) is accessible without authentication. To prevent an unauthenticated remote attacker from taking over an unfinished deployment, access to these endpoints is **restricted to localhost by default**.

To allow setup access from a remote browser (for example when running in Docker where bridge networking means the host is not `127.0.0.1` inside the container), set:

```
ALLOW_REMOTE_SETUP=yes
```

This restriction is **automatically lifted** as soon as setup is completed — no further action is needed at that point. As a best practice, remove `ALLOW_REMOTE_SETUP=yes` from your environment after finishing the initial setup.
