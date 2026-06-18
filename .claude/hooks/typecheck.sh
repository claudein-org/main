#!/usr/bin/env bash
# PostToolUse hook: typecheck the edited package (web or cli) and feed any
# errors back to Claude as non-blocking context. Reads hook JSON on stdin.
set -euo pipefail

f=$(jq -r '.tool_input.file_path // .tool_response.filePath // empty')
root="${CLAUDE_PROJECT_DIR:-$(pwd)}"

case "$f" in
  */web/*.ts|*/web/*.tsx) pkg=web ;;
  */cli/*.ts|*/cli/*.tsx) pkg=cli ;;
  *) exit 0 ;;
esac

if out=$(cd "$root/$pkg" && bunx tsc --noEmit 2>&1); then
  exit 0
fi

jq -n --arg o "$out" --arg p "$pkg" \
  '{hookSpecificOutput: {hookEventName: "PostToolUse", additionalContext: ("tsc --noEmit reported type errors in " + $p + "/:\n" + $o)}}'
