# First Setup

After starting the container for the first time, open [http://localhost:3000](http://localhost:3000) in your browser. You'll be greeted by the setup wizard.

---

## Step 1: Create an Admin Account

Choose a username and a secure password. This account is used to log in to Paperless-AI.

---

## Step 2: Connect to Paperless-ngx

You'll need two things from your Paperless-ngx instance:

**API URL** – The address of your Paperless-ngx server, e.g. `http://paperless:8000` or `http://192.168.1.100:8000`. If Paperless-ngx and Paperless-AI are in the same Docker network, use the service name (e.g. `http://paperless-ngx:8000`).

**API Token** – Found in Paperless-ngx under *Settings → API Tokens*. Create a new token with full permissions.

---

## Step 3: Choose Your AI Provider

Select which AI service should analyze your documents:

| Provider | What you need |
|---|---|
| **OpenAI** | An API key from [platform.openai.com](https://platform.openai.com) |
| **Ollama** | Ollama running locally or on your server |
| **Azure OpenAI** | Azure endpoint + API key + deployment name |
| **Custom / Compatible** | Any OpenAI-compatible API URL + key |

Not sure which to pick? **Ollama** is the privacy-friendly choice (everything runs locally). **OpenAI** is the easiest to get started with.

---

## Step 4: Configure Processing Preferences

- **Which documents to process** – All new documents, or only those with a specific tag
- **What to assign** – Tags, document type, correspondent, language
- **Restrictions** – Should the AI only use tags and correspondents that already exist in Paperless-ngx?

---

## Step 5: Save and Restart

Click **Save**. Then restart the container once to apply the configuration and start the background processing service.

!!! warning "Don't skip the restart"
    The document processing loop only starts after a clean restart following the initial setup.

---

## You're Done!

Paperless-AI will now automatically pick up new documents added to Paperless-ngx, analyze them, and assign metadata. Check the [History](../features/history.md) page to see what's been processed.
