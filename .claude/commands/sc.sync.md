---
description: Close a completed phase — commits, pushes, merges to develop, and updates CLAUDE.md. Optionally pass the phase file path, or Claude auto-detects from the current branch.
---

## User Input

```text
$ARGUMENTS
```

## Steps

1. **Determine the phase file:**

   **If `$ARGUMENTS` contains a file path** → use it.

   **If `$ARGUMENTS` is empty** → detect the current git branch, then scan all phase files in `.speccraft/phases/` to find the one whose Branch header matches the current branch. If no match found, ask the user which phase to sync.

2. Read the phase file.

3. **Verify the phase is complete** — check the actual codebase against each DoD item (run commands, read files). **If any DoD item is not met, stop and tell the user to run `/sc.review` first.** Do not proceed with an incomplete phase.

4. **Mark all DoD checkboxes as complete in the phase file** — replace every `- [ ]` in the Definition of Done section with `- [x]`. This records completion directly in the spec. Save the file.

5. Note what is already in `CLAUDE.md` from your context — you will append to it in step 10.

6. **Commit all changes on the feature branch** (including the updated phase file with checked DoD):
   - Stage all changes
   - Write a descriptive commit message:
     ```
     Phase [N]: [Phase Name]

     [Summary of what was built — capabilities delivered, key decisions made]
     ```

7. **Push the feature branch to remote — remote step, cannot run from WSL:**
   Tell the user:
   > Run this in CMD:
   > ```
   > git push origin [branch-name]
   > ```
   > Let me know once it's done.
   Wait for confirmation before continuing.

8. **Merge the feature branch into develop:**
   1. Run locally (WSL):
      ```
      git checkout develop
      ```
   2. **Remote step — tell the user:**
      > Run this in CMD:
      > ```
      > git pull origin develop
      > ```
      > Let me know once it's done.
      Wait for confirmation before continuing.
   3. Run locally (WSL):
      ```
      git merge [branch-name]
      ```
   **If merge conflicts occur:** stop and inform the user. Do not resolve conflicts automatically. List the conflicting files and ask the user how to proceed.

9. **Push develop to remote — remote step, cannot run from WSL:**
   Tell the user:
   > Run this in CMD:
   > ```
   > git push origin develop
   > ```
   > Let me know once it's done.
   Wait for confirmation before continuing.

10. **Update `CLAUDE.md`** with what was decided or discovered during this phase:
    - Architectural decisions made (patterns chosen, approaches taken)
    - Constraints discovered (things that don't work, dependencies that matter)
    - Conventions established (naming, structure, tooling now in place)
    - Tech stack details pinned (specific versions, config that must not change)
    - Only append what's genuinely new — do not rewrite existing content

11. **Mark the phase as complete in `.speccraft/branches.md`.**

12. **Commit the CLAUDE.md and .speccraft/branches.md updates on develop:**
    1. Run locally (WSL):
       ```
       git add CLAUDE.md .speccraft/branches.md
       git commit -m "docs: update CLAUDE.md after Phase [N] completion"
       ```
    2. **Remote step — tell the user:**
       > Run this in CMD:
       > ```
       > git push origin develop
       > ```
       > Let me know once it's done.
       Wait for confirmation before continuing.

13. **Report what was done:**
    - Commit hash and message
    - Branch merged to develop
    - What was added to `CLAUDE.md`
    - Suggest the next ready phase:
      ```
      Next ready phase: .speccraft/phases/backend/02-database.md
      Run: /sc.plan .speccraft/phases/backend/02-database.md (if progressive)
      or:  /sc.implement .speccraft/phases/backend/02-database.md (if full)
      ```
