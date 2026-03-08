---
title: "First Setup"
---

After starting the container for the first time, open [http://localhost:3000](http://localhost:3000) in your browser.

Paperless-AI next now uses a guided **7-step initial installer** with built-in validation for Paperless and AI connectivity.

Need all available Docker environment variables? See the [Configuration reference](/getting-started/configuration/#docker-environment-variables).

## Before you start

Have these values ready:

- Paperless-ngx URL (base URL, not `/api`)
- Paperless username
- Paperless API token
- AI provider details (provider URL, model, and credentials if required)

:::tip
If Paperless-ngx and Paperless-AI next run in the same Docker network, use the service name (for example `http://paperless-ngx:8000`) instead of `localhost`.
:::

:::note[MFA lockout recovery]
If you later enable MFA and lose access to your authenticator, use the in-container MFA reset CLI.
See [Troubleshooting -> MFA lockout recovery](/getting-started/troubleshooting/#mfa-lockout-recovery).
:::

---

## Installer steps

| Step | What happens |
| --- | --- |
| **1. Admin account** | Create the first local Paperless-AI next admin user (password must be at least 8 characters). |
| **2. MFA setup (optional)** | Optionally enable MFA for that admin account and confirm a TOTP code. |
| **3. Paperless connection** | Enter Paperless URL, username, and token, then run **Test Paperless connection**. |
| **4. Paperless metadata** | Load document/tag/correspondent counts and define include/exclude/processed tag behavior plus scan interval. |
| **5. AI credentials** | Select a provider preset, configure API URL/model/token, then run **Test AI connection**. |
| **6. Mistral OCR (optional)** | Enable OCR fallback and set Mistral credentials/model if needed. |
| **7. Review and finish** | Review generated `.env` values, copy them if needed, and finalize setup. |

### Provider notes

- `openai` and `azure` require an API token.
- `custom` endpoints can leave token empty if the endpoint allows anonymous access.
- `ollama` uses URL + model and usually no token.

### Validation gates

- Step 3 and step 5 include explicit connection tests.
- You can continue after a failed test, but this should only be used for advanced scenarios where reachability is expected later.

---

## What happens after Finish?

When you click **Save and restart container**, the installer writes configuration to `data/.env`, creates the admin user, and triggers an app restart.

In most Docker setups (`restart: unless-stopped`), this restart happens automatically.

If your container is not configured to auto-restart, restart it manually once.

After successful setup:

- `/setup` is no longer accessible
- you are redirected to login
- further changes are done via `/settings`

---

## You're Done

Paperless-AI next will now automatically pick up new documents added to Paperless-ngx, analyze them, and assign metadata based on your selected rules. Check [History](/features/history/) to see what has been processed.
