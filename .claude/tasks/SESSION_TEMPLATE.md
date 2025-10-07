# Session Template

Use this template for every implementation session to maintain continuity across sessions.

---

## Session Information

**Date**: [YYYY-MM-DD]
**Phase**: [Phase Name]
**Component**: [Component Name]
**Duration**: [X hours]
**Participants**: [Names]

---

## Session Goals

_What do we want to accomplish in this session?_

- [ ] Goal 1
- [ ] Goal 2
- [ ] Goal 3

---

## Pre-Session Checklist

- [ ] Read `PROGRESS.md` - Check overall status
- [ ] Read current phase/ring `OVERVIEW.md` - Check phase status
- [ ] Review dependencies in `RADIAL_MAP.md` or `ring{N}/CONTRACTS.md`
- [ ] Check for blockers in previous session logs
- [ ] Set up development environment
- [ ] Pull latest code

---

## Session Plan

### 1. Write Failing Tests (30 min)

**Tests to write**:
```typescript
// List specific tests you'll write
describe('[Component]', () => {
  it('[test case 1]');
  it('[test case 2]');
  it('[test case 3]');
});
```

**Test files**:
- `tests/unit/[path]/[file].test.ts`
- `tests/integration/[path]/[file].test.ts`

### 2. Implementation (2-3 hours)

**Files to create/modify**:
- `src/[path]/[file].ts`
- `src/[path]/[file2].ts`

**Approach**:
1. Step 1: [Description]
2. Step 2: [Description]
3. Step 3: [Description]

**TDD Cycle**:
- 🔴 Red: Write failing test
- 🟢 Green: Make test pass (minimal code)
- 🔵 Refactor: Clean up code
- Repeat

### 3. Documentation (30 min)

**Documents to update**:
- [ ] `PROGRESS.md` - Check off completed tasks
- [ ] `TEST_MATRIX.md` - Update coverage
- [ ] `ring{N}/OVERVIEW.md` - Update component status
- [ ] Component API docs (if applicable)
- [ ] Code comments (if complex logic)

---

## What We Did

_Detailed notes on implementation_

### Tests Written

```typescript
// Example: What tests were written
describe('RunBundleStore', () => {
  it('creates bundle directory structure');
  it('writes summary.json with correct schema');
  it('stores hooks.ndjson in streaming fashion');
});
```

**Test Results**:
- ✅ All tests passing
- ⚠️ Some tests skipped
- ❌ Tests failing (explain why)

### Code Implemented

**Files Changed**:
- `src/storage/RunBundleStore.ts` (+150 lines)
- `src/storage/contentStore.ts` (+80 lines)
- `tests/unit/storage/runBundle.test.ts` (+120 lines)

**Key Implementation Details**:
- [Detail 1]
- [Detail 2]
- [Detail 3]

**Design Decisions**:
- Decision: [Why we chose approach A over B]
- Decision: [Why we chose approach C over D]

### Challenges Encountered

1. **Challenge**: [Description]
   - **Solution**: [How we solved it]
   - **Alternatives Considered**: [Other approaches]

2. **Challenge**: [Description]
   - **Solution**: [How we solved it]

---

## Blockers

_Issues that prevent progress_

### Active Blockers

1. **Blocker**: [Description]
   - **Impact**: [High/Medium/Low]
   - **Owner**: [Who will resolve]
   - **Next Steps**: [Actions to unblock]

### Resolved Blockers

1. **Blocker**: [Description]
   - **Resolution**: [How it was resolved]

---

## Learnings

_Key insights from this session_

### Technical Learnings

- Learning 1: [Description]
- Learning 2: [Description]
- Learning 3: [Description]

### Process Learnings

- Learning 1: [What worked well]
- Learning 2: [What didn't work]
- Learning 3: [What to improve]

---

## Code Quality

### Test Coverage

**Before Session**: [X]%
**After Session**: [Y]%
**Target**: [Z]%

**Coverage Details**:
- Unit tests: [X/Y tests passing]
- Integration tests: [X/Y tests passing]
- E2E tests: [X/Y tests passing]

### Performance

**Benchmark Results** (if applicable):
- Test suite runtime: [X seconds]
- Performance overhead: [Y%]
- Memory usage: [Z MB]

### Code Review

**Self-Review Checklist**:
- [ ] All tests passing
- [ ] Code follows style guide
- [ ] No console.log statements
- [ ] Error handling implemented
- [ ] Edge cases covered
- [ ] Documentation updated
- [ ] No TypeScript errors
- [ ] No linter warnings

---

## Next Steps

_What should happen in the next session?_

### Immediate Next Steps

1. [Action 1] - Priority: [High/Medium/Low]
2. [Action 2] - Priority: [High/Medium/Low]
3. [Action 3] - Priority: [High/Medium/Low]

### Dependencies for Next Session

- Dependency 1: [Description]
- Dependency 2: [Description]

### Handoff Notes

_Important context for next developer_

- Note 1: [Description]
- Note 2: [Description]

---

## Post-Session Checklist

- [ ] Update `PROGRESS.md` with completed tasks
- [ ] Update `TEST_MATRIX.md` with new coverage
- [ ] Update phase/ring `OVERVIEW.md`
- [ ] Commit all changes with descriptive message
- [ ] Push to repository
- [ ] Update project board (if applicable)
- [ ] Notify team of progress
- [ ] Archive this session log

---

## Commit Message

```
[Phase X] Implement [Component Name]

- Implemented [feature 1]
- Implemented [feature 2]
- Added tests for [component]
- Coverage: [X]% → [Y]%

Closes: #[issue-number] (if applicable)
```

---

## Time Breakdown

| Activity | Planned | Actual | Notes |
|----------|---------|--------|-------|
| Pre-session setup | 5 min | [X min] | |
| Writing tests | 30 min | [X min] | |
| Implementation | 2-3 hours | [X hours] | |
| Documentation | 30 min | [X min] | |
| Review & commit | 15 min | [X min] | |
| **Total** | **~4 hours** | **[X hours]** | |

---

## Session Rating

**Productivity**: [1-5 stars] ⭐⭐⭐⭐⭐
**Code Quality**: [1-5 stars] ⭐⭐⭐⭐⭐
**Team Collaboration**: [1-5 stars] ⭐⭐⭐⭐⭐

**Overall Notes**: [Brief reflection on session]

---

## Template Usage Notes

### For Spike Sessions (Phase 0)

- Focus less on "Tests Written" (spikes are prototypes)
- Focus more on "Learnings" and "Questions Answered"
- Add section: "Spike Success Criteria Met?" (Yes/No + explanation)

### For Kernel Sessions (Phase 1)

- Emphasize API stability (kernel shouldn't change)
- Document API contracts thoroughly
- Add section: "Breaking Changes?" (should be none)

### For Ring Sessions (Phase 2-5)

- Focus on integration with other spokes
- Document cross-spoke dependencies
- Add section: "Integration Test Results"

### For Integration Sessions (End of Ring)

- Focus on cross-component integration
- Document integration issues discovered
- Update ring-level `INTEGRATION.md`

---

**Template Version**: 1.0
**Last Updated**: 2025-10-07
