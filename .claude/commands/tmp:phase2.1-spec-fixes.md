# Phase 2.1: Specification Fixes (Post-Audit v2)

**Purpose:** Fix 29 issues discovered in comprehensive re-audit of v1.4 specification.

**Tracking Document:** `.claude/docs/vibecheck/spec-fixes-tracking-phase-2.1.md`

**Context:**
- Phase 2 (COMPLETE): Fixed 24 issues from original audit (v1.3 → v1.4)
- Phase 2.1 (THIS): Fix 29 NEW issues from comprehensive re-audit (v1.4 → v1.4.1)
- Audit Report: `.claude/docs/vibecheck/specification-audit-v2.md`

---

## Your Task

Fix all issues in batches, starting with **Batch 1: Type System Conflicts** (CRITICAL).

### Execution Order

1. **Batch 1: Type System Conflicts** 🔴 MUST FIX FIRST
   - Rubric Type Chaos (2 incompatible definitions)
   - Missing SDKUserMessage Type Import
   - prompt() Return Type Mismatch
   - Circular Dependency in Helper Functions

2. **Batch 2: Missing Core Implementations** 🔴 HIGH PRIORITY
   - ContextManager missing methods
   - Judge helper functions incomplete
   - Git detection logic missing

3. **Batch 3: API Consistency** 🔴 HIGH PRIORITY
   - runAgent() contradictory return types
   - Workspace precedence unclear
   - hookCaptureStatus never populated

4. **Batch 4: Structural Improvements** ⚠️ MEDIUM PRIORITY
   - DEFAULT_MODEL location
   - AgentConfig duplication
   - MCP examples in wrong section
   - File structure inconsistencies

5. **Batch 5: Documentation & Cleanup** 📄 LOW PRIORITY
   - All 9 documentation gaps
   - Bundle cleanup policy
   - Reporter naming consistency

---

## Work Flow

For each batch:

1. **Read tracking document** to see batch details
2. **Read audit report** for specific issue context
3. **Fix issues** in the technical specification
4. **Update spec version** (v1.4-beta.1, beta.2, etc.)
5. **Mark complete** in tracking document
6. **Get approval** before next batch

---

## Success Criteria

- [ ] All 8 critical blockers resolved
- [ ] All 12 consistency issues resolved
- [ ] All 9 documentation gaps addressed (or deferred to Phase 3)
- [ ] Specification updated to v1.4.1 (or v1.5)
- [ ] No new issues introduced
- [ ] Ready for implementation

---

## Notes

- **START WITH BATCH 1** - Type conflicts block everything else
- Work incrementally with user approval between batches
- Use beta versions during work (v1.4-beta.1, etc.)
- Final version only after all critical batches complete
- Documentation gaps can be deferred to Phase 3 if needed

---

## Output Format

After each batch completion, provide:
1. Summary of changes made
2. Sections modified
3. Version updated to
4. Items checked off in tracking doc
5. Request approval before proceeding to next batch
