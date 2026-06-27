---
description: Extract requirements from a PDF, text input, or any combination of sources into CLAUDE.md. Pass a file path, plain text description, or both.
---

## User Input

```text
$ARGUMENTS
```

You **MUST** process the user input before doing anything else. If empty, ask the user what their project requirements are.

## Steps

1. **Parse the input** — determine what was provided in `$ARGUMENTS`:

   - **File path detected** (ends in `.pdf`, `.md`, `.txt`, or looks like a path) → read the file
   - **Multiple file paths** → read all of them
   - **Plain text** → treat as a direct requirements description
   - **Mix of files and text** → read all files, combine with text input

2. **Extract from the input sources.** Pull out these categories:

   - **Product requirements** — what must be built (features, capabilities)
   - **Constraints** — tech requirements, compliance, deadlines, budget
   - **User flows** — how users interact with the product, step by step
   - **Success criteria** — how the client/judges/stakeholders will evaluate the result
   - **Out of scope** — anything explicitly mentioned as excluded
   - **Ambiguities** — anything unclear, contradictory, or missing that needs clarification

3. **Update `CLAUDE.md`** with the extracted information. Add to the existing content, do not overwrite what init already generated.

4. **Check working mode** from `CLAUDE.md`:

   - **Co-pilot mode:** Present the extracted requirements to the user. Ask: "Does this capture everything? Should I adjust anything before we plan?" Wait for confirmation before finishing.
   - **Auto-pilot mode:** Proceed without confirmation. Report what was extracted.

5. **Report what was done:**
   - Source(s) processed
   - Number of features, constraints, and open questions extracted
   - If there are open questions, list them — these should be resolved before running `/sc.plan`
   - Suggest next step: resolve open questions (if any), then run `/sc.plan`
