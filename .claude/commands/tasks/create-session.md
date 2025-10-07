---
description: Create new work session with TDD plan
argument-hint: [component-name]
allowed-tools: Read, Write, Glob
---

# Create New Work Session

<context>
<progress_state>
# Current Progress

Read from `.claude/tasks/PROGRESS.md` to understand:
- Current phase and overall completion
- Which tasks are pending vs complete
- Next recommended task to work on
- Dependencies between tasks

**Location**: `.claude/tasks/PROGRESS.md`
</progress_state>

<phase_context>
# Phase Documentation

Each phase has documentation showing:
- Goals and objectives
- Task breakdown
- Team assignments
- Dependencies

**Locations**:
- Phase 0: `.claude/tasks/spikes/OVERVIEW.md`
- Phase 1: `.claude/tasks/kernel/README.md`
- Phase 2: `.claude/tasks/ring1/OVERVIEW.md`
- Phase 3: `.claude/tasks/ring2/OVERVIEW.md`
- Phase 4: `.claude/tasks/ring3/OVERVIEW.md`
- Phase 5: `.claude/tasks/ring4/OVERVIEW.md`
</phase_context>

<session_template_structure>
# Session Log Template

The template at `.claude/tasks/SESSION_TEMPLATE.md` provides the structure for every work session.

**Required Sections**:
- **Session Information**: Date, phase, component, duration, participants
- **Session Goals**: What to accomplish (checklist format)
- **Pre-Session Checklist**: Setup tasks before coding
- **Session Plan**:
  - Write Failing Tests (30 min) - TDD RED phase
  - Implementation (2-3 hours) - TDD GREEN and REFACTOR phases
  - Documentation (30 min) - Update progress trackers
- **What We Did**: Implementation notes (filled during session)
- **Blockers**: Issues preventing progress
- **Learnings**: Insights from session
- **Code Quality**: Coverage, performance metrics
- **Next Steps**: Handoff notes for next session
- **Post-Session Checklist**: Tasks after coding
- **Commit Message**: Suggested git commit
- **Time Breakdown**: Actual vs planned time

**Key Principle**: Tests FIRST, then implementation (TDD)
</session_template_structure>
</context>

## Your Task

You are helping the user create a new work session for implementing a component in the Vibe-Check project. This involves reading the current state, determining what to work on, creating a session log from the template, and planning the TDD approach.

**Why this matters**: Proper session planning ensures clear goals, enforces TDD discipline (tests first), maintains continuity across sessions, and provides documentation for team handoffs.

**Expected output**:
- Session log file created at correct path
- Session goals filled in from current phase documentation
- TDD plan with specific tests to write FIRST
- Implementation approach outlined
- Files to create/modify listed
- Estimated duration provided
- References to relevant documentation

## Process

First, determine what component to work on:

1. **Identify component**:
   - If user specified component name in argument ($1), use that
   - Otherwise, read PROGRESS.md and suggest next pending task
   - Validate the component is part of current phase

2. **Read context files** in parallel:
   - Read PROGRESS.md (overall status)
   - Read current phase OVERVIEW.md (phase-specific context)
   - Read SESSION_TEMPLATE.md (template structure)

3. **Extract component details**:
   - Quote the task description from PROGRESS.md
   - Quote any dependencies or prerequisites
   - Identify which track/team this component belongs to
   - Check for related technical specification sections
   - Look for spike learnings if applicable

4. **Create session log**:
   - Generate filename: `.claude/tasks/SESSION_LOG/YYYY-MM-DD-{component-name}.md`
   - Use today's date (2025-10-07)
   - Copy SESSION_TEMPLATE.md structure
   - Fill in Session Information section (date, phase, component)
   - Fill in Session Goals from PROGRESS.md task description
   - Fill in Pre-Session Checklist with specific items for this component

5. **Plan TDD approach** (CRITICAL):
   - **Tests FIRST**: List specific test cases to write before any implementation
   - Identify test file locations (unit vs integration)
   - Define test scenarios (happy path, edge cases, error cases)
   - Estimate 30 minutes for writing failing tests (RED phase)
   - Then plan implementation to make tests pass (GREEN phase)
   - Then refactoring (BLUE phase)

6. **List implementation files**:
   - Source files to create (src/...)
   - Test files to create (tests/...)
   - Documentation files to update (PROGRESS.md, TEST_MATRIX.md, etc.)

7. **Add references**:
   - Link to technical specification sections
   - Link to spike learnings if applicable
   - Link to kernel API docs if building on kernel

Use parallel tool execution: Read PROGRESS.md, phase OVERVIEW.md, and SESSION_TEMPLATE.md simultaneously.

<examples>
<example index="1">
<scenario>Create session for correlation utility (kernel component, depends on spike learnings)</scenario>

<input>
User invokes: `/tasks/create-session correlation`

PROGRESS.md shows:
- Current Phase: Phase 1 (Kernel)
- Task: "src/utils/correlation.ts - Tool call correlation (from Spike 3)"
- Status: Pending
</input>

<expected_output>
📝 New Session Created

**Session**: 2025-10-07 - Implement Tool Call Correlation
**Phase**: Phase 1 - Shared Kernel
**Component**: src/utils/correlation.ts

**Session Log**: `.claude/tasks/SESSION_LOG/2025-10-07-correlation.md`

**Goals**:
1. Implement correlation algorithm (from Spike 3 learnings)
2. Handle edge cases (missing PostToolUse, concurrent calls)
3. Achieve O(n) performance
4. Write comprehensive tests (95%+ coverage)

**TDD Plan** (TESTS FIRST):

**1. Write Failing Tests** (30 min - RED phase):
- File: `tests/unit/utils/correlation.test.ts`
- Tests to write:
  ```typescript
  describe('correlateToolCalls', () => {
    it('correlates PreToolUse + PostToolUse correctly');
    it('handles missing PostToolUse gracefully');
    it('handles concurrent tool calls with same name');
    it('maintains O(n) performance with 1000+ events');
    it('returns correlation ID for matched pairs');
    it('handles out-of-order events');
  });
  ```

**2. Implementation** (2-3 hours - GREEN + REFACTOR phases):
- File: `src/utils/correlation.ts`
- Approach:
  1. Implement basic correlation (make first test pass)
  2. Add missing PostToolUse handling (make second test pass)
  3. Add concurrent call support (make third test pass)
  4. Optimize to O(n) using hash map (make fourth test pass)
  5. Refactor for clarity
- Use learnings from `.claude/tasks/spikes/03-correlation/LEARNINGS.md`

**3. Documentation** (30 min):
- Update `PROGRESS.md` (check off correlation task)
- Update `TEST_MATRIX.md` (add 6 unit tests)
- Update `kernel/README.md` (document correlation API)
- Add JSDoc comments to correlation.ts

**References**:
- Technical Spec: `.claude/docs/vibecheck/technical-specification.md` (Section 4.2)
- Spike Learnings: `.claude/tasks/spikes/03-correlation/LEARNINGS.md`
- Kernel API: `.claude/tasks/kernel/API.md`

**Estimated Duration**: 3-4 hours

**Ready to start!** Run: `cat .claude/tasks/SESSION_LOG/2025-10-07-correlation.md`
</expected_output>

<reasoning>
This component depends on Spike 3 learnings, so the output references the spike LEARNINGS.md file. The TDD plan is explicit: write 6 specific tests FIRST (30 min), then implement to make them pass (2-3 hours). The tests are listed as concrete describe/it blocks.
</reasoning>
</example>

<example index="2">
<scenario>Create session for Ring 1 component (no spike dependencies)</scenario>

<input>
User invokes: `/tasks/create-session RunBundleStore`

PROGRESS.md shows:
- Current Phase: Phase 2 (Ring 1)
- Task: "src/storage/RunBundleStore.ts - Bundle creation/reading/cleanup"
- Status: Pending
- Dependencies: Kernel complete ✅
</input>

<expected_output>
📝 New Session Created

**Session**: 2025-10-07 - Implement RunBundleStore
**Phase**: Phase 2 - Ring 1 (Storage System)
**Component**: src/storage/RunBundleStore.ts

**Session Log**: `.claude/tasks/SESSION_LOG/2025-10-07-runbundlestore.md`

**Goals**:
1. Implement bundle directory creation at `.vibe/bundles/<run-id>/`
2. Write summary.json with validated schema
3. Stream hooks to hooks.ndjson
4. Implement bundle reading with lazy file loading
5. Achieve 95%+ test coverage

**TDD Plan** (TESTS FIRST):

**1. Write Failing Tests** (30 min - RED phase):
- File: `tests/unit/storage/runBundle.test.ts`
- Tests to write:
  ```typescript
  describe('RunBundleStore', () => {
    it('creates bundle directory structure');
    it('writes summary.json with correct schema');
    it('validates summary.json against Zod schema');
    it('appends hooks to hooks.ndjson in streaming fashion');
    it('reads existing bundle and returns RunResult');
    it('provides lazy file accessors (text(), stream())');
    it('handles missing bundles gracefully');
  });
  ```

- File: `tests/integration/storage/runBundle.test.ts`
- Tests to write:
  ```typescript
  describe('RunBundleStore integration', () => {
    it('writes and reads complete bundle');
    it('handles concurrent writes to same bundle');
    it('preserves content integrity (hash verification)');
  });
  ```

**2. Implementation** (2-3 hours - GREEN + REFACTOR phases):
- File: `src/storage/RunBundleStore.ts`
- Approach:
  1. Implement createBundle() (makes first 4 tests pass)
  2. Implement readBundle() (makes 5th test pass)
  3. Add lazy file loading (makes 6th test pass)
  4. Add error handling (makes 7th test pass)
  5. Refactor for clarity and performance
- Uses kernel types: `RunResult`, `FileChange`, `ToolCall`
- Uses kernel schemas: `runBundleSchema` from `src/schemas/runBundle.ts`

**3. Documentation** (30 min):
- Update `PROGRESS.md` (check off RunBundleStore task)
- Update `TEST_MATRIX.md` (add 10 tests total)
- Update `ring1/OVERVIEW.md` (mark Storage track progress)
- Add JSDoc comments to RunBundleStore.ts

**References**:
- Technical Spec: `.claude/docs/vibecheck/technical-specification.md` (Section 3)
- Kernel Types: `src/types/core.ts` (RunResult interface)
- Kernel Schemas: `src/schemas/runBundle.ts` (Zod schema)
- Storage Contract: `.claude/tasks/ring1/CONTRACTS.md`

**Estimated Duration**: 4-5 hours

**Ready to start!** Run: `cat .claude/tasks/SESSION_LOG/2025-10-07-runbundlestore.md`
</expected_output>

<reasoning>
Ring 1 component that depends on kernel types and schemas. The TDD plan includes both unit and integration tests. The output references the Ring 1 CONTRACTS.md which documents the APIs between Storage, Agent, and Git systems.
</reasoning>
</example>

<example index="3">
<scenario>Auto-detect next task (no component specified)</scenario>

<input>
User invokes: `/tasks/create-session`

PROGRESS.md shows:
- Current Phase: Phase 1 (Kernel)
- Completed: src/types/ ✅, src/schemas/ ✅
- Next pending: src/utils/correlation.ts
</input>

<expected_output>
📝 New Session Created (Auto-Detected Next Task)

**Session**: 2025-10-07 - Implement Tool Call Correlation
**Phase**: Phase 1 - Shared Kernel
**Component**: src/utils/correlation.ts

**Why this component?**: Next pending task in Phase 1 after Types and Schemas completion

**Session Log**: `.claude/tasks/SESSION_LOG/2025-10-07-correlation.md`

**Goals**:
1. Implement correlation algorithm (from Spike 3 learnings)
2. Handle edge cases (missing PostToolUse, concurrent calls)
3. Achieve O(n) performance
4. Write comprehensive tests (95%+ coverage)

**TDD Plan** (TESTS FIRST):
[... same as Example 1 ...]

**Ready to start!** Run: `cat .claude/tasks/SESSION_LOG/2025-10-07-correlation.md`
</expected_output>

<reasoning>
When no component specified, the command auto-detects the next pending task from PROGRESS.md. The output explicitly states "Why this component?" to explain the auto-detection logic.
</reasoning>
</example>

<example index="4">
<scenario>Create session for vibeTest (Ring 2 component with complex dependencies)</scenario>

<input>
User invokes: `/tasks/create-session vibeTest`

PROGRESS.md shows:
- Current Phase: Phase 3 (Ring 2)
- Task: "src/testing/vibeTest.ts - Main test function with fixtures"
- Dependencies: Ring 1 complete ✅ (Storage, Agent, Git)
</input>

<expected_output>
📝 New Session Created

**Session**: 2025-10-07 - Implement vibeTest
**Phase**: Phase 3 - Ring 2 (Test Infrastructure)
**Component**: src/testing/vibeTest.ts

**Session Log**: `.claude/tasks/SESSION_LOG/2025-10-07-vibetest.md`

**Goals**:
1. Implement vibeTest function wrapping Vitest test.extend
2. Inject VibeTestContext fixtures (runAgent, judge, expect, annotate, task)
3. Integrate with AgentRunner from Ring 1
4. Integrate with RunBundleStore from Ring 1
5. Achieve 90%+ test coverage

**Dependencies Verified**:
✅ AgentRunner (Ring 1) - Available
✅ RunBundleStore (Ring 1) - Available
✅ Kernel types (VibeTestContext, RunResult) - Available

**TDD Plan** (TESTS FIRST):

**1. Write Failing Tests** (30 min - RED phase):
- File: `tests/integration/testing/vibeTest.test.ts`
- Tests to write:
  ```typescript
  describe('vibeTest', () => {
    it('extends Vitest test with VibeTestContext');
    it('provides runAgent fixture that returns RunResult');
    it('provides judge fixture for rubric evaluation');
    it('provides annotate fixture for streaming updates');
    it('stores RunResult in task.meta after execution');
    it('integrates with AgentRunner and RunBundleStore');
  });
  ```

**2. Implementation** (3-4 hours - GREEN + REFACTOR phases):
- File: `src/testing/vibeTest.ts`
- File: `src/testing/context.ts` (VibeTestContext implementation)
- Approach:
  1. Create test.extend() wrapper (makes first test pass)
  2. Implement runAgent fixture using AgentRunner (makes 2nd test pass)
  3. Implement judge fixture (makes 3rd test pass)
  4. Implement annotate fixture (makes 4th test pass)
  5. Add task.meta storage integration (makes 5th test pass)
  6. Add full integration (makes 6th test pass)
  7. Refactor for clarity

**3. Documentation** (30 min):
- Update `PROGRESS.md` (check off vibeTest task)
- Update `TEST_MATRIX.md` (add 6 integration tests)
- Update `ring2/OVERVIEW.md` (mark vibeTest track progress)
- Update `ring2/USER_GUIDE.md` (add vibeTest usage examples)

**References**:
- Technical Spec: `.claude/docs/vibecheck/technical-specification.md` (Section 2.1)
- Kernel Types: `src/types/core.ts` (VibeTestContext interface)
- Ring 1 Agent: `src/agent/AgentRunner.ts`
- Ring 1 Storage: `src/storage/RunBundleStore.ts`
- Vitest Docs: https://vitest.dev/api/#test-extend

**Estimated Duration**: 4-5 hours

**Ready to start!** Run: `cat .claude/tasks/SESSION_LOG/2025-10-07-vibetest.md`
</expected_output>

<reasoning>
Complex Ring 2 component that depends on multiple Ring 1 systems (Agent and Storage). The output validates dependencies are met and provides references to both internal APIs and external Vitest documentation.
</reasoning>
</example>

<example index="5">
<scenario>Create session for spike (Phase 0, no tests required initially)</scenario>

<input>
User invokes: `/tasks/create-session hook-capture`

PROGRESS.md shows:
- Current Phase: Phase 0 (Spikes)
- Task: "Spike 1: Hook Capture System"
- Status: Pending
</input>

<expected_output>
📝 New Session Created (Spike Session)

**Session**: 2025-10-07 - Spike 1: Hook Capture System
**Phase**: Phase 0 - Risk Assessment & Spikes
**Component**: spikes/01-hook-capture/

**Session Log**: `.claude/tasks/SESSION_LOG/2025-10-07-spike-hook-capture.md`

**Spike Goals** (Questions to Answer):
1. Can we capture hooks non-blocking?
2. What temp file strategy works best?
3. How do we handle write failures?
4. When should we clean up temp files?
5. What is the performance overhead?

**Spike Plan** (Prototype-Driven, Not TDD):

**1. Set Up Spike Environment** (15 min):
- Create `spikes/01-hook-capture/` directory
- Create `spikes/01-hook-capture/prototype.ts`
- Create `spikes/01-hook-capture/LEARNINGS.md` (empty, to be filled)

**2. Build Minimal Prototype** (2-3 hours):
- Implement basic hook listener
- Test with real Claude SDK execution
- Try different temp file strategies:
  - Single NDJSON file (append mode)
  - Multiple files per hook type
  - In-memory buffer + periodic flush
- Measure performance overhead for each approach
- Test error handling (disk full, permission errors)

**3. Document Learnings** (1 hour):
- Fill `LEARNINGS.md` with answers to spike questions
- Document recommended approach
- Document performance benchmarks
- List risks/concerns discovered
- Provide code samples for Phase 1 implementation

**Note**: Spikes are prototypes, not production code. Focus on learning, not test coverage.

**Files to Create**:
- `spikes/01-hook-capture/prototype.ts`
- `spikes/01-hook-capture/LEARNINGS.md`
- `spikes/01-hook-capture/benchmarks.md` (performance data)

**References**:
- Claude Code Hooks: https://docs.claude.com/en/docs/claude-code/hooks
- Technical Spec: `.claude/docs/vibecheck/technical-specification.md` (Section 4.1)

**Estimated Duration**: 4-5 hours

**Ready to start!** Run: `cat .claude/tasks/SESSION_LOG/2025-10-07-spike-hook-capture.md`
</expected_output>

<reasoning>
Spike sessions are different from implementation sessions. They don't require TDD (tests first) since they're prototypes for learning. The output emphasizes "Questions to Answer" instead of "Tests to Write" and focuses on documenting learnings.
</reasoning>
</example>
</examples>

## Success Criteria

- [ ] Component identified (from argument or auto-detected from PROGRESS.md)
- [ ] Session log created at correct path with today's date
- [ ] Session template structure copied correctly
- [ ] Session Information section filled in
- [ ] Session Goals filled from task description
- [ ] TDD plan includes specific tests to write FIRST (unless spike)
- [ ] Test files and source files listed
- [ ] Documentation files to update listed
- [ ] References to specs/learnings/dependencies provided
- [ ] Estimated duration included
- [ ] For spikes: Questions to Answer instead of TDD plan
- [ ] For Ring components: Dependencies validated
