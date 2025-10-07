# Vibe-Check Implementation Strategy

**Created**: 2025-10-07
**Project**: @dao/vibe-check - Testing & Automation Framework for Claude Code Agents
**Estimated Duration**: 8 weeks
**Recommended Approach**: Hybrid (Core-First Radial + Risk-Driven Spike-First)

---

## Executive Summary

This document outlines the implementation strategy for Vibe-Check, a dual-purpose testing framework:
- **Automation Suite**: Multi-stage agent pipelines and workflow orchestration
- **Evaluation Framework**: Model/config/prompt benchmarking with LLM judges

**System Complexity**:
- 9 distinct domains (Core Testing, Agent Execution, Storage, Judge, Reporters, Hook Capture, File Tracking, Configuration, Matrix Testing)
- 53 resolved specifications
- ~3,376 lines of technical specification
- Comprehensive testing requirements (unit, integration, E2E)

**Strategy Selection**: After analyzing 5 different implementation strategies, we recommend a **Hybrid approach** combining:
- **Risk-Driven Spike-First**: De-risk critical unknowns early (Week 1-3)
- **Core-First Radial**: Build stable kernel, then expand in concentric rings (Week 4-8)

---

## Quick Links

- [Detailed Strategy Breakdown](#detailed-strategy-breakdown)
- [Week-by-Week Plan](#week-by-week-plan)
- [Context Management](#context-management)
- [Session Structure](#session-structure)
- [RADIAL_MAP.md](./RADIAL_MAP.md) - Visual architecture
- [RISK_ASSESSMENT.md](./RISK_ASSESSMENT.md) - Risk analysis

---

## Why This Hybrid Approach?

### ✅ Advantages

1. **De-risks Critical Unknowns** (Week 1-3)
   - Hook capture system (Risk Score: 9/10)
   - SDK integration & recorder/replay (Risk Score: 8/10)
   - Tool call correlation algorithm (Risk Score: 7/10)

2. **Establishes Stable Foundation** (Week 2)
   - Shared kernel (types, schemas, core utilities)
   - Informed by spike learnings
   - Immutable API after Week 2

3. **Enables High Parallelization** (Week 3-8)
   - Ring 1: 5 developers working simultaneously
   - Ring 2: 6 developers (highest parallelization)
   - Ring 3: 5 developers
   - Ring 4: 4 developers

4. **Balances Speed & Quality**
   - Spikes add confidence (fail fast on unknowns)
   - Radial expansion enables concurrency
   - TDD throughout ensures quality

### 📊 Comparison with Other Strategies

| Strategy | Team Size | Parallelization | Speed to MVP | Risk Management | Best For |
|----------|-----------|----------------|--------------|-----------------|----------|
| **Hybrid (Recommended)** | 4-6 devs | High | Medium | Very Low | Vibe-Check complexity |
| Bottom-Up Dependency | 5+ devs | Medium | Slow | Low | Stable specs, large teams |
| Domain-Driven Vertical | 2-4 devs | Low | Medium | Medium | Clear domain boundaries |
| Feature-Slice Horizontal | 1-3 devs | Low | Fast | High | Rapid iteration, MVPs |
| Core-First Radial | 5-8 devs | High | Medium | Low | Complex architectures |
| Risk-Driven Spike-First | 4-6 devs | High | Medium | Very Low | High uncertainty |

---

## Detailed Strategy Breakdown

### Phase 0: Risk Assessment & Spikes (Week 1-3)

#### Week 1: Risk Assessment + Top 3 Spikes

**Objective**: Identify and de-risk the highest-risk components

**Top Risks Identified**:

| Component | Complexity | Uncertainty | Impact | Risk Score | Priority |
|-----------|------------|-------------|--------|------------|----------|
| Hook Capture System | High | High | Critical | 9 | 1 |
| SDK Integration | Medium | High | Critical | 8 | 2 |
| Tool Call Correlation | High | Medium | High | 7 | 3 |
| Content-Addressed Storage | Medium | Medium | High | 6 | 4 |
| LLM Judge Parsing | Medium | High | Medium | 6 | 5 |
| Reactive Watchers | High | Medium | Medium | 6 | 6 |

**Spikes to Execute** (Time-boxed: 4-8 hours each):

**Spike 1: Hook Capture System** (Risk Score: 9)
- **Question**: Can we reliably capture hooks to temp files without blocking agent execution?
- **Approach**: Build minimal hook listener, test with real Claude SDK
- **Success Criteria**:
  - All hook events captured
  - No dropped hooks under load
  - <5% performance overhead
- **Deliverables**:
  - `spikes/01-hook-capture/prototype.ts`
  - `spikes/01-hook-capture/LEARNINGS.md`
  - `spikes/01-hook-capture/PERFORMANCE.md`

**Spike 2: SDK Integration** (Risk Score: 8)
- **Question**: Can we build recorder/replayer for deterministic testing?
- **Approach**: Build SDK bridge, prototype recorder/replayer
- **Success Criteria**:
  - Recorder captures all SDK calls
  - Replayer replays deterministically
  - Handles timing/randomness
- **Deliverables**:
  - `spikes/02-sdk-integration/bridge.ts`
  - `spikes/02-sdk-integration/recorder.ts`
  - `spikes/02-sdk-integration/LEARNINGS.md`

**Spike 3: Tool Call Correlation** (Risk Score: 7)
- **Question**: Can we reliably correlate PreToolUse + PostToolUse events?
- **Approach**: Build correlation algorithm, test with edge cases
- **Success Criteria**:
  - 100% correlation accuracy
  - Handles missing PostToolUse
  - Handles concurrent tool calls
- **Deliverables**:
  - `spikes/03-correlation/algorithm.ts`
  - `spikes/03-correlation/test-cases.json`
  - `spikes/03-correlation/LEARNINGS.md`

**Parallelization**: 3 parallel spikes (1 dev/pair per spike)

---

### Phase 1: Shared Kernel (Week 2)

**Objective**: Build stable foundation using spike learnings

**Deliverables**:

1. **Type System** (`src/types/`)
   - `core.ts` - 11 core interfaces (VibeTestContext, RunResult, AgentExecution, ToolCall, FileChange, TimelineEvent, etc.)
   - `agent.ts` - Agent types (AgentConfig, RunAgentOptions)
   - `judge.ts` - Judge types (Rubric, JudgmentResult)
   - `workflow.ts` - Workflow types (WorkflowContext, StageResult)

2. **Schema System** (`src/schemas/`)
   - `runBundle.ts` - RunBundle validation (Zod)
   - `summary.ts` - summary.json schema
   - `hooks.ts` - Hook NDJSON schema
   - `rubric.ts` - Rubric validation

3. **Core Utilities** (`src/utils/`)
   - `correlation.ts` - Tool call correlation (from Spike 3)
   - `hash.ts` - SHA-256 content addressing
   - `ndjson.ts` - NDJSON serialization/deserialization
   - `git.ts` - Git helpers

4. **SDK Bridge** (`src/sdk/`)
   - `bridge.ts` - Claude SDK integration (from Spike 2)
   - `types.ts` - SDK type wrappers

**Tests to Write First**:
```typescript
// tests/unit/types/core.test.ts
describe('Core Types', () => {
  it('exports all expected interfaces');
  it('types are compatible with expected usage');
});

// tests/unit/schemas/runBundle.test.ts
describe('RunBundle Schema', () => {
  it('validates valid summary.json');
  it('rejects invalid metrics');
  it('validates hook NDJSON format');
});

// tests/unit/utils/correlation.test.ts
describe('Tool Call Correlation', () => {
  it('correlates PreToolUse + PostToolUse correctly');
  it('handles missing PostToolUse gracefully');
  it('handles concurrent tool calls');
});
```

**Parallelization**: 3 parallel tracks
- Track 1: Types + Schemas (2 devs)
- Track 2: Core Utilities (2 devs)
- Track 3: SDK Bridge (1 dev)

**Duration**: 1 week

**Context Files**:
- `kernel/README.md` - Kernel API (immutable after this phase)
- `kernel/API.md` - Public API contracts
- `kernel/STABILITY.md` - Stability guarantees

---

### Phase 2: Ring 1 - Core Systems (Week 3-4)

**Objective**: Build storage, agent execution, and git integration

**Ring 1 Domains** (3 Parallel Tracks):

#### Track 1A: Storage System
**Deliverables**:
- `src/storage/RunBundleStore.ts` - Bundle creation/reading/cleanup
- `src/storage/contentStore.ts` - Content-addressed file storage
- `src/storage/lazyFile.ts` - Lazy text()/stream() accessors
- `src/storage/cleanup.ts` - 30-day retention policy
- `tests/unit/storage/` - Unit tests
- `tests/integration/storage/` - Integration tests

**Key Features**:
- Create bundles at `.vibe/bundles/<run-id>/`
- Content-addressed storage (SHA-256 deduplication)
- Lazy loading for large files (>10MB streams)
- NDJSON for events/hooks
- 30-day retention with `.vibe-keep` protection

**Tests to Write First**:
```typescript
describe('RunBundleStore', () => {
  it('creates bundle directory structure');
  it('writes summary.json with correct schema');
  it('stores hooks.ndjson in streaming fashion');
  it('content-addresses files with SHA-256');
  it('deduplicates identical content');
  it('cleans up old bundles per retention policy');
});
```

#### Track 1B: Agent Execution System
**Deliverables**:
- `src/agent/AgentRunner.ts` - Agent execution orchestrator
- `src/agent/ContextManager.ts` - Hook capture → process → inject flow
- `src/agent/hooks/capture.ts` - Hook writing to temp files (from Spike 1)
- `src/agent/hooks/processor.ts` - Hook correlation and extraction
- `src/agent/AgentExecution.ts` - Thenable execution handle
- `tests/unit/agent/` - Unit tests (mocked SDK)
- `tests/integration/agent/` - Integration tests with recorder

**Key Features**:
- Execute agents via Claude SDK
- Capture hooks to temp files non-blocking
- Correlate PreToolUse + PostToolUse
- Build RunResult from execution context
- Graceful degradation on hook failures

**Tests to Write First**:
```typescript
describe('AgentRunner', () => {
  it('executes agent with Claude SDK');
  it('captures hooks during execution');
  it('correlates hooks into ToolCall objects');
  it('populates RunResult with complete context');
  it('handles hook capture failures gracefully');
});
```

#### Track 1C: Git Integration System
**Deliverables**:
- `src/git/captureGitState.ts` - Before/after git state
- `src/git/generateDiff.ts` - Unified diff generation
- `src/git/detectChanges.ts` - File change detection
- `tests/unit/git/` - Unit tests

**Key Features**:
- Detect git repositories
- Capture commit hash + dirty state
- Generate git diffs (name-status format)
- Store file content before/after changes

**Tests to Write First**:
```typescript
describe('Git Integration', () => {
  it('detects git repository');
  it('captures git state (commit hash, dirty files)');
  it('generates unified diff patches');
  it('detects file changes (add/modify/delete/rename)');
});
```

**Parallelization**: 3 teams (5 devs total)
- Team A (2 devs): Storage
- Team B (2 devs): Agent Execution
- Team C (1 dev): Git Integration

**Cross-Team Sync**:
- Daily 15-min standup
- Shared Slack channel for questions
- Integration session at end of Week 4

**Duration**: 2 weeks

**Context Files**:
- `ring1/OVERVIEW.md` - Track status
- `ring1/INTEGRATION.md` - How systems integrate
- `ring1/CONTRACTS.md` - APIs between systems

---

### Phase 3: Ring 2 - Test Infrastructure (Week 5-6)

**Objective**: Build vibeTest, vibeWorkflow, matchers, and reactive watchers

**Ring 2 Domains** (4 Parallel Tracks):

#### Track 2A: vibeTest Infrastructure
**Deliverables**:
- `src/testing/vibeTest.ts` - Main test function with fixtures
- `src/testing/context.ts` - VibeTestContext implementation
- `src/testing/stateAccumulator.ts` - Cumulative state tracking
- `tests/integration/testing/` - vibeTest integration tests

**Key Features**:
- Vitest fixture integration (test.extend)
- Inject runAgent and judge methods
- Context-bound expect
- Cumulative state across multiple runs
- annotate() for reporter streaming

#### Track 2B: vibeWorkflow Infrastructure
**Deliverables**:
- `src/testing/vibeWorkflow.ts` - Workflow orchestration
- `src/testing/workflowContext.ts` - WorkflowContext implementation
- `src/testing/stageManager.ts` - Stage lifecycle management
- `src/testing/until.ts` - Iterative loop helper

**Key Features**:
- stage() method with stage-scoped context
- until() for iterative loops
- Cross-stage state management
- Workflow serialization (no concurrent stages)

#### Track 2C: Custom Matchers
**Deliverables**:
- `src/testing/matchers/toHaveChangedFiles.ts`
- `src/testing/matchers/toHaveUsedTool.ts`
- `src/testing/matchers/toHaveCostLessThan.ts`
- `src/testing/matchers/toHaveSucceeded.ts`
- 8+ total matchers

**Key Features**:
- expect.extend integration
- Rich error messages
- Type-safe matcher signatures

#### Track 2D: AgentExecution Enhancements
**Deliverables**:
- `src/agent/AgentExecution.ts` - Enhanced with watchers
- `src/agent/watchers.ts` - Watcher execution logic
- `tests/unit/agent/watchers.test.ts`

**Key Features**:
- Thenable implementation (then/catch/finally)
- watch() method for reactive watchers
- Sequential watcher execution
- Early abort on watcher failures

**Tests to Write First**:
```typescript
describe('vibeTest', () => {
  it('injects runAgent fixture');
  it('provides context-bound expect');
  it('accumulates state across runs');
  it('custom matchers work correctly');
});

describe('vibeWorkflow', () => {
  it('registers stages with unique IDs');
  it('stage() creates stage-scoped context');
  it('until() iterates until predicate satisfied');
  it('cross-stage state accessible');
});

describe('AgentExecution watchers', () => {
  it('executes watchers sequentially');
  it('aborts on watcher assertion failure');
  it('is thenable (works with await)');
});
```

**Parallelization**: 4 teams (6 devs total)
- Team A (2 devs): vibeTest
- Team B (2 devs): vibeWorkflow
- Team C (1 dev): Matchers
- Team D (1 dev): Watchers

**Duration**: 2 weeks

**Context Files**:
- `ring2/OVERVIEW.md`
- `ring2/USER_GUIDE.md` - Early user documentation
- `ring2/EXAMPLES.md` - Code examples

---

### Phase 4: Ring 3 - Evaluation & Reporting (Week 7)

**Objective**: Build judge system and reporters

**Ring 3 Domains** (3 Parallel Tracks):

#### Track 3A: Judge System
**Deliverables**:
- `src/judge/judge.ts` - LLM judge executor
- `src/judge/rubric.ts` - Rubric validation
- `src/judge/prompts.ts` - Prompt formatter
- `src/judge/parser.ts` - Result parser
- `tests/integration/judge/` - Judge E2E tests

**Key Features**:
- Format rubrics into judge prompts
- Execute LLM evaluations
- Parse structured judgments
- Custom result formats (Zod generics)
- Track judgment costs separately

#### Track 3B: Terminal Reporter
**Deliverables**:
- `src/reporters/TerminalCostReporter.ts`
- `tests/integration/reporters/terminal.test.ts`

**Key Features**:
- Cost aggregation from task.meta
- Terminal formatting with colors
- Budget warnings

#### Track 3C: HTML Reporter
**Deliverables**:
- `src/reporters/HtmlReporter.ts`
- `src/reporters/templates/` - HTML templates
- `src/reporters/assets/` - CSS/JS assets
- `tests/integration/reporters/html.test.ts`

**Key Features**:
- Rich HTML reports with transcripts
- File diff viewers (git-based)
- Timeline visualization
- Tool call details
- Cost/token breakdowns

**Tests to Write First**:
```typescript
describe('Judge System', () => {
  it('validates rubric schema');
  it('formats rubric into LLM prompt');
  it('calls LLM and parses response');
  it('supports custom result formats');
  it('handles parsing failures gracefully');
});

describe('Reporters', () => {
  it('terminal reporter aggregates costs');
  it('HTML reporter generates report with timeline');
  it('HTML report includes file diffs');
});
```

**Parallelization**: 3 teams (5 devs total)
- Team A (2 devs): Judge
- Team B (1 dev): Terminal Reporter
- Team C (2 devs): HTML Reporter

**Duration**: 1 week

**Context Files**:
- `ring3/OVERVIEW.md`
- `ring3/RUBRICS.md` - Example rubrics
- `ring3/REPORTER_SAMPLES.md` - Sample outputs

---

### Phase 5: Ring 4 - Advanced Features & Polish (Week 8)

**Objective**: Matrix testing, configuration, documentation

**Ring 4 Domains** (3 Parallel Tracks):

#### Track 4A: Matrix Testing
**Deliverables**:
- `src/matrix/defineTestSuite.ts`
- `src/matrix/product.ts` - Cartesian product generator
- `tests/integration/matrix/` - Matrix tests

#### Track 4B: Configuration System
**Deliverables**:
- `src/config/defineVibeConfig.ts`
- `src/config/validation.ts` - Config schema
- `tests/unit/config/` - Config tests

#### Track 4C: Documentation & Examples
**Deliverables**:
- User guide
- API reference
- Tutorial examples
- Cookbook recipes

**Parallelization**: 3 teams (4 devs total)
- Team A (1 dev): Matrix testing
- Team B (1 dev): Configuration
- Team C (2 devs): Documentation

**Duration**: 1 week

---

## Week-by-Week Plan

| Week | Phase | Focus | Parallelization | Key Deliverables |
|------|-------|-------|-----------------|------------------|
| **1** | Phase 0 | Risk assessment + spikes | 3 parallel spikes | Spike learnings, de-risked components |
| **2** | Phase 1 | Shared kernel | 3 parallel tracks | Types, schemas, utils, SDK bridge |
| **3-4** | Phase 2 | Ring 1: Core systems | 3 teams (5 devs) | Storage, Agent Execution, Git |
| **5-6** | Phase 3 | Ring 2: Test infra | 4 teams (6 devs) | vibeTest, vibeWorkflow, Matchers, Watchers |
| **7** | Phase 4 | Ring 3: Eval & reporting | 3 teams (5 devs) | Judge, Terminal Reporter, HTML Reporter |
| **8** | Phase 5 | Ring 4: Polish | 3 teams (4 devs) | Matrix testing, Config, Docs |

---

## Context Management

### Files to Create (Day 1)

```
.claude/tasks/
├── IMPLEMENTATION_STRATEGY.md (this file)
├── PROGRESS.md (master checklist)
├── RISK_ASSESSMENT.md (risk matrix)
├── TEST_MATRIX.md (coverage tracker)
├── RADIAL_MAP.md (visual architecture)
├── SESSION_TEMPLATE.md (session structure guide)
├── SESSION_LOG/ (daily notes)
├── spikes/
│   ├── OVERVIEW.md
│   ├── LEARNINGS_SUMMARY.md
│   ├── 01-hook-capture/
│   ├── 02-sdk-integration/
│   └── 03-correlation/
├── kernel/
│   └── README.md
├── ring1/
│   └── OVERVIEW.md
├── ring2/
│   └── OVERVIEW.md
├── ring3/
│   └── OVERVIEW.md
└── ring4/
    └── OVERVIEW.md
```

### Context File Purposes

**PROGRESS.md**: Master checklist of all tasks across all phases
**RISK_ASSESSMENT.md**: Risk matrix with scores, spike plans
**TEST_MATRIX.md**: Coverage tracker (unit/integration/E2E × module)
**RADIAL_MAP.md**: Visual diagram of kernel → rings → spokes
**SESSION_LOG/{date}.md**: Daily session notes (what worked, blockers, next steps)

---

## Session Structure

### Session Template

Each session should follow this pattern:

#### 1. Start of Session (5 min)
- Read `PROGRESS.md` - What's done, what's next
- Read current phase/ring `OVERVIEW.md` - Current status
- Check dependencies in `RADIAL_MAP.md` or `ring{N}/CONTRACTS.md`

#### 2. Write Failing Tests (30 min)
- TDD red phase
- Write tests for the component you're about to build
- Ensure tests are comprehensive (unit + integration)

#### 3. Implement (2-3 hours)
- TDD green phase: Make tests pass
- TDD refactor phase: Clean up code
- Iterate: red → green → refactor

#### 4. Document (30 min)
- Update relevant context files:
  - `ring{N}/OVERVIEW.md` - Mark component as complete
  - `TEST_MATRIX.md` - Update coverage
  - Component-specific docs (API contracts, examples)

#### 5. Commit (5 min)
- Update `PROGRESS.md` - Check off completed tasks
- Add `SESSION_LOG/{date}-{component}.md` entry
- Git commit with descriptive message

### Session Types

**Spike Session** (Week 1)
- Duration: 4-8 hours (time-boxed!)
- Focus: Prove feasibility, identify unknowns
- Output: Prototype + LEARNINGS.md (not production code)

**Kernel Session** (Week 2)
- Duration: 4 hours
- Focus: One kernel component (types OR schemas OR utils)
- Participants: 2-3 devs (pair programming recommended)
- Output: Stable, well-tested kernel component

**Ring Session** (Week 3-8)
- Duration: 4-6 hours
- Focus: One spoke/domain within a ring
- Participants: 1-2 devs per spoke
- Output: Complete spoke + integration tests

**Integration Session** (End of each ring)
- Duration: 2-3 hours
- Focus: Cross-spoke integration within ring
- Participants: All devs working on ring
- Output: Integration tests passing, documented contracts

---

## Success Metrics

### Code Quality
- ✅ Core modules: ≥95% test coverage
- ✅ Supporting modules: ≥90% test coverage
- ✅ Utility modules: ≥85% test coverage

### Performance
- ✅ Unit test suite: ≤45s
- ✅ Integration suite: ≤90s
- ✅ E2E recorder suite: ≤5min
- ✅ Hook capture overhead: <5%

### Architecture
- ✅ No circular dependencies
- ✅ Clear domain boundaries
- ✅ Immutable kernel API (after Week 2)
- ✅ Graceful degradation (hook failures don't break tests)

### Documentation
- ✅ Complete user guide
- ✅ API reference for all public APIs
- ✅ Tutorial examples
- ✅ Cookbook recipes (common patterns)

---

## Next Steps

1. **Review this strategy** with your team
2. **Create context files** (templates provided in separate files)
3. **Set up directory structure** (see Context Management section)
4. **Week 1**: Start with risk assessment workshop
5. **Week 1**: Execute top 3 spikes in parallel
6. **Follow the plan** week by week

---

## Architecture Reference

For visual architecture and dependency mapping, see:
- **[RADIAL_MAP.md](./RADIAL_MAP.md)** - Kernel → Rings dependency visualization
- **[RISK_ASSESSMENT.md](./RISK_ASSESSMENT.md)** - Complete risk analysis with spike plans

---

**Last Updated**: 2025-10-07
**Status**: Ready to begin Phase 0 (Risk Assessment + Spikes)
