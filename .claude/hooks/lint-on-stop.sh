#!/usr/bin/env bash
set -uo pipefail

# Collect changed src/ files eligible for eslint
CHANGED_FILES=$(
  { git diff --name-only HEAD 2>/dev/null; git ls-files --others --exclude-standard 2>/dev/null; } \
    | grep -E '^src/.*\.[tj]sx?$' || true
)

if [[ -z "$CHANGED_FILES" ]]; then
  exit 0
fi

OUTPUT=$(echo "$CHANGED_FILES" | xargs npx eslint 2>&1) || {
  echo "$OUTPUT" >&2
  echo "ESLint failed on changed src/ files." >&2
  exit 2
}

exit 0
