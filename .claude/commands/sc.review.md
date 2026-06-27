---
description: Review a completed phase against its Definition of Done. Optionally pass the phase file path, or Claude auto-detects from the current branch.
---

## User Input

```text
$ARGUMENTS
```

## Steps

1. **Determine the phase file:**

   **If `$ARGUMENTS` contains a file path** → use it.

   **If `$ARGUMENTS` is empty** → detect the current git branch, then scan all phase files in `.speccraft/phases/` to find the one whose Branch header matches the current branch. If no match found, ask the user which phase to review.

2. Read the phase file.

3. Read the **Definition of Done** section — this is the only acceptance criteria. Not personal opinion, not best practices beyond what's listed — only what the DoD specifies.

4. Read the **Explicit Boundaries** section — verify nothing outside the phase's scope was accidentally built.

5. For each DoD item, check the actual state of the codebase:

   **Behavioral items** — run or observe the described behavior:
   - If it can be verified by running a command, run it
   - If it requires reading code, read the relevant files
   - Mark ✓ if behavior matches, ✗ if not, with a specific reason

   **Structural items** — verify files and configuration exist:
   - Check each file or folder mentioned exists at the correct path
   - Check configuration values are present and correct
   - Mark ✓ if present, ✗ if missing or wrong

   **Testing items** — verify tests exist and pass:
   - Check the test files exist
   - Run the tests
   - Mark ✓ if tests exist and pass, ✗ if missing or failing

6. Check for boundary violations:
   - Scan what was built against the Explicit Boundaries section
   - Flag anything built that belongs to another phase

7. Produce a review report:

   ```
   Phase Review: [Phase Name]

   Behavioral:
     ✓ [item]
     ✗ [item] — [specific reason]

   Structural:
     ✓ [item]
     ✗ [item] — [specific reason]

   Tests:
     ✓ [item]
     ✗ [item] — [specific reason]

   Boundary check:
     ✓ No out-of-scope additions found
     (or)
     ✗ Out-of-scope: [what and where it belongs]

   Status: COMPLETE / INCOMPLETE
   ```

8. **If COMPLETE:**
   - Confirm all DoD items pass and no boundary violations
   - Suggest: "Run `/sc.sync` to commit, push, merge to develop, and update CLAUDE.md."

9. **If INCOMPLETE:**
   - List exactly what remains — specific files, behaviors, or tests missing
   - Do not suggest workarounds or partial acceptance — the DoD is the standard
