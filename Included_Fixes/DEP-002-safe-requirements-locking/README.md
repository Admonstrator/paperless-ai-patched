# DEP-002: Safe Requirements Update and Runtime Lockfiles

## Background
The repository used floating minimum Python dependencies in `requirements.txt` and had no reproducible lock strategy across the two Python runtimes in use:
- Python 3.11 in the full image (`Dockerfile`)
- Python 3.10 in the RAG-only image (`Dockerfile.rag`)

This made dependency resolution drift over time and increased update risk. In parallel, direct Node.js dependencies needed safe patch/minor refreshes within current major versions.

## Changes
- Added `requirements.in` as the source dependency definition.
- Replaced `requirements.txt` with a fully pinned lockfile generated for Python 3.11.
- Added `requirements-py310.txt` as a fully pinned lockfile generated for Python 3.10.
- Updated `Dockerfile.rag` to install from `requirements-py310.txt`.
- Kept `*.dist-info` metadata in the full image venv to prevent `chromadb` import failures (required by opentelemetry entry points).
- Updated direct Node dependencies in `package.json` to safe patch/minor targets and regenerated `package-lock.json`.
- Aligned docs and examples with current runtime/config behavior:
  - `docker-compose.yml`: default `RAG_SERVICE_ENABLED=false` for `:latest` (Lite) image
  - `Docker-Hub.md`: corrected env vars (`PAPERLESS_API_URL`, `OLLAMA_API_URL`, `SCAN_INTERVAL`, `ACTIVATE_*`)
  - `docs/RAG-DEV-GUIDE.md`: corrected startup command to `npm run test`
  - `COPILOT.md`: replaced unavailable lint script with `npx eslint .` and `npx prettier --check .`
  - `docs/index.html`: manual clone example points to this fork

## Testing
```bash
# Node lock + vulnerability check (via Docker)
docker run --rm -v "${PWD}:/work" -w /work node:24-slim sh -lc "npm install --package-lock-only"
docker run --rm -v "${PWD}:/work" -w /work node:24-slim sh -lc "npm audit --omit=dev --json || true"

# Python lock generation (via Docker)
docker run --rm -v "${PWD}:/work" -w /work python:3.11-slim bash -lc "pip install --no-cache-dir pip-tools && pip-compile --resolver=backtracking --allow-unsafe --output-file=requirements.txt requirements.in"
docker run --rm -v "${PWD}:/work" -w /work python:3.10-slim bash -lc "pip install --no-cache-dir pip-tools && pip-compile --resolver=backtracking --allow-unsafe --output-file=requirements-py310.txt requirements.in"

# Docker build validation
docker build -f Dockerfile .
docker build -f Dockerfile.rag .

# Python runtime smoke checks
docker run --rm --entrypoint /app/venv/bin/python paperless-ai-patched:dep002-full -c "import fastapi,chromadb,torch; print('py11-ok')"
docker run --rm paperless-ai-patched:dep002-rag python -c "import fastapi,chromadb,torch; print('py10-ok')"

# Node test (containerized)
docker run --rm -v "${PWD}:/work" -w /work node:24-slim sh -lc "apt-get update && apt-get install -y --no-install-recommends python3 make g++ && npm install --omit=dev && node tests/test-pr772-fix.js"

Results (2026-02-19):
- docker-compose config: OK
- Dockerfile build (full): OK
- Dockerfile.rag build: OK
- Python smoke test (full): py11-ok
- Python smoke test (rag): py10-ok
- Node test: OK (retry and content-length tests passed)
```

## Impact
- Reproducibility: Python dependencies are now fully pinned per runtime.
- Safety: direct npm packages were moved to safer patch/minor versions within existing majors.
- Operations: documentation now matches actual config names and startup scripts.
- Runtime: prevents `chromadb` import failures in the full image by preserving venv metadata.
- Remaining risk: some npm advisories remain where a non-breaking fix is not available in current major lines.

## Upstream Status
- [x] Not submitted
- [ ] PR opened
- [ ] Merged upstream
- [ ] Upstream declined
