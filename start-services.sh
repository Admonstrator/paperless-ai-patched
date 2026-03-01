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

# Start the Python RAG service in the background
echo "Starting Python RAG service..."
"$PYTHON_BIN" main.py --host 127.0.0.1 --port 8000 --initialize &
PYTHON_PID=$!

# Give it a moment to initialize
sleep 2
echo "Python RAG service started with PID: $PYTHON_PID"

# Set environment variables for the Node.js service
export RAG_SERVICE_URL="http://localhost:8000"
export RAG_SERVICE_ENABLED="true"

# Start the Node.js application
echo "Starting Node.js Paperless-AI next service..."
pm2-runtime ecosystem.config.js

# If Node.js exits, kill the Python service
kill $PYTHON_PID
