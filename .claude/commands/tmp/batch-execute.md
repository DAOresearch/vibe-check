---
description: Execute a single batch of specification fixes from Phase 2
model: claude-sonnet-4-5-20250929
allowed-tools: Read, Write, Edit, TodoWrite
thinking:
  enabled: true
  budget: tokens
---

# Batch Execute - Spec Fixes

**Purpose:** Execute a single batch of specification fixes from Phase 2.

**Usage:** Provide the batch number as an argument (e.g., "1", "2", etc.)

**Prerequisites:**
- Phase 2 initiated (spec-fixes-tracking.md exists)
- Previous batches completed (if batch > 1)

---

## Your Task

1. **Read the tracking document:**
   - `.claude/docs/vibecheck/spec-fixes-tracking.md`
   - Find the specified batch number

2. **Verify dependencies:**
   - Check if all prerequisite batches are complete
   - Check if required design decisions are finalized
   - If dependencies not met: STOP and report which are missing

3. **Read current specification:**
   - `.claude/docs/vibecheck/technical-specification.md`
   - Note the current version

4. **Apply all fixes in the batch:**
   - For each fix in the batch:
     - Locate the spec section(s) to modify
     - Apply the fix according to design decisions
     - Verify the fix doesn't break other sections
     - Update any cross-references if needed

5. **Increment spec version:**
   - Update version in spec header
   - Format: `1.4-alpha.<batch-number>`
   - Update changelog with batch fixes

6. **Update tracking document:**
   - Check off all completed fixes in the batch
   - Mark batch status as "✅ Complete"
   - Note spec version after this batch

7. **Show changes to user:**
   - Present a summary of what was changed
   - Show before/after for critical changes
   - Ask for approval before marking complete

---

## Success Criteria

- [ ] All fixes in batch applied correctly
- [ ] Spec version incremented
- [ ] Changelog updated
- [ ] Tracking document updated (items checked off)
- [ ] No new inconsistencies introduced
- [ ] User approved the changes

---

## Output Format

Provide:
1. Batch number and name
2. List of fixes applied
3. Spec sections modified
4. Before/after examples for major changes
5. New spec version
6. Status: COMPLETE or NEEDS REVISION

---

## Notes

- Work incrementally within the batch
- If a fix requires a design decision not yet made: STOP and flag it
- If you discover new issues while fixing: document them
- Don't proceed to next batch without user approval
