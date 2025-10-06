---
description: Update a single documentation file to match specification v1.4
model: claude-sonnet-4-20250514
allowed-tools: Read, Write, Edit, Glob, TodoWrite
---

# Doc Update - Single File

**Purpose:** Update a single documentation file to match specification v1.4.

**Usage:** Provide the doc file name as an argument (e.g., "judge", "prompt", etc.)

**Prerequisites:**
- Phase 2 completed (spec v1.4 finalized)
- Phase 3 initiated (docs-updates-checklist.md exists)

---

## Your Task

1. **Read the checklist:**
   - `.claude/docs/vibecheck/docs-updates-checklist.md`
   - Find the specified doc file section

2. **Read current documentation:**
   - `docs/content/docs/api/<doc-file>.mdx` (or appropriate path)

3. **Read specification reference sections:**
   - `.claude/docs/vibecheck/technical-specification.md` (v1.4)
   - Read all sections referenced in checklist for this file

4. **Apply the updates:**
   - Follow the specific changes listed in checklist
   - Maintain existing doc structure/formatting
   - Add complete code examples
   - Ensure API signatures match spec v1.4 exactly
   - Add cross-references to related docs

5. **Validate examples:**
   - Ensure all code examples are syntactically correct
   - Verify examples use correct types from spec
   - Check imports are correct

6. **Update checklist:**
   - Check off completed items for this doc file
   - Mark file status as "✅ Complete"

7. **Show changes to user:**
   - Present summary of updates
   - Highlight major additions/rewrites
   - Ask for approval

---

## Success Criteria

- [ ] All checklist items for this file completed
- [ ] API signatures match spec v1.4
- [ ] Code examples are correct and complete
- [ ] Cross-references updated
- [ ] Checklist updated
- [ ] User approved the changes

---

## Output Format

Provide:
1. Doc file name
2. Type of update (REWRITE, ADD SECTION, MINOR FIXES)
3. List of sections added/modified
4. Example count added
5. Status: COMPLETE or NEEDS REVISION

---

## Common Doc Files

- judge.mdx - Judge API with generic signature
- prompt.mdx - Multi-modal prompt builder
- runAgent.mdx - Agent execution
- vibeTest.mdx - Test API
- vibeWorkflow.mdx - Workflow API
- matchers.mdx - Custom matchers
- types.mdx - Core types

---

## Notes

- Major rewrites (judge, prompt) may take 1-2 hours
- Minor additions (runAgent section) may take 30 minutes
- Always include practical examples
- Link to related documentation
- Maintain Diátaxis framework (API ref is Reference category)
