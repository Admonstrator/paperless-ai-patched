#!/bin/bash
# start-services.sh - Script to start both Node.js and Python services

set -e

# Activate virtual environment for Python when present
if [[ -f /app/venv/bin/activate ]]; then
	source /app/venv/bin/activate
fi

PYTHON_BIN=""
if [[ -x /app/venv/bin/python ]]; then
	PYTHON_BIN="/app/venv/bin/python"
elif [[ -x /app/venv/bin/python3 ]]; then
	PYTHON_BIN="/app/venv/bin/python3"
elif command -v python3 >/dev/null 2>&1; then
	PYTHON_BIN="$(command -v python3)"
elif command -v python >/dev/null 2>&1; then
	PYTHON_BIN="$(command -v python)"
else
	echo "[ERROR] No Python interpreter found (python3/python)."
	exit 1
fi

# Keep Node.js and Python services on the same verbosity level.
export LOG_LEVEL="${LOG_LEVEL:-info}"

# Start the Python RAG service in the background
echo "Starting Python RAG service (LOG_LEVEL=${LOG_LEVEL})..."
"$PYTHON_BIN" main.py --host 127.0.0.1 --port 8000 &
PYTHON_PID=$!

# Wait until RAG API is reachable (or timeout)
echo "Waiting for RAG service health endpoint..."
RAG_READY=0
for i in $(seq 1 60); do
	if "$PYTHON_BIN" -c "import urllib.request,sys; sys.exit(0 if urllib.request.urlopen('http://127.0.0.1:8000/status', timeout=1).status == 200 else 1)" >/dev/null 2>&1; then
		RAG_READY=1
		echo "RAG service is reachable (attempt $i)."
		break
	fi
	sleep 1
done

if [[ "$RAG_READY" -ne 1 ]]; then
	echo "[WARN] RAG service did not become reachable within 60 seconds. Continuing startup anyway."
fi

echo "Python RAG service started with PID: $PYTHON_PID"

# Set environment variables for the Node.js service
export RAG_SERVICE_URL="http://localhost:8000"
export RAG_SERVICE_ENABLED="true"

# Start the Node.js application
echo "Starting Node.js Paperless-AI next service..."
pm2-runtime ecosystem.config.js

# If Node.js exits, kill the Python service
kill $PYTHON_PID
