# Vibe-Check Testing Specification v1.0

**Status**: Draft
**Last Updated**: 2025-10-07
**Related**: technical-specification.md v1.4

---

## Table of Contents
1. [Introduction & Purpose](#1-introduction--purpose)
2. [Testing Philosophy & Principles](#2-testing-philosophy--principles)
3. [Claude Code SDK Mocking Strategy](#3-claude-code-sdk-mocking-strategy)
4. [Test Inventory](#4-test-inventory)
   1. [Core Test Infrastructure](#41-core-test-infrastructure)
   2. [Agent Runner & Context Manager](#42-agent-runner--context-manager)
   3. [Storage System](#43-storage-system)
   4. [Judge System](#44-judge-system)
   5. [Reporters](#45-reporters)
   6. [Matrix Testing](#46-matrix-testing)
   7. [Configuration](#47-configuration)
   8. [File Change Tracking](#48-file-change-tracking)
   9. [Tool Call Processing](#49-tool-call-processing)
   10. [Workflow System](#410-workflow-system)
   11. [Error Handling](#411-error-handling)
   12. [Performance & Cost Tracking](#412-performance--cost-tracking)
5. [Architecture Decisions](#5-architecture-decisions)
6. [Implementation Roadmap](#6-implementation-roadmap)
7. [Maintenance & Evolution](#7-maintenance--evolution)
8. [Appendices](#appendices)
   - [Appendix A: Fixture Reference](#appendix-a-fixture-reference)
   - [Appendix B: Test Naming Conventions](#appendix-b-test-naming-conventions)
   - [Appendix C: Coverage Requirements Matrix](#appendix-c-coverage-requirements-matrix)

---

## 1. Introduction & Purpose
This document translates the implementation requirements in **Technical Specification v1.4** into a comprehensive testing contract. The specification defines the complete set of automated tests that must exist before implementation begins. Implementation work (much of which will be LLM-generated) is considered correct **only when all tests in this document pass**. Human reviewers evaluate this specification and the eventual tests; once the tests pass, the resulting codebase is trusted by definition.

The goals of this document are to:
- Encode every functional, integration, and quality requirement into executable test scaffolds.
- Provide deterministic, repeatable fixtures that emulate external dependencies (notably the Claude Code SDK).
- Establish conventions, fixtures, and helper utilities that enable Test-Driven Development (TDD) for LLM-generated code.
- Ensure breadth and depth of coverage across all modules outlined in the technical specification, including success paths, edge cases, and failure modes.

## 2. Testing Philosophy & Principles

### 2.1 TDD for LLM-Generated Code
- **Tests First**: All module implementations must be driven by tests defined here. Contributors (human or LLM) implement code strictly to satisfy failing tests.
- **Executable Specification**: Tests embody the acceptance criteria. Passing tests imply compliance with the technical spec. Code reviews focus on verifying that tests correctly encode requirements rather than line-by-line inspection of generated code.
- **Red-Green-Refactor Workflow**: Encourage small, incremental steps—write a focused test, implement the minimal code to make it pass, then refactor while keeping coverage intact.
- **Regression Guarantee**: Any discovered bug must result in a new failing test that reproduces the issue. Fixes are accepted only once the new test passes.

### 2.2 Fixture Architecture
- **Constructor-Based Fixtures**: All fixtures are instantiated via constructors or dedicated factory functions—no inline object literals in tests. This ensures deterministic setup, makes dependencies explicit, and facilitates reuse.
- **Dependency Injection**: Every unit under test receives dependencies via constructor parameters or setter injection. Test doubles (mocks, fakes, recorders) are injected at test setup time.
- **Composable Fixtures**: Provide layer-specific fixture builders (e.g., `createAgentRunnerFixture`, `createRunBundleFixture`) that return both the unit under test and supporting fakes/mocks.
- **Isolation**: Fixtures are reset between tests. Avoid shared global state; rely on scoped contexts managed by the test runner (`describe.each`, `beforeEach`, etc.).
- **SDK Fixture Layer**: A dedicated SDK fixture module exposes recorder/replay utilities. No test instantiates the real Claude SDK directly; only the recording harness and fixture update scripts can do so.

### 2.3 Test Organization Principles
- **Directory Layout**:
  - `tests/unit/<module>/...` for unit tests.
  - `tests/integration/<module>/...` for cross-component tests.
  - `tests/e2e/...` for workflow-level validations.
  - Shared helpers live in `tests/support/` and must be documented in Appendix A.
- **Naming Conventions**: File names mirror the unit under test (`agent-runner.spec.ts`, `context-manager.integration.spec.ts`, etc.). See Appendix B.
- **Hierarchical `describe` Blocks**: Start with the module name, then feature or method name. Each `it` block asserts a single behavior.
- **Test Independence**: Tests must not depend on execution order. Use fresh fixtures per test, avoid relying on mutated singletons.
- **Custom Matchers**: Place reusable assertions in `tests/support/matchers.ts` and ensure they are registered via a single setup file imported by Vitest.

### 2.4 What to Test vs. What Not to Test
- **Unit Tests**: Cover all public methods, configuration options, edge cases, error handling, and observable side effects. Private helpers are indirectly tested via public APIs.
- **Integration Tests**: Validate interactions between adjacent layers (e.g., `AgentRunner` with `ContextManager`, storage with reporters). They use real implementations of in-process collaborators while mocking external systems.
- **End-to-End (E2E) Tests**: Validate complete workflows such as running a vibe workflow, capturing artifacts, judging results, and generating reports. Limit to critical user journeys due to runtime cost.
- **Exclusions**:
  - Third-party library internals (Vitest, Zod) except for verifying integration (e.g., schema errors are surfaced properly).
  - Static type definitions already enforced by TypeScript, unless runtime validation is required.
  - Purely visual aspects of reporters beyond verifying generated artifacts (handled via snapshot/text diff tests).

### 2.5 Data Management Strategy
- **Fixture Repository**: Store deterministic fixtures under `tests/__fixtures__`. Subdirectories align with modules (`agent-runner`, `storage`, `sdk`, etc.).
- **Versioning**: Each fixture directory includes a `metadata.json` describing schema version, SDK version, creation date, and scenario description.
- **Recorder Outputs**: Claude SDK recordings reside under `tests/__fixtures__/claude-sdk/scenarios/` with standardized structure (see Section 3).
- **Snapshot Testing**: Use structured JSON snapshots rather than raw string snapshots to minimize flakiness. When unavoidable (e.g., HTML reporter output), ensure snapshots are whitespace-stable and document update procedure.
- **Demo Repositories**: Maintain lightweight demo workspaces under `tests/__fixtures__/workspaces/` for recording SDK runs. Each workspace includes a README describing purpose and reset instructions.

### 2.6 Quality Gates
- **Coverage**: Minimum 90% line and branch coverage per module, with rationale documented in Appendix C if lower coverage is justified (e.g., third-party glue code).
- **Performance**: Integration and E2E suites must complete within 5 minutes locally. Long-running scenarios (e.g., large diff processing) use replayed fixtures to remain deterministic.
- **CI Integration**: Tests run via `bun test` in CI. Recorder fixtures have dedicated lint checks to ensure metadata freshness. Any missing fixture or mismatch fails the build.
- **Pass Criteria**: All suites (unit, integration, e2e) must pass. Linting and type checks (biome, tsc) are prerequisites for merge but defined elsewhere.

## 3. Claude Code SDK Mocking Strategy

### 3.1 Decision Summary
We adopt a **Recorder/Wrapper Pattern (Option A)** supplemented by lightweight hand-written mocks for trivial edge cases. The recorder captures real SDK interactions to ensure fidelity and deterministic replay during tests. Hand-crafted mocks are reserved for unit tests that only need small artifacts (e.g., simulating a timeout error object) to avoid bloated fixtures.

### 3.2 Rationale
- **Determinism**: Replay eliminates network/API variability and cost while guaranteeing consistent hook/event sequences.
- **Fidelity**: Recorded sessions capture real-world tool usage, hook ordering, and token accounting—critical for validating complex orchestration logic.
- **Maintainability**: Versioned fixtures enable auditing changes across SDK upgrades. Structured metadata documents scenario purpose and coverage.
- **Scalability**: Replay is fast and scales to dozens of scenarios without incurring API costs.

### 3.3 Trade-offs Accepted
- **Upfront Investment**: Building the recorder wrapper and initial scenarios requires dedicated effort. Mitigated by providing implementation roadmap and scripts.
- **Fixture Drift**: SDK updates may invalidate recordings. Addressed through metadata versioning, CI checks, and routine refresh scripts.
- **Scenario Coverage**: Recordings must be curated to cover edge cases. Supplementary traditional mocks fill any remaining gaps.

### 3.4 Recorder Architecture
- **Location**: Recorder implementation lives in `tests/support/sdk-recorder/`. Fixtures stored in `tests/__fixtures__/claude-sdk/scenarios/`.
- **Wrapper Pattern**:
  - `RecordingClaudeClient` wraps the real SDK client. When `RECORD_SDK=1` env var is set, it proxies calls and records inputs/outputs.
  - `ReplayingClaudeClient` reads fixture metadata, matches scenario keys, and replays recorded hooks/tool results.
  - Both implement the same interface (`ClaudeCodeClient`), enabling injection into production code via dependency overrides.
- **Activation**: Recording is triggered by running `bun test --record-sdk <scenario>` or dedicated script `bun run record-sdk --scenario=<name>`. Replay is default during test runs.
- **Versioning**: Each scenario directory includes `metadata.json` with fields: `{ "scenario": "simple-file-edit", "sdkVersion": "<semver>", "recordedAt": "YYYY-MM-DD", "workspace": "<fixture workspace>", "technicalSpecVersion": "1.4" }`.

### 3.5 Capture Specification
- **Inputs Captured**:
  - Agent configuration (model, temperature, tools, tool configuration, system prompt overrides).
  - Initial prompt messages (full prompt transcript, including multi-turn conversations).
  - Workspace state: path identifier, git HEAD commit, list of tracked/untracked files, environment variables relevant to the run.
  - User context: test name, rubric (if judging), workflow configuration.
- **Outputs Captured**:
  - Hook events with timestamps, unique IDs, payloads (PreToolUse, PostToolUse, Notification, TextDelta, etc.).
  - Tool invocations and results (including arguments, stdout/stderr, exit codes).
  - File mutations: before/after snapshots, diffs, commit metadata if applicable.
  - Git operations (new commits, branches, status snapshots).
  - Token usage, cost estimates, and latency metrics.
  - Errors, warnings, and termination reasons.

### 3.6 Storage Format
```
tests/__fixtures__/claude-sdk/
  schema-version.json
  scenarios/
    simple-file-edit/
      input.json
      hooks/
        001-PreToolUse.json
        002-PostToolUse.json
        ...
      workspace/
        tracked-files.json
        git-state.json
      output.json
      metadata.json
    multi-file-refactor/
      ...
```
- **input.json**: Normalized request payload.
- **hooks/**: Ordered JSON files capturing each hook event with metadata (timestamp, correlation IDs).
- **workspace/**: Captures repository snapshot references (commit SHA, file listings). File contents stored in content-addressed storage (Section 4.3).
- **output.json**: Final RunResult-like summary (tools, files, cost, stop reason).
- **metadata.json**: Scenario metadata, SDK version, spec version, tags.

### 3.7 Replay Mechanism
- **Matching Strategy**: Tests specify `scenarioKey` (e.g., `simple-file-edit`). The replay client validates that the requested agent configuration matches `input.json` via deep comparison (with allow-list of permissible differences such as timestamps).
- **API Surface**: `createMockClaudeClient({ scenario: 'simple-file-edit' })` returns an object implementing the SDK interface. Missing scenarios throw descriptive errors with suggestions.
- **Partial Matches**: If configuration deviates (e.g., temperature change), the mock raises `FixtureMismatchError` listing mismatched fields. Tests must explicitly opt-in via `allowConfigDiffs` if divergence is intentional.
- **Error Handling**: Fixture load failures produce actionable errors instructing contributors to run the recorder. Corrupted fixtures fail CI via schema validation.

### 3.8 Scenario Catalog
Initial recording backlog (expandable):
1. **simple-file-edit** – single file modification.
2. **multi-file-refactor** – edits spanning multiple files with intermediate commits.
3. **git-commit-workflow** – agent stages and commits changes.
4. **error-correction-loop** – tool failure followed by retry.
5. **multi-agent-coordination** – workflow with sequential agents sharing context.
6. **tool-usage-shell** – heavy shell tool interaction with stdout/stderr capture.
7. **file-deletion** – agent deletes files and updates git state.
8. **large-diff** – >100 files modified for performance stress.
9. **cost-budget-adherence** – run constrained by cost ceiling.
10. **todo-completion** – agent processes TODO list watchers.
11. **hook-failure** – simulated hook processing failure for graceful degradation.
12. **session-timeout** – long-running tool call leading to timeout.

### 3.9 Hybrid Mock Usage
- Unit tests requiring only minimal SDK behavior (e.g., ensuring timeout errors propagate) may use inline stub classes defined in `tests/support/sdk-stubs.ts`.
- Integration/E2E tests must rely on recorded scenarios to guarantee realistic sequences.

## 4. Test Inventory
The following sections enumerate the required tests for each module, adhering to the template provided in the user instructions. Each test case describes intent, fixtures, edge cases, and pass criteria.

### 4.1 Core Test Infrastructure

#### Module: `vibeTest`
**Location**: `src/testing/vibeTest.ts`
**Dependencies**: Vitest `test.extend`, `VibeTestContext`, fixture factories
**Complexity**: Medium

##### Test Coverage Strategy
- **Unit Tests**: 6 tests
  - Focus: fixture extension behavior, context lifetime, cleanup guarantees, error propagation.
  - Mocking: Inject mock `ContextManager`, `AgentRunner`, and recorder clients.
  - Fixtures: `createVibeTestContextFixture`, `createMockVitest` harness.
- **Integration Tests**: 3 tests
  - Focus: integration with `vibeWorkflow`, hooking into reporters, ensuring watchers propagate.
  - Real dependencies: Use actual `VibeWorkflow`, stubbed reporters, replay SDK scenario.
  - Fixtures: `simple-file-edit` scenario, `TestRunBundle` fixture.
- **E2E Tests**: Covered via workflow E2E suite.

###### Unit Tests

**describe('vibeTest - fixture extension')**
- `it('provides VibeTestContext via vitest.extend once per test case')`
  - Validates: `vibeTest` registers fixtures exactly once and each test receives isolated context.
  - Fixtures: Mock Vitest API capturing `extend` calls, `createVibeTestContextFixture`.
  - Setup: Simulate registering two tests; assert context objects are unique.
  - Edge cases: Ensure parallel test definitions still receive unique contexts.
  - Pass criteria: `extend` called with expected keys, contexts isolated.

- `it('cleans up context resources after each test')`
  - Validates: Disposes watchers, storage handles, and SDK clients in `teardown`.
  - Fixtures: Spy on `dispose` of dependencies.
  - Edge cases: Exceptions thrown during test should still trigger cleanup.
  - Pass criteria: All disposables invoked even on simulated error.

- `it('propagates runAgent and judge methods onto test context')`
  - Validates: Methods available on `VibeTestContext` are correctly bound.
  - Fixtures: Mock implementations returning sentinel values.
  - Pass criteria: Context methods delegate to underlying service.

- `it('captures attachments via addTestAttachment helper')`
  - Validates: `TestAttachment` addition works and uses Vitest API.
  - Edge cases: Multiple attachments, duplicate file names.

- `it('throws descriptive error when required fixtures missing')`
  - Validates: If `AgentRunner` injection fails, error message suggests running setup.
  - Fixtures: Deliberately omit dependency.

- `it('supports custom matcher registration in setup file')`
  - Validates: Custom matchers registered via `vibeTest.setup.ts` executed before tests.

**describe('vibeTest - error handling')**
- `it('wraps asynchronous fixture errors with contextual metadata')`
  - Validates: Errors thrown inside `beforeEach` include test title, spec path.

###### Integration Tests

**describe('vibeTest - workflow integration')**
- `it('runs vibeWorkflow within a test and captures RunResult artifacts')`
  - Components: `vibeTest`, `vibeWorkflow`, `AgentRunner`, `ContextManager`.
  - Real vs Mock: Real workflow, replay SDK scenario, mock reporters.
  - Data flow: run workflow, ensure captured hooks stored in context.
  - Pass criteria: RunResult matches fixture, attachments recorded.

- `it('propagates watcher failures to vitest failure state')`
  - Validate watchers executed and when failure occurs, test fails early.

- `it('emits reporter hooks for each stage when using vibeWorkflow')`
  - Ensure reporters receive stage lifecycle events.

#### Module: `vibeWorkflow`
**Location**: `src/testing/vibeWorkflow.ts`
**Dependencies**: `StageManager`, `AgentRunner`, `ContextManager`, custom matchers
**Complexity**: High

##### Test Coverage Strategy
- **Unit Tests**: 8 tests
  - Focus: Stage orchestration, cross-stage context propagation, loop helpers, error propagation.
  - Mocking: Mock `AgentRunner`, `StageManager`, watchers.
- **Integration Tests**: 4 tests
  - Focus: Interaction with `ContextManager`, `RunBundle`, reporters, judge.
  - Real dependencies: Replay SDK scenario for at least one stage.
- **E2E Tests**: 2 tests
  - Scenarios: Full workflow including judge evaluation and report generation.

###### Unit Tests

**describe('vibeWorkflow - stage execution')**
- `it('executes stages sequentially and passes cumulative context')`
  - Validates stage order, context merging.
  - Fixtures: Mock stages with spies verifying invocation order.

- `it('supports optional stages guarded by predicates')`
  - Ensure conditional stage is skipped when predicate false.

- `it('aborts workflow on stage failure when stopOnError enabled')`
  - Edge case: Stage throws error; next stages not executed.

- `it('continues when stopOnError disabled and collects errors')`
  - Validates aggregated errors stored in workflow result.

**describe('vibeWorkflow - loops and until helper')**
- `it('retries stage until predicate returns true')`
  - Setup: Mock stage returning partial result; predicate triggers after 3 iterations.

- `it('throws when until helper exceeds max iterations')`
  - Validates descriptive error includes stage name, iteration count.

**describe('vibeWorkflow - context bridging')**
- `it('exposes prior stage outputs via context.getStageResult')`
  - Ensure stage can read preceding outputs.

- `it('merges attachments and hooks across stages')`
  - Validate aggregated outputs appended to RunBundle.

###### Integration Tests

**describe('vibeWorkflow - integration')**
- `it('executes agent stage with recorded SDK scenario and stores hooks')`
  - Components: Real `AgentRunner`, `ContextManager` with replay client.
  - Pass criteria: Stage result contains expected tool call timeline.

- `it('invokes judge stage with rubric and stores structured result')`
  - Ensure judge output appended to context.

- `it('publishes stage lifecycle events to reporters')`
  - Validate `StageStarted` and `StageCompleted` events emitted.

- `it('supports nested workflows via compose helper')`
  - Integration of parent/child workflows, verifying context isolation.

###### E2E Tests

**describe('vibeWorkflow - end-to-end')**
- `it('runs multi-stage workflow with cost reporting and HTML artifact generation')`
  - Journey: Setup workspace fixture, execute workflow, judge result, produce HTML report.
  - Success: All artifacts generated, RunBundle stored, reporters invoked.

- `it('handles failure stage gracefully and surfaces aggregated errors in report')`
  - Journey: Stage failure simulated via recorded `hook-failure` scenario; ensures workflow result marks failure and reporters capture diagnostics.

#### Module: Test Context & Fixtures
**Location**: `src/testing/context.ts`, `src/testing/fixtures/*`
**Dependencies**: `ContextManager`, `RunBundle`, `AgentRunner`, SDK replay client
**Complexity**: Medium

##### Test Coverage Strategy
- **Unit Tests**: 5 tests
  - Focus: Fixture creation, dependency injection, lifecycle hooks, override support.
  - Mocking: Mock SDK client factory, RunBundle store.
- **Integration Tests**: 2 tests
  - Focus: Running fixtures with actual `ContextManager` and verifying run state persistence.

###### Unit Tests

**describe('createVibeTestContextFixture')**
- `it('builds isolated RunBundle per test with unique identifiers')`
  - Validates: Each fixture invocation generates unique IDs and directories.
  - Fixtures: `withTempStorage` temp dir.
  - Pass criteria: IDs unique, no cross-test leakage.

- `it('injects replay SDK client when scenario provided')`
  - Validates: Fixture wires replay client automatically.
  - Edge cases: Scenario mismatch surfaces descriptive error.

- `it('allows overriding dependencies via options parameter')`
  - Setup: Provide custom `AgentRunner`; ensure override used.

- `it('resets context state between tests via teardown hook')`
  - Validate: After dispose, internal caches cleared.

- `it('throws informative error when required env vars missing')`
  - Pass criteria: Error message lists missing variables.

###### Integration Tests

**describe('VibeTestContext fixture integration')**
- `it('creates fully wired context enabling runAgent invocation')`
  - Components: Real `ContextManager`, replay scenario, RunBundle store.
  - Pass criteria: `runAgent` returns execution with watchers.

- `it('composes fixtures for nested describe blocks without duplication')`
  - Validates: Using fixture in nested scope reuses base setup while maintaining isolation.

#### Module: Custom Matchers

##### Matcher: `toHaveHookSequence`
**Location**: `src/testing/matchers/toHaveHookSequence.ts`
**Dependencies**: `HookTimeline`, `expect.extend`
**Complexity**: Low

##### Test Coverage Strategy
- **Unit Tests**: 4 tests verifying success path, diff output, missing hook detection, order enforcement.
- **Integration Tests**: 1 test ensuring matcher works within workflow test.

###### Unit Tests
- `it('passes when hook timeline matches expected sequence')`
- `it('produces readable diff when hooks differ')`
- `it('fails when expected hook missing and lists gap')`
- `it('fails when hooks out of order and highlights offending IDs')`

###### Integration Tests
- `it('validates hook timeline in recorded workflow scenario')`

##### Matcher: `toMatchRunBundle`
**Location**: `src/testing/matchers/toMatchRunBundle.ts`
**Dependencies**: Deep comparison utilities, RunBundle schema
**Complexity**: Low

##### Test Coverage Strategy
- **Unit Tests**: 4 tests covering deep comparison, diff readability, ignoring transient fields, partial comparison options.
- **Integration Tests**: 1 test verifying matcher used in workflow E2E to compare RunBundle snapshot.

###### Unit Tests
- `it('passes when RunBundle structures match exactly')`
- `it('ignores transient timestamps when ignoreTimestamps option set')`
- `it('prints diff of mismatched fields with path information')`
- `it('allows partial comparison when provided projection callback')`

###### Integration Tests
- `it('asserts RunBundle equality for recorded scenario without false positives')`

##### Matcher: `toHaveCompleteHookData`
**Location**: `src/testing/matchers/toHaveCompleteHookData.ts`
**Dependencies**: Hook correlation utils, expect API
**Complexity**: Low

##### Test Coverage Strategy
- **Unit Tests**: 4 tests validating detection of missing Post hook, mismatched IDs, incomplete tool data, success path.

###### Unit Tests
- `it('passes when every Pre hook has matching Post hook')`
- `it('fails with descriptive message when Post hook missing')`
- `it('fails when toolCallId differs between paired hooks')`
- `it('flags incomplete tool payload (missing stderr/stdout) when required')`

##### Matcher: `toRespectCostBudget`
**Location**: `src/testing/matchers/toRespectCostBudget.ts`
**Dependencies**: Cost tracker, expect API
**Complexity**: Low

##### Test Coverage Strategy
- **Unit Tests**: 3 tests ensuring matcher verifies token usage against budget thresholds, handles warnings, and formats errors.

###### Unit Tests
- `it('passes when total cost below hard budget')`
- `it('fails with warning message when soft budget exceeded')`
- `it('fails with error when hard budget exceeded and includes breakdown')`

### 4.2 Agent Runner & Context Manager

#### Module: `AgentRunner`
**Location**: `src/runner/AgentRunner.ts`
**Dependencies**: `ContextManager`, Claude SDK client, storage, reporters
**Complexity**: High

##### Test Coverage Strategy
- **Unit Tests**: 10 tests covering run lifecycle, hook routing, error handling, cancellation, watcher integration.
- **Integration Tests**: 5 tests verifying coordination with `ContextManager`, storage, cost tracking, and reporters.
- **E2E Tests**: Covered via workflow scenarios.

###### Unit Tests
- `it('initializes AgentExecution with watchers and promise semantics')`
- `it('streams hooks to ContextManager.processHookEvent')`
- `it('records tool call timeline and correlates IDs')`
- `it('propagates abort signal to SDK client')`
- `it('handles SDK timeout by marking execution as aborted with reason')`
- `it('captures file diffs via FileTracker integration')`
- `it('computes RunResult summary including costs and hook status')`
- `it('invokes watchers sequentially without overlap')`
- `it('supports multiple runAgent invocations in same context')`
- `it('raises descriptive error when SDK fixture missing')`

###### Integration Tests
- `it('executes recorded scenario and writes RunBundle artifacts')`
- `it('persists tool calls and file changes to storage layer')`
- `it('emits reporter events for lifecycle stages')`
- `it('handles git detection and fallback when repository absent')`
- `it('supports partial result retrieval during execution via ContextManager.getPartialResult')`

#### Module: `ContextManager`
**Location**: `src/runner/ContextManager.ts`
**Dependencies**: `RunBundle`, storage system, hook processors, git tracker
**Complexity**: High

##### Test Coverage Strategy
- **Unit Tests**: 9 tests covering hook processing, partial results, git capture, error resilience, concurrency guarantees.
- **Integration Tests**: 4 tests with `AgentRunner`, storage, reporters.

###### Unit Tests
- `it('initializes RunBundle with baseline metadata')`
- `it('processes PreToolUse and PostToolUse hooks, correlating by toolCallId')`
- `it('handles Notification hooks by appending to timeline')`
- `it('captures git state when repository detected')`
- `it('skips git capture gracefully when repository missing')`
- `it('records file changes lazily via LazyFileLoader')`
- `it('provides getPartialResult reflecting latest hooks')`
- `it('handles hook processing errors according to graceful degradation policy')`
- `it('marks hookCaptureStatus field appropriately')`

###### Integration Tests
- `it('integrates with AgentRunner to produce RunResult with complete data')`
- `it('stores content-addressed files and exposes references in RunBundle')`
- `it('updates cumulative context for multiple agent runs')`
- `it('triggers cleanup of temporary files after run completion')`

#### Module: Hook Capture System
**Location**: `src/hooks/capture.ts`
**Dependencies**: `ContextManager`, storage, SDK hooks, event bus
**Complexity**: Medium

##### Test Coverage Strategy
- **Unit Tests**: 6 tests validating hook subscription setup, batching, retries, error propagation, fallback behavior, teardown.
- **Integration Tests**: 2 tests confirming compatibility with recorder fixtures and ensuring captured hooks stored correctly.

###### Unit Tests
- `it('subscribes to SDK hook stream with configured filters')`
- `it('buffers streaming events and flushes batches respecting ordering guarantees')`
- `it('retries transient errors when reading hook stream')`
- `it('invokes ContextManager.processHookEvent for each hook in order')`
- `it('falls back to degraded mode when hook stream unavailable')`
- `it('cleans up subscriptions when AgentExecution completes or aborts')`

###### Integration Tests
- `it('captures hook stream for recorded scenario and forwards to ContextManager')`
- `it('handles hook stream interruption gracefully using hook-failure scenario')`

#### Module: Hook Processing & Correlation
**Location**: `src/hooks/process.ts`
**Dependencies**: ContextManager state, tool correlation, RunBundle timeline
**Complexity**: Medium

##### Test Coverage Strategy
- **Unit Tests**: 5 tests for pre/post pairing, timeline ordering, partial data handling, error propagation, telemetry.
- **Integration Tests**: 1 test verifying `ToolCall` objects created correctly using recorded scenario.

###### Unit Tests
- `it('updates timeline with chronological ordering using hook timestamps')`
- `it('correlates tool hooks and emits ToolCall records')`
- `it('handles partial hook payloads by marking degraded status')`
- `it('propagates processing errors to graceful degradation handler')`
- `it('records telemetry for each processed hook type')`

###### Integration Tests
- `it('processes recorded multi-tool scenario and produces expected ToolCall list')`

#### Module: RunResult Population
**Location**: `src/runner/RunResultFactory.ts`
**Dependencies**: `ContextManager`, cost tracker, tool timeline, git tracker
**Complexity**: Medium

##### Test Coverage Strategy
- **Unit Tests**: 6 tests verifying transformation from internal state to public `RunResult` structure, including cost, timeline, files, status flags, attachments, watchers.
- **Integration Tests**: 2 tests ensuring combination with reporter output and judge results.

###### Unit Tests
- `it('maps context state into RunResult with files, tools, costs, git info')`
- `it('marks hookCaptureStatus according to ContextManager state')`
- `it('includes watcher notifications in RunResult timeline')`
- `it('attaches budget summary when budgets enforced')`
- `it('serializes attachments metadata correctly')`
- `it('handles degraded states by including warnings array')`

###### Integration Tests
- `it('produces RunResult consumed by HTML reporter for artifact generation')`
- `it('provides RunResult to judge() and verifies rubric evaluation uses data')`

### 4.3 Storage System

#### Module: RunBundle Disk Storage
**Location**: `src/storage/RunBundleStore.ts`
**Dependencies**: Node filesystem APIs, `ContentStore`, cleanup policies, logger
**Complexity**: High

##### Test Coverage Strategy
- **Unit Tests**: 8 tests
  - Focus: atomic persistence, metadata integrity, concurrency locks, cleanup eligibility, error propagation.
  - Mocking: Mock filesystem (`memfs` or injected FS adapter), fake clock for age-based checks.
  - Fixtures: `withTempStorage`, `createRunBundleFixture`, sample RunResult payloads.
- **Integration Tests**: 4 tests
  - Focus: end-to-end persistence with AgentRunner, cross-platform paths, cleanup CLI, reporter consumption.
  - Real dependencies: Use actual filesystem (temporary directory) and replay SDK scenario.
  - Fixtures: `simple-file-edit` RunResult, `withTempStorage` directory.

###### Unit Tests

**describe('RunBundleStore - persistence')**
- `it('writes run bundle metadata to disk atomically')`
  - Validates: `save` method writes metadata and payload in a single atomic operation (temp file + rename).
  - Fixtures: Mock FS adapter capturing write order.
  - Edge cases: Interrupt during write triggers rollback.
  - Pass criteria: Only final file exists with complete JSON, temp file removed.

- `it('assigns deterministic bundle IDs and directory layout')`
  - Validates: IDs based on timestamp + hash as per spec.
  - Fixtures: Fake clock returning deterministic timestamp, hash stub.
  - Pass criteria: Directory path matches expected format.

- `it('persists associated content-addressed file references')`
  - Validates: `files` array includes content IDs referencing ContentStore.

- `it('rejects corrupted writes with descriptive error')`
  - Setup: Simulate fs write failure.
  - Pass criteria: Throws `RunBundlePersistenceError` with file path context.

**describe('RunBundleStore - retrieval')**
- `it('loads run bundle metadata and reconstructs lazy file handles')`
  - Validates: `load(bundleId)` returns object with lazy loaders wired.

- `it('handles missing bundle directory by throwing NotFound error')`
  - Edge cases: Non-existent ID, ensures error message actionable.

**describe('RunBundleStore - cleanup metadata')**
- `it('marks bundle lastAccessed timestamp on read')`
  - Validates: Access updates metadata for cleanup policy.

- `it('computes eligible bundles based on age and disk thresholds')`
  - Fixtures: Fake clock/disk usage to trigger cleanup eligibility.

###### Integration Tests

**describe('RunBundleStore - integration')**
- `it('saves RunResult emitted by AgentRunner and reloads identical data')`
  - Components: AgentRunner (replay scenario), ContextManager, RunBundleStore.
  - Real vs Mock: Real FS in temp dir, replay SDK client.
  - Pass criteria: Reloaded RunBundle deep-equals original.

- `it('allows reporters to stream artifacts from stored bundle')`
  - Components: RunBundleStore + HTML reporter reading from store.

- `it('respects .vibe-keep markers when cleanup runs')`
  - Setup: Create keep file; run cleanup CLI; ensure bundle preserved.

- `it('handles cross-platform path separators in stored metadata')`
  - Validate portability by simulating Windows-style paths.

#### Module: Content-Addressed File Storage
**Location**: `src/storage/ContentStore.ts`
**Dependencies**: Filesystem, hashing utilities (`sha256`), compression
**Complexity**: Medium

##### Test Coverage Strategy
- **Unit Tests**: 7 tests focusing on hashing, deduplication, streaming, binary support.
- **Integration Tests**: 2 tests ensuring compatibility with RunBundleStore and reporters.

###### Unit Tests

**describe('ContentStore - writes')**
- `it('stores file content under deterministic hash path')`
  - Pass criteria: Path includes prefix directories as per spec (e.g., `ab/cd/hash`).

- `it('deduplicates identical content and increments reference count')`
  - Edge cases: Writing same content twice returns same ID without rewriting file.

- `it('compresses large text files when compression enabled')`
  - Fixtures: Provide large text fixture; verify compressed flag set.

**describe('ContentStore - reads')**
- `it('returns readable stream for stored content')`
- `it('handles binary files without encoding corruption')`

**describe('ContentStore - errors')**
- `it('throws ContentNotFoundError for missing hash')`
- `it('recovers gracefully when write interrupted (temp file cleanup)')`

###### Integration Tests
- `it('resolves file references from RunBundleStore.load')`
- `it('feeds HTML reporter with inline diffs via stream interface')`

#### Module: Lazy Loading Mechanism
**Location**: `src/storage/LazyFileLoader.ts`
**Dependencies**: `ContentStore`, Node streams
**Complexity**: Medium

##### Test Coverage Strategy
- **Unit Tests**: 5 tests verifying deferred reads, caching, error propagation, concurrency.
- **Integration Tests**: 1 test ensuring reporters consume lazy loaders correctly.

###### Unit Tests
- `it('defers file read until text() invoked')`
- `it('caches resolved text to avoid duplicate reads')`
- `it('supports stream() interface with backpressure handling')`
- `it('throws descriptive error when content missing')`
- `it('retries read on transient fs error based on policy')`

###### Integration Tests
- `it('allows HTML reporter to render large diff without loading entire file eagerly')`

#### Module: Cleanup Policies
**Location**: `src/storage/cleanup.ts`
**Dependencies**: `RunBundleStore`, disk usage monitor, logger
**Complexity**: Medium

##### Test Coverage Strategy
- **Unit Tests**: 6 tests covering age filter, disk threshold, `.vibe-keep`, dry-run, manual override, reporting.
- **Integration Tests**: 1 test executing cleanup across temp storage directory.

###### Unit Tests
- `it('selects bundles older than maxAgeDays for deletion')`
- `it('skips bundles marked with .vibe-keep file')`
- `it('triggers cleanup when disk usage exceeds threshold')`
- `it('supports dry-run mode logging planned deletions only')`
- `it('allows manual override via cleanupBundles({ ids })')`
- `it('logs summary with counts and reclaimed bytes')`

###### Integration Tests
- `it('removes eligible bundles and retains protected ones in temp storage')`

### 4.4 Judge System

#### Module: Rubric Validation (Zod Schemas)
**Location**: `src/judge/rubric.ts`
**Dependencies**: `zod`, rubric interfaces
**Complexity**: Medium

##### Test Coverage Strategy
- **Unit Tests**: 5 tests verifying schema acceptance/rejection, defaulting, JSON schema export, error formatting.
- **Integration Tests**: 1 test ensuring invalid rubric triggers descriptive failure in `judge()`.

###### Unit Tests
- `it('accepts structured rubric with criteria array and thresholds')`
- `it('rejects rubric missing required name field with helpful message')`
- `it('allows custom criteria via passthrough validation')`
- `it('exports JSON schema compatible with API docs')`
- `it('normalizes optional fields to defaults (e.g., passThreshold)')`

###### Integration Tests
- `it('causes judge() to throw JudgmentFailedError when rubric invalid')`

#### Module: LLM Judge Execution
**Location**: `src/judge/judge.ts`
**Dependencies**: Claude SDK, rubric validator, prompt formatter, RunBundle
**Complexity**: High

##### Test Coverage Strategy
- **Unit Tests**: 8 tests focusing on prompt formatting, streaming handling, retries, fallback model selection, cost tracking.
- **Integration Tests**: 3 tests using recorded scenarios (`judge-structured`, `judge-freeform`, `judge-timeout`).

###### Unit Tests
- `it('formats prompt with rubric criteria and instructions')`
- `it('selects DEFAULT_MODEL when none provided')`
- `it('handles streaming responses and aggregates final result')`
- `it('retries on transient SDK error up to configured limit')`
- `it('propagates fatal errors with context metadata')`
- `it('records token usage into RunBundle cost tracker')`
- `it('supports custom resultFormat zod schema for typed output')`
- `it('aborts when abortSignal triggered during evaluation')`

###### Integration Tests
- `it('produces structured judgment using recorded structured scenario')`
- `it('handles freeform rubric scenario and stores unstructured verdict')`
- `it('captures timeout scenario and surfaces partial reasoning')`

#### Module: JudgeResult Handling
**Location**: `src/judge/results.ts`
**Dependencies**: Rubric schema, RunBundle, reporters
**Complexity**: Medium

##### Test Coverage Strategy
- **Unit Tests**: 6 tests verifying result parsing, threshold evaluation, `throwOnFail`, metadata attachments, summary formatting, serialization.
- **Integration Tests**: 2 tests ensuring results appended to RunBundle and forwarded to reporters.

###### Unit Tests
- `it('parses JSON response according to resultFormat schema')`
- `it('marks result as pass when score >= threshold')`
- `it('honors throwOnFail by raising JudgmentFailedError')`
- `it('attaches rubric summary to RunBundle attachments list')`
- `it('serializes judgment for HTML reporter with sections')`
- `it('retains raw response for debugging when configured')`

###### Integration Tests
- `it('appends judgment result to RunBundle and notifies reporters')`
- `it('aggregates multiple judgments into workflow summary')`

### 4.5 Reporters

#### Module: Terminal Cost Reporter
**Location**: `src/reporters/TerminalCostReporter.ts`
**Dependencies**: cost tracker, chalk (or equivalent), event bus
**Complexity**: Medium

##### Test Coverage Strategy
- **Unit Tests**: 5 tests verifying formatting, currency conversion, zero-cost handling, budget warnings, summary totals.
- **Integration Tests**: 1 test hooking reporter into workflow to confirm event reception.

###### Unit Tests
- `it('prints per-run cost with currency formatting')`
- `it('aggregates multiple runs into cumulative total')`
- `it('highlights cost overruns in red when exceeding budget')`
- `it('suppresses output when quiet mode enabled')`
- `it('handles zero token usage gracefully')`

###### Integration Tests
- `it('receives lifecycle events during workflow execution and logs summary')`

#### Module: HTML Reporter
**Location**: `src/reporters/HtmlReporter.ts`
**Dependencies**: template renderer, asset bundler, RunBundle store
**Complexity**: High

##### Test Coverage Strategy
- **Unit Tests**: 7 tests covering template rendering, asset copying, navigation structure, timeline rendering, diff embedding, theme switching, error handling.
- **Integration Tests**: 2 tests verifying artifacts stored in RunBundle and accessible from workflow outputs.

###### Unit Tests
- `it('renders overview page with run metadata and cost summary')`
- `it('renders stage pages with hook timelines and tool calls')`
- `it('embeds diffs using lazy loader placeholders')`
- `it('copies static assets into artifact directory')`
- `it('supports dark/light themes via config toggle')`
- `it('generates deterministic HTML suitable for snapshot comparison')`
- `it('throws descriptive error when template missing')`

###### Integration Tests
- `it('writes HTML artifact to RunBundle storage and registers attachment')`
- `it('links to reporter output from workflow summary email/report')`

#### Module: Report Generation & Artifacts
**Location**: `src/reporting/generateReport.ts`
**Dependencies**: reporters, RunBundleStore, filesystem
**Complexity**: Medium

##### Test Coverage Strategy
- **Unit Tests**: 5 tests for artifact bundling, metadata inclusion, reporter orchestration, failure handling, idempotency.
- **Integration Tests**: 2 tests ensuring multi-reporter output and CLI invocation.

###### Unit Tests
- `it('invokes all registered reporters with RunBundle data')`
- `it('collects reporter outputs into single manifest JSON')`
- `it('handles reporter failure by logging and continuing when allowed')`
- `it('aborts when reporter failure configured as fatal')`
- `it('is idempotent when run multiple times for same bundle')`

###### Integration Tests
- `it('generates combined artifacts for terminal + HTML reporters')`
- `it('runs via CLI command and stores manifest in storage directory')`

### 4.6 Matrix Testing

#### Module: `defineTestSuite`
**Location**: `src/matrix/defineTestSuite.ts`
**Dependencies**: matrix utilities, vibeTest, workflow helpers
**Complexity**: Medium

##### Test Coverage Strategy
- **Unit Tests**: 6 tests verifying cartesian product generation, scenario labeling, selective skip/filter, fixture composition, parameter validation, concurrency options.
- **Integration Tests**: 2 tests ensuring generated suites execute vibeWorkflow runs with recorded scenarios.

###### Unit Tests
- `it('expands matrix definitions into cartesian combinations')`
- `it('applies filters to exclude incompatible combinations')`
- `it('supports `.only`/`.skip` flags per dimension')`
- `it('composes fixtures into vibeTest contexts automatically')`
- `it('validates matrix definition schema and throws helpful errors')`
- `it('supports concurrent execution when marked as parallel-safe')`

###### Integration Tests
- `it('executes generated suites and captures results per combination')`
- `it('names tests using label templates for readability')`

#### Module: Cartesian Product Utilities
**Location**: `src/matrix/utils.ts`
**Dependencies**: none beyond stdlib
**Complexity**: Low

##### Test Coverage Strategy
- **Unit Tests**: 4 tests verifying combination logic, stable ordering, empty dimension handling, duplicate elimination.

###### Unit Tests
- `it('produces cartesian product preserving dimension order')`
- `it('returns empty array when any dimension empty')`
- `it('deduplicates identical combinations when requested')`
- `it('supports mapping function for custom combination objects')`

### 4.7 Configuration

#### Module: `defineVibeConfig`
**Location**: `src/config/defineVibeConfig.ts`
**Dependencies**: config schema, environment loader, defaults
**Complexity**: Medium

##### Test Coverage Strategy
- **Unit Tests**: 6 tests verifying default merging, environment overrides, schema validation, nested config, error messaging, caching.
- **Integration Tests**: 2 tests ensuring config influences AgentRunner and reporters.

###### Unit Tests
- `it('merges user config with defaults without mutating input')`
- `it('applies environment variable overrides with precedence rules')`
- `it('rejects invalid config with aggregated error message')`
- `it('supports nested config sections (storage, reporters, workflow)')`
- `it('memoizes config when called multiple times in same process')`
- `it('exposes derived fields (e.g., resolved paths)')`

###### Integration Tests
- `it('drives AgentRunner model selection according to config')`
- `it('configures reporters (e.g., HTML output path) via defineVibeConfig result')`

#### Module: Config Validation & Defaults
**Location**: `src/config/validation.ts`
**Dependencies**: `zod`, default constants
**Complexity**: Low

##### Test Coverage Strategy
- **Unit Tests**: 4 tests verifying schema enforcement, default injection, error formatting, backward compatibility.

###### Unit Tests
- `it('injects default values when fields omitted')`
- `it('returns aggregated error tree for multiple issues')`
- `it('supports deprecated fields via transform with warning')`
- `it('prevents unknown keys unless explicitly allowed')`

### 4.8 File Change Tracking

#### Module: Git State Capture
**Location**: `src/git/capture.ts`
**Dependencies**: `simple-git` (or internal wrapper), filesystem, logger
**Complexity**: Medium

##### Test Coverage Strategy
- **Unit Tests**: 6 tests verifying repository detection, status snapshot, branch detection, detached head handling, no-git fallback, error resilience.
- **Integration Tests**: 2 tests ensuring captured git state stored in RunBundle and surfaced in reporters.

###### Unit Tests
- `it('detects git repository root from nested workspace directory')`
- `it('captures branch name and latest commit SHA')`
- `it('records staged/unstaged file lists with statuses')`
- `it('handles detached HEAD by labeling commit-only state')`
- `it('falls back to no-git state when repository missing')`
- `it('wraps git errors with descriptive message and continues')`

###### Integration Tests
- `it('stores git snapshot in RunBundle and references content store')`
- `it('exposes git info within HTML reporter overview section')`

#### Module: File Diff Generation
**Location**: `src/git/diff.ts`
**Dependencies**: diff library, filesystem, LazyFileLoader
**Complexity**: Medium

##### Test Coverage Strategy
- **Unit Tests**: 5 tests for diff generation, binary detection, rename detection, large file handling, whitespace sensitivity toggles.
- **Integration Tests**: 1 test verifying diff output consumed by HTML reporter and CLI summary.

###### Unit Tests
- `it('generates unified diff for modified text files')`
- `it('marks binary files and omits inline diff')`
- `it('detects renames and populates before/after paths')`
- `it('supports large files via streaming diff builder')`
- `it('respects ignoreWhitespace option from config')`

###### Integration Tests
- `it('injects diff summary into reporter outputs for recorded scenario')`

#### Module: Before/After Content Storage
**Location**: `src/git/content.ts`
**Dependencies**: `ContentStore`, filesystem
**Complexity**: Low

##### Test Coverage Strategy
- **Unit Tests**: 4 tests verifying snapshot capture for before/after states, large file handling, deletion markers, rename references.

###### Unit Tests
- `it('stores pre-edit and post-edit content references')`
- `it('marks deleted files with null afterContent')`
- `it('handles binary files via metadata only')`
- `it('updates reference on file rename while retaining history')`

### 4.9 Tool Call Processing

#### Module: PreToolUse/PostToolUse Correlation
**Location**: `src/tools/correlation.ts`
**Dependencies**: hook event models, logger
**Complexity**: Medium

##### Test Coverage Strategy
- **Unit Tests**: 6 tests verifying correlation by `toolCallId`, fallback heuristics, out-of-order events, duplicate IDs, missing Post events, degraded mode.

###### Unit Tests
- `it('correlates PreToolUse and PostToolUse by matching toolCallId')`
- `it('handles out-of-order hooks by buffering until pair complete')`
- `it('applies fallback heuristic when Post event missing ID')`
- `it('detects duplicate toolCallId and logs warning')`
- `it('marks hookCaptureStatus degraded when correlation fails')`
- `it('supports manual correlation overrides from ContextManager')`

#### Module: ToolCall Record Creation
**Location**: `src/tools/records.ts`
**Dependencies**: correlation module, RunBundle models
**Complexity**: Low

##### Test Coverage Strategy
- **Unit Tests**: 4 tests ensuring normalized record creation, argument serialization, error capture, timestamps.

###### Unit Tests
- `it('creates ToolCall record with name, arguments, and duration')`
- `it('captures stderr/stdout for shell tool results')`
- `it('marks tool call as failed when Post hook indicates error')`
- `it('serializes large JSON arguments without truncation when configured')`

#### Module: Tool Timeline Construction
**Location**: `src/tools/timeline.ts`
**Dependencies**: correlation, notification hooks, RunBundle timeline models
**Complexity**: Medium

##### Test Coverage Strategy
- **Unit Tests**: 5 tests verifying timeline ordering, notification merging, nested tool calls, concurrency markers, formatting.
- **Integration Tests**: 2 tests with recorded scenarios featuring multiple tool invocations.

###### Unit Tests
- `it('orders tool calls chronologically using hook timestamps')`
- `it('merges notification events between pre/post pairs')`
- `it('represents nested tool calls using indentation metadata')`
- `it('handles overlapping tool executions gracefully')`
- `it('formats timeline entries for reporter consumption')`

###### Integration Tests
- `it('produces expected timeline for multi-tool recorded scenario')`
- `it('integrates with HTML reporter timeline rendering')`

### 4.10 Workflow System

#### Module: Stage Management
**Location**: `src/workflow/StageManager.ts`
**Dependencies**: workflow context, logger, error policy
**Complexity**: Medium

##### Test Coverage Strategy
- **Unit Tests**: 6 tests covering registration order, lifecycle callbacks, dependency resolution, cancellation, error propagation, metrics.

###### Unit Tests
- `it('registers stages with unique identifiers and order index')`
- `it('invokes beforeEach/afterEach hooks around stage execution')`
- `it('resolves stage dependencies before execution')`
- `it('cancels remaining stages when abort requested')`
- `it('records execution metrics per stage')`
- `it('propagates errors respecting stopOnError setting')`

#### Module: Cross-Stage Context
**Location**: `src/workflow/ContextBridge.ts`
**Dependencies**: StageManager, RunBundle context store
**Complexity**: Medium

##### Test Coverage Strategy
- **Unit Tests**: 5 tests verifying data sharing, immutability, versioning, conflict resolution, cleanup.
- **Integration Tests**: 1 test verifying data accessible across workflow stages.

###### Unit Tests
- `it('allows stage to read previous stage output via context.get')`
- `it('prevents direct mutation of previous stage result objects')`
- `it('namespaces context entries by stage ID to avoid collisions')`
- `it('supports versioned entries for iterative stages')`
- `it('cleans up transient context after workflow completes')`

###### Integration Tests
- `it('shares agent output with subsequent judge stage in workflow')`

#### Module: Loop/Iteration Helpers (`until()`)
**Location**: `src/workflow/helpers.ts`
**Dependencies**: StageManager, timing utilities
**Complexity**: Medium

##### Test Coverage Strategy
- **Unit Tests**: 5 tests for iteration counting, exponential backoff, timeout handling, custom stop conditions, instrumentation.
- **Integration Tests**: 1 test verifying integration with StageManager loops recorded scenario.

###### Unit Tests
- `it('retries stage until predicate returns true')`
- `it('applies exponential backoff between retries when configured')`
- `it('times out after max duration and emits detailed error')`
- `it('records iteration metrics for performance analysis')`
- `it('supports custom stop condition callbacks returning metadata')`

###### Integration Tests
- `it('retries stage using recorded error-correction scenario and succeeds on retry')`

### 4.11 Error Handling

#### Module: Graceful Degradation
**Location**: `src/errors/graceful.ts`
**Dependencies**: logger, RunBundle state
**Complexity**: Medium

##### Test Coverage Strategy
- **Unit Tests**: 5 tests verifying degraded modes for hook capture, file tracking, reporter failures, ensuring flags set and messages emitted.

###### Unit Tests
- `it('marks RunResult hookCaptureStatus when hook processing fails')`
- `it('adds warning attachment with remediation steps')`
- `it('preserves partial data while skipping failed subsystem')`
- `it('avoids double-logging the same degradation event')`
- `it('restores normal operation on subsequent runs')`

#### Module: Hook Failure Scenarios
**Location**: `src/errors/hookFailures.ts`
**Dependencies**: Hook processing, logger
**Complexity**: Low

##### Test Coverage Strategy
- **Unit Tests**: 4 tests covering error classification, retry decisions, user messaging, telemetry.

###### Unit Tests
- `it('classifies hook errors into retryable and fatal categories')`
- `it('retries retryable errors up to configured limit')`
- `it('emits user-facing notification when hooks dropped')`
- `it('records telemetry event for observability')`

#### Module: Storage Failure Scenarios
**Location**: `src/errors/storage.ts`
**Dependencies**: RunBundleStore, ContentStore, cleanup policies
**Complexity**: Medium

##### Test Coverage Strategy
- **Unit Tests**: 5 tests simulating disk full, permission denied, corrupted files, verifying fallback and messaging.
- **Integration Tests**: 1 test verifying workflow continues with degraded storage using temp directory with read-only simulation.

###### Unit Tests
- `it('throws StorageError with remedial suggestion on disk full')`
- `it('retries writes with exponential backoff for transient errors')`
- `it('marks bundle as degraded when read fails but continues execution')`
- `it('logs support package instructions when corruption detected')`
- `it('handles cleanup failure without crashing workflow')`

###### Integration Tests
- `it('completes workflow while skipping artifact write when storage unavailable')`

#### Module: SDK Timeout Handling
**Location**: `src/errors/sdkTimeout.ts`
**Dependencies**: AgentRunner, Claude SDK recorder
**Complexity**: Medium

##### Test Coverage Strategy
- **Unit Tests**: 4 tests ensuring timeouts emit correct error, include diagnostic data, preserve partial result, trigger budget updates.
- **Integration Tests**: 1 test using `session-timeout` scenario to verify behavior end-to-end.

###### Unit Tests
- `it('wraps timeout in AgentTimeoutError with hook context')`
- `it('attaches partial RunResult to error for inspection')`
- `it('updates cost tracker with consumed tokens despite timeout')`
- `it('emits watcher notification about timeout event')`

###### Integration Tests
- `it('replays session-timeout scenario and verifies graceful workflow abort')`

### 4.12 Performance & Cost Tracking

#### Module: Token Counting
**Location**: `src/perf/tokenCounter.ts`
**Dependencies**: hook events, model pricing tables
**Complexity**: Medium

##### Test Coverage Strategy
- **Unit Tests**: 5 tests verifying accumulation across hooks, multi-model runs, streaming deltas, reset behavior, concurrency.

###### Unit Tests
- `it('accumulates prompt and completion tokens per hook event')`
- `it('handles multi-model runs by tracking per-model totals')`
- `it('processes streaming TextDelta events incrementally')`
- `it('resets counters between runs when requested')`
- `it('is thread-safe for concurrent updates within same run')`

#### Module: Cost Calculation
**Location**: `src/perf/costCalculator.ts`
**Dependencies**: tokenCounter, pricing config, currency conversion
**Complexity**: Medium

##### Test Coverage Strategy
- **Unit Tests**: 6 tests for pricing tables, discount application, rounding, multi-currency support, caching, error handling.
- **Integration Tests**: 2 tests ensuring costs aggregated per workflow and reporter output matches.

###### Unit Tests
- `it('computes cost using per-model pricing table')`
- `it('applies enterprise discount when configured')`
- `it('rounds totals to configured precision')`
- `it('supports currency conversion using exchange rates')`
- `it('caches computed totals for repeated access')`
- `it('throws descriptive error when pricing missing for model')`

###### Integration Tests
- `it('aggregates costs across multi-stage workflow and matches reporter output')`
- `it('respects per-stage budget overrides when computing totals')`

#### Module: Budget Enforcement
**Location**: `src/perf/budget.ts`
**Dependencies**: costCalculator, AgentRunner
**Complexity**: Medium

##### Test Coverage Strategy
- **Unit Tests**: 5 tests verifying thresholds, soft vs hard limits, messaging, cumulative tracking, reset behavior.
- **Integration Tests**: 2 tests with AgentRunner ensuring runs abort or warn appropriately.

###### Unit Tests
- `it('enforces hard budget by throwing before run exceeds limit')`
- `it('issues warning for soft budget while allowing execution')`
- `it('tracks cumulative cost across multiple runs within same test')`
- `it('resets budget tracker when context disposed')`
- `it('logs actionable guidance when budget exceeded')`

###### Integration Tests
- `it('aborts AgentRunner execution when budget exceeded mid-run')`
- `it('allows run to continue with warning when within soft limit scenario')`

## 5. Architecture Decisions

### Decision 1: Claude Code SDK Mocking Strategy
- **Decision**: Recorder/Wrapper with optional lightweight stubs.
- **Date**: 2025-10-07
- **Rationale**: Maximizes fidelity, determinism, and maintainability while retaining flexibility.
- **Trade-offs**: Upfront complexity, fixture maintenance overhead.
- **Alternatives Considered**: (1) Traditional mocks — rejected due to unrealistic sequences. (2) Hybrid with equal weight — rejected to avoid duplicated systems.

### Decision 2: Fixture Architecture Pattern
- **Decision**: Constructor-based dependency injection using factory builders (`createXFixture`).
- **Rationale**: Ensures isolation, explicit dependencies, easy overrides.
- **Examples**:
  - `const { agentRunner, contextManager, sdkClient } = createAgentRunnerFixture({ scenario: 'simple-file-edit' });`
- **Guidelines**: Fixtures return both unit under test and helpers/spies. Builders accept overrides for dependencies and configuration.

### Decision 3: Test Organization Structure
- **Decision**: Three-tier directory layout (`unit`, `integration`, `e2e`) with mirrored module paths.
- **Rationale**: Aligns with testing philosophy, simplifies navigation, enables targeted CI runs.
- **Structure**:
```
tests/
  unit/
    runner/agent-runner.spec.ts
    runner/context-manager.spec.ts
    ...
  integration/
    runner/agent-runner.integration.spec.ts
    workflow/vibe-workflow.integration.spec.ts
    ...
  e2e/
    workflow/full-workflow.e2e.spec.ts
  support/
    fixtures/
    matchers/
    sdk-recorder/
```

### Decision 4: Snapshot Strategy
- **Decision**: Prefer structured JSON snapshots with schema validation; HTML snapshots use prettified deterministic format.
- **Rationale**: Minimizes flaky diffs and aids review.

### Decision 5: Coverage Enforcement
- **Decision**: 90% module-level coverage with documented exceptions.
- **Rationale**: Ensures comprehensive verification while allowing practical carve-outs.

## 6. Implementation Roadmap

### 6.1 Implementation Order
1. **Support Infrastructure**: Implement fixture factories, custom matchers, SDK recorder/replay utilities.
2. **Core Context Tests**: Add `vibeTest`, `vibeWorkflow`, and context fixture tests (unit first, then integration).
3. **AgentRunner & ContextManager**: Build unit tests using replay fixtures, then integration tests.
4. **Storage & File Tracking**: Implement tests ensuring RunBundle persistence and diff capture.
5. **Judge & Reporters**: Add unit and integration tests leveraging recorded judgment scenarios.
6. **Workflow E2E**: Compose full workflows once lower-level modules covered.
7. **Performance & Budget**: Add cost tracking tests last, after core data structures exist.

### 6.2 Fixture Construction Guide
- **Factory Pattern**: Each `createXFixture` accepts overrides for dependencies and returns `{ instance, dependencies, dispose }`.
- **Shared Utilities**: `tests/support/createTempWorkspace`, `tests/support/loadScenario`, `tests/support/createMockReporter`.
- **Composition Examples**:
  - Combine `createAgentRunnerFixture` with `createReplaySdkClient` for integration tests.
  - Wrap fixtures in `withTemporaryEnv` helper for config-dependent tests.

### 6.3 Assertion Patterns
- **RunResult Assertions**: Use `toMatchRunBundle` for structural equality, `toHaveHookSequence` for timeline validation.
- **Error Assertions**: `await expect(promise).rejects.toThrowErrorMatchingInlineSnapshot()` with structured error messages.
- **Watcher Assertions**: Use spies capturing invocation order, assert sequential execution.
- **Custom Matchers**: Document usage in each module’s test scaffolds.

### 6.4 Test Data Management
- **Data Location**: All static data under `tests/__fixtures__`. No inline JSON strings; load via helper `loadFixture('path')`.
- **Adding New Scenarios**: Run `bun run record-sdk --scenario=<name>`; commit resulting fixtures with metadata update.
- **Maintenance**: Quarterly refresh of SDK recordings or upon SDK version bump. Document update in changelog.

## 7. Maintenance & Evolution
- **Spec Updates**: Any change to technical spec must be mirrored here. Use semantic versioning for this document (increment minor for new tests, patch for clarifications).
- **Fixture Lifecycle**: Maintain `schema-version.json` to detect format drift. Introduce migration scripts when format changes.
- **CI Enforcement**: Add check ensuring spec and fixtures are in sync (e.g., `bun run validate-fixtures`).
- **Review Process**: Changes require approval from testing lead. Summaries must highlight affected modules and fixtures.
- **Documentation Sync**: Keep Appendices updated as new fixtures/matchers added.

## Appendices

### Appendix A: Fixture Reference
- `createAgentRunnerFixture`: Builds AgentRunner with injected replay SDK.
- `createContextManagerFixture`: Provides RunBundle store, content store, git tracker mocks.
- `createWorkflowFixture`: Composes StageManager, reporters, context.
- `createJudgeFixture`: Supplies rubric schemas, replay scenario clients.
- `replayScenario(scenarioKey)`: Loads recorded SDK session.
- `withTempStorage()`: Creates isolated filesystem directory for storage tests.
- `mockReporterFactory(name)`: Returns reporter spy capturing emitted events.

### Appendix B: Test Naming Conventions
- File names: `<module>.<type>.spec.ts` where type ∈ {`spec`, `integration`, `e2e`}.
- `describe` blocks: `describe('<Module> - <Feature>')`.
- `it` blocks: Imperative description starting with verb (`it('returns ...')`).
- Use `test.concurrent` only when no shared fixtures.

### Appendix C: Coverage Requirements Matrix
| Module | Coverage Target | Rationale |
| --- | --- | --- |
| Core Test Infrastructure | 95% | Critical for all tests |
| AgentRunner | 95% | High complexity, mission-critical |
| ContextManager | 95% | Data integrity |
| Storage System | 90% | IO-heavy, acceptable to mock edge cases |
| Judge System | 90% | Deterministic replay ensures coverage |
| Reporters | 85% | Snapshot-heavy, visual nuances |
| Matrix Testing | 90% | Controls test expansion |
| Configuration | 90% | Prevent misconfiguration |
| File Change Tracking | 90% | Ensures diff fidelity |
| Tool Call Processing | 95% | Hook correlation correctness |
| Workflow System | 90% | Core orchestration |
| Error Handling | 85% | Many branches, focus on critical paths |
| Performance & Cost Tracking | 90% | Budget enforcement reliability |

