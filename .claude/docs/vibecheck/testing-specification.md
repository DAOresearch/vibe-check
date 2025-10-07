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
  - [2.4 Scope of Testing](#24-scope-of-testing)
  - [2.5 Data Management Strategy](#25-data-management-strategy)
  - [2.6 Quality Gates](#26-quality-gates)
- [3. Claude Code SDK Mocking Strategy](#3-claude-code-sdk-mocking-strategy)
  - [3.1 Decision Summary](#31-decision-summary)
  - [3.2 Recording Infrastructure](#32-recording-infrastructure)
  - [3.3 Capture Specification](#33-capture-specification)
  - [3.4 Storage Format](#34-storage-format)
  - [3.5 Replay Mechanism](#35-replay-mechanism)
  - [3.6 Scenario Library](#36-scenario-library)
  - [3.7 Implementation Guidance](#37-implementation-guidance)
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
- [Appendices](#appendices)
  - [Appendix A: Fixture Reference](#appendix-a-fixture-reference)
  - [Appendix B: Test Naming Conventions](#appendix-b-test-naming-conventions)
  - [Appendix C: Coverage Requirements Matrix](#appendix-c-coverage-requirements-matrix)

---

## 1. Introduction & Purpose

This testing specification defines the verification contract for the Vibe-Check test harness as described in the Technical Specification v1.4. The document encodes correctness requirements as executable test scaffolds so that, if all prescribed tests pass, the implementation is deemed correct. The intended workflow is:

1. Author tests and fixtures according to this specification.
2. Generate implementation code that satisfies the tests.
3. Use tests as the authoritative oracle of correctness.
4. Review and evolve this spec as the product evolves.

The scope covers unit, integration, and workflow-level behavior for every module enumerated in the technical specification, with particular emphasis on deterministic reproduction of Claude Code SDK interactions.

## 2. Testing Philosophy & Principles

### 2.1 TDD for LLM-Generated Code
- Tests precede implementation. Specifications herein must be translated into automated tests before any production code is generated.
- Human reviewers focus on validating tests, fixtures, and expectations. Implementation code is considered opaque as long as it satisfies the tests.
- Each test must articulate the behavior it guarantees via `Validates` statements. Passing all tests equals compliance with the technical specification.
- Regression coverage: whenever the technical spec gains a new invariant, tests must be updated first.

### 2.2 Fixture Architecture
- Fixtures are defined via constructor-based factories. No inline `beforeEach` object literals; always encapsulate setup in dedicated builder functions/classes for reusability and DI.
- Dependency injection: tests obtain dependencies (e.g., mocked SDK, storage providers) via explicit factory parameters to allow substitution per scenario.
- Layered fixtures: base fixture for minimal environment (temp workspace, default config), extended fixtures for specialized scenarios (git repo, multi-agent workflow).
- All fixtures live under `tests/fixtures/` mirroring production module structure. Shared utilities go in `tests/fixtures/shared/`.
- Example pattern:
  ```ts
  class AgentRunnerFixture {
    constructor(private readonly sdk: MockClaudeCodeSDK, private readonly storage: InMemoryBundleStore) {}
    create(options?: Partial<AgentRunnerOptions>): AgentRunner {
      return new AgentRunner({ sdk: this.sdk, storage: this.storage, ...options });
    }
  }
  ```

### 2.3 Test Organization Principles
- Directory structure mirrors production modules. Example:
  ```
  tests/
    core/
      vibeTest.spec.ts
    agent/
      AgentRunner.spec.ts
      ContextManager.spec.ts
    storage/
      RunBundleStore.spec.ts
  ```
- Naming: `<ModuleName>.spec.ts` for unit tests, `<ModuleName>.integration.spec.ts` for cross-module scenarios, `<WorkflowName>.e2e.spec.ts` for end-to-end flows.
- Group tests via `describe` blocks per major responsibility.
- Tests are isolated: no shared mutable state across tests. Use fixture constructors per test or per `describe` with reset hooks.
- Custom matchers live in `tests/matchers/` and are registered in a single setup file `tests/setupMatchers.ts` consumed by Vitest's `setupFiles` configuration.

### 2.4 Scope of Testing
- **Unit tests** validate individual classes/functions using mocks for external dependencies.
- **Integration tests** execute real collaborations within a subsystem (e.g., AgentRunner + ContextManager + storage) while mocking SDK interactions via recorder fixtures.
- **End-to-end (E2E)** tests simulate full workflows (vibeTest + reporters + judge). Limited to critical happy paths due to cost and runtime, but must use recorded SDK sessions to remain deterministic.
- Do not test third-party libraries beyond our integration contracts (e.g., do not re-test Vitest functionality).
- Favor public APIs; private methods are tested indirectly via public behavior unless a private helper encodes crucial logic (documented explicitly below).

### 2.5 Data Management Strategy
- Test data resides under `tests/__fixtures__/`. Subdirectories per subsystem (e.g., `agent-runner/`, `storage/`, `sdk/`).
- SDK recordings are versioned by scenario name and SDK semantic version.
- Git repositories for tests are created via fixtures that initialize temp directories using `simple-git` or shell commands; recorded states stored as bare fixtures when reproducible.
- Snapshot testing permitted for complex HTML reports using deterministic rendering; snapshots stored under `tests/__snapshots__/`. Each snapshot must include version metadata in file header comments.

### 2.6 Quality Gates
- Minimum coverage: 90% statements/branches for core logic (`AgentRunner`, `ContextManager`, storage, judge). 80% minimum for reporters and configuration.
- Performance: E2E suite must complete within 5 minutes locally with recordings (no live API calls). Individual tests target < 5s runtime.
- CI: required jobs include lint (Biome), type-check (tsc --noEmit), unit/integration tests (vitest), and e2e tests (vitest --runInBand with `--config vitest.e2e.config.ts`).
- Tests must fail fast with descriptive errors. Each `Validates` clause should be reflected in the assertion failure message where feasible.

## 3. Claude Code SDK Mocking Strategy

### 3.1 Decision Summary
- **Decision**: Adopt Recorder/Wrapper pattern with versioned fixtures, supplemented by lightweight manual mocks for exceptional cases (Hybrid leaning Recorder-first).
- **Justification**: Provides deterministic, realistic SDK behavior without incurring API costs. Allows replay of complex hook sequences and git interactions required by AgentRunner/ContextManager integration tests. Manual mocks limited to error injection scenarios not easily captured via live recording.
- **Trade-offs**: Initial investment in building recorder infrastructure and maintaining scenario fixtures. Requires tooling to regenerate fixtures when SDK versions change.

### 3.2 Recording Infrastructure
- Recorder resides in `tests/sdk/recorder/` implementing `RecordingClaudeCodeSDK`. It wraps the real SDK during fixture generation via a CLI script (`scripts/record-sdk-scenario.ts`).
- Recording triggered via dedicated npm script `bun run record:sdk --scenario <name> --workspace <path>` which loads scenario definition from `tests/sdk/scenarios/<name>.ts`.
- Recorder intercepts all SDK calls (`start`, `sendMessage`, `watch`, etc.) capturing inputs/outputs sequentially.
- Version tagging: each recording includes SDK version, scenario version (incremented when spec changes), and hash of workspace initial state for consistency validation.

### 3.3 Capture Specification
- **Inputs captured**:
  - Agent configuration (model, temperature, tools, tool config, max tokens).
  - Prompt payloads (user/system messages) and metadata (attachments, content types).
  - Workspace state: file tree listing, git status, current branch, commit hash, dirty files.
  - Test harness config (vibe config overrides, environment variables relevant to SDK).
- **Outputs captured**:
  - Full hook event stream with sequence IDs and timestamps.
  - Tool invocations with inputs and outputs; includes PreToolUse/PostToolUse pairing metadata.
  - File changes produced (path, before, after, patch) and git commit metadata if any.
  - Notifications, errors, abort events, token usage, and cost breakdown.
  - Final RunResult summary as emitted by SDK.
- **Validation**: Recorder verifies all required hooks present; missing data fails recording.

### 3.4 Storage Format
```
tests/__fixtures__/claude-code-sdk/
  scenarios/
    <scenario-name>/
      metadata.json        # sdkVersion, scenarioVersion, workspaceHash, description
      input.json           # agent config, prompt, environment
      workspace.tar.gz     # optional packed workspace state (if needed)
      hooks/
        001-<HookType>.json
        002-<HookType>.json
      output.json          # final run summary, aggregate stats
      assertions.json      # expected derived metrics (token totals, etc.)
```
- Metadata includes checksum to detect fixture drift.
- Hooks stored individually to allow incremental loading during replay for streaming assertions.

### 3.5 Replay Mechanism
- `MockClaudeCodeSDK` implements same interface as real SDK but reads from fixtures.
- Constructor accepts `{ scenario: string, assertInput?: boolean }`. When `assertInput` true, the mock verifies runtime options match recorded `input.json` (deep equality with tolerances for timestamps).
- Streaming watchers: replay mock emits hook events in recorded order, respecting `setTimeout` delays encoded as relative timestamps. Tests can assert asynchronous behavior deterministically.
- Missing scenario: throws descriptive error instructing developer to record scenario.
- Partial matches: if runtime inputs differ (e.g., prompt text change), mock fails fast with diff to avoid silent drift.
- Error injection: manual fixtures extend recorded scenarios by modifying hook stream or metadata; stored under `tests/__fixtures__/claude-code-sdk/manual/` with explicit documentation.

### 3.6 Scenario Library
Core scenarios to record:
1. `simple-file-edit`
2. `multi-file-refactor`
3. `git-commit-workflow`
4. `error-correction-loop`
5. `multi-agent-workflow`
6. `tool-usage-shell`
7. `file-deletion`
8. `large-change-100-files`
9. `cost-budget-enforced`
10. `todo-completion`
11. `hook-failure-recovery`
12. `session-timeout`

Each scenario specification documents initial workspace, agent prompt, expected outputs, and maintenance owner.

### 3.7 Implementation Guidance
- Recorder CLI uses TypeScript + Bun script, orchestrates workspace cloning and cleanup.
- Provide abstract base `ClaudeCodeScenario` with hooks for `setupWorkspace`, `buildPrompt`, `assertResults` to encourage consistency.
- When SDK updates break fixtures, run `bun run record:sdk --all` to regenerate; diffs must be reviewed and approved.

## 4. Test Inventory

### 4.1 Core Test Infrastructure

#### Module: vibeTest
**Location**: `src/testing/vibeTest.ts`
**Dependencies**: Vitest `test`, fixture system, `vibeWorkflow`
**Complexity**: Medium

##### Test Coverage Strategy
- **Unit Tests**: 6
  - Focus: fixture registration, context lifecycle, error wrapping, reporter notification.
  - Mocking: spy wrappers for Vitest `test`, stub reporters, fake workflow.
  - Fixtures: `TestContextFixture`, `ReporterSpyFixture`.
- **Integration Tests**: 2
  - Focus: interplay with `vibeWorkflow` and reporters using recorded SDK scenario.
  - Real dependencies: actual workflow logic, reporters running in-memory.
  - Fixtures: `simple-file-edit` scenario, HTML reporter stub.
- **E2E Tests**: Covered by Workflow System.

##### Test Scaffolds

###### describe('vibeTest - context lifecycle')
- **`it('provides a fresh VibeTestContext per test invocation')`**
  - **Validates**: Ensures no state leakage between tests.
  - **Fixtures**: `createTestContextFixture()` returning unique `Symbol` each call.
  - **Setup**: Invoke `vibeTest` twice with unique callbacks; capture contexts from fixture.
  - **Edge cases**: Run sequential synchronous tests.
  - **Pass criteria**: contexts have different IDs and empty cumulative state arrays.

- **`it('merges user-defined fixtures respecting override precedence')`**
  - **Validates**: `vibeTest` extends base fixtures with user-provided overrides while preserving defaults.
  - **Fixtures**: Base fixture adds `context.base = true`; override adds `context.override = 42` and modifies config.
  - **Edge cases**: asynchronous fixture returning Promise.
  - **Pass criteria**: final context includes both fields and config override.

###### describe('vibeTest - error handling')
- **`it('wraps thrown errors with VibeTestError metadata')`**
  - **Validates**: thrown errors include `cause` and `testTitle` per spec.
  - **Fixtures**: failing test body that throws `new Error('boom')`.
  - **Pass criteria**: captured error instance of `VibeTestError`, `cause.message === 'boom'`.

- **`it('notifies reporters on failure before propagating error')`**
  - **Validates**: even when test fails, reporters receive failure summary.
  - **Fixtures**: Reporter spy collecting `onTestEnd` arguments.
  - **Pass criteria**: reporter invoked with `{ status: 'failed', error }` prior to rejection.

###### describe('vibeTest - workflow integration')
- **`it('delegates stage execution to vibeWorkflow with constructed plan')`**
  - **Validates**: `vibeWorkflow` called once per test with context and stage definitions.
  - **Fixtures**: Spy on workflow export, provide stub result.
  - **Pass criteria**: recorded call contains stage definitions from test body.

- **`it('propagates workflow result to reporters on success')`**
  - **Validates**: success path publishes `RunResult` to all reporters.
  - **Fixtures**: Fake workflow returning `RunResult` stub, reporter spy.
  - **Pass criteria**: reporter receives same `RunResult` instance.

#### Module: vibeWorkflow
**Location**: `src/testing/vibeWorkflow.ts`
**Dependencies**: Stage planner, AgentRunner, ContextManager, reporters
**Complexity**: High

##### Test Coverage Strategy
- **Unit Tests**: 7
  - Focus: stage sequencing, retry loops, `until()` semantics, reporter notifications.
  - Mocking: stub AgentRunner returning synthetic executions, stub reporters.
- **Integration Tests**: 3
  - Focus: multi-stage workflow with recorded SDK verifying cross-stage context and watchers.
  - Real dependencies: actual AgentRunner + ContextManager with recorded scenarios.
- **E2E Tests**: 1 (workflow happy path) delegated to section 4.10.

##### Test Scaffolds

###### describe('vibeWorkflow - stage sequencing')
- **`it('executes stages in declared order even when promises resolve out of order')`**
  - **Validates**: ensures sequential execution guarantee.
  - **Fixtures**: Stage fixtures returning `Promise` with controlled delays.
  - **Pass criteria**: execution log array equals stage order.

- **`it('respects stage dependency blocks and skips gated stages when predicate false')`**
  - **Validates**: gating logic prevents stage execution when condition fails.
  - **Fixtures**: Stage definitions with `shouldRun` predicate.
  - **Pass criteria**: gated stage not executed, log includes skip reason.

###### describe('vibeWorkflow - until() helper')
- **`it('terminates loop when predicate satisfied mid-iteration')`**
  - **Validates**: `until()` stops scheduling additional runs.
  - **Fixtures**: Stage using `until()` with iteration counter.
  - **Edge cases**: predicate true on first iteration.
  - **Pass criteria**: no extra iterations executed, context indicates `completionReason: 'predicate-met'`.

- **`it('emits iteration history when predicate never satisfied within maxIterations')`**
  - **Validates**: ensures fallback exit reason captured.
  - **Pass criteria**: result contains `maxIterationsReached: true`.

###### describe('vibeWorkflow - error handling')
- **`it('aborts remaining stages after first failure and records failure stage')`**
  - **Validates**: failure short-circuits execution and logs metadata.
  - **Fixtures**: Stage that throws error, reporter spy.
  - **Pass criteria**: subsequent stages not executed, reporter receives failure with stage name.

- **`it('propagates partial RunResult to reporters when AgentRunner emits partial data')`**
  - **Validates**: ensures partial results forwarded on error.
  - **Fixtures**: AgentRunner stub returning partial result flag.
  - **Pass criteria**: reporter receives `hookCaptureStatus: 'partial'`.

###### describe('vibeWorkflow - integration')
- **`it('accumulates cross-stage context state using recorded multi-agent-workflow scenario')`**
  - **Validates**: ensures context shares file/tool state.
  - **Fixtures**: `multi-agent-workflow` scenario, real ContextManager.
  - **Pass criteria**: final context file list equals union of stage outputs.

- **`it('invokes watchers sequentially via AgentExecution.watch hooks')`**
  - **Validates**: watchers triggered in order recorded scenario requires.
  - **Fixtures**: recorded scenario with watchers, spy watchers capturing timestamps.
  - **Pass criteria**: watchers log sequential order; no overlapping execution.

- **`it('produces final RunResult aggregated from stage results')`**
  - **Validates**: aggregated metrics (cost, tokens, duration) match fixture assertions.
  - **Pass criteria**: final result equals `assertions.json` content.

#### Module: Test Context & Fixtures
**Location**: `src/testing/context.ts`
**Dependencies**: AgentRunner, ContextManager, storage
**Complexity**: Medium

##### Test Coverage Strategy
- **Unit Tests**: 5
  - Focus: context construction, state accumulation, helper APIs, disposal.
- **Integration Tests**: 2
  - Focus: context with real AgentRunner + recorded SDK scenario.

##### Test Scaffolds

###### describe('TestContext - construction')
- **`it('creates AgentRunner and ContextManager instances per test')`**
  - **Validates**: ensures each test gets unique runner/manager pair.
  - **Fixtures**: `AgentRunnerFixture`, `ContextManagerFixture` with spies.
  - **Pass criteria**: spies confirm constructor invoked per test.

- **`it('applies configuration overrides when provided via vibeTest options')`**
  - **Validates**: ensures context merges user config.
  - **Fixtures**: Provide overrides for model/cost, assert runner receives them.
  - **Pass criteria**: runner invoked with override values.

###### describe('TestContext - state management')
- **`it('tracks cumulative file changes across multiple runAgent calls')`**
  - **Validates**: `context.files` grows cumulatively.
  - **Fixtures**: recorded scenario executed twice with distinct outputs.
  - **Pass criteria**: `context.files` length equals sum of runs, includes deduplicated entries.

- **`it('exposes helper getRun(index) retrieving stored results')`**
  - **Validates**: ensures accessor returns run metadata and results.
  - **Edge cases**: negative index -> last run.
  - **Pass criteria**: correct run returned, throws RangeError for invalid index.

- **`it('clears state when context.dispose() invoked')`**
  - **Validates**: ensures memory cleanup after test.
  - **Pass criteria**: arrays emptied, watchers unsubscribed.

###### describe('TestContext - integration')
- **`it('integrates with AgentRunner to execute recorded scenario')`**
  - **Validates**: context-runner pipeline works end-to-end.
  - **Fixtures**: `simple-file-edit` scenario.
  - **Pass criteria**: run result stored in context, watchers invoked.

- **`it('propagates judge() calls to Judge system with defaults')`**
  - **Validates**: ensures `context.judge` delegates correctly.
  - **Fixtures**: stub judge returning predetermined result.
  - **Pass criteria**: judge invoked with RunResult from last run.

#### Module: Custom Matchers
**Location**: `tests/matchers/*.ts`
**Complexity**: Low-Medium

##### Test Coverage Strategy
- **Unit Tests**: 4 per matcher verifying pass/fail behavior and error messages.
- **Integration Tests**: 1 shared test ensuring matchers register via `setupMatchers`.

##### Matchers

###### toHaveCompleteHookData
- **`it('passes when RunResult.hookCaptureStatus === "complete" and all hooks present')`**
  - **Fixtures**: RunResult fixture from `simple-file-edit`.
  - **Pass criteria**: matcher returns `{ pass: true }`.
- **`it('fails with diff highlighting missing hooks')`**
  - **Fixtures**: Partial RunResult missing PostToolUse hook.
  - **Pass criteria**: message lists missing hook IDs.

###### toMatchRunResult
- Validate tolerance for timestamps, ensures deep equality with metadata.

###### toRespectCostBudget
- Validate passes when `result.cost.total <= budget`, fails with message when exceeded using `cost-budget-enforced` scenario.

### 4.2 Agent Runner & Context Manager

#### Module: AgentRunner
**Location**: `src/agent/AgentRunner.ts`
**Dependencies**: Claude Code SDK bridge, ContextManager, storage, git utilities
**Complexity**: High

##### Test Coverage Strategy
- **Unit Tests**: 10
  - Focus: SDK invocation, hook routing, cost enforcement, retry logic, storage interaction.
  - Mocking: `MockClaudeCodeSDK`, stub storage implementing `RunBundleStore` interface.
  - Fixtures: `AgentRunnerFixture`, manual error scenarios.
- **Integration Tests**: 5
  - Focus: Run with real ContextManager and storage using recorded scenarios.
  - Real dependencies: ContextManager, RunBundleStore writing to temp dir.
  - Fixtures: `simple-file-edit`, `multi-file-refactor`, `cost-budget-enforced`, `hook-failure-recovery`, `session-timeout`.
- **E2E Tests**: Covered by workflow.

##### Unit Test Scaffolds

###### describe('AgentRunner - SDK invocation')
- **`it('constructs SDK client with resolved configuration defaults')`**
  - **Validates**: ensures model defaults and environment overrides applied before calling SDK.
  - **Fixtures**: Runner fixture with config overrides.
  - **Pass criteria**: `MockClaudeCodeSDK.start` called with expected config.

- **`it('streams prompt iterable to SDK without buffering')`**
  - **Validates**: ensures async generator forwarded as-is.
  - **Fixtures**: generator spy that records consumption order.
  - **Pass criteria**: generator consumed lazily, each chunk forwarded sequentially.

###### describe('AgentRunner - hook routing')
- **`it('emits hook events to ContextManager.processHookEvent in order received')`**
  - **Validates**: preserves hook ordering.
  - **Fixtures**: Mock SDK emitting hooks; ContextManager spy capturing sequence.
  - **Pass criteria**: spy invocation order equals fixture order.

- **`it('marks hookCaptureStatus partial when PostToolUse missing')`**
  - **Validates**: error path sets status correctly.
  - **Fixtures**: Manual mock scenario missing PostToolUse.
  - **Pass criteria**: RunResult has `hookCaptureStatus: 'partial'` and warning logged.

###### describe('AgentRunner - storage interaction')
- **`it('writes RunBundle to storage upon completion')`**
  - **Validates**: ensures storage `save` invoked with run metadata.
  - **Fixtures**: Stub storage verifying call.
  - **Pass criteria**: `save` called once with matching result ID.

- **`it('handles storage failure by emitting warning and continuing if config allows')`**
  - **Validates**: graceful degradation path.
  - **Fixtures**: storage stub throwing `DiskFullError`, config `ignoreStorageErrors = true`.
  - **Pass criteria**: run resolves with warning recorded; error logged but not thrown.

###### describe('AgentRunner - cost enforcement')
- **`it('throws CostBudgetExceededError when projected cost exceeds budget before run')`**
  - **Validates**: preflight budget check triggered.
  - **Fixtures**: config with low budget, cost estimator returning high cost.
  - **Pass criteria**: run rejects with error containing `budget` and `projectedCost`.

- **`it('accumulates token usage from hook stream to enforce runtime budget')`**
  - **Validates**: ensures tokens aggregated from hooks.
  - **Fixtures**: Mock hooks with token counts exceeding budget mid-run.
  - **Pass criteria**: run aborts with budget error, partial result saved.

###### describe('AgentRunner - error handling')
- **`it('translates SDK timeout into RunAbortedError with metadata')`**
  - **Validates**: ensures specific error type thrown on timeout.
  - **Fixtures**: Manual mock raising timeout event.
  - **Pass criteria**: rejection instance includes `reason: 'timeout'`.

- **`it('retries transient SDK errors according to retry policy')`**
  - **Validates**: ensures exponential backoff with limited attempts.
  - **Fixtures**: SDK stub failing twice before succeeding; time mocked.
  - **Pass criteria**: `start` called expected number of times, backoff intervals recorded.

##### Integration Test Scaffolds

###### describe('AgentRunner integration - recorded scenarios')
- **`it('produces RunResult matching simple-file-edit fixture')`**
  - **Validates**: ensures full run matches recorded output.
  - **Fixtures**: Mock SDK replaying `simple-file-edit`, real ContextManager & storage (temp dir).
  - **Pass criteria**: RunResult equals fixture assertions (diff, hooks, cost).

- **`it('captures multi-file diffs for multi-file-refactor scenario')`**
  - **Validates**: ensures diff aggregation works for multiple files.
  - **Pass criteria**: stored bundle contains all file diffs, indexes consistent.

- **`it('enforces cost budget during cost-budget-enforced scenario')`**
  - **Validates**: ensures run aborts when budget hit mid-stream.
  - **Pass criteria**: RunResult flagged partial, error recorded.

- **`it('recovers from missing hook via graceful degradation in hook-failure-recovery scenario')`**
  - **Validates**: ensures warnings recorded and run continues.
  - **Pass criteria**: `hookCaptureStatus === 'partial'`, warning log entry.

- **`it('handles session timeout by emitting partial result and abort reason')`**
  - **Validates**: ensures run stops cleanly, watchers notified.
  - **Pass criteria**: RunResult includes `abortReason: 'session-timeout'`.

#### Module: ContextManager
**Location**: `src/agent/ContextManager.ts`
**Dependencies**: Hook processor, storage, watchers
**Complexity**: High

##### Test Coverage Strategy
- **Unit Tests**: 9
  - Focus: hook processing, state tracking, watcher execution, partial result snapshots.
- **Integration Tests**: 4
  - Focus: interplay with AgentRunner, storage, and workflow watchers using recorded scenarios.

##### Unit Test Scaffolds

###### describe('ContextManager - state tracking')
- **`it('initializes empty state for files, tools, timeline')`**
  - **Validates**: ensures baseline state matches spec defaults.
  - **Fixtures**: new ContextManager instance.
  - **Pass criteria**: arrays empty, statuses `idle`.

- **`it('accumulates file changes with deduplicated paths')`**
  - **Validates**: ensures repeated updates merge properly.
  - **Fixtures**: feed multiple FileEdit hooks referencing same path.
  - **Pass criteria**: final state contains one entry with latest change set.

###### describe('ContextManager - processHookEvent')
- **`it('correlates PreToolUse and PostToolUse events into ToolCall record')`**
  - **Validates**: ensures correlation map keyed by toolInvocationId.
  - **Fixtures**: pair of hooks with shared ID.
  - **Pass criteria**: tool call recorded with combined input/output.

- **`it('handles orphan PostToolUse by logging warning and flagging gap')`**
  - **Validates**: ensures missing pre-hook recorded as anomaly.
  - **Fixtures**: PostToolUse without preceding Pre; logging spy.
  - **Pass criteria**: warning emitted, tool call flagged `orphan: true`.

- **`it('queues hook payloads for lazy storage hydration')`**
  - **Validates**: ensures hook data persisted for later retrieval.
  - **Fixtures**: feed hook event, inspect queue.
  - **Pass criteria**: queue contains serialized payload referencing storage path.

###### describe('ContextManager - watchers')
- **`it('executes watchers sequentially with awaited completion')`**
  - **Validates**: watchers awaited before next invoked.
  - **Fixtures**: register watchers pushing to log with delays.
  - **Pass criteria**: log order matches registration order, durations additive.

- **`it('allows watcher to request abort, halting further processing')`**
  - **Validates**: ensures `return { abort: true }` stops run.
  - **Fixtures**: watcher returning abort; spy verifying `abortController.abort()` invoked.
  - **Pass criteria**: run aborted, subsequent watchers not called.

###### describe('ContextManager - partial results')
- **`it('getPartialResult returns snapshot of current state without mutating original')`**
  - **Validates**: ensures copy semantics.
  - **Fixtures**: feed hooks, call `getPartialResult` mid-run.
  - **Pass criteria**: returned object equals expected subset, original state still mutable.

- **`it('reset() clears stored hooks and metrics')`**
  - **Validates**: ensures context reusable.
  - **Pass criteria**: state arrays empty, watchers list preserved.

- **`it('processHookEvent handles error gracefully and records degradation status')`**
  - **Validates**: ensures catch block updates `hookCaptureStatus` to `failed`.
  - **Fixtures**: hook causing JSON parse error.
  - **Pass criteria**: status updated, error logged.

##### Integration Test Scaffolds

- **`it('aggregates timeline and tool calls from simple-file-edit scenario')`**
  - **Validates**: ensures recorded hooks produce expected timeline.
  - **Pass criteria**: timeline length matches fixture, tool call details correct.

- **`it('preserves watcher order with real AgentRunner and watchers')`**
  - **Validates**: watchers triggered sequentially.
  - **Pass criteria**: watchers log expected order/time.

- **`it('produces partial RunResult for hook-failure-recovery scenario')`**
  - **Validates**: ensures partial status recorded.
  - **Pass criteria**: partial result matches `assertions.json`.

- **`it('supports multi-stage accumulation across workflow integration test')`**
  - **Validates**: ensures state persists across stage boundaries.
  - **Pass criteria**: context state accessible to workflow after each stage.

#### Module: Hook Capture System
**Location**: `src/agent/hooks/`
**Dependencies**: ContextManager, storage
**Complexity**: Medium

- **Unit Tests**: Validate hook schema parsing, correlation IDs, deduping.
- **Integration Tests**: Combined with ContextManager & AgentRunner verifying `hookCaptureStatus` transitions and timeline ordering.

#### Module: RunResult Population
- Integration tests ensuring aggregated metrics (cost, tokens, watchers) match fixture expectations and `RunResult` fields populate per spec.

### 4.3 Storage System

#### Module: RunBundle Disk Storage
**Location**: `src/storage/RunBundleStore.ts`
**Dependencies**: filesystem, path utilities
**Complexity**: Medium

##### Strategy
- **Unit Tests**: 8
  - Focus: path generation, serialization, metadata integrity, concurrency protection.
- **Integration Tests**: 3
  - Focus: storing from AgentRunner, retrieving via lazy loader, cleanup.

##### Unit Test Scaffolds

###### describe('RunBundleStore - persistence')
- **`it('writes RunResult bundle with deterministic directory structure')`**
  - **Validates**: ensures path format `<timestamp>-<runId>`.
  - **Fixtures**: temp dir fixture.
  - **Pass criteria**: file exists at expected path with metadata.

- **`it('stores attachments using content hashes to prevent duplication')`**
  - **Validates**: ensures deduped storage.
  - **Fixtures**: multiple attachments with identical content.
  - **Pass criteria**: only one file stored, references reused.

- **`it('persists tool call transcripts as JSON with schema validation')`**
  - **Validates**: ensures stored JSON matches schema.
  - **Pass criteria**: `zod` validation passes.

###### describe('RunBundleStore - resilience')
- **`it('throws descriptive error when disk quota exceeded')`**
  - **Fixtures**: mock fs `write` to throw ENOSPC.
  - **Pass criteria**: error message includes suggested cleanup command.

- **`it('supports concurrent save operations via mutex')`**
  - **Validates**: ensures file writes serialized.
  - **Fixtures**: spawn parallel saves, verify no race.

- **`it('records bundle index entry for fast lookup')`**
  - **Validates**: ensures index file updated.
  - **Pass criteria**: index includes new entry with metadata.

###### describe('RunBundleStore - cleanup')
- **`it('deletes bundles older than maxAgeDays when cleanup invoked')`**
  - **Fixtures**: create bundles with backdated timestamps.
  - **Pass criteria**: old bundle removed, new retained.

- **`it('respects .vibe-keep marker to skip deletion')`**
  - **Pass criteria**: kept bundle remains even if old.

##### Integration Tests
- `it('saves RunResult from AgentRunner integration and reloads successfully')`
- `it('lazy loads file contents on-demand using text()/stream() API')`
- `it('cleanup triggered automatically when disk threshold below minFreeDiskMb')`

#### Module: Content-Addressed File Storage
**Location**: `src/storage/contentStore.ts`
**Complexity**: Medium

- **Unit Tests**: 5 verifying hashing, deduping, binary streaming, error on missing file, caching.
- **Integration Tests**: 1 verifying interplay with RunBundleStore retrieving large file via stream.

#### Module: Lazy Loading Mechanism
- **Unit Tests**: 4 verifying `text()` caching, `stream()` single-use, error messages.
- **Integration Tests**: 1 verifying with recorded scenario retrieving diff lazily.

#### Module: Cleanup Policies
- **Unit Tests**: 3 verifying policy evaluation, manual cleanup API, event logging.
- **Integration Tests**: 1 verifying CLI `cleanupBundles` respects `.vibe-keep` and concurrency lock.

### 4.4 Judge System

#### Module: Rubric Validation (Zod)
**Location**: `src/judge/rubric.ts`
**Complexity**: Medium

##### Strategy
- **Unit Tests**: 6 verifying schema acceptance/rejection.
- **Integration Tests**: 1 verifying serialization to JSON schema for docs.

##### Unit Test Scaffolds
- `it('accepts rubric with criteria array and optional passThreshold')`
- `it('rejects rubric missing name field with descriptive error path')`
- `it('rejects criteria lacking id/description')`
- `it('supports custom criteria objects via zod passthrough')`
- `it('enforces passThreshold between 0 and 1 inclusive')`
- `it('normalizes rubric defaults when unspecified')`

#### Module: LLM Judge Execution
**Location**: `src/judge/judge.ts`
**Complexity**: High

- **Unit Tests**: 5
  - Validate prompt construction, result parsing, error mapping, `throwOnFail` semantics.
- **Integration Tests**: 3 using recorded scenarios `judge-happy-path`, `judge-fail`, `judge-malformed-response`.
- **E2E**: Verified via workflow E2E when judge invoked post-run.

##### Key Tests
- `it('formats prompt with rubric criteria bullet list matching spec ordering')`
- `it('passes resultFormat to zod parser enforcing output shape')`
- `it('returns structured result with scores and reasoning')`
- `it('throws JudgmentFailedError when response missing required fields')`
- `integration: it('evaluates RunResult via recorded judge-happy-path and returns passing judgment')`
- `integration: it('handles failing rubric by returning failure result when throwOnFail=false')`

#### Module: JudgeResult Handling
- **Unit Tests**: 4 verifying default result merging, attachments, cost recording.

### 4.5 Reporters

#### Module: Terminal Cost Reporter
**Location**: `src/reporters/TerminalCostReporter.ts`
**Complexity**: Medium

##### Strategy
- **Unit Tests**: 5 verifying formatting, rounding, color usage, streaming updates.
- **Integration Tests**: 1 ensuring events triggered from workflow produce expected log (snapshot with ANSI stripped).

##### Test Scaffolds
- `it('renders cost summary with two decimal places and currency symbol')`
- `it('omits zero-cost categories from output')`
- `it('colors warnings when budget exceeded')`
- `it('supports incremental updates via onCostUpdate hook')`
- `integration: it('matches snapshot for multi-stage run cost output')`

#### Module: HTML Reporter
**Location**: `src/reporters/HtmlReporter.ts`
**Complexity**: Medium-High

- **Unit Tests**: 6 verifying template rendering, asset bundling, navigation.
- **Integration Tests**: 2 generating report for `simple-file-edit` and `multi-stage` scenarios; snapshot HTML (with stable IDs) and verify asset files created.

#### Module: Report Generation & Artifacts
- **Unit Tests**: 4 verifying artifact manifest, zipped bundles, relative paths.
- **Integration Tests**: 1 verifying zipped artifact includes attachments and reporter assets.

### 4.6 Matrix Testing (`defineTestSuite`)
**Location**: `src/testing/matrix.ts`
**Complexity**: Medium

- **Unit Tests**: 6 verifying cartesian product generation, parameter validation, label formatting, asynchronous dimension support.
- **Integration Tests**: 1 verifying generated tests register with Vitest using dynamic dimensions and respect skip/only flags.

### 4.7 Configuration (`defineVibeConfig`)
**Location**: `src/config/defineVibeConfig.ts`
**Complexity**: Medium

- **Unit Tests**: 7 verifying default merging, environment overrides, schema validation, workspace precedence, CLI overrides.
- **Integration Tests**: 2 verifying config applied to AgentRunner and reporters in workflow integration test.

### 4.8 File Change Tracking
**Location**: `src/git/`
**Complexity**: Medium-High

- **Unit Tests**: 8 verifying git detection, diff parsing, binary file fallback, submodule detection, non-git fallback.
- **Integration Tests**: 3 verifying diffs recorded in RunResult for `git-commit-workflow`, `file-deletion`, `large-change-100-files` scenarios.

### 4.9 Tool Call Processing
**Location**: `src/agent/tooling.ts`
**Complexity**: Medium

- **Unit Tests**: 7 verifying Pre/Post correlation, nested tool calls, duration computation, error classification.
- **Integration Tests**: 2 verifying timeline correctness using recorded `tool-usage-shell` and `error-correction-loop` scenarios.

### 4.10 Workflow System
**Location**: `src/workflow/`
**Complexity**: High

- **Unit Tests**: 8 verifying stage definitions, metadata propagation, concurrency restrictions, stage result merging, hooks for before/after stage.
- **Integration Tests**: 3 verifying cross-stage context, watchers, and stage failure recovery.
- **E2E Tests**: 1 `workflow-happy-path.e2e.spec.ts`
  - **Validates**: full workflow from vibeTest invocation through AgentRunner, ContextManager, reporters, judge using `multi-agent-workflow` scenario.
  - **Journey**: start with config load, run stages, capture hooks, judge result, generate report.
  - **Pass criteria**: All modules invoked successfully, outputs match fixture expectations, cost within budget.

### 4.11 Error Handling
**Location**: `src/errors/`
**Complexity**: Medium

- **Unit Tests**: 6 verifying custom error classes (RunAbortedError, CostBudgetExceededError, StorageError) include metadata and serialization.
- **Integration Tests**: 3 injecting failures (storage failure, hook failure, SDK timeout) verifying graceful degradation policy executed.

### 4.12 Performance & Cost Tracking
**Location**: `src/metrics/`
**Complexity**: Medium

- **Unit Tests**: 6 verifying token counting, cost calculation, rounding, currency conversion, cost budget evaluation.
- **Integration Tests**: 2 verifying aggregated metrics from recorded scenarios (`large-change-100-files`, `cost-budget-enforced`).

## 5. Architecture Decisions

### Decision 1: Claude Code SDK Mocking Strategy
- **Decision**: Recorder-first hybrid mocking with versioned fixtures.
- **Date**: 2025-10-07
- **Rationale**: Realistic deterministic data critical for validating complex hook/timeline behavior; manual mocks insufficient.
- **Trade-offs**: Fixture maintenance overhead, initial infra cost.
- **Alternatives considered**: Pure manual mocks (rejected due to drift risk), live SDK in tests (rejected due to cost/flakiness).

### Decision 2: Fixture Architecture Pattern
- **Decision**: Constructor-based fixture factories with explicit dependency injection.
- **Rationale**: Promotes reusability and deterministic setup for LLM-generated code.
- **Examples**: `AgentRunnerFixture`, `ContextManagerFixture`, `ReporterFixture` classes.
- **Guidelines**: No inline fixtures; provide `.withOverrides()` builder pattern for variations.

### Decision 3: Test Organization Structure
- **Decision**: Mirror production directories under `tests/`, segregate unit/integration/e2e via filename suffixes.
- **Rationale**: Simplifies navigation, enforces consistency with spec sections.
- **Structure**:
  ```
  tests/
    agent/
      AgentRunner.spec.ts
      AgentRunner.integration.spec.ts
    storage/
      RunBundleStore.spec.ts
    workflow/
      vibeWorkflow.spec.ts
      workflow-happy-path.e2e.spec.ts
  ```

### Decision 4: Snapshot Usage
- **Decision**: Allow snapshot tests only for HTML and terminal output with deterministic fixtures.
- **Rationale**: Minimizes fragile snapshots; ensures textual outputs validated comprehensively.

### Decision 5: Coverage Gates
- **Decision**: Enforce 90%/80% coverage thresholds with module-level tracking.
- **Rationale**: Ensures high confidence in mission-critical modules without overburdening ancillary code.

### Decision 6: SDK Scenario Versioning
- **Decision**: Tag fixtures with SDK version + scenario version; enforce check during replay.
- **Rationale**: Prevents silent drift when SDK updates occur.

## 6. Implementation Roadmap

1. **Establish Fixture Infrastructure**
   - Implement base fixtures (workspace, SDK mock, storage) and register custom matchers.
   - Record baseline SDK scenarios (`simple-file-edit`, `multi-file-refactor`).
2. **Core Unit Tests**
   - Start with `AgentRunner`, `ContextManager`, storage modules to secure foundation.
   - Implement matcher tests to support subsequent modules.
3. **Integration Tests**
   - Compose AgentRunner + ContextManager with recorded scenarios.
   - Add workflow-level tests ensuring stage sequencing and watchers.
4. **Judge & Reporter Tests**
   - After core agent flows stable, implement judge tests (requires scenario recordings) and reporter snapshots.
5. **Matrix, Config, Tooling**
   - Write tests for configuration, matrix suite utilities, tool call processing.
6. **E2E Workflow Test**
   - Combine modules into `workflow-happy-path.e2e.spec.ts` verifying entire pipeline.
7. **Error & Performance Suites**
   - Add failure injection tests using manual SDK fixtures and metrics validation.
8. **Finalize Coverage & CI**
   - Ensure coverage gates met, integrate with CI config.

## 7. Maintenance & Evolution

- Review this spec quarterly or upon major SDK release.
- When new features added to technical spec, extend this document first.
- Fixture regeneration protocol:
  1. Update scenario definition.
  2. Run recorder script.
  3. Review diffs in fixtures.
  4. Update tests referencing fixtures.
- Keep Appendix C coverage matrix up to date with actual coverage metrics from CI.

---

## Appendices

### Appendix A: Fixture Reference
- `createWorkspaceFixture(options)`: sets up temp workspace with optional git repo.
- `createAgentRunnerFixture({ scenario })`: returns AgentRunner configured with MockClaudeCodeSDK for scenario.
- `createContextManagerFixture()`: wires storage + watchers.
- `createReporterFixtures()`: returns terminal/html reporter spies.
- `createJudgeScenarioFixture(name)`: loads judge SDK fixture and provides RunResult stub.

### Appendix B: Test Naming Conventions
- `describe('<Module> - <Aspect>')`
- `it('should <behavior>')` for happy paths.
- `it('fails when <condition>')` for negative tests.
- Use `scenario: <name>` prefix for data-driven integration tests.
- Include `Validates` comment within test describing guarantee.

### Appendix C: Coverage Requirements Matrix
| Module | Coverage % | Rationale |
| --- | --- | --- |
| AgentRunner | 90 | High complexity, core workflow |
| ContextManager | 90 | Stateful, orchestrates hooks |
| Storage System | 90 | Persistence integrity critical |
| Judge System | 85 | LLM evaluation reliability |
| Reporters | 80 | Presentation layer |
| Configuration | 80 | Fewer branches |
| Matrix Testing | 85 | Generates dynamic tests |
| Workflow System | 90 | Governs overall execution |
| Error Handling | 90 | Guarantees graceful degradation |
| Performance/Cost | 85 | Financial safeguards |

