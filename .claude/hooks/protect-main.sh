#!/bin/bash
INPUT=$(cat)
COMMAND=$(echo "$INPUT" | jq -r '.tool_input.command // empty')

if [ -z "$COMMAND" ]; then
  exit 0
fi

if echo "$COMMAND" | grep -qE '(git checkout|git switch)\s+main(\s|$)'; then
  echo "BLOCKED: SpecCraft never touches the main branch. All work happens on develop or feature branches." >&2
  exit 2
fi

if echo "$COMMAND" | grep -qE 'git push\s+\S+\s+main(\s|$|:)'; then
  echo "BLOCKED: SpecCraft never pushes to main. Push to develop or your feature branch instead." >&2
  exit 2
fi

if echo "$COMMAND" | grep -qE 'git branch\s+-[dD]\s+main(\s|$)'; then
  echo "BLOCKED: Cannot delete the main branch." >&2
  exit 2
fi

exit 0
