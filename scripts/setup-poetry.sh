#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
FLASK_DIR="$REPO_ROOT/flask-server"

if ! command -v poetry >/dev/null 2>&1; then
  echo "Poetry not found — installing..."
  curl -sSL https://install.python-poetry.org | python3 -
  export PATH="$HOME/.local/bin:$PATH"
fi

echo "Installing backend dependencies with poetry..."
cd "$FLASK_DIR"
poetry install --no-interaction

echo "Poetry setup complete. Use 'poetry run flask --app app run' to start the server." 
