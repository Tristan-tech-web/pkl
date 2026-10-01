#!/bin/bash
# Pasang dependensi untuk sesi Claude Code di web (idempoten, non-interaktif).
set -euo pipefail

if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

cd "${CLAUDE_PROJECT_DIR:-$(pwd)}"
pnpm install --no-frozen-lockfile
