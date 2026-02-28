# History & Restore

The **History** page gives you a complete log of everything Paperless-AI next has done. Every document that was processed appears here with the full details of what the AI decided – and you can undo any of it.

---

## What you can see

Click on any row in the history table to open the **Info Modal**, which shows:

- **Tags** – What the AI assigned, with a color-coded diff: green for new tags, red for removed tags
- **Document type and language** – What was detected
- **Custom fields** – Any values assigned
- **Token usage** – How many tokens the AI used for this document (relevant if you're on a paid plan)
- **Original state** – What the document looked like *before* Paperless-AI next touched it

---

## Rescan

If you're not happy with the AI's result, click **Rescan** in the Info Modal. The document will be re-sent to the AI using your current settings. Useful if you've changed your AI configuration or prompts since the document was first processed.

---

## Restore Original

Made a mistake or the AI went completely off track? Click **Restore Original** to revert the document to exactly the state it was in before Paperless-AI next processed it – tags, title, document type, correspondent, language, all of it.

!!! tip
    The original state is captured the moment Paperless-AI next first processes a document. Restoring is always possible as long as the history entry exists.

---

## Cleanup

Over time, documents you delete in Paperless-ngx will leave behind orphaned history entries. Use the **Validate History** button to find them, and **Cleanup** to remove them in bulk.
