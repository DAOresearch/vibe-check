---
description: Phase 3 - Update all documentation files to match specification v1.4
model: claude-sonnet-4-20250514
allowed-tools: Read, Write, Edit, Glob, TodoWrite
---

# Phase 3: Documentation Updates

**Purpose:** Update all documentation files to match the corrected specification v1.4.

**Tracking Document:** `.claude/docs/vibecheck/docs-updates-checklist.md`

**Prerequisites:**
- Phase 2 completed (spec v1.4 finalized)
- `.claude/docs/vibecheck/spec-fixes-tracking.md` shows all items complete

---

## Your Task

1. **Create the documentation updates checklist:**
   - File: `.claude/docs/vibecheck/docs-updates-checklist.md`
   - List all 7 documentation gaps from audit
   - For each doc file:
     - Current status (stub/partial/missing section)
     - Priority (HIGH/MEDIUM/LOW)
     - Spec reference sections
     - Specific changes needed (bulleted list)
     - Estimated time

2. **Present the checklist to user:**
   - Show which docs need major rewrites vs minor additions
   - Get approval on priority order

3. **Update documentation files:**
   - Work through checklist in priority order:
     1. judge.mdx (MAJOR REWRITE)
     2. prompt.mdx (MAJOR REWRITE)
     3. runAgent.mdx (ADD SECTION - AgentExecution)
     4. vibeTest.mdx (ADD SECTION - Cumulative State & Watchers)
     5. vibeWorkflow.mdx (ADD SECTION - until() helper)
     6. Remove/redirect defineJudge.mdx (incorrect pattern)
     7. Update any other affected docs

4. **For each doc file:**
   - Read the current version
   - Read relevant spec sections (v1.4)
   - Write the updates/additions
   - Include code examples
   - Check off in tracking doc
   - Show user the changes

5. **Cross-reference validation:**
   - Ensure all API signatures match spec v1.4
   - Ensure all examples use correct syntax
   - Ensure no contradictions between docs

---

## Success Criteria

- [ ] docs-updates-checklist.md created with all files listed
- [ ] All 7 documentation gaps addressed
- [ ] judge.mdx fully rewritten with generic signature
- [ ] prompt.mdx fully rewritten with multi-modal support
- [ ] runAgent.mdx has AgentExecution section
- [ ] vibeTest.mdx has cumulative state section
- [ ] vibeWorkflow.mdx has until() helper section
- [ ] All code examples syntactically correct
- [ ] All API signatures match spec v1.4
- [ ] No contradictions between docs
- [ ] Ready to proceed to Phase 4 (validation)

---

## Output Format

After completion, provide:
1. Path to docs-updates-checklist.md (all checked off)
2. List of all modified doc files with brief description of changes
3. Any doc files that should be archived/removed
4. Confirmation that all docs align with spec v1.4
5. Confirmation that Phase 4 can begin

---

## Notes

- Reference spec v1.4 as source of truth
- Use existing doc file styles/formatting
- Include practical examples for each feature
- Ensure Diátaxis framework alignment (reference, guides, tutorials, explanations)
- Major rewrites may take 1-2 hours per file
