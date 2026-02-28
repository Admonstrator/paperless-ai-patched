# Automatic Tagging

Paperless-AI next constantly monitors your Paperless-ngx inbox. Every few minutes (configurable), it checks for new documents and processes them automatically.

---

## What gets assigned

For each document, the AI reads the full text and determines:

- **Title** – A clean, descriptive title
- **Tags** – What category/categories the document belongs to
- **Document type** – Invoice, letter, contract, etc.
- **Correspondent** – Who sent or issued the document
- **Language** – Detected automatically

---

## Processing rules

### Process all documents or only specific ones?

By default, every new document gets processed. If you only want to process documents that you've manually marked (e.g. with an "AI" tag), enable **Process only tagged documents** in Settings and specify those tags.

### Use existing tags only

If you want the AI to stay within your current tag structure and not invent new tags, enable **Restrict to existing tags**. The same option exists for correspondents.

---

## What happens if something goes wrong?

If the AI fails to process a document (e.g. the text is too short or the AI is unavailable), it retries up to 3 times before giving up and moving on. No document blocks the queue permanently.

You can always re-process a document manually from the [History](history.md) page.

---

## Tips

- **Better results**: The more text a document contains, the better the AI can classify it. Scanned documents with poor OCR quality may produce poor results – see [OCR Queue](ocr-queue.md).
- **Custom field support**: Date and Boolean custom fields defined in Paperless-ngx are also populated by the AI.
- **Token usage**: Processing costs are tracked per document and visible in the History Info-Modal.
