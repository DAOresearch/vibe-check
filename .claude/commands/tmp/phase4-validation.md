---
description: Phase 4 - Re-audit specification to verify all issues resolved and implementation-ready
model: claude-sonnet-4-20250514
allowed-tools: Read, Write, Glob, Grep, TodoWrite
---

# Phase 4: Validation

**Purpose:** Re-audit the specification to verify all 36 issues are resolved and spec is implementation-ready.

**Tracking Document:** `.claude/docs/vibecheck/audit-resolution-summary.md`

**Prerequisites:**
- Phase 1 completed (design decisions finalized)
- Phase 2 completed (spec v1.4 finalized)
- Phase 3 completed (docs updated)

---

## Your Task

1. **Re-run the audit process:**
   - Read the updated specification v1.4
   - Read all updated documentation files
   - Check each of the 36 original issues:
     - 13 critical blockers
     - 11 consistency issues
     - 7 documentation gaps
     - 5 design questions

2. **For each issue, verify:**
   - ✅ Resolved correctly according to design decisions
   - ✅ No new issues introduced by the fix
   - ✅ Documentation matches implementation
   - ✅ Examples are correct and complete

3. **Create audit resolution summary:**
   - File: `.claude/docs/vibecheck/audit-resolution-summary.md`
   - Format:
     ```markdown
     # Audit Resolution Summary

     ## Original Issues (36 total)
     - Critical Blockers: 13 → Status
     - Consistency Issues: 11 → Status
     - Documentation Gaps: 7 → Status
     - Design Questions: 5 → Status

     ## Resolution Details
     [For each issue: ID, status, how resolved, verification]

     ## New Issues Found (if any)
     [List any new issues discovered during validation]

     ## Final Assessment
     Implementation Ready: YES/NO
     Recommendation: PROCEED / FIX NEW ISSUES FIRST
     ```

4. **Update finalized-decisions.md:**
   - Add Phase 1-4 completion status
   - Reference all tracking documents
   - Update "implementation status" section

5. **Final sign-off:**
   - If all 36 issues resolved and no new critical issues: APPROVE
   - If new issues found: CREATE NEW TRACKING DOC for follow-up

---

## Success Criteria

- [ ] All 36 original issues verified as resolved
- [ ] No critical issues introduced by fixes
- [ ] audit-resolution-summary.md created
- [ ] finalized-decisions.md updated
- [ ] Specification v1.4 marked as implementation-ready
- [ ] Documentation verified to match spec v1.4
- [ ] Final recommendation: PROCEED TO IMPLEMENTATION

---

## Output Format

Provide:
1. Path to audit-resolution-summary.md
2. Table showing resolution status of all 36 issues
3. List of any new issues found (with severity)
4. Final assessment: Implementation Ready? YES/NO
5. If YES: Provide implementation kickoff checklist
6. If NO: Provide tracking doc for new issues

---

## Implementation Kickoff Checklist (if approved)

After validation passes:
- [ ] Update README.md implementation status
- [ ] Create GitHub milestone for v1.4 implementation
- [ ] Set up src/ directory structure per spec Section 5.3
- [ ] Install dependencies per spec Section 5.1
- [ ] Create implementation-plan.mdx if not exists
- [ ] Begin Phase 1 implementation (Core Types & Schemas)

---

## Notes

- Be thorough: check every fix against the spec
- Look for ripple effects: did fixing one thing break another?
- Validate examples: they should be runnable code
- Check cross-references: do section references still point to right locations?
- This is the quality gate before implementation begins
