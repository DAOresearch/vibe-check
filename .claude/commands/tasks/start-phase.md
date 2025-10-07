---
description: Start a new implementation phase with session planning
argument-hint: [phase-number]
allowed-tools: Read, Write, Glob
---

# Start Implementation Phase

<context>
<progress_tracker>
# Current Progress State

Read from `.claude/tasks/PROGRESS.md` to understand:
- Overall completion percentage
- Which phases are complete
- Which phase should start next
- Current blockers and dependencies

**Location**: `.claude/tasks/PROGRESS.md`
</progress_tracker>

<dependency_map>
# Radial Dependency Architecture

The Vibe-Check project follows a radial (core-first) architecture:

**Phases**:
- Phase 0: Risk Assessment & Spikes (Week 1)
- Phase 1: Shared Kernel - Immutable foundation (Week 2)
- Phase 2: Ring 1 - Core Systems (Storage, Agent, Git) (Week 3-4)
- Phase 3: Ring 2 - Test Infrastructure (vibeTest, vibeWorkflow) (Week 5-6)
- Phase 4: Ring 3 - Evaluation & Reporting (Judge, Reporters) (Week 7)
- Phase 5: Ring 4 - Advanced Features (Matrix, Config, Docs) (Week 8)

**Critical Dependencies**:
- Kernel MUST complete before any Ring
- Ring 1 MUST complete before Ring 2
- Ring 2 MUST complete before Ring 3/4

**Parallelization**:
- Within each phase: Multiple tracks work simultaneously
- Each phase has 3-6 parallel tracks

**Reference**: `.claude/tasks/RADIAL_MAP.md` for complete dependency details
</dependency_map>

<phase_documentation>
# Phase Documentation Files

Each phase has an OVERVIEW.md that contains:
- Phase goals and objectives
- Task breakdown by track
- Team assignments
- Acceptance criteria
- Dependencies

**Locations**:
- Phase 0: `.claude/tasks/spikes/OVERVIEW.md`
- Phase 1: `.claude/tasks/kernel/README.md` (special: API documentation)
- Phase 2: `.claude/tasks/ring1/OVERVIEW.md`
- Phase 3: `.claude/tasks/ring2/OVERVIEW.md`
- Phase 4: `.claude/tasks/ring3/OVERVIEW.md`
- Phase 5: `.claude/tasks/ring4/OVERVIEW.md`
</phase_documentation>

<session_template>
# Session Log Template

Sessions are logged using the template at:
**Location**: `.claude/tasks/SESSION_TEMPLATE.md`

**Log Directory**: `.claude/tasks/SESSION_LOG/`
**Naming Format**: `YYYY-MM-DD-phase-{N}-{component}.md`

**Template includes**:
- Session information (date, phase, component, duration)
- Pre-session checklist
- TDD plan (tests first)
- Implementation approach
- Post-session documentation updates
</session_template>
</context>

## Your Task

You are helping the user start a new implementation phase for the Vibe-Check project. This involves reading the current project state, identifying which phase to start, understanding its goals, and creating a comprehensive session plan.

**Why this matters**: Starting a phase properly ensures the team has clear objectives, understands dependencies, identifies potential blockers early, and maximizes parallel work opportunities.

**Expected output**:
- Clear identification of which phase is starting
- Summary of phase goals from documentation
- Breakdown of tasks organized by parallel tracks
- List of dependencies that must be satisfied
- Session log created from template
- Next steps for team coordination

## Process

First, analyze the current state by reading and quoting:

1. **Read PROGRESS.md** simultaneously with RADIAL_MAP.md:
   - Quote the current phase status
   - Quote what phase should start next
   - Identify completion percentage
   - Check for any blockers

2. **Determine the phase** to start:
   - If user specified phase number in argument ($1), use that
   - Otherwise, detect from PROGRESS.md (next uncompleted phase)
   - Validate dependencies are met (e.g., can't start Ring 2 if Ring 1 incomplete)

3. **Read phase documentation**:
   - Read the appropriate OVERVIEW.md for the phase
   - Quote the phase goals
   - Quote the task breakdown by track
   - Identify parallel work opportunities

4. **Create session plan**:
   - List all tasks for this phase
   - Organize by parallel tracks
   - Highlight dependencies between tracks
   - Estimate team size needed
   - Suggest task assignments if team structure is clear

5. **Generate session log**:
   - Use SESSION_TEMPLATE.md as base
   - Create file at: `.claude/tasks/SESSION_LOG/YYYY-MM-DD-phase-{N}-start.md`
   - Fill in phase goals
   - Add pre-session checklist items specific to this phase
   - Leave implementation sections blank (to be filled during work)

Use parallel tool execution: Read PROGRESS.md, RADIAL_MAP.md, and phase OVERVIEW.md simultaneously for optimal performance.

<examples>
<example index="1">
<scenario>Starting Phase 0 (Spikes) - Project beginning</scenario>

<input>
User invokes: `/tasks/start-phase`

PROGRESS.md shows:
- Current Phase: None (project not started)
- Phase 0 status: Not Started
- Overall completion: 0%
</input>

<expected_output>
🚀 Starting Phase 0: Risk Assessment & Spikes

**Phase Goals**:
- Identify and de-risk highest-risk components
- Run 3 critical spikes (Hook Capture, SDK Integration, Tool Correlation)
- Document learnings that inform Phase 1 implementation
- Create risk matrix with scores

**Tasks for this phase** (3 parallel spikes):

**Spike 1: Hook Capture System** (Risk Score: 9)
- [ ] Set up spike environment
- [ ] Build minimal hook listener
- [ ] Test with real Claude SDK
- [ ] Measure performance overhead
- [ ] Document learnings

**Spike 2: SDK Integration** (Risk Score: 8)
- [ ] Build minimal SDK bridge
- [ ] Prototype recorder/replayer
- [ ] Test deterministic replay
- [ ] Document learnings

**Spike 3: Tool Call Correlation** (Risk Score: 7)
- [ ] Build minimal correlation algorithm
- [ ] Test edge cases (missing PostToolUse, concurrent calls)
- [ ] Benchmark performance
- [ ] Document learnings

**Dependencies**:
✅ None (Phase 0 is foundation)

**Parallel Work Opportunities**:
- All 3 spikes can run simultaneously
- Recommended: 3-6 developers (1-2 per spike)

**Session log created**: `.claude/tasks/SESSION_LOG/2025-10-07-phase-0-start.md`

**Next Steps**:
1. Assign spikes to team members
2. Each spike team reviews spike plan in PROGRESS.md
3. Create individual session logs when starting work
4. Target: Complete all spikes within Week 1
</expected_output>

<reasoning>
This example shows starting from the very beginning. Phase 0 has no dependencies, so it can start immediately. The output highlights the 3 parallel spikes and makes it clear all can run simultaneously, which is critical for Week 1 timeline.
</reasoning>
</example>

<example index="2">
<scenario>Starting Phase 1 (Kernel) - After spikes complete</scenario>

<input>
User invokes: `/tasks/start-phase`

PROGRESS.md shows:
- Current Phase: Phase 0 complete ✅
- Phase 1 status: Not Started
- Overall completion: 5% (3/60 tasks)
- All spike learnings documented
</input>

<expected_output>
🚀 Starting Phase 1: Shared Kernel

**Phase Goals**:
- Build stable foundation (types, schemas, utils, SDK bridge)
- Ensure kernel API is immutable after completion
- Achieve 95%+ test coverage for kernel
- Apply learnings from Phase 0 spikes

**Tasks for this phase** (3 parallel tracks):

**Track 1: Type System** (2 devs)
- [ ] src/types/core.ts (11 core interfaces)
- [ ] src/types/agent.ts (Agent types)
- [ ] src/types/judge.ts (Judge types)
- [ ] src/types/workflow.ts (Workflow types)
- [ ] tests/unit/types/ (validate exports)

**Track 2: Schema System** (2 devs)
- [ ] src/schemas/runBundle.ts (Zod validation)
- [ ] src/schemas/summary.ts
- [ ] src/schemas/hooks.ts
- [ ] tests/unit/schemas/ (edge cases)

**Track 3: Core Utilities + SDK Bridge** (2 devs split)
- [ ] src/utils/correlation.ts (from Spike 3 learnings)
- [ ] src/utils/hash.ts (SHA-256)
- [ ] src/sdk/bridge.ts (from Spike 2 learnings)
- [ ] tests/unit/utils/, tests/unit/sdk/

**Dependencies**:
✅ Phase 0 complete (spike learnings available)
⚠️ Must reference: `.claude/tasks/spikes/*/LEARNINGS.md` files

**Parallel Work Opportunities**:
- All 3 tracks can run simultaneously
- Recommended: 5 developers total
- Track 1 & 2 have no dependencies
- Track 3 depends on spike learnings (already complete)

**Session log created**: `.claude/tasks/SESSION_LOG/2025-10-07-phase-1-start.md`

**Next Steps**:
1. Review spike learnings (Hook Capture, SDK Integration, Correlation)
2. Assign tracks to developers
3. Each track creates component-specific session logs
4. Target: Complete kernel by end of Week 2
5. IMPORTANT: Kernel becomes immutable after this phase
</expected_output>

<reasoning>
Phase 1 depends on Phase 0 spike learnings. The output explicitly references the spike LEARNINGS.md files and emphasizes that kernel becomes immutable - a critical architectural constraint.
</reasoning>
</example>

<example index="3">
<scenario>Starting Phase 2 (Ring 1) - Mid-project with explicit phase number</scenario>

<input>
User invokes: `/tasks/start-phase 2`

PROGRESS.md shows:
- Phase 0: Complete ✅
- Phase 1: Complete ✅ (Kernel locked)
- Phase 2: Not Started
- Overall completion: 18% (15/80 tasks)
</input>

<expected_output>
🚀 Starting Phase 2: Ring 1 - Core Systems

**Phase Goals**:
- Build storage system (RunBundleStore, content-addressed files)
- Build agent execution system (AgentRunner, ContextManager, hook capture)
- Build git integration (capture state, generate diffs)
- Integrate all 3 systems with kernel

**Tasks for this phase** (3 parallel tracks):

**Track 1A: Storage System** (2 devs)
- [ ] src/storage/RunBundleStore.ts
- [ ] src/storage/contentStore.ts (SHA-256 addressing)
- [ ] src/storage/lazyFile.ts (lazy loading)
- [ ] src/storage/cleanup.ts (30-day retention)
- [ ] tests/unit/storage/ + tests/integration/storage/

**Track 1B: Agent Execution System** (2 devs)
- [ ] src/agent/AgentRunner.ts
- [ ] src/agent/ContextManager.ts (capture → process → inject)
- [ ] src/agent/hooks/capture.ts (from Spike 1)
- [ ] src/agent/hooks/processor.ts (correlation)
- [ ] tests/unit/agent/ + tests/integration/agent/

**Track 1C: Git Integration System** (1 dev)
- [ ] src/git/captureGitState.ts
- [ ] src/git/generateDiff.ts
- [ ] src/git/detectChanges.ts
- [ ] tests/unit/git/

**Dependencies**:
✅ Phase 1 complete (kernel available and locked)
✅ Kernel provides: RunResult types, correlation utils, SDK bridge
⚠️ Storage and Agent tracks will integrate at end of phase
⚠️ All tracks depend on kernel (immutable foundation)

**Parallel Work Opportunities**:
- All 3 tracks can run simultaneously
- Recommended: 5 developers total (2+2+1 split)
- Storage and Agent can develop independently
- Integration session required at end of Ring 1

**Session log created**: `.claude/tasks/SESSION_LOG/2025-10-07-phase-2-start.md`

**Next Steps**:
1. Review kernel API contracts (`.claude/tasks/kernel/API.md`)
2. Assign tracks to developers
3. Track leads coordinate integration points early
4. Schedule Ring 1 integration session for end of Week 4
5. Target: Complete Ring 1 by end of Week 4
</expected_output>

<reasoning>
User explicitly requested Phase 2. This phase has critical dependencies on kernel (Phase 1) which are validated. The output emphasizes the integration session needed at the end since Storage and Agent must work together.
</reasoning>
</example>

<example index="4">
<scenario>Attempting to start Phase 3 but dependencies not met</scenario>

<input>
User invokes: `/tasks/start-phase 3`

PROGRESS.md shows:
- Phase 0: Complete ✅
- Phase 1: Complete ✅
- Phase 2: In Progress 🚧 (60% complete)
- Phase 3: Not Started
</input>

<expected_output>
❌ Cannot Start Phase 3: Ring 2

**Reason**: Phase 2 (Ring 1) is not complete

**Current Status**:
- Phase 2 (Ring 1): 🚧 In Progress (60% complete)
  - Storage System: ✅ Complete
  - Agent Execution: 🚧 In Progress (4/6 tasks done)
  - Git Integration: ✅ Complete

**Dependencies Required for Phase 3**:
- ✅ Kernel (Phase 1) - Complete
- ❌ Storage System (Ring 1) - Complete ✅
- ❌ Agent Execution (Ring 1) - In Progress 🚧 (BLOCKER)
- ❌ Ring 1 Integration Complete - Not Done (BLOCKER)

**What needs to finish first**:
1. Complete Agent Execution remaining tasks:
   - [ ] src/agent/hooks/processor.ts
   - [ ] tests/integration/agent/
2. Run Ring 1 integration session
3. Update PROGRESS.md to mark Phase 2 complete

**Recommendation**:
Run `/tasks/check-progress` to see detailed status of Phase 2 tasks, then complete those before starting Phase 3.

**Estimated Time to Unblock**: 1-2 days (based on 2 tasks remaining)
</expected_output>

<reasoning>
This shows the validation logic. When dependencies aren't met, the command should clearly explain what's blocking and what needs to happen first. It provides actionable next steps rather than just failing.
</reasoning>
</example>

<example index="5">
<scenario>Starting Phase 5 (Ring 4) - Final phase with all dependencies met</scenario>

<input>
User invokes: `/tasks/start-phase`

PROGRESS.md shows:
- Phases 0-4: All Complete ✅
- Phase 5: Not Started
- Overall completion: 85% (68/80 tasks)
</input>

<expected_output>
🚀 Starting Phase 5: Ring 4 - Advanced Features & Polish

**Phase Goals**:
- Implement matrix testing (defineTestSuite)
- Build configuration system (defineVibeConfig)
- Complete user documentation (Guide, API Reference, Tutorials)
- Final polish and performance optimization
- Prepare for npm publish

**Tasks for this phase** (3 parallel tracks):

**Track 4A: Matrix Testing** (1 dev)
- [ ] src/matrix/defineTestSuite.ts (Cartesian product generator)
- [ ] src/matrix/product.ts
- [ ] src/matrix/filter.ts
- [ ] tests/integration/matrix/

**Track 4B: Configuration System** (1 dev)
- [ ] src/config/defineVibeConfig.ts
- [ ] src/config/validation.ts (Zod schemas)
- [ ] src/config/defaults.ts
- [ ] tests/unit/config/

**Track 4C: Documentation & Examples** (2 devs)
- [ ] User guide (Getting Started, Tutorials, How-To)
- [ ] API Reference (complete API docs)
- [ ] 5+ example projects
- [ ] Cookbook recipes

**Final Polish**:
- [ ] E2E testing across all components
- [ ] Performance testing (suite timings)
- [ ] Coverage verification (≥95% kernel, ≥90% supporting)
- [ ] README.md, CONTRIBUTING.md, LICENSE
- [ ] Prepare for bun publish

**Dependencies**:
✅ All Rings 1-3 complete
✅ vibeTest API stable (Ring 2)
✅ Judge system ready (Ring 3)
✅ Reporters working (Ring 3)

**Parallel Work Opportunities**:
- All 3 tracks can run simultaneously
- Documentation can reference completed features
- Matrix and Config tracks are independent
- Recommended: 4 developers total (1+1+2 split)

**Session log created**: `.claude/tasks/SESSION_LOG/2025-10-07-phase-5-start.md`

**Next Steps**:
1. Assign tracks to developers
2. Documentation team reviews all implemented features
3. Matrix/Config teams review vibeTest API contracts
4. Schedule final integration testing session
5. Target: Complete Ring 4 by end of Week 8
6. **Milestone**: Project ready for v1.0 release! 🎉
</expected_output>

<reasoning>
Final phase example showing the project is nearly complete. The tone is slightly celebratory (milestone emoji) since this is the last phase. All dependencies are met, and the output includes the critical "Final Polish" section that's unique to Phase 5.
</reasoning>
</example>
</examples>

## Success Criteria

- [ ] Correct phase identified (from argument or PROGRESS.md)
- [ ] Dependencies validated (earlier phases complete)
- [ ] Phase documentation read and goals extracted
- [ ] Tasks organized by parallel tracks
- [ ] Session log created at correct path with template structure
- [ ] Next steps provided with actionable items
- [ ] If dependencies not met: Clear explanation of blockers
- [ ] Team size recommendations included
- [ ] Integration requirements highlighted (if applicable)
