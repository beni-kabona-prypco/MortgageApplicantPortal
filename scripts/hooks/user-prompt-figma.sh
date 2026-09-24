#!/bin/sh
# UserPromptSubmit hook — when the user's prompt contains a Figma URL,
# nudge Claude to invoke the /from-figma skill.
# Skips the nudge when the prompt already starts with /from-figma so
# explicit invocations aren't second-guessed.
#
# stdin: { session_id, prompt, ... } per Claude Code hook contract
# stdout: JSON with hookSpecificOutput.additionalContext, or nothing.
# Silent on any failure — a broken hook must never block prompt submission.

TMP="$(mktemp)"
trap 'rm -f "$TMP"' EXIT
cat > "$TMP"

node - "$TMP" <<'JS'
(() => {
  try {
    const fs = require('fs');
    const path = process.argv[2];
    const { prompt = '' } = JSON.parse(fs.readFileSync(path, 'utf8'));

    // Explicit skill invocation — respect the user's choice.
    if (/^\s*\/from-figma(\s|$)/.test(prompt)) return;

    // Any figma.com URL (design | file | proto | board | slides).
    if (!/https?:\/\/\S*figma\.com\/\S+/i.test(prompt)) return;

    const additionalContext = [
      'The user prompt contains a Figma link.',
      'Invoke the /from-figma skill (defined at .claude/skills/from-figma/SKILL.md)',
      'to implement the design as Angular code following instamortgage-buyer conventions.',
    ].join(' ');

    process.stdout.write(JSON.stringify({
      hookSpecificOutput: {
        hookEventName: 'UserPromptSubmit',
        additionalContext,
      },
    }));
  } catch (_) {
    // Silent failure — never break prompt submission.
  }
})();
JS
