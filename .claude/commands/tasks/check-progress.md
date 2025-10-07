---
description: Check current implementation status and next steps
allowed-tools: Read, Glob
---

# Check Implementation Progress

<context>
<progress_definitions>
# Understanding Progress Tracking

The Vibe-Check project tracks progress at multiple levels:

**Overall Progress** = (Completed Tasks / Total Tasks) × 100%
**Phase Progress** = (Completed Tasks in Phase / Total Tasks in Phase) × 100%

**Task States**:
- ✅ Complete: Task fully implemented, tested, and documented
- 🚧 In Progress: Task started but not complete
- 🔜 Not Started: Task pending
- ❌ Blocked: Task cannot start due to dependencies

**Files to Read**:
- `.claude/tasks/PROGRESS.md` - Master checklist with all tasks
- `.claude/tasks/TEST_MATRIX.md` - Test coverage by component
- `.claude/tasks/RISK_ASSESSMENT.md` - Current risk status
- Current phase OVERVIEW.md - Phase-specific status
</progress_definitions>

<completion_calculation_algorithm>
# How to Calculate Completion Percentage

**Algorithm**:
1. Parse PROGRESS.md and count checkbox states
2. Count total tasks: `total = count(all checkboxes in PROGRESS.md)`
3. Count completed: `completed = count(checkboxes with [x] or ✅)`
4. Calculate: `overall_pct = (completed / total) * 100`
5. Round to nearest integer

**Per-Phase Calculation**:
1. Identify phase sections in PROGRESS.md (## Phase N: ...)
2. For current phase:
   - Count tasks under phase heading
   - Count completed tasks (marked [x] or ✅)
   - Calculate: `phase_pct = (phase_completed / phase_total) * 100`

**Example**:
- PROGRESS.md has 80 total checkboxes
- 12 are marked [x] or ✅
- Overall: (12/80) * 100 = 15%
- Current phase (Phase 1) has 10 tasks, 6 complete
- Phase 1: (6/10) * 100 = 60%
</completion_calculation_algorithm>

<phase_structure>
# Project Phase Structure

**Phase 0**: Risk Assessment & Spikes (Week 1)
- 3 spikes + learnings = ~6 tasks

**Phase 1**: Shared Kernel (Week 2)
- Types, Schemas, Utils, SDK = ~10-12 tasks

**Phase 2**: Ring 1 - Core Systems (Week 3-4)
- Storage, Agent, Git = ~15-18 tasks

**Phase 3**: Ring 2 - Test Infrastructure (Week 5-6)
- vibeTest, vibeWorkflow, Matchers, Watchers = ~18-20 tasks

**Phase 4**: Ring 3 - Evaluation & Reporting (Week 7)
- Judge, Reporters = ~12-15 tasks

**Phase 5**: Ring 4 - Advanced Features (Week 8)
- Matrix, Config, Documentation = ~15-18 tasks

**Total**: ~80 tasks across all phases
</phase_structure>
</context>

## Your Task

You are helping the user check the current status of the Vibe-Check implementation project. This involves reading progress trackers, calculating completion percentages, identifying what's done and what's next, and surfacing any blockers.

**Why this matters**: Regular progress checks keep the team aligned, identify blockers early, celebrate completed work, and ensure momentum toward project goals.

**Expected output**:
- Current phase and completion percentages (overall + phase-specific)
- List of recently completed tasks
- List of in-progress tasks
- Next recommended tasks to work on
- Any blockers or issues
- Test coverage summary
- Recommendations for next steps

## Process

First, read and analyze all progress tracking files:

1. **Read progress files** in parallel:
   - Read PROGRESS.md (master task list)
   - Read TEST_MATRIX.md (test coverage)
   - Read RISK_ASSESSMENT.md (risk status)
   - Read current phase OVERVIEW.md

2. **Calculate completion percentages**:
   - Parse PROGRESS.md for all checkboxes
   - Count total tasks and completed tasks
   - Calculate overall completion: `(completed / total) * 100`
   - Identify current phase from PROGRESS.md header
   - Calculate current phase completion: `(phase_completed / phase_total) * 100`

3. **Identify completed tasks**:
   - Quote tasks marked ✅ or [x] in PROGRESS.md
   - Group by phase if helpful
   - Focus on recently completed (last session or two)

4. **Identify in-progress tasks**:
   - Look for tasks marked 🚧 or partially complete
   - Check SESSION_LOG/ directory for active sessions
   - Estimate percentage complete for in-progress tasks if possible

5. **Identify next tasks**:
   - Find first unchecked task in current phase
   - Validate dependencies are met
   - Suggest 1-3 tasks to prioritize
   - Consider parallelization opportunities

6. **Check for blockers**:
   - Read "Blockers & Issues" section in PROGRESS.md
   - Check RISK_ASSESSMENT.md for high-risk items
   - Look for dependency violations (Ring 2 started before Ring 1 complete)

7. **Summarize test coverage**:
   - Read TEST_MATRIX.md
   - Report overall coverage percentage
   - Compare against targets (kernel ≥95%, supporting ≥90%, utilities ≥85%)
   - Flag any components below target

8. **Provide recommendations**:
   - Based on completion %, blockers, and next tasks
   - Suggest focus areas for current session
   - Estimate time to phase completion
   - Highlight risks or concerns

Use parallel tool execution: Read all tracking files simultaneously for speed.

<examples>
<example index="1">
<scenario>Early in project - Phase 0 complete, Phase 1 in progress</scenario>

<input>
User invokes: `/tasks/check-progress`

PROGRESS.md shows:
- Phase 0: All tasks ✅ (6/6 complete)
- Phase 1: 60% complete (6/10 tasks done)
- Overall: 15% complete (12/80 tasks)
- No blockers

TEST_MATRIX.md shows:
- Phase 0 spikes: No tests (prototypes)
- Phase 1 completed: 85% coverage (target: 95%)
</input>

<expected_output>
📊 Vibe-Check Implementation Progress

**Current Status**:
- **Phase**: Phase 1 - Shared Kernel
- **Overall**: 15% complete (12/80 tasks)
- **This Phase**: 60% complete (6/10 tasks)

**Recently Completed** ✅:
- Phase 0: All 3 spikes complete
- Phase 0: Learnings documented
- Phase 1: Types system (src/types/)
- Phase 1: Schema system (src/schemas/)
- Phase 1: Hash utilities (src/utils/hash.ts)
- Phase 1: NDJSON utilities (src/utils/ndjson.ts)

**In Progress** 🚧:
- Phase 1: Correlation utilities (50% done)
  - Tests written ✅
  - Implementation in progress 🚧
  - Expected completion: Today

**Next Up**:
1. **Complete correlation.ts** (Priority: High)
   - Finish implementation (from Spike 3 learnings)
   - Run tests and ensure 95%+ coverage
   - Update documentation

2. **Start SDK bridge** (Priority: High)
   - File: src/sdk/bridge.ts
   - Use learnings from Spike 2
   - Depends on: correlation complete

3. **Kernel documentation** (Priority: Medium)
   - After all components complete
   - Document API contracts
   - Mark kernel as immutable

**Blockers**: None ✅

**Test Coverage**:
- Phase 1 completed components: 85% (Target: 95% ⚠️)
- Gap: Need 10% more coverage on completed components
- Recommendation: Add edge case tests to types and schemas

**Next Steps**:
1. Focus on completing correlation.ts today
2. Add edge case tests to bring Phase 1 to 95% coverage
3. Start SDK bridge tomorrow
4. Target: Complete Phase 1 by end of this week

**Estimated Time to Phase Completion**: 2-3 days
</expected_output>

<reasoning>
Shows project early stage with Phase 0 complete and Phase 1 60% done. The output celebrates recent completions, identifies the specific in-progress task, and provides clear next steps. It also flags that test coverage is below target (85% vs 95%) and recommends how to close the gap.
</reasoning>
</example>

<example index="2">
<scenario>Mid-project - Ring 1 complete, Ring 2 just starting</scenario>

<input>
User invokes: `/tasks/check-progress`

PROGRESS.md shows:
- Phases 0-1: Complete ✅ (18/18 tasks)
- Phase 2 (Ring 1): Complete ✅ (18/18 tasks)
- Phase 3 (Ring 2): Just started (2/20 tasks)
- Overall: 38% complete (38/80 tasks)

TEST_MATRIX.md shows:
- Kernel: 98% coverage ✅
- Ring 1: 92% coverage ✅
</input>

<expected_output>
📊 Vibe-Check Implementation Progress

**Current Status**:
- **Phase**: Phase 3 - Ring 2 (Test Infrastructure)
- **Overall**: 48% complete (38/80 tasks)
- **This Phase**: 10% complete (2/20 tasks)

**Recently Completed** ✅:
- Phase 2 (Ring 1): All 18 tasks complete 🎉
  - Storage System: RunBundleStore, contentStore, lazyFile, cleanup ✅
  - Agent Execution: AgentRunner, ContextManager, hooks ✅
  - Git Integration: captureGitState, generateDiff, detectChanges ✅
- Ring 1 Integration Session: Complete ✅

**In Progress** 🚧:
- Phase 3: vibeTest.ts (40% done)
  - Fixture system implemented ✅
  - runAgent integration 🚧
  - Expected completion: Tomorrow

- Phase 3: vibeWorkflow.ts (20% done)
  - Initial structure created ✅
  - Stage management 🚧
  - Expected completion: 2 days

**Next Up**:
1. **Complete vibeTest runAgent integration** (Priority: Critical)
   - Integrate with AgentRunner from Ring 1
   - Test with RunBundleStore integration
   - Target: Tomorrow

2. **Complete vibeWorkflow stage management** (Priority: High)
   - Implement wf.stage() method
   - Add cumulative context tracking
   - Target: 2 days

3. **Start custom matchers** (Priority: High)
   - Can work in parallel with above
   - Begin with toHaveChangedFiles, toHaveUsedTool
   - Target: Start tomorrow (parallel track)

**Blockers**: None ✅

**Test Coverage**:
- Kernel (Phase 1): 98% coverage ✅✅ (Target: 95%)
- Ring 1 (Phase 2): 92% coverage ✅ (Target: 90%)
- Ring 2 (Phase 3): 15% coverage (just started, target: 90%)

**Milestone** 🎉:
- **Ring 1 Complete!** All core systems (Storage, Agent, Git) are production-ready

**Next Steps**:
1. Complete vibeTest and vibeWorkflow this week
2. Parallelize matchers work (independent track)
3. Schedule Ring 2 integration session for next week
4. Target: Complete Ring 2 by end of next week

**Estimated Time to Phase Completion**: 5-6 days
</expected_output>

<reasoning>
Mid-project status showing Ring 1 just completed (celebrate with 🎉). Two tasks in Ring 2 are in progress with different completion percentages. Recommends parallelization (matchers can start while finishing vibeTest/vibeWorkflow). Test coverage shows completed phases are excellent.
</reasoning>
</example>

<example index="3">
<scenario>Blocker discovered - dependency violation</scenario>

<input>
User invokes: `/tasks/check-progress`

PROGRESS.md shows:
- Phase 0-1: Complete ✅
- Phase 2 (Ring 1): 80% complete (14/18 tasks) 🚧
  - Agent Execution: 4/6 tasks (missing ContextManager, hooks/processor)
- Phase 3 (Ring 2): Started 🚧 (vibeTest in progress)
- Overall: 40% complete (32/80 tasks)

RISK_ASSESSMENT.md shows:
- Hook capture system: Medium risk (implementation complex)
</input>

<expected_output>
📊 Vibe-Check Implementation Progress

**Current Status**:
- **Phase**: Phase 2 - Ring 1 (Core Systems) + Phase 3 (Early Start)
- **Overall**: 40% complete (32/80 tasks)
- **Phase 2**: 78% complete (14/18 tasks)
- **Phase 3**: 5% complete (1/20 tasks)

**Recently Completed** ✅:
- Phase 2: Storage System complete ✅
- Phase 2: Git Integration complete ✅
- Phase 2: AgentRunner implemented ✅
- Phase 3: vibeTest started (early)

**In Progress** 🚧:
- Phase 2: Agent Execution System (67% done)
  - AgentRunner: ✅ Complete
  - ContextManager: ❌ Not started (BLOCKER)
  - hooks/capture.ts: ✅ Complete
  - hooks/processor.ts: ❌ Not started (BLOCKER)

- Phase 3: vibeTest.ts (20% done)
  - Started early (before Ring 1 complete) ⚠️

**⚠️ BLOCKERS DETECTED**:

**Blocker 1: Dependency Violation** (Critical)
- **Issue**: Phase 3 (vibeTest) started before Phase 2 (Ring 1) complete
- **Impact**: vibeTest depends on AgentRunner and ContextManager
- **Risk**: ContextManager not implemented yet
- **Resolution**:
  1. PAUSE work on vibeTest
  2. Complete ContextManager (Priority: Critical)
  3. Complete hooks/processor.ts (Priority: Critical)
  4. THEN resume vibeTest work

**Blocker 2: Hook Processing Incomplete** (High)
- **Issue**: hooks/processor.ts not started
- **Impact**: Cannot correlate tool calls, vibeTest cannot capture RunResult properly
- **Resolution**:
  1. Implement hooks/processor.ts (use Spike 3 learnings)
  2. Test with ContextManager
  3. Target: 2-3 days

**Next Steps** (Corrected Priority):
1. ❌ **STOP vibeTest work temporarily**
2. ✅ **Implement ContextManager** (Critical - start NOW)
3. ✅ **Implement hooks/processor.ts** (Critical - can parallel with ContextManager)
4. ✅ **Complete Ring 1 integration session**
5. ✅ **Then resume vibeTest** (after Ring 1 complete)

**Test Coverage**:
- Ring 1 (partial): 88% coverage (missing Agent components)
- Target for Ring 1: 90%

**Recommendation**:
Focus all resources on completing Ring 1 Agent Execution System before continuing Ring 2 work. The radial architecture requires Ring 1 to be fully complete before Ring 2 can proceed.

**Estimated Time to Unblock**: 2-3 days (complete Ring 1 Agent System)
</expected_output>

<reasoning>
This example shows a critical blocker: Phase 3 started before Phase 2 was complete, violating the radial dependency architecture. The output clearly identifies the violation, explains why it's a problem, and provides specific steps to resolve it. It emphasizes stopping Phase 3 work until Phase 2 is complete.
</reasoning>
</example>

<example index="4">
<scenario>Late project - Ring 4 in progress, almost done</scenario>

<input>
User invokes: `/tasks/check-progress`

PROGRESS.md shows:
- Phases 0-4: All Complete ✅ (68/80 tasks)
- Phase 5 (Ring 4): 75% complete (9/12 tasks)
- Overall: 96% complete (77/80 tasks)

TEST_MATRIX.md shows:
- All components: 93% average coverage ✅
</input>

<expected_output>
📊 Vibe-Check Implementation Progress

**Current Status**:
- **Phase**: Phase 5 - Ring 4 (Final Phase) 🎉
- **Overall**: 96% complete (77/80 tasks)
- **This Phase**: 75% complete (9/12 tasks)

**Recently Completed** ✅:
- Phase 5: Matrix testing (defineTestSuite) ✅
- Phase 5: Configuration system (defineVibeConfig) ✅
- Phase 5: User guide documentation ✅
- Phase 5: API reference complete ✅
- Phase 5: 5 tutorial examples ✅

**In Progress** 🚧:
- Phase 5: Cookbook recipes (80% done)
  - 8/10 recipes complete
  - Expected completion: Today

**Next Up** (Final Tasks):
1. **Complete cookbook recipes** (Priority: High)
   - 2 more recipes to write
   - Target: Today

2. **Final E2E testing** (Priority: Critical)
   - Run full test suite across all components
   - Validate performance targets
   - Target: Tomorrow

3. **Prepare for publication** (Priority: Critical)
   - Final README.md polish
   - CONTRIBUTING.md review
   - package.json metadata
   - Target: Tomorrow

**Blockers**: None ✅

**Test Coverage**:
- **Overall**: 93% average coverage ✅✅
- Kernel: 98% ✅
- Ring 1: 92% ✅
- Ring 2: 91% ✅
- Ring 3: 94% ✅
- Ring 4: 90% ✅
- All targets met! ✅

**Performance Targets**:
- Unit tests: 42s (Target: ≤45s) ✅
- Integration tests: 85s (Target: ≤90s) ✅
- E2E tests: Pending final run

**🎉 Milestone: 96% Complete!**

Project is nearly done! Only 3 tasks remaining:
1. Complete cookbook recipes
2. Final E2E testing
3. Publication preparation

**Next Steps**:
1. Finish cookbook recipes today
2. Run comprehensive E2E test suite tomorrow
3. Prepare for bun publish (v1.0.0)
4. **Target: Project complete this week!**

**Estimated Time to Completion**: 2 days 🚀
</expected_output>

<reasoning>
Shows project at 96% completion, almost done. The tone is celebratory (🎉) since it's the final phase. All test coverage targets are met. The output emphasizes the remaining tasks are simple and provides a clear path to project completion. Performance targets are included since this is final phase.
</reasoning>
</example>

<example index="5">
<scenario>Project just starting - nothing complete yet</scenario>

<input>
User invokes: `/tasks/check-progress`

PROGRESS.md shows:
- All phases: Not started
- Overall: 0% complete (0/80 tasks)
- No blockers
</input>

<expected_output>
📊 Vibe-Check Implementation Progress

**Current Status**:
- **Phase**: Phase 0 - Risk Assessment & Spikes (Not Started)
- **Overall**: 0% complete (0/80 tasks)
- **This Phase**: 0% complete (0/6 tasks)

**Recently Completed** ✅:
- None (project just starting)

**In Progress** 🚧:
- None (ready to begin)

**Next Up** (Start Here):
1. **Begin Phase 0** (Priority: Critical)
   - Run `/tasks/start-phase` to plan Phase 0
   - Start with risk assessment workshop

2. **Recommended First Tasks**:
   - Risk Assessment Workshop (4 hours)
   - Spike 1: Hook Capture System (de-risk highest priority)
   - Spike 2: SDK Integration (can parallel with Spike 1)
   - Spike 3: Tool Call Correlation (can parallel)

3. **Parallelization Opportunity**:
   - All 3 spikes can run simultaneously
   - Recommended: 3-6 developers (1-2 per spike)

**Blockers**: None ✅

**Test Coverage**: N/A (no code written yet)

**Project Structure**:
- 6 phases total
- ~80 tasks across all phases
- 8-week timeline (1 phase per week approximately)

**Recommendation**:
Begin with Phase 0 to de-risk the project before building. The spikes will inform Phase 1 implementation and prevent costly mistakes.

**Next Command**: `/tasks/start-phase`

**Estimated Time to First Completion**: End of Week 1 (Phase 0 complete)
</expected_output>

<reasoning>
Shows completely fresh project with 0% completion. The output is encouraging and provides clear direction on how to start. It recommends using `/tasks/start-phase` as the next command and explains the value of Phase 0 (spikes).
</reasoning>
</example>
</examples>

## Success Criteria

- [ ] Overall completion percentage calculated correctly
- [ ] Current phase completion percentage calculated correctly
- [ ] Recently completed tasks listed
- [ ] In-progress tasks identified with estimated completion
- [ ] Next recommended tasks provided (1-3 tasks)
- [ ] Blockers surfaced if present
- [ ] Test coverage summarized from TEST_MATRIX.md
- [ ] Recommendations provided based on current state
- [ ] Estimated time to phase completion included
- [ ] For blockers: Clear explanation of issue and resolution steps
- [ ] For late-stage projects: Celebratory tone and final tasks highlighted
