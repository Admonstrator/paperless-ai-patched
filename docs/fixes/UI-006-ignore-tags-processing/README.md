# UI-006: Ignore Tags for Processing and Statistics

## Background

Bisher konnte die Verarbeitung auf bestimmte Tags eingeschränkt werden (`TAGS` + `PROCESS_PREDEFINED_DOCUMENTS`), aber es gab keine Möglichkeit, Tags explizit auszuschließen.

Für viele Workflows ist das notwendig, z. B. wenn Dokumente mit bestimmten Markierungen nie automatisch verarbeitet werden sollen.

## Changes

- `views/setup.ejs`
  - Neues Eingabefeld **Ignore Tags** ergänzt.
  - Werte werden als CSV in `ignoreTags` gespeichert.
- `views/settings.ejs`
  - Neues Eingabefeld **Ignore Tags** ergänzt.
  - Werte werden als CSV in `ignoreTags` gespeichert.
- `public/js/setup.js`
  - Tag-Manager erweitert, damit zusätzlich die Ignore-Tag-Liste gepflegt werden kann.
- `public/js/settings.js`
  - Zusätzlicher `TagsManager` für Ignore-Tags initialisiert.
- `routes/setup.js`
  - Setup/Settings GET: `IGNORE_TAGS` geladen und als Array normalisiert.
  - Setup/Settings POST: `ignoreTags` verarbeitet und als `IGNORE_TAGS` persistiert.
  - Dashboard: Dokumentanzahl auf **effektiv verarbeitbare** Dokumente umgestellt.
- `services/paperlessService.js`
  - Include-/Exclude-Tag-Helfer ergänzt (`parseTagList`, `resolveTagIdsByName`, `filterDocumentsByExcludedTagIds`).
  - `getAllDocuments()` filtert jetzt zusätzlich nach `IGNORE_TAGS`.
  - `getEffectiveDocumentCount()` ergänzt (für Dashboard-Statistik).
- `config/config.js`
  - `ignoreTags` aus `IGNORE_TAGS` ergänzt.
- `tests/test-ignore-tags-filter.js`
  - Neue Tests für Include+Exclude, Exclude-only und ohne Exclude.

## Testing

```bash
node tests/test-ignore-tags-filter.js
```

Zusätzlich manuell geprüft:

- Setup/Settings zeigen Ignore-Tags an und speichern sie.
- Reguläre Scans verarbeiten Dokumente mit Ignore-Tags nicht.
- Dashboard nutzt die bereinigte Gesamtmenge.

## Impact

- Funktionalität: Administrierbares Ausschließen von Tags bei regulären Scans.
- UX: Neue Felder in Setup und Settings.
- Statistik: Dashboard zählt verarbeitbare Dokumente (Exclude-bereinigt).

## Upstream Status

- [x] Not submitted
- [ ] PR opened
- [ ] Merged upstream
- [ ] Upstream declined
