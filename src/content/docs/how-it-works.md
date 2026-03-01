---
title: "How It Works"
---


You don't need to understand any of this to use Paperless-AI next. But if you're curious what's happening under the hood, here's the short version.

---

## The two services

Paperless-AI next runs two background services:

**The main service** (Node.js) handles the web interface, processes documents, communicates with Paperless-ngx, and talks to your AI provider. This is always running.

**The search service** (Python, Full image only) maintains a local vector database of your documents so the AI Chat can search through them semantically. It runs alongside the main service.

Both are managed automatically – you never need to start or stop them manually.

---

## The processing loop

Every few minutes (configurable), Paperless-AI next checks your Paperless-ngx instance for new documents. When it finds one:

1. It fetches the document text from Paperless-ngx
2. Sends the text to your AI provider with instructions about what to extract
3. Receives the AI's response (suggested tags, title, document type, etc.)
4. Writes the metadata back to Paperless-ngx
5. Saves a snapshot of the original state so you can restore it later

If a document can't be processed (too short, AI unavailable), it retries a few times before moving on. Nothing gets stuck.

---

## The AI Chat index

When you add a document to Paperless-ngx, the search service creates a mathematical representation of the text and stores it locally. When you ask a question in the AI Chat, your question gets the same treatment and the system finds documents whose representation is similar to your question – that's how it can answer *"electricity bill from January"* even if the bill never uses those exact words.

---

## Your data

Everything is stored in the `./data` volume you mount into the container:

- `data/.env` – Your configuration
- `data/documents.db` – Processing history, metrics, user accounts
- `data/chromadb/` – Vector index for AI Chat (Full image only)

Paperless-AI next does not send your documents anywhere except to the AI provider you configured. If you use Ollama, nothing leaves your network at all.
