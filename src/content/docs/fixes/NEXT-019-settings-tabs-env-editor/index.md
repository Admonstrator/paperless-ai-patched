# NEXT-019: Settings UI rework with tab groups and runtime ENV editor

## Background
The settings page had grown into a long, hard-to-navigate single form. It was difficult to see which options belong together, and several runtime-relevant Docker environment variables were not configurable from the UI.

The goal of this fix is to make settings maintenance faster and safer by introducing grouped tabs, adding inline hints for each setting, exposing additional runtime-relevant environment variables, and improving secret handling.

## Changes
- `views/settings.ejs`
  - Reworked the settings form into grouped tabs: **System**, **AI**, **OCR**, and **Troubleshooting**.
  - Added inline ENV hints for fields to show variable mapping and restart behavior.
  - Added new settings sections for missing runtime-relevant variables:
    - OCR (`MISTRAL_OCR_ENABLED`, `MISTRAL_API_KEY`, `MISTRAL_OCR_MODEL`)
    - Troubleshooting/System (`RAG_SERVICE_ENABLED`, `RAG_SERVICE_URL`, `GLOBAL_RATE_LIMIT_WINDOW_MS`, `GLOBAL_RATE_LIMIT_MAX`, `TRUST_PROXY`, `MIN_CONTENT_LENGTH`, `PAPERLESS_AI_PORT`, `EXTERNAL_API_ALLOW_PRIVATE_IPS`)
  - Sensitive input fields now use masked placeholders instead of rendering secret values directly.

- `public/js/settings.js`
  - Added tab navigation controller for the new multi-tab layout.
  - Hardened form initialization to avoid null-reference issues when elements are absent.
  - Updated provider toggle behavior so secret fields are no longer forced as required when existing values are already configured.
  - Removed duplicate tag-cache clear event handler.

- `routes/setup.js`
  - Extended `GET /settings` config payload with additional runtime-relevant ENV values.
  - Added server-side secret masking state (`configuredSecrets`) and stopped pre-filling secret values in rendered fields.
  - Extended `POST /settings` to persist newly exposed ENV settings.
  - Updated save logic to keep existing secret values when corresponding inputs are left empty.
  - Improved provider validation flow to use effective values (new input or existing config).
  - Fixed API key regeneration response format to include `newKey` consistently.

## Testing
Manual validation performed:
- Open settings page and verify tab navigation and grouped sections.
- Verify provider-specific blocks toggle correctly in the AI tab.
- Save settings with empty secret fields and confirm existing secrets are preserved.
- Verify new OCR and Troubleshooting fields are submitted without server errors.

Automated test execution note:
- `npm run test -- tests/test-restriction-service.js` currently starts `nodemon server.js` (not a test runner) and fails due to a pre-existing server startup issue (`txtLogger.log is not a function` in `server.js`).

## Impact
- Better settings UX through grouped tabs and reduced cognitive load.
- Broader runtime configurability from the UI for relevant Docker env variables.
- Improved security posture for secrets by avoiding direct prefill in form fields.
- More robust backend save behavior for partial updates.

## Upstream Status
- [x] Not submitted
- [ ] PR opened
- [ ] Merged upstream
- [ ] Upstream declined
