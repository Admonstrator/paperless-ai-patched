# COPILOT Context – Paperless-AI Patched

## Ziel der Anwendung
Paperless-AI Patched erweitert Paperless-ngx um KI-gestützte Dokumentverarbeitung:
- automatische Metadaten-Extraktion (Titel, Tags, Korrespondent, Dokumenttyp, Datum)
- periodisches Scannen und Aktualisieren von Dokumenten
- optionales RAG-basiertes semantisches Suchen und Q&A über den Dokumentbestand

Es ist ein Community-Fork von `clusterzx/paperless-ai` mit Fokus auf Integrationsfixes, Performance und Docker-Optimierungen.

---

## Architektur auf einen Blick

### 1) Node.js-Hauptdienst (Express)
- Einstiegspunkt: `server.js`
- Framework: Express 4
- Aufgaben:
  - Web-UI (EJS-Templates)
  - REST-/JSON-Endpunkte für Setup, Verarbeitung, Verlauf, manuelle Aktionen
  - zeitgesteuertes Scannen über `node-cron`
  - Auth (JWT-Cookie + API-Key)
  - OpenAPI/Swagger unter `/api-docs`

### 2) Optionaler Python-RAG-Dienst (FastAPI)
- Einstiegspunkt: `main.py`
- Framework: FastAPI + uvicorn
- Aufgaben:
  - Indexierung von Paperless-Dokumenten
  - Hybrid-Suche (BM25 + Embeddings)
  - semantischer Kontext für Fragen
  - Status-/Indexierungs-Endpunkte

### 3) Persistenz
- SQLite via `better-sqlite3` in `models/document.js`
- DB-Datei: `data/documents.db`
- WAL-Modus aktiv

Wichtige Tabellen:
- `processed_documents`
- `history_documents`
- `openai_metrics`
- `original_documents`
- `users`
- `processing_status`

---

## Dienste, APIs und Integrationen

### Externe Kernintegration
- Paperless-ngx API (Dokumente lesen/aktualisieren, Tags/Korrespondenten/Typen auflösen)
  - Konfiguriert über `PAPERLESS_API_URL` und `PAPERLESS_API_TOKEN`

### KI-Provider (Factory-Pattern)
- Auswahl via `AI_PROVIDER` in `services/aiServiceFactory.js`
- Unterstützte Provider:
  - OpenAI (`services/openaiService.js`)
  - Ollama (`services/ollamaService.js`)
  - Custom OpenAI-kompatibel (`services/customService.js`)
  - Azure OpenAI (`services/azureService.js`)

### RAG-Integration
- Node-Proxydienst: `services/ragService.js`
- Python-Backend via `RAG_SERVICE_URL` (Default: `http://localhost:8000`)
- Feature-Toggle: `RAG_SERVICE_ENABLED`

### Interne API-/Route-Bereiche
- Haupt-Routen: `routes/setup.js` (großer Teil der Web- und API-Logik)
- Auth-Middleware: `routes/auth.js`
- RAG-Routen: `routes/rag.js` (`/api/rag/*`)

Typische Endpunkte:
- `GET /health`
- `GET /api-docs` und `GET /api-docs/openapi.json`
- `POST /api/rag/search`
- `POST /api/rag/ask`
- `POST /api/rag/index`
- `GET /api/rag/status`

---

## Verwendete Sprachen, Frameworks, Libraries

### Sprachen
- JavaScript (Node.js)
- Python
- HTML/CSS/Vanilla JS im Frontend (EJS-Templates)

### Backend/Infra
- Express
- node-cron
- better-sqlite3
- jsonwebtoken + bcryptjs
- OpenAI SDK
- PM2 (Produktionslauf in Containern)

### Python/RAG
- FastAPI, uvicorn
- sentence-transformers
- ChromaDB
- rank-bm25
- nltk
- torch (CPU-Build in requirements)

---

## Wichtige Konfigurationsdateien
- `config/config.js` (lädt/parst Umgebungsvariablen aus `data/.env`)
- `data/.env` (laufzeitrelevante Konfiguration; wird durch Setup erzeugt)
- `server.js` (Service-Start, Cron, Routen-Mounting)
- `main.py` (RAG-Service)
- `start-services.sh` (Start beider Dienste im Full-Image)
- `docker-compose.yml`, `Dockerfile`, `Dockerfile.lite`, `Dockerfile.rag`
- `ecosystem.config.js` (PM2)

---

## Kritische Umgebungsvariablen (Auswahl)

### Verbindung zu Paperless-ngx
- `PAPERLESS_API_URL`
- `PAPERLESS_API_TOKEN`

### KI-Provider allgemein
- `AI_PROVIDER` (`openai|ollama|custom|azure`)
- `SYSTEM_PROMPT`
- `TOKEN_LIMIT`
- `RESPONSE_TOKENS`

### OpenAI
- `OPENAI_API_KEY`
- `OPENAI_MODEL`

### Ollama
- `OLLAMA_API_URL`
- `OLLAMA_MODEL`

### Custom OpenAI-kompatibel
- `CUSTOM_BASE_URL`
- `CUSTOM_API_KEY`
- `CUSTOM_MODEL`

### Azure OpenAI
- `AZURE_ENDPOINT`
- `AZURE_API_KEY`
- `AZURE_DEPLOYMENT_NAME`
- `AZURE_API_VERSION`

### Scan/Verarbeitungssteuerung
- `SCAN_INTERVAL`
- `DISABLE_AUTOMATIC_PROCESSING`
- `PROCESS_PREDEFINED_DOCUMENTS`
- `TAGS`
- `MIN_CONTENT_LENGTH`

### Feature-Toggles
- `ACTIVATE_TAGGING`
- `ACTIVATE_CORRESPONDENTS`
- `ACTIVATE_DOCUMENT_TYPE`
- `ACTIVATE_TITLE`
- `ACTIVATE_CUSTOM_FIELDS`

### Restriktionsmodus
- `RESTRICT_TO_EXISTING_TAGS`
- `RESTRICT_TO_EXISTING_CORRESPONDENTS`
- `RESTRICT_TO_EXISTING_DOCUMENT_TYPES`

### Sicherheit / Zugriff
- `JWT_SECRET`
- `API_KEY`

### RAG
- `RAG_SERVICE_ENABLED`
- `RAG_SERVICE_URL`

---

## Lokale Einrichtung und Ausführung

## Voraussetzungen
- Node.js (LTS)
- npm
- Python 3.10+
- optional: virtuelle Umgebung (`venv`)

## Option A – Nur Node.js-Dienst (ohne lokalen RAG-Dienst)
1. Abhängigkeiten installieren:
   - `npm install`
2. Konfigurationsdatei anlegen:
   - `data/.env` mit mindestens `PAPERLESS_API_URL`, `PAPERLESS_API_TOKEN`, Provider-spezifischen KI-Variablen
3. Starten:
   - `npm run test`
4. Aufrufen:
   - `http://localhost:3000`

## Option B – Node.js + Python-RAG lokal
1. Node-Abhängigkeiten installieren:
   - `npm install`
2. Python-Umgebung einrichten:
   - `python -m venv venv`
   - Aktivieren (Windows PowerShell): `venv\Scripts\Activate.ps1`
   - `pip install -r requirements.txt`
3. `data/.env` anlegen/prüfen (inkl. Paperless + KI)
4. RAG-Dienst starten:
   - `python main.py --host 127.0.0.1 --port 8000`
5. Node-Dienst starten:
   - `npm run test`
6. Sicherstellen:
   - `RAG_SERVICE_ENABLED=true`
   - `RAG_SERVICE_URL=http://localhost:8000`

## Option C – Docker
- Schnellstart mit Compose:
  - `docker compose up -d`
- Standard-Image ist Lite; Full-Image mit RAG in `docker-compose.yml` auswählbar.

---

## Was ein KI-Modell wissen muss, um effektiv zu helfen

1. **Dual Runtime verstehen**
   - Viele Features sitzen im Node-Dienst; semantische Suche sitzt im Python-RAG-Dienst.

2. **Konfiguration kommt primär aus `data/.env`**
   - `config/config.js` normalisiert Booleans zu `'yes'/'no'`.

3. **Service-Layer und Factory respektieren**
   - Providerwechsel nur über `AIServiceFactory`, keine direkte Verdrahtung im Aufrufer.

4. **Dokumenten-Flow ist sensitiv**
   - Retry-Limits, Mindestinhalt, optionale Restriktionen (nur bestehende Tags/Korrespondenten/Typen) sind zentral.

5. **Authentifizierung immer mitdenken**
   - JWT-Cookie oder `x-api-key`; viele Routen sind geschützt.

6. **Performance-/History-Muster nicht zurückbauen**
   - Serverseitige Pagination + Caching im Verlauf sind absichtlich eingeführt.

7. **RAG-Feature-Flag beachten**
   - RAG-Routen/UI werden nur gemountet, wenn `RAG_SERVICE_ENABLED==='true'`.

8. **Fehlerbehandlung und Logging konsistent halten**
   - Bestehende Logger-/Route-Patterns beibehalten; keine stillen Fehler.

9. **Datenbankzugriffe über vorbereitete Statements**
   - `models/document.js` nutzt vorbereitete Queries und sollte stilistisch so erweitert werden.

10. **Sicherheitsvalidierung nicht umgehen**
    - URL-Validierung in Setup-/Service-Logik (SSRF-Schutz) ist relevant.

---

## Offene Fragen für besseres Verständnis

1. Welche Node.js-Version ist für lokale Entwicklung offiziell vorgesehen (Repository nennt teils 22, Fix-Doku teils 24 LTS)?
2. Welche Endpunkte sollen öffentlich (ohne Auth) erreichbar sein, insbesondere für Monitoring/Automation neben `/health` und `/api-docs`?
3. Soll der RAG-Dienst lokal standardmäßig mitlaufen oder nur in Full-Docker-Deployments?
4. Gibt es ein empfohlenes Minimal-Set an `data/.env` Variablen für „Quick Start“ außerhalb des Setup-Wizards?
5. Welche AI-Provider werden in dieser Fork-Produktion tatsächlich unterstützt/getestet (OpenAI, Ollama, Azure, Custom) und in welcher Priorität?
6. Ist die erwartete Antwortstruktur aller AI-Provider strikt identisch (inkl. `custom_fields`) oder gibt es providerabhängige Abweichungen?
7. Sollen neue API-Endpunkte immer in Swagger/OpenAPI dokumentiert werden, und gibt es dafür eine verpflichtende CI-Prüfung?
8. Welche Strategie ist für DB-Migrationen vorgesehen, wenn neue Tabellen/Spalten ergänzt werden?
9. Wie soll mit langen OCR-Inhalten >50k Zeichen künftig umgegangen werden (reines Truncating vs. Chunking im Node-Flow)?
10. Gibt es formale Richtlinien, wann Änderungen in `Included_Fixes/` als neuer Fix-Eintrag dokumentiert werden müssen?

---

## Git-Hinweis
`COPILOT.md` ist in `.gitignore` eingetragen, damit diese lokale KI-Kontextdatei nicht versehentlich committed wird.