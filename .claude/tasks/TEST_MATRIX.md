# Vibe-Check Test Coverage Matrix

**Last Updated**: 2025-10-07
**Overall Coverage**: 0%

---

## Coverage Targets

- 🎯 **Core modules**: ≥95% coverage
- 🎯 **Supporting modules**: ≥90% coverage
- 🎯 **Utility modules**: ≥85% coverage

## Performance Targets

- ⚡ **Unit test suite**: ≤45s
- ⚡ **Integration suite**: ≤90s
- ⚡ **E2E recorder suite**: ≤5min

---

## Test Coverage by Module

| Module | Unit Tests | Integration Tests | E2E Tests | Coverage | Status |
|--------|------------|-------------------|-----------|----------|--------|
| **Phase 1: Kernel** | | | | | |
| `src/types/` | 0/5 | - | - | 0% | 🔜 |
| `src/schemas/` | 0/8 | - | - | 0% | 🔜 |
| `src/utils/correlation` | 0/10 | - | - | 0% | 🔜 |
| `src/utils/hash` | 0/5 | - | - | 0% | 🔜 |
| `src/utils/ndjson` | 0/6 | - | - | 0% | 🔜 |
| `src/utils/git` | 0/4 | - | - | 0% | 🔜 |
| `src/sdk/bridge` | 0/8 | 0/3 | - | 0% | 🔜 |
| **Phase 2: Ring 1** | | | | | |
| `src/storage/RunBundleStore` | 0/15 | 0/8 | - | 0% | 🔜 |
| `src/storage/contentStore` | 0/12 | 0/5 | - | 0% | 🔜 |
| `src/storage/lazyFile` | 0/10 | 0/4 | - | 0% | 🔜 |
| `src/storage/cleanup` | 0/8 | 0/3 | - | 0% | 🔜 |
| `src/agent/AgentRunner` | 0/20 | 0/10 | 0/5 | 0% | 🔜 |
| `src/agent/ContextManager` | 0/18 | 0/8 | - | 0% | 🔜 |
| `src/agent/hooks/capture` | 0/12 | 0/6 | - | 0% | 🔜 |
| `src/agent/hooks/processor` | 0/15 | 0/5 | - | 0% | 🔜 |
| `src/agent/AgentExecution` | 0/10 | 0/4 | - | 0% | 🔜 |
| `src/git/captureGitState` | 0/8 | - | - | 0% | 🔜 |
| `src/git/generateDiff` | 0/6 | - | - | 0% | 🔜 |
| `src/git/detectChanges` | 0/7 | - | - | 0% | 🔜 |
| **Phase 3: Ring 2** | | | | | |
| `src/testing/vibeTest` | 0/15 | 0/12 | 0/5 | 0% | 🔜 |
| `src/testing/context` | 0/12 | - | - | 0% | 🔜 |
| `src/testing/stateAccumulator` | 0/10 | - | - | 0% | 🔜 |
| `src/testing/vibeWorkflow` | 0/18 | 0/10 | 0/5 | 0% | 🔜 |
| `src/testing/workflowContext` | 0/14 | - | - | 0% | 🔜 |
| `src/testing/stageManager` | 0/12 | - | - | 0% | 🔜 |
| `src/testing/until` | 0/8 | - | - | 0% | 🔜 |
| `src/testing/matchers/*` (8 matchers) | 0/40 | - | - | 0% | 🔜 |
| `src/agent/watchers` | 0/15 | 0/6 | - | 0% | 🔜 |
| **Phase 4: Ring 3** | | | | | |
| `src/judge/judge` | 0/12 | 0/8 | 0/5 | 0% | 🔜 |
| `src/judge/rubric` | 0/10 | - | - | 0% | 🔜 |
| `src/judge/prompts` | 0/8 | - | - | 0% | 🔜 |
| `src/judge/parser` | 0/12 | - | - | 0% | 🔜 |
| `src/reporters/TerminalCostReporter` | 0/10 | 0/5 | - | 0% | 🔜 |
| `src/reporters/HtmlReporter` | 0/18 | 0/8 | - | 0% | 🔜 |
| **Phase 5: Ring 4** | | | | | |
| `src/matrix/defineTestSuite` | 0/12 | 0/6 | - | 0% | 🔜 |
| `src/matrix/product` | 0/8 | - | - | 0% | 🔜 |
| `src/config/defineVibeConfig` | 0/10 | 0/4 | - | 0% | 🔜 |
| `src/config/validation` | 0/8 | - | - | 0% | 🔜 |

**Legend**: 🔜 Not Started | 🚧 In Progress | ✅ Complete | ⚠️ Below Target | 🎯 Meets Target

---

## Test Types

### Unit Tests
**Purpose**: Test individual functions/classes in isolation
**Location**: `tests/unit/`
**Mocking**: Mock all external dependencies (SDK, filesystem, git)
**Coverage Target**: ≥95% for core, ≥90% for supporting, ≥85% for utility

### Integration Tests
**Purpose**: Test 2-3 modules working together
**Location**: `tests/integration/`
**Mocking**: Mock external systems (SDK, filesystem may be real in test env)
**Coverage Target**: All critical paths

### E2E Tests
**Purpose**: Test complete workflows end-to-end
**Location**: `tests/e2e/`
**Mocking**: Use SDK recorder/replayer, real filesystem
**Coverage Target**: All user-facing features

---

## Test Scenarios

### Baseline E2E Scenarios (From Testing Spec)

Required scenarios for SDK recorder/replayer:

1. ✅ **Simple File Edit**
   - Agent edits single file
   - 1 tool call (Edit)
   - Success case

2. ✅ **Multi-File Refactor**
   - Agent edits 5+ files
   - Multiple tool calls (Read, Edit)
   - Success case

3. ✅ **Error and Retry**
   - Agent encounters error
   - Retries and succeeds
   - Error handling case

4. ✅ **Tool Call Burst**
   - Agent makes 10+ rapid tool calls
   - Tests concurrent hook capture
   - Performance case

5. ✅ **Large File Handling**
   - Agent edits file >10MB
   - Tests lazy loading
   - Performance case

6. ✅ **Git Operations**
   - Agent makes changes in git repo
   - Tests before/after git state
   - Git integration case

7. ✅ **Hook Capture Failure**
   - Simulate hook write failure
   - Tests graceful degradation
   - Error handling case

8. ✅ **Watcher Abort**
   - Watcher assertion fails mid-execution
   - Tests early abort
   - Watcher case

9. ✅ **Workflow Multi-Stage**
   - 3 stages with cross-stage state
   - Tests workflow orchestration
   - Workflow case

10. ✅ **Judge Evaluation**
    - RunResult evaluated with rubric
    - Tests LLM judge
    - Judge case

11. ✅ **Matrix Test Generation**
    - 2×2 matrix generates 4 tests
    - Tests matrix testing
    - Matrix case

12. ✅ **Cost Tracking**
    - Multiple tests with cost aggregation
    - Tests reporter cost summation
    - Reporter case

---

## Test Fixture Management

### SDK Recorder Fixtures
**Location**: `tests/__fixtures__/claude-sdk/scenarios/`
**Format**: NDJSON (one event per line)
**Versioning**: By SDK semver (e.g., `v0.1.0/`)

### Demo Workspaces
**Location**: `tests/__fixtures__/workspaces/`
**Purpose**: Sample repos for testing agent execution

Examples:
- `simple-ts-project/` - Basic TypeScript project
- `multi-file-refactor/` - Project with multiple files to refactor
- `git-repo/` - Project with git repository

### Sample RunBundles
**Location**: `tests/__fixtures__/bundles/`
**Purpose**: Pre-generated RunBundles for testing reporters/judge

---

## Coverage Commands

```bash
# Run all tests with coverage
bun test:coverage

# Run unit tests only
bun test:unit

# Run integration tests only
bun test:integration

# Run E2E tests only
bun test:e2e

# Run tests for specific module
bun test -- src/storage

# Watch mode for development
bun test:watch
```

---

## Coverage Reports

**Location**: `coverage/`
**Format**: HTML + LCOV
**CI Integration**: Upload to Codecov

---

## Performance Benchmarks

### Current Performance

| Suite | Target | Current | Status |
|-------|--------|---------|--------|
| Unit tests | ≤45s | - | 🔜 |
| Integration tests | ≤90s | - | 🔜 |
| E2E tests | ≤5min | - | 🔜 |

### Performance Monitoring

- Run benchmarks after each phase
- Fail CI if tests exceed targets
- Profile slow tests with `--reporter=verbose`

---

## Notes

- Update this matrix after each session
- Run `bun test:coverage` before marking module complete
- Add new test scenarios as needed
- Document any coverage gaps in SESSION_LOG

---

**Next Action**: Begin writing tests for Phase 1 (Kernel)
