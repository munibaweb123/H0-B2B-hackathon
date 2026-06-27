#!/bin/bash
INPUT=$(cat)
BRANCH=$(git branch --show-current 2>/dev/null)

if [ -z "$BRANCH" ] || [ "$BRANCH" = "develop" ] || [ "$BRANCH" = "main" ]; then
  echo "You are on branch: ${BRANCH:-unknown}. No active phase."
  exit 0
fi

PHASE_FILE=$(grep -rl "\*\*Branch\*\*: \`$BRANCH\`" phases/ 2>/dev/null | head -1)

if [ -z "$PHASE_FILE" ]; then
  echo "On branch $BRANCH but no matching phase file found in phases/."
  exit 0
fi

echo "SPECCRAFT CONTEXT (restored):"
echo "Branch: $BRANCH"
echo "Phase file: $PHASE_FILE"
echo ""
echo "--- Phase file contents ---"
cat "$PHASE_FILE"
echo ""

WORKING_MODE=$(grep -A1 "## Working Mode" CLAUDE.md 2>/dev/null | tail -1)
if [ -n "$WORKING_MODE" ]; then
  echo "Working mode: $WORKING_MODE"
fi
