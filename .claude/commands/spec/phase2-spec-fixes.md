---
description: Phase 2 - Fix all 24 specification issues in organized batches
model: claude-sonnet-4-5-20250929
allowed-tools: Read, Write, Edit, TodoWrite
thinking:
  enabled: true
  budget: tokens
---

# Phase 2: Specification Fixes

**Purpose:** Fix all 24 issues (13 critical blockers + 11 consistency issues) in the technical specification.

**Tracking Document:** `.claude/docs/vibecheck/spec-fixes-tracking.md`

**Prerequisites:**
- Phase 1 completed (all design decisions finalized)
- `.claude/docs/vibecheck/design-decisions.md` exists

---

## Your Task

1. **Create the spec fixes tracking document:**
   - File: `.claude/docs/vibecheck/spec-fixes-tracking.md`
   - Group the 24 fixes into logical batches (5-7 batches)
   - Batch by: related functionality, dependencies, spec sections
   - Example batches:
     - Batch 1: Type System Foundations
     - Batch 2: Judge System Complete
     - Batch 3: Dependencies & Package Setup
     - Batch 4: API Signature Alignments
     - Batch 5: File & Storage Consistency
     - Batch 6: Documentation Alignment
     - Batch 7: Naming & Minor Fixes

2. **For each batch:**
   - List all fixes in that batch (with issue #s from audit)
   - Note dependencies (design decisions or previous batches)
   - Specify which spec sections need editing
   - Provide implementation approach

3. **Present the batches to user:**
   - Show the proposed batch structure
   - Get approval to proceed

4. **Execute fixes batch by batch:**
   - For each batch:
     - Read current spec sections
     - Apply fixes according to design decisions
     - Update spec with version increment (1.4-alpha.1, alpha.2, etc.)
     - Check off completed items in tracking doc
     - Show user the changes made
     - Get approval before next batch

5. **Final spec version:**
   - After all batches: bump to v1.4
   - Update changelog in spec header
   - Mark all 24 issues as resolved

---

## Success Criteria

- [ ] spec-fixes-tracking.md created with all batches defined
- [ ] All 24 issues organized into batches
- [ ] All batches completed and checked off
- [ ] Technical specification updated to v1.4
- [ ] Changelog updated with all changes
- [ ] All design decisions implemented correctly
- [ ] No new inconsistencies introduced
- [ ] Ready to proceed to Phase 3 (documentation)

---

## Output Format

After completion, provide:
1. Path to updated technical-specification.md (v1.4)
2. Path to spec-fixes-tracking.md (all checked off)
3. Summary table of changes by batch
4. List of spec sections modified
5. Confirmation that Phase 3 can begin

---

## Notes

- Work incrementally: one batch at a time
- Get user approval between batches if requested
- Reference design-decisions.md for correct implementations
- Use alpha versions during work (1.4-alpha.1, etc.)
- Final version only after all batches complete
