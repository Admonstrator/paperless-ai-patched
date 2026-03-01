---
title: "OCR Queue"
---


:::note[Requires Mistral API key]
The OCR Queue uses [Mistral AI's](https://mistral.ai) OCR service. You need a Mistral API key to use this feature.
:::

Some documents scan poorly – handwritten notes, faxes, low-resolution scans. When Paperless-ngx can't extract readable text, the AI has nothing to work with and the document gets skipped or poorly tagged.

The OCR Queue is the rescue system for these documents.

---

## How it works

When Paperless-AI next encounters a document with very little or unreadable text, it automatically adds it to the **OCR Queue** instead of skipping it silently.

From **/ocr** you can then:

1. See all queued documents
2. Press **Process Queue** to send them through Mistral's OCR API
3. Mistral reads the document image and extracts proper text
4. The improved text is written back to Paperless-ngx
5. Optionally, the AI tagging pipeline runs automatically on the freshly extracted text

Progress is shown in real time while the queue processes.

---

## Enabling it

In **/settings**, enable **Mistral OCR Queue** and enter your Mistral API key. That's it – documents with poor OCR will now be queued automatically.

---

## Which documents end up in the queue?

Documents whose extracted text falls below a minimum quality threshold are added automatically. You can also add documents manually from the History page if you notice a specific one was poorly classified.

---

## Cost

The OCR feature uses Mistral's paid API. Check [Mistral's pricing](https://mistral.ai/pricing) for current rates. For most home users, the cost is negligible.
