---
description: Implement a phase — auto-creates a branch from develop, reads the phase spec, and builds exactly what it defines. Optionally pass the phase file path, or Claude will ask.
---

## User Input

```text
$ARGUMENTS
```

## Steps

1. **Determine the phase file:**

   **If `$ARGUMENTS` contains a file path** → use it.

   **If `$ARGUMENTS` is empty** → scan the `.speccraft/phases/` folder, check which phases are not yet complete (cross-reference with `branches.md`), and present available phases:
   ```
   Available phases:
     1. .speccraft/phases/backend/01-project-setup.md (ready — no dependencies)
     2. .speccraft/phases/backend/02-database.md (ready — Phase 1 complete)
     3. .speccraft/phases/backend/03-auth.md (blocked — Phase 2 incomplete)

   Which phase do you want to implement?
   ```
   Wait for user response.

2. Read the phase file. **If the phase file is still a stub** (empty sections), stop and suggest: "This phase needs detailing first. Run `/sc.plan [phase-file-path]` to fill in the details."

3. Note the global constraints and conventions from `CLAUDE.md` already in your context.

4. **Handle the git branch:**
   - Read the Branch field from the phase file header
   - Check if the branch already exists:
     - **Exists** → switch to it and continue where work left off
     - **Does not exist** → create it from `develop`:
       1. Run locally (WSL):
          ```
          git checkout develop
          ```
       2. **Remote step — you cannot run this from WSL. Tell the user:**
          > Run this in CMD before continuing:
          > ```
          > git pull origin develop
          > ```
          > Let me know once it's done.
          Wait for the user to confirm before continuing.
       3. After confirmation, run locally (WSL):
          ```
          git checkout -b feature/<area>/<name>
          ```

5. Check phase dependencies — are upstream phases complete? **If any upstream phase is incomplete:** warn the user and ask whether to proceed. Do not proceed silently.

6. Read the **Explicit Boundaries** section. Internalize what does NOT belong in this phase before reading what does.

7. Read the **Anti-patterns** section. These are specific mistakes to avoid.

8. Read the **Core Capabilities** section. This describes what to build at the intent level. Do not build beyond what is described.

9. Read the **Service Interactions** section. Only call upstream services listed. Only expose what downstream phases expect.

10. Read the **Architectural Constraints** section. Phase-specific rules in addition to `CLAUDE.md` global rules.

11. Load the skills listed in the phase file header.

12. **Create the folder structure before writing any code.** All source files must go inside a `src/` directory, organized by area:
    - `src/<area>/` — e.g., `src/frontend/`, `src/backend/`, `src/infra/`
    - Never place source files in the project root. Config files (`.gitignore`, `package.json`, etc.) are the only files that belong at root level.
    - If `CLAUDE.md` specifies a different structure, follow that instead.

13. Execute the build:
    - Work capability by capability as listed in Core Capabilities
    - After each capability is complete, check it against the relevant DoD items
    - Do not start the next capability until the current one is working
    - If something is ambiguous, ask before assuming

14. When all capabilities are built, run through the full **Definition of Done** checklist:
    - Behavioral items: verify by running or observing
    - Structural items: verify files and configuration exist
    - Testing items: verify tests exist and pass

15. Report final status:
    - Show each DoD item as ✓ or ✗
    - If all pass → suggest: "Run `/sc.review` for final verification."
    - If any fail → list what remains and why
