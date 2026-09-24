#!/bin/sh
# PostToolUse hook — fast, per-file lint/format after Claude edits a source file.
# Receives a JSON payload on stdin with tool_input.file_path. Never blocks (exit 0);
# it auto-fixes what it can and surfaces anything left for Claude to address.

TMP="$(mktemp)"
trap 'rm -f "$TMP"' EXIT
cat > "$TMP"

FILE="$(node -e "try{process.stdout.write(JSON.parse(require('fs').readFileSync(process.argv[1],'utf8')).tool_input?.file_path||'')}catch{process.stdout.write('')}" "$TMP" 2>/dev/null)"
[ -z "$FILE" ] && exit 0

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$ROOT" || exit 0

# Only touch files inside the repo's src (skip configs, node_modules, dist, etc.).
case "$FILE" in
  "$ROOT"/src/*) REL="${FILE#"$ROOT"/}" ;;
  src/*) REL="$FILE" ;;
  *) exit 0 ;;
esac

case "$REL" in
  *.ts | *.html)
    pnpm exec prettier --write "$REL" >/dev/null 2>&1
    pnpm exec eslint --fix --cache --cache-location node_modules/.cache/eslint/ "$REL" 2>&1 | tail -30
    ;;
  *.scss | *.css)
    pnpm exec prettier --write "$REL" >/dev/null 2>&1
    ;;
  *.json | *.md)
    pnpm exec prettier --write "$REL" >/dev/null 2>&1
    ;;
  *) exit 0 ;;
esac

exit 0
