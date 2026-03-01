---
title: "AI Chat (RAG)"
---


:::note[Full image only]
The AI Chat feature requires the **Full** image (`latest-full`). It is not available in the Lite image.
:::

The AI Chat lets you have a conversation with your document archive. Instead of searching for keywords, you can ask natural language questions and get answers based on the actual content of your documents.

---

## Examples

- *"What was my electricity bill in January?"*
- *"Do I have any documents from Deutsche Telekom?"*
- *"When does my car insurance expire?"*
- *"Show me all invoices over 500 euros from last year."*

---

## How to use it

Navigate to **RAG Chat** in the sidebar. Type your question and press Enter. The AI will search through your documents and answer based on what it finds, citing the relevant source documents.

---

## First-time setup

After starting the Full image for the first time, the system needs to index all existing documents. This happens automatically but can take a few minutes depending on your archive size.

If the chat returns no results at first, wait a moment and try again, or trigger a manual re-index from the RAG Chat settings.

---

## Privacy note

With the Full image, document text and embeddings are stored locally in a ChromaDB vector database inside your `./data` volume. No document content is sent to any external service unless your chosen AI provider is cloud-based (e.g. OpenAI). Using Ollama keeps everything on your own machine.
