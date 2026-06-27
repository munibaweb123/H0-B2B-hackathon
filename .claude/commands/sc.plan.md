---
description: Plan the project — generate phase file stubs, detail individual phases, or fully plan everything upfront. Adapts to working mode (Auto-pilot or Co-pilot).
---

## User Input

```text
$ARGUMENTS
```

You **MUST** parse the input to determine which planning mode to use:

- **Empty or area name only** (e.g., `backend`) → Progressive Step 1: generate stubs for all phases (or filtered by area)
- **Phase file path** (e.g., `.speccraft/phases/backend/01-project-setup.md`) → Progressive Step 2: detail that specific phase
- **`full`** (optionally followed by area) → Full planning: generate all phases fully detailed

## Steps

1. From `CLAUDE.md` already in your context, note the product description, requirements, core user flows, constraints, MVP scope, and **Working Mode** (Auto-pilot or Co-pilot).

2. Parse `$ARGUMENTS` to determine planning mode.

---

### If Progressive Step 1 (no argument or area only):

3. Read `.speccraft/branches.md` if it exists — identify what phases already have branches defined.

4. Scan `.speccraft/phases/` folder if it exists — identify what phase files already exist to avoid overwriting.

5. Determine the full phase breakdown:
   - Identify areas (e.g., backend, frontend, infra)
   - Within each area, define numbered phases in the correct build order
   - Map dependencies between phases

6. **Check working mode:**

   **Auto-pilot:** Generate all phase stubs and report what was created.

   **Co-pilot:** Propose the structure first and wait for confirmation before generating.

7. Create directories with `mkdir -p .speccraft/phases/<area>` (works on both bash and PowerShell). Generate phase file stubs at `.speccraft/phases/<area>/<nn>-<name>.md` with only these sections filled:
   - **Header:** branch name, phase dependencies, effort estimate
   - **Architectural Role:** why this phase exists
   - **Domain Ownership:** what this phase owns
   - All other sections structured but empty — marked with placeholder comments

   **Branch naming convention:** `<type>/<area>/<name>`
   - type: `feature`, `fix`, `refactor`, `infra`, `chore`
   - area: matches the phases folder area (e.g., `backend`, `frontend`, `infra`)
   - name: kebab-case, describes the deliverable (e.g., `project-setup`, `user-auth`)
   - Examples: `feature/backend/project-setup`, `feature/frontend/core-ui`, `infra/deployment`

8. Generate or update `.speccraft/branches.md` with all branch entries.

9. Report what was created and suggest: "Run `/sc.plan .speccraft/phases/<area>/<first-phase>.md` to detail the first phase before building."

---

### If Progressive Step 2 (phase file path provided):

3. Read the stub phase file at the path in `$ARGUMENTS`.

4. Read completed upstream phase files — learn from what was already built. Decisions made in earlier phases inform this phase's details.

5. **Check working mode:**

   **Auto-pilot:** Fill all empty sections based on CLAUDE.md context and upstream phase learnings:
   - Explicit boundaries + anti-patterns
   - Core capabilities (intent and patterns, not code)
   - Service interactions (upstream/downstream)
   - Architectural constraints (phase-specific only)
   - Definition of Done (behavioral, structural, testing)
   - Rollback criteria (if high-risk phase)
   Report what was filled.

   **Co-pilot:** Fill each section and present for review one at a time. Wait for confirmation before moving to the next section.

6. Save the updated phase file.

7. Suggest next step: `/sc.implement <phase-file-path>`

---

### If Full planning (`full` argument):

3. Read `.speccraft/branches.md` if it exists.

4. Scan `.speccraft/phases/` folder if it exists.

5. Determine the full phase breakdown (same as Progressive Step 1).

6. **Check working mode:**

   **Auto-pilot:** Generate all phase files with every section fully filled. Generate `.speccraft/branches.md`. Report what was created.

   **Co-pilot:** Propose the phase structure, wait for confirmation. For each phase, fill details and present for review. Generate `.speccraft/branches.md`. Report what was created.

7. Suggest next step: `/sc.implement` on the first phase with no upstream dependencies.

---

**Do not overwrite existing phase files in any mode.** If a phase file already has content in a section, skip that section.
