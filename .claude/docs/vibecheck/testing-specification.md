# Vibe-Check Testing Specification v1.0

**Status**: Draft
**Last Updated**: 2025-10-07
**Related**: technical-specification.md v1.4

---

## Table of Contents
- [1. Introduction & Purpose](#1-introduction--purpose)
- [2. Testing Philosophy & Principles](#2-testing-philosophy--principles)
  - [2.1 TDD for LLM-Generated Code](#21-tdd-for-llm-generated-code)
  - [2.2 Fixture Architecture](#22-fixture-architecture)
  - [2.3 Test Organization Principles](#23-test-organization-principles)
  - [2.4 What to Test vs What Not to Test](#24-what-to-test-vs-what-not-to-test)
  - [2.5 Data Management Strategy](#25-data-management-strategy)
  - [2.6 Quality Gates](#26-quality-gates)
- [3. Claude Code SDK Mocking Strategy](#3-claude-code-sdk-mocking-strategy)
  - [3.1 Decision Overview](#31-decision-overview)
  - [3.2 Recording Infrastructure](#32-recording-infrastructure)
  - [3.3 Capture Specification](#33-capture-specification)
  - [3.4 Storage Format](#34-storage-format)
  - [3.5 Replay Mechanism](#35-replay-mechanism)
  - [3.6 Scenario Library](#36-scenario-library)
  - [3.7 Maintenance Workflow](#37-maintenance-workflow)
- [4. Test Inventory](#4-test-inventory)
  - [4.1 Core Test Infrastructure](#41-core-test-infrastructure)
  - [4.2 Agent Runner & Context Manager](#42-agent-runner--context-manager)
  - [4.3 Storage System](#43-storage-system)
  - [4.4 Judge System](#44-judge-system)
  - [4.5 Reporters](#45-reporters)
  - [4.6 Matrix Testing](#46-matrix-testing)
  - [4.7 Configuration](#47-configuration)
  - [4.8 File Change Tracking](#48-file-change-tracking)
  - [4.9 Tool Call Processing](#49-tool-call-processing)
  - [4.10 Workflow System](#410-workflow-system)
  - [4.11 Error Handling](#411-error-handling)
  - [4.12 Performance & Cost Tracking](#412-performance--cost-tracking)
- [5. Architecture Decisions](#5-architecture-decisions)
- [6. Implementation Roadmap](#6-implementation-roadmap)
- [7. Maintenance & Evolution](#7-maintenance--evolution)
- [Appendix A: Fixture Reference](#appendix-a-fixture-reference)
- [Appendix B: Test Naming Conventions](#appendix-b-test-naming-conventions)
- [Appendix C: Coverage Requirements Matrix](#appendix-c-coverage-requirements-matrix)

---

## 1. Introduction & Purpose

This document defines the executable testing contract for @dao/vibe-check. It translates the implementation guidance from `technical-specification.md` v1.4 into a comprehensive testing strategy that guarantees correctness when all prescribed tests pass. The specification is designed for test-driven development with LLM-generated implementations. Human reviewers focus on validating this testing spec; implementations must conform to it. The document covers unit, integration, and end-to-end tests, fixture architecture, data management, and quality gates required to assert the system is production ready.

## 2. Testing Philosophy & Principles

### 2.1 TDD for LLM-Generated Code

- All implementation work must begin with tests defined here. LLMs generate code only after corresponding tests exist.
- Tests encode behavioral contracts from the technical specification. Passing tests constitute proof of correctness.
- Human reviews prioritize verifying test completeness, fixture fidelity, and coverage thresholds rather than line-by-line implementation audits.
- Regression prevention: When bugs are discovered, augment this specification with additional tests before fixing code.
- Maintain deterministic tests; avoid reliance on flaky async timing or real external services. Determinism ensures reproducibility across LLM-generated runs.

### 2.2 Fixture Architecture

- Use constructor-based fixtures exclusively. Each fixture is a class or function instantiated in `beforeEach`/`beforeAll` or through Vitest `test.extend` patterns.
- Dependency Injection (DI) is mandatory: fixtures receive dependencies through constructor parameters, never via implicit imports or global state.
- Compose fixtures to represent layered concerns (e.g., `SdkRecorderFixture` → `ContextManagerFixture` → `RunResultFixture`).
- Fixtures must be reusable across modules; avoid inline fixture setup inside tests.
- Provide explicit teardown hooks for temporary directories, HTTP servers, or SDK recorders.
- Example DI pattern:
  ```ts
  class RunResultFixture {
    constructor(private readonly recorder: RecorderFixture, private readonly bundleFS: BundleFSFixture) {}
    async createSuccessfulRun(opts: Partial<RunAgentOptions> = {}) { /* ... */ }
  }
  ```

### 2.3 Test Organization Principles

- Tests live under `tests/` mirroring `src/` structure. Example: `src/runner/agentRunner.ts` → `tests/runner/agentRunner.test.ts` (unit) and `tests/integration/agentRunner.integration.test.ts` (integration).
- Group tests by domain first, behavior second. Each `describe` block reflects a capability or contract from the technical specification.
- Ensure independence: no shared mutable state across tests. Use fresh fixtures per test unless explicitly performing integration/E2E where stateful sequences are required.
- Shared utilities reside in `tests/utils/` with clear naming (`createRunBundle`, `loadFixtureScenario`, etc.).
- Keep test names declarative and outcome-based: `should capture tool calls in execution order`, not `capturesToolCalls`.

### 2.4 What to Test vs What Not to Test

- **Test public APIs and exported helpers**. Internal helpers are tested indirectly unless explicitly noted in the technical spec (e.g., `_TestContextManager`).
- **Unit Tests** cover pure logic, schema validation, transformations, and state machines.
- **Integration Tests** cover interactions between modules (e.g., `AgentRunner` + `ContextManager` + storage).
- **End-to-End Tests** cover user journeys using `vibeTest`/`vibeWorkflow` entry points.
- Do not test third-party libraries (Vitest, Zod, SDK) beyond verifying our integration with them.
- Avoid over-testing: prefer representative scenarios rather than exhaustively enumerating permutations where logic is declarative (e.g., rely on matrix tests instead of enumerating all combos manually).

### 2.5 Data Management Strategy

- All test data resides in `tests/__fixtures__/` separated by domain (`claude-code-sdk`, `run-bundles`, `reporters`, etc.).
- Recorder fixtures produce deterministic JSON artifacts committed to the repository.
- Snapshot testing is reserved for large HTML reports and CLI output. Snapshots must include semantic markers to reduce brittleness.
- Fixtures are versioned by scenario and SDK version. Backwards-incompatible SDK updates require regenerating affected fixtures.
- Demo repositories for recorder captures live under `tests/demo-workspaces/`. Each scenario has a README describing its intent.

### 2.6 Quality Gates

- **Code coverage**: minimum 90% statement coverage overall, 95% for critical modules (`AgentRunner`, `ContextManager`, storage, judge, workflow). Custom matchers require 100% branch coverage.
- **Mutation testing** (via Stryker or equivalent) must cover matcher logic and core orchestration paths.
- **Performance**: integration suites complete within 5 minutes on CI hardware; per-test budget 60s unless marked slow.
- **CI/CD**: `bun run test:unit`, `bun run test:integration`, and `bun run test:e2e` pipelines must pass. HTML reporter snapshot diff review is mandatory for changes.

## 3. Claude Code SDK Mocking Strategy

### 3.1 Decision Overview

- **Decision**: Adopt the Recorder/Wrapper pattern with deterministic playback for all SDK interactions. Traditional mocks are only permitted for unit tests that do not require SDK data (e.g., schema validation) and must not contradict recorder data.
- **Rationale**: Hook capture, tool correlation, and git/file tracking rely on authentic SDK payloads. Recorder ensures fidelity and keeps tests hermetic without incurring runtime API costs.
- **Trade-offs**: Initial investment in recorder tooling and fixture maintenance. Accepting fixture regeneration overhead when SDK changes. In return we gain deterministic, reviewable artifacts and high-confidence regression coverage.

### 3.2 Recording Infrastructure

- Implement `SdkRecorder` located at `tests/utils/sdkRecorder.ts` exposing:
  - `recordScenario(name: string, runner: (workspace: WorkspaceFixture) => Promise<void>)`
  - `replayScenario(name: string, overrides?: ReplayOverrides)` returning mocked SDK stream.
- Recorder wraps the Claude Code SDK query client via proxy class `RecordingSDK` that intercepts calls to `query()`.
- Recording triggered by running `bun run fixtures:record <scenario>` which executes orchestrated flows against demo repos.
- Recordings are versioned by SDK version and scenario slug. Metadata contains commit hash of demo repo to ensure reproducibility.

### 3.3 Capture Specification

- **Inputs captured**:
  - Agent configuration (model, temperature, max tokens, tool list, MCP server config).
  - Initial prompt and streaming message sequence numbers.
  - Workspace snapshot (git HEAD, untracked files, config overrides).
  - Environment variables relevant to SDK (e.g., `CLAUDE_API_KEY` masked).
  - Test metadata (scenario description, intended assertions).
- **Outputs captured**:
  - Full hook stream with ordering preserved (PreToolUse, PostToolUse, Notification, Stop, SubagentStop, Error).
  - Tool IO (structured inputs/outputs, durations, exit codes).
  - File mutations, including intermediate states if multiple writes occur.
  - Git operations (commits, branch changes, diffs) with before/after tree snapshots.
  - Cost telemetry (token counts by role, total USD, latency metrics).
  - Errors, warnings, and cancellation events.

### 3.4 Storage Format

```
tests/__fixtures__/claude-code-sdk/
  README.md
  recorder-manifest.json        # global manifest for quick lookup
  scenarios/
    simple-file-edit/
      input.json                # agent configuration + workspace baseline hash
      hooks/
        001-Notification.json
        002-PreToolUse.json
        003-PostToolUse.json
        ...
      timeline.json             # derived chronological view for quick assertions
      files/
        before/
          src/index.ts
        after/
          src/index.ts
        diffs/
          src/index.ts.diff
      tools.json                # aggregated tool call summary
      git.json                  # branch, commits, status before/after
      metrics.json              # tokens, costs, durations
      metadata.json             # SDK version, recording date, scenario tags
```

### 3.5 Replay Mechanism

- Provide `RecordingSDK` implementing the SDK interface. During tests it matches `input.json` payload against call parameters (deep equality with tolerances for timestamps).
- On match, it streams recorded events via async generator mimicking the SDK.
- If no exact match, throw `MissingScenarioError` with diff of expected vs received inputs.
- Partial overrides (e.g., change model) require explicit entry in `replayScenario` to adjust metadata before stream begins.
- Replay verifies checksum of fixture files to detect tampering.
- Hooks replayed with original timestamps but scaled relative to test start for determinism.

### 3.6 Scenario Library

Record the following baseline scenarios (expandable as needed):
1. **simple-file-edit** – Single file modification, one tool call.
2. **multi-file-refactor** – Multiple tools editing 5+ files with commit.
3. **git-commit-workflow** – Agent running `git status`, staging, committing.
4. **error-correction-loop** – Tool failure followed by retry success.
5. **multi-agent-workflow** – Primary agent delegating to sub-agent.
6. **tool-usage-spectrum** – Exercises read/write/list/delete tools.
7. **file-deletion** – Agent deletes files; ensures tombstone capture.
8. **large-batch-edit** – 100+ file edits to stress storage.
9. **cost-budget-adherence** – Scenario hitting cost thresholds.
10. **todo-completion** – Agent resolving TODO annotations.
11. **hook-failure** – Simulated missing hook to test graceful degradation.
12. **session-timeout** – Forced cancellation to exercise abort logic.

### 3.7 Maintenance Workflow

- Fixtures regenerated via `bun run fixtures:record --scenario <name>`.
- Manifest tracks SDK version; CI fails if version mismatch between fixtures and package.
- Add documentation per scenario describing coverage and impacted modules.
- Recordings reviewed like code: ensure sensitive data scrubbed, diffs validated.

## 4. Test Inventory

### 4.1 Core Test Infrastructure

#### Module: vibeTest

**Location**: `src/test/vibeTest.ts`
**Dependencies**: Vitest `test`, `VibeTestContext` fixture, `ContextManager`, `AgentRunner`
**Complexity**: High

##### Test Coverage Strategy
- **Unit Tests**: 8
  - Focus: fixture extension, context propagation, tagging helpers (`skip`, `only`), metadata injection.
  - Mocking: Use `RecordingSDK` replay for `runAgent` invocation; stub Vitest hooks via `vitest` API.
  - Fixtures: `ViteEnvironmentFixture`, `SdkRecorderFixture`, `ContextAccumulatorFixture`.
- **Integration Tests**: 4
  - Focus: `vibeTest` executing actual recorded scenarios end-to-end.
  - Real dependencies: Recorder-based SDK, real file system in temp workspace.
  - Fixtures: `DemoWorkspaceFixture`, `RunBundleFixture`.
- **E2E Tests**: 2
  - Focus: user journeys using `vibeTest` with watchers and custom matchers.
  - Scenario: multi-agent refactor, fail-fast watcher run.

##### Unit Tests

###### describe('vibeTest - fixture extension')
- **`it('injects VibeTestContext into callback')`**
  - **Validates**: `test.extend` wiring passes context with `runAgent`, `judge`, `files`, `tools`.
  - **Fixtures**: `VibeTestContextFixture` returning stubbed context.
  - **Setup**: simulate Vitest test registration, assert callback receives context keys.
  - **Edge cases**: ensures context properties lazily evaluated.
  - **Pass criteria**: expectation verifying all context keys exist and are functions or proxies as specified.

- **`it('propagates meta bundler path into test context')`**
  - Validates `task.meta.bundleDir` set.
  - Fixture: `RunBundleFixture`.

###### describe('vibeTest - tagging helpers')
- Tests verifying `vibeTest.skip/only/concurrent/sequential/todo/fails` call underlying Vitest equivalents.
- Edge cases: ensures metadata preserved.

###### describe('vibeTest - context accumulation')
- Test ensures multiple `runAgent` invocations accumulate state (files, tools) per spec.

###### describe('vibeTest - watcher integration')
- Verifies `runAgent` watchers registered via context propagate to `AgentExecution.watch`.

##### Integration Tests

###### describe('vibeTest - recorded scenarios')
- **`it('executes simple-file-edit scenario and exposes RunResult via expect')`**
  - Validates: run with recorded data returns RunResult accessible through context.
  - Components: `vibeTest`, `runAgent`, recorder, storage.

- Additional tests: multi-agent, failure propagation, stage watchers.

##### E2E Tests

###### describe('vibeTest - fail fast workflow')
- Scenario verifying watchers abort after threshold using recorded `cost-budget-adherence` data.

###### describe('vibeTest - automation pipeline mimic')
- Multi-run agent usage verifying cumulative state and custom matchers combined.

---

#### Module: vibeWorkflow

**Location**: `src/test/vibeWorkflow.ts`
**Dependencies**: `WorkflowContext`, `Stage` helpers, `ContextManager`, `AgentRunner`
**Complexity**: High

##### Test Coverage Strategy
- **Unit Tests**: 10
  - Focus: stage registration, cross-stage context, `until()` loop semantics, watcher propagation, abort logic.
  - Mocking: Recorder for agent runs; fake timer for iteration control.
- **Integration Tests**: 5
  - Focus: multi-stage workflows interacting with storage and reporters.
- **E2E Tests**: 2
  - Focus: automation pipeline executing recorded multi-agent scenario.

##### Unit Tests

###### describe('vibeWorkflow - stage orchestration')
- Tests stage creation order, ensures `wf.stage` names recorded, context transitions.

###### describe('vibeWorkflow - cross-stage state')
- Ensures files/tools from stage 1 accessible in stage 2 via context aggregator.

###### describe('vibeWorkflow - until helper')
- Validates loops terminate when predicate returns true, includes max iteration guard.

###### describe('vibeWorkflow - error propagation')
- Tests watchers raising errors cancel subsequent stages, ensures cleanup.

##### Integration Tests

- Multi-stage scenario verifying recorded `multi-agent-workflow` fixture.
- `until` loop with scenario `error-correction-loop` verifying partial results accessible between iterations.

##### E2E Tests

- Realistic pipeline replicating docs example: plan → implement → verify with judge.

---

#### Module: Test Context & Fixtures

**Location**: `src/test/fixtures.ts`, `_TestContextManager.ts`
**Dependencies**: `RunResult`, storage, SDK recorder
**Complexity**: Medium

##### Test Coverage Strategy
- **Unit Tests**: 6
  - Focus: fixture DI, context accumulation, resets between tests.
- **Integration Tests**: 3
  - Focus: interplay with `AgentRunner` and storage when building contexts.

##### Unit Tests
- Validate `_TestContextManager` merges file changes, tool usage, metrics.
- Ensure `beforeEach` resets state.
- Verify `files.filter` respects glob patterns.

##### Integration Tests
- Run recorded scenario to ensure context exposes aggregated timeline, metrics.

---

#### Module: Custom Matchers

Each matcher receives targeted tests verifying positive, negative, and error messaging scenarios using recorded data.

##### Matcher: toHaveChangedFiles
- **Unit Tests**: 4 verifying exact match, glob patterns, mismatch errors, diff output.
- **Integration**: 1 verifying with actual RunResult from `multi-file-refactor`.

##### Matcher: toHaveNoDeletedFiles
- Tests include scenario with deletion verifying failure message enumerates deleted files.

##### Matcher: toHaveUsedTool
- Tests cover min count, absent tool, verifying error string lists available tools.

##### Matcher: toUseOnlyTools
- Tests ensure allowlist enforcement and proper diff formatting.

##### Matcher: toCompleteAllTodos
- Use `todo-completion` scenario verifying detection of unresolved TODO.

##### Matcher: toHaveNoErrorsInLogs
- Use recorded scenario with `Notification` warnings.

##### Matcher: toStayUnderCost
- Unit test verifying cost threshold, integration verifying metrics from `cost-budget-adherence`.

##### Matcher: toPassRubric
- Unit tests stub judge invocation; integration ensures it triggers `judge()` with rubric and handles rejection.

##### Matcher: toHaveCompleteHookData
- Tests verifying both success and failure when hook capture intentionally omitted (using `hook-failure` scenario).

### 4.2 Agent Runner & Context Manager

#### Module: AgentRunner (runAgent & AgentExecution)

**Location**: `src/runner/agentRunner.ts`
**Dependencies**: Claude SDK (via recorder), `ContextManager`, storage, abort controller
**Complexity**: High

##### Test Coverage Strategy
- **Unit Tests**: 9
  - Focus: AgentExecution behavior, watcher registration, promise resolution, abort handling.
- **Integration Tests**: 6
  - Focus: streaming events from recorder through ContextManager.
- **E2E Tests**: Covered via `vibeTest`/`vibeWorkflow` suites.

##### Unit Tests
- `describe('AgentExecution - watch')` verifying watchers invoked on PostToolUse events.
- `describe('runAgent - abort handling')` ensuring aborted execution cancels stream and rejects with AbortError.
- `describe('runAgent - error propagation')` verifying SDK errors bubble up and cleanup runs once.

##### Integration Tests
- Use recorded scenarios to assert watchers triggered in correct order.
- Validate `runAgent` resolves to RunResult with correct bundle metadata.

#### Module: ContextManager

**Location**: `src/runner/contextManager.ts`
**Dependencies**: storage, hook writer, file diff engine, git detection
**Complexity**: High

##### Test Coverage Strategy
- **Unit Tests**: 12
  - Focus: partial result calculation, watcher execution, hook event processing, error tolerance.
- **Integration Tests**: 7
  - Focus: processing recorded streams, verifying RunResult sections (files, tools, metrics).

##### Unit Tests
- `describe('ContextManager - addWatcher/runWatchers')`: ensures sequential execution, error propagation halts loop.
- `describe('ContextManager - onHookPayload')`: verifies Pre/Post correlation, pending tool map cleanup.
- `describe('ContextManager - finalize')`: ensures completed tools persisted, pending tools flagged.
- `describe('ContextManager - getPartialResult')`: returns snapshot consistent with spec.
- Edge cases include missing PostToolUse, hook failure toggles `hookCaptureStatus.complete=false`.

##### Integration Tests
- Replay `large-batch-edit` to stress memory and ensure lazy loading.
- Replay `hook-failure` to verify graceful degradation sets warnings.

#### Module: Hook Capture System

**Location**: `src/runner/hookCapture.ts` (per spec Section 4.2.1)
**Dependencies**: temp file writer, JSON schema
**Complexity**: Medium

- **Unit Tests**: 6 verifying file writer chunking, concurrency safety, error handling.
- **Integration Tests**: 3 ensuring recorded hooks persist to disk correctly.

#### Module: Hook Processing & Correlation

- Tests verifying chronological processing, correlation by session/tool, fallback for missing events.

#### Module: RunResult Population

- Unit tests on builder ensuring metrics, timeline, attachments, hooks, files align with spec.
- Integration using `RunBundle` to confirm lazy getters fetch from storage.

### 4.3 Storage System

#### Module: RunBundle Disk Storage

**Location**: `src/storage/runBundle.ts`
**Dependencies**: filesystem, path utilities, hashing
**Complexity**: High

- **Unit Tests**: 8 verifying directory layout creation, metadata writes, concurrency.
- **Integration Tests**: 5 verifying bundling during recorded runs, failure recovery.

#### Module: Content-Addressed File Storage

**Location**: `src/storage/contentAddressedStore.ts`
**Complexity**: Medium

- Unit tests verifying hashing, deduplication, retrieval.
- Integration ensures identical content stored once across runs.

#### Module: Lazy Loading Mechanism

- Tests verifying `RunResult.files.text()` loads lazily, caches results, handles missing file gracefully.

#### Module: Cleanup Policies

- Tests simulate bundles older than threshold, disk space pressure, `.vibe-keep` markers.

### 4.4 Judge System

#### Module: Rubric Validation (Zod Schemas)

**Location**: `src/judge/rubric.ts`
**Complexity**: Medium

- Unit tests verifying schema accepts valid rubrics, rejects invalid structures, handles custom criteria.

#### Module: LLM Judge Execution

**Location**: `src/judge/judge.ts`

- Integration tests using recorder scenario `judge-success` (subset of simple-file-edit) verifying prompt formatting and response parsing.
- Error scenario with invalid JSON response ensures `JudgmentFailedError` thrown when `throwOnFail` true.

#### Module: JudgeResult Handling

- Tests verifying default result object shape, compatibility with custom schema, attachments.

### 4.5 Reporters

#### Module: Terminal Cost Reporter

**Location**: `src/reporters/cost.ts`
**Complexity**: Medium

- Unit tests verifying aggregation of metrics, color output, zero-cost handling.
- Integration tests using recorded run to assert CLI output matches snapshot.

#### Module: HTML Reporter

**Location**: `src/reporters/html.ts`
**Complexity**: High

- Unit tests for HTML generation utilities, path resolution, asset bundling.
- Integration tests produce HTML from run bundle; verify snapshot with semantic diffing (use `@testing-library/dom` to assert structure).

#### Module: Report Generation & Artifacts

- Integration tests verifying run attaches zipped bundle, ensures metadata includes scenario tags.

### 4.6 Matrix Testing

#### Module: defineTestSuite

**Location**: `src/matrix/defineTestSuite.ts`
**Complexity**: Medium

- Unit tests verifying cartesian product generation, filtering, label formatting, deduped combos.
- Integration tests ensure suites run `vibeTest` for each configuration, capturing results.

### 4.7 Configuration

#### Module: defineVibeConfig

**Location**: `src/config/index.ts`
**Complexity**: Low

- Unit tests verifying default merging, reporter injection, environment overrides.
- Integration tests ensure config integrates with Vitest CLI in fixture project.

### 4.8 File Change Tracking

#### Module: Git State Capture

**Location**: `src/capture/git.ts`
**Complexity**: Medium

- Unit tests stub git commands verifying parse logic.
- Integration tests using demo repo verifying branch detection, untracked files capture.

#### Module: File Diff Generation

- Tests verifying diff format, rename detection, binary file handling.

#### Module: Before/After Content Storage

- Tests ensuring content stored in bundle and accessible via `RunResult.files.text()`.

### 4.9 Tool Call Processing

#### Module: PreToolUse/PostToolUse Correlation

**Location**: `src/processors/toolCalls.ts`
**Complexity**: Medium

- Unit tests verifying correlation across sessions, handling missing PostToolUse, duplicates.
- Integration tests using `tool-usage-spectrum` verifying timeline ordering.

#### Module: ToolCall Record Creation

- Tests ensure fields (`name`, `input`, `output`, `durationMs`, `ok`) align with spec.

#### Module: Tool Timeline Construction

- Integration verifying timeline merges notifications and tool calls for HTML reporter.

### 4.10 Workflow System

#### Module: Stage Management

**Location**: `src/workflow/stage.ts`
**Complexity**: Medium

- Unit tests verifying stage metadata, sequential execution, error propagation.

#### Module: Cross-Stage Context

- Tests ensuring context aggregator exposes previous stage results and attachments.

#### Module: Loop/Iteration Helpers (`until`)

- Tests verifying predicate evaluation, max iteration enforcement, partial run snapshots.

### 4.11 Error Handling

#### Module: Graceful Degradation

**Location**: `src/errors/graceful.ts`
**Complexity**: Medium

- Unit tests verifying warnings emitted without failing tests when hooks missing.
- Integration tests using `hook-failure` scenario ensuring RunResult reflects `hookCaptureStatus.complete=false`.

#### Module: Hook Failure Scenarios

- Tests verifying fallback data population, logging format.

#### Module: Storage Failure Scenarios

- Simulate disk write failure ensures error surfaces with actionable message.

#### Module: SDK Timeout Handling

- Replay `session-timeout` verifying abort message, partial result, cleanup.

### 4.12 Performance & Cost Tracking

#### Module: Token Counting

**Location**: `src/metrics/tokenCounter.ts`
**Complexity**: Medium

- Unit tests verifying accumulation, resetting, streaming updates.

#### Module: Cost Calculation

- Tests verifying USD conversion using pricing table, custom overrides, rounding.

#### Module: Budget Enforcement

- Integration tests hooking into watchers verifying abort when budget exceeded.

## 5. Architecture Decisions

### Decision 1: Claude Code SDK Mocking Strategy
- **Decision**: Recorder/Wrapper with deterministic playback
- **Date**: 2025-10-07
- **Rationale**: Aligns with need for authentic hook data, ensures determinism, eliminates external dependencies in CI.
- **Trade-offs**: Fixture maintenance, storage footprint.
- **Alternatives considered**: Traditional mocks (rejected for low fidelity), hybrid approach (complexity without significant benefit).

### Decision 2: Fixture Architecture Pattern
- **Decision**: Constructor-based DI for all fixtures
- **Rationale**: Encourages reuse and composability, simplifies LLM implementation, matches technical spec emphasis on context accumulation.
- **Examples**:
  ```ts
  const test = vibeTest.extend<{ recorder: RecorderFixture }>({
    recorder: async ({}, use) => {
      const recorder = new RecorderFixture();
      await use(recorder);
      await recorder.cleanup();
    },
  });
  ```
- **Guidelines**: Expose fixtures through `tests/utils/fixtures/index.ts`, document dependencies in Appendix A.

### Decision 3: Test Organization Structure
- **Decision**: Mirror source directory, separate unit/integration/e2e roots.
- **Rationale**: Improves traceability, supports targeted CI pipelines.
- **Structure**:
  ```
  tests/
    unit/
      runner/
        agentRunner.test.ts
    integration/
      runner/
        agentRunner.integration.test.ts
    e2e/
      vibeTest.e2e.test.ts
    utils/
      fixtures/
      recorder/
  ```

### Decision 4: Snapshot Usage Policy
- **Decision**: Restrict snapshots to reporter outputs with semantic validation helpers.
- **Rationale**: Prevent brittle tests while still validating complex HTML/CLI outputs.

### Decision 5: Coverage Enforcement
- **Decision**: Enforce module-level coverage gates via Vitest configuration and CI scripts.
- **Rationale**: Ensures critical modules remain thoroughly tested despite future changes.

## 6. Implementation Roadmap

1. **Bootstrap Recorder Infrastructure**
   - Implement `SdkRecorder`, fixture CLI, baseline scenarios `simple-file-edit`, `error-correction-loop`.
2. **Core Fixture Layer**
   - Build context fixtures (`RunBundleFixture`, `DemoWorkspaceFixture`, `_TestContextManagerFixture`).
3. **Custom Matcher Tests**
   - Implement matcher tests early; they provide assertion tools for later suites.
4. **Agent Runner & Context Manager Tests**
   - Unit tests first, then integration using recorder data.
5. **Storage & Metrics Modules**
   - Validate file persistence, lazy loading, cost tracking.
6. **Reporters & Judge**
   - After RunResult reliable, implement reporter/judge tests with recorded runs.
7. **Workflow & E2E Suites**
   - Finalize automation flows once lower layers proven.

### Fixture Construction Guide

- Create fixture factories in `tests/utils/fixtures/` (e.g., `createRunResultFixture`, `createReporterHarness`).
- Compose factories: `createWorkflowFixture` depends on `RecorderFixture` and `ContextFixture`.
- Provide `withTempDir` helper to manage filesystem resources.

### Assertion Patterns

- Prefer custom matchers for RunResult validations.
- Use `expect(() => fn()).toThrowErrorMatchingInlineSnapshot()` for error scenarios.
- For asynchronous watchers, use `await expect(promise).rejects.toThrow(...)`.

### Test Data Management

- Fixtures stored under `tests/__fixtures__`. Add README describing structure.
- New scenarios require updating `recorder-manifest.json` and adding release notes in Appendix A.
- Maintain script `bun run fixtures:verify` to ensure manifest matches file system and checksums.

## 7. Maintenance & Evolution

- Update this specification when technical spec evolves or new regressions appear.
- Version sections using semantic numbering (v1.1, v1.2) tracked in repo history.
- Introduce new scenarios or fixtures through ADR-style proposals appended to Section 5.
- Review coverage reports quarterly; adjust thresholds when modules stabilize.
- Document deprecations and migrations within appendices.

---

## Appendix A: Fixture Reference

| Fixture | Purpose | Dependencies |
| --- | --- | --- |
| `RecorderFixture` | Provides recorder replay/record operations | `RecordingSDK`, filesystem |
| `RunBundleFixture` | Manages temp bundle directories for tests | `fs`, `os`, hashing |
| `DemoWorkspaceFixture` | Clones demo repo into temp dir | `git`, `fs` |
| `_TestContextManagerFixture` | Exposes internal context manager for unit tests | RecorderFixture |
| `ReporterHarness` | Captures reporter output for assertions | `Vitest`, `RunBundleFixture` |
| `JudgeFixture` | Wraps recorder data for judge tests | `RecordingSDK`, `RunResultFixture` |

## Appendix B: Test Naming Conventions

- Use `should` phrasing: `should capture hook payload order`.
- Prefix integration tests with scenario slug in test name: `should replay [simple-file-edit] run result`.
- Tag slow tests with `test.slow` when exceeding 30s.
- Use `describe` hierarchy: `<Module> - <Capability>`.

## Appendix C: Coverage Requirements Matrix

| Module | Coverage | Rationale |
| --- | --- | --- |
| AgentRunner | ≥95% statements/branches | Critical orchestrator of SDK events |
| ContextManager | ≥95% | Handles hook correlation and watchers |
| Storage subsystem | ≥95% | Prevent data loss, ensures lazy loading |
| Judge system | ≥90% | Ensures evaluation correctness |
| Workflow system | ≥90% | Guarantees automation flows |
| Reporters | ≥85% | Visual feedback, allow snapshot tolerance |
| Custom Matchers | 100% branches | Primary assertion surface |
| Remaining modules | ≥85% | Baseline for support code |

