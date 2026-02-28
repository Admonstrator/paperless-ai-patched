# SEC-003: Global Rate-Limiting for API and Streaming Endpoints

## Background
Rate limiting previously protected only a few cache-clear/reset endpoints. Most API endpoints, plus high-cost streaming routes, were still susceptible to request flooding.

## Changes
- `server.js`
  - Added a global rate limiter middleware using `express-rate-limit`.
  - Applied limiter to `['/api', '/chat', '/manual']` so all API and API-like streaming calls are covered.
  - Added hybrid identity keying:
    1. API key (`x-api-key`) when valid
    2. JWT user identity (`id|userId|username|sub`) when available
    3. Fallback to client IP
  - Enabled `app.set('trust proxy', 1)` for correct IP behavior behind reverse proxies.
- `config/config.js`
  - Added `apiKey` configuration fallback chain: `API_KEY || PAPERLESS_AI_API_KEY`.
  - Added global limiter config:
    - `GLOBAL_RATE_LIMIT_WINDOW_MS` (default `900000`)
    - `GLOBAL_RATE_LIMIT_MAX` (default `1000`)
- `routes/auth.js`
  - Switched API key auth checks to `config.apiKey` for consistency.
- `routes/setup.js`
  - Updated existing cache-clear limiter API key skip check to use `config.apiKey`.
- `tests/test-rate-limiting.js`
  - Reworked test to validate global limiter scope (`/api`, `/chat`, `/manual`), health exclusion, and optional 429 enforcement.

## Testing
```bash
# Server starten
npm run test

# In separater Shell (optional mit niedrigem Limit für schnellen 429-Test)
GLOBAL_RATE_LIMIT_MAX=10 node tests/test-rate-limiting.js
```

## Impact
- Security: Broad protection against request flooding for all major API entry points.
- Reliability: Better resilience for streaming endpoints under burst traffic.
- Operability: Limit values are centrally configurable via environment variables.

## Upstream Status
- [ ] Not submitted
- [ ] PR opened
- [ ] Merged upstream
- [x] Fork-local security hardening
