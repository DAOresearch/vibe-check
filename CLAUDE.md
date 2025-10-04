# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# @dao/vibe-check

**Automation and Evaluation framework for Claude Code agents, built on Vitest v3.**

This is a TypeScript library that provides a dual-purpose testing framework:
1. **Automation Suite** - Run agent pipelines, orchestrate multi-agent workflows
2. **Evaluation Framework** - Benchmark models/configs/prompts with matrix testing and LLM judges

## Development Commands

### Linting & Type Checking
```bash
bun run lint              # Run Biome formatter/linter with auto-fix
bun run lint:summary      # Lint with summary output
bun run typecheck         # Run TypeScript type checking
bun run check             # Run both lint and typecheck
```

### Running Code
```bash
bun run dev               # Run src/index.tsx
bun run clean:dev         # Clean .dev directory
bun run clean:test        # Clean test artifacts
```

## Architecture Overview

### Design Philosophy

**Key Principles:**
- **Vitest-native** - No custom test runners; pure Vitest infrastructure
- **Dual identity** - Support both automation and evaluation equally
- **DX-first** - Simple user-facing API hiding Vitest complexity
- **Auto-capture** - Execution context (git state, file changes, tool calls, hooks) captured automatically
- **Rich reporting** - Terminal + HTML reports with transcripts, timelines, costs

**API Simplicity Rule:**
- Users see: `vibeTest`, `vibeWorkflow`, `defineAgent`, `prompt`, `runAgent`, `judge`, matchers
- Users never see: Vitest reporters, task.meta, fixtures, lifecycle hooks, worker pools

### Core Architecture Components

#### 1. Dual API Surface

**`vibeTest`** - For testing/evaluation use cases
- Benchmarking models
- Quality gates with assertions
- Matrix testing configurations

**`vibeWorkflow`** - For automation/pipeline use cases
- Multi-stage agent pipelines (`wf.stage()`)
- Loop/iteration support (`wf.until()` helper)
- Production automation with cumulative context
- Access to cross-stage data (files, tools, timeline)

**Why "workflow" over "pipeline"?** Better conveys multi-stage orchestration; aligns with automation vocabulary.

Both APIs share primitives (`defineAgent`, `prompt`, `runAgent`, `judge`) but have different semantics tailored to their use cases.

#### 2. Auto-Captured RunContext

**Critical Concept:** When `runAgent()` executes, the framework automatically captures:

- **Git state**: commit hashes before/after, branch, changed files
- **File changes**: Full before/after content (not just diffs), plus git diffs
- **Tool calls**: Correlated PreToolUse + PostToolUse events into structured ToolCall records
- **Hook emissions**: All Claude Code hook data (Notification, Stop, SubagentStop, etc.)
- **Processed messages**: Tool results, annotations, errors extracted from logs

**Implementation:**
1. During agent run: Write hook events to small temp files (non-blocking)
2. After run completes: Process hook files, correlate events, extract data
3. Inject into Vitest flow: Store using **Hybrid approach** (decided by research)
4. Make accessible: Test code gets `RunResult`, reporters get via `test.meta`

**Storage Strategy (Decided):**
**Hybrid disk bundle + thin meta** - The disk RunBundle is the canonical source of truth; `RunResult` provides lazy accessors; `task.meta` carries only summaries and `bundleDir` pointer. This approach:
- Scales to large data (100+ file changes)
- Reporters read artifacts from disk (no IPC overhead)
- Test code gets ergonomic lazy API (no memory bloat)
- See `deep-research-report.md` Part 2.4 for full rationale

#### 3. Claude Code Hooks Integration

Vibe-check captures execution data via **Claude Code hooks** (see https://docs.claude.com/en/docs/claude-code/hooks):

**Hooks used:**
- `PreToolUse` - Capture tool invocation (name, inputs)
- `PostToolUse` - Capture tool results (outputs, success/failure)
- `Notification` - Capture notification messages
- `Stop`/`SubagentStop` - Capture completion events
- `SessionStart`/`SessionEnd` - Session lifecycle

**Data flow:**
```
Hook fires → Write to temp file → Agent completes → Process files →
Correlate Pre+Post → Populate RunResult → Return to test code
```

#### 4. Vitest Fixture System

**What users get in test context:**
```typescript
vibeTest('example', async ({ runAgent, judge, expect, task, annotate }) => {
  // runAgent: Execute agent, returns RunResult with auto-populated context
  // judge: LLM-based evaluation with rubrics
  // expect: Vitest expect with custom matchers
  // task: Access to Vitest task metadata
  // annotate: Stream annotations to reporters (tool starts, todo updates)
});
```

**Full VibeTestContext signature:**
```typescript
type VibeTestContext = {
  runAgent(opts: RunAgentOptions): Promise<RunResult>;
  judge(res: RunResult, opts: { rubric: Rubric; throwOnFail?: boolean }): Promise<JudgeResult>;
  expect: typeof import('vitest')['expect'];
  annotate(message: string, type?: string, attachment?: TestAttachment): Promise<void>;
  task: import('vitest').TestContext['task'];
};
```

**Implementation:** Uses `test.extend` to inject fixtures, hiding all Vitest plumbing from users.

#### 5. Custom Matchers

Shipped matchers for common assertions:

**File-based matchers:**
- `toHaveChangedFiles(paths)` - Verify specific files changed (glob support)
- `toHaveNoDeletedFiles()` - Ensure no files were deleted

**Tool-based matchers:**
- `toHaveUsedTool(name, opts?)` - Check specific tool usage with optional min count
- `toUseOnlyTools(allowlist)` - Validate only allowed tools were used

**Quality matchers:**
- `toCompleteAllTodos()` - Verify all TODOs completed
- `toHaveNoErrorsInLogs()` - Check for errors in logs
- `toPassRubric(rubric)` - LLM-based quality evaluation

**Cost matchers:**
- `toStayUnderCost(maxUsd)` - Enforce cost budgets

**Access patterns for file changes:**
```typescript
const result = await runAgent({ ... });

// Lazy file access API
const file = result.files.get("src/index.ts");
const beforeText = await file?.before?.text();  // Lazy load
const afterText = await file?.after?.text();
expect(beforeText).toContain("old code");
expect(afterText).toContain("new code");

// Or use matchers that access auto-captured context
expect(result).toHaveChangedFiles(["src/index.ts"]);
expect(result.files.stats()).toEqual({ added: 1, modified: 2, deleted: 0, renamed: 0, total: 3 });
```

#### 6. Reporter System

**Terminal Reporter** (`VibeCostReporter`):
- Aggregates cost across tests using `task.meta`
- Prints summary at end of run

**HTML Reporter** (`VibeHtmlReporter`):
- Generates rich HTML report with:
  - Conversation transcripts
  - Tool call timelines
  - TODO status tracking
  - File diff viewer (uses git diffs from RunContext)
  - Cost/token breakdowns
  - Artifact links

**Implementation:** Extends Vitest's `BaseReporter`, uses lifecycle hooks (`onTestCaseResult`, `onTestRunEnd`) to collect data.

#### 7. Matrix Testing

**Pattern:** `defineTestSuite` generates Cartesian product of test configurations

```typescript
defineTestSuite({
  matrix: {
    agent: [sonnetAgent, opusAgent],
    maxTurns: [8, 16]
  },
  test: ({ agent, maxTurns }) => {
    vibeTest(`${agent.name} with ${maxTurns} turns`, async ({ runAgent }) => {
      // Test runs 4 times (2 agents × 2 maxTurns)
    });
  }
});
```

#### 8. Workspace Context Design

**Decision**: ✅ Both with override (default at workflow level, override at runAgent)

**Rationale**: Most pipelines share one workspace, but some stages use a different repo (e.g., docs site). Mirrors Vitest's "projects + injected defaults" pattern.

**Implementation**:
- **Default at suite/workflow level**:
  ```typescript
  vibeWorkflow('deploy', async (wf) => {
    // All stages inherit workspace from workflow defaults
  }, { defaults: { workspace: '/path/to/repo' } });
  ```

- **Override at call site** (for multi-repo workflows):
  ```typescript
  vibeWorkflow('deploy', async (wf) => {
    await wf.stage('build app', { agent: builder, prompt: '/build' });
    await wf.stage('deploy docs', {
      agent: deployer,
      prompt: '/deploy',
      workspace: '/path/to/docs-repo'  // Override for this stage
    });
  }, { defaults: { workspace: '/path/to/app-repo' } });
  ```

## Project Structure

```
/
├── src/
│   └── index.tsx           # Main entry point (currently minimal)
├── .claude/
│   ├── docs/
│   │   └── vibecheck/
│   │       ├── implementation-plan.mdx           # Detailed implementation roadmap
│   │       ├── vitest-deep-research-prompt-v2.md # Research prompt for architecture
│   │       └── deep-research-report.md           # Research findings
│   ├── agents/             # Claude Code agent definitions
│   ├── commands/           # Claude Code slash commands
│   └── tasks/              # Task definitions
├── package.json
└── README.md               # User-facing documentation
```

## Key Implementation Areas (Not Yet Built)

This is a **design-first** project. The following areas need implementation:

### 1. Core Test Infrastructure
- `src/test/vibeTest.ts` - Main test function wrapping Vitest with fixtures
- `src/test/context.ts` - Fixture definitions and context types
- `src/test/matchers.ts` - Custom matcher implementations

### 2. Agent Runner & Context Manager
- `src/runner/agentRunner.ts` - Executes Claude Code agents, captures hooks
- `src/runner/contextManager.ts` - Manages RunContext lifecycle (capture → process → inject)
- Hook capture mechanism (write temp files during run)
- Hook processing (correlate PreTool + PostTool, extract data)

### 3. Judge System
- `src/judge/rubric.ts` - Rubric schema validation (Zod)
- `src/judge/llmJudge.ts` - LLM-based evaluation logic

### 4. Reporters
- `src/reporters/cost.ts` - Terminal cost summary reporter
- `src/reporters/html.ts` - HTML report generator with diffs/timelines

### 5. Matrix Testing
- `src/matrix/defineTestSuite.ts` - Cartesian product generator

### 6. Configuration
- `src/config/index.ts` - `defineVibeConfig` helper

## Documentation Structure

The `.claude/docs/vibecheck/` directory contains:

- **implementation-plan.mdx** - Step-by-step implementation guide with:
  - API signatures
  - Code skeletons
  - Test strategy
  - Acceptance criteria
  - Trade-off discussions

- **vitest-deep-research-prompt-v2.md** - Research prompt for designing:
  - RunContext architecture
  - Context manager implementation
  - Storage strategy (task.meta vs fixture)
  - Dual API design (vibeTest + vibeWorkflow)
  - Workspace context placement
  - Loop/iteration patterns

- **deep-research-report.md** - Comprehensive Vitest research covering:
  - Vitest API surface exploration
  - Composition patterns
  - Automation strategies
  - Reporting innovations

## Development Workflow

### Adding New Features

1. **Read implementation plan** (`.claude/docs/vibecheck/implementation-plan.mdx`)
2. **Follow API design** from research documents
3. **Maintain API simplicity** - Users never see Vitest internals
4. **Auto-capture RunContext** - No manual artifact management
5. **Test with Vitest** - Use Vitest for self-testing

### Code Quality Standards

- **Linter:** Biome (via Ultracite) - strict type safety, accessibility, best practices
- **Auto-fix:** `bun run lint` applies fixes automatically
- **Type checking:** Strict TypeScript (`bun run typecheck`)
- **Git hooks:** Lefthook + lint-staged runs Ultracite on staged files

### Testing Philosophy

- Use Vitest for framework's own tests
- Self-hosting: vibe-check tests itself with its own API
- Focus on DX: API should feel natural in real tests

## Critical Design Decisions

Research from `deep-research-report.md` has answered most critical questions:

1. ✅ **RunResult interface** - Complete TypeScript interface designed (see report Part 7.1)
   - Lazy file accessors, git state, tool calls, timeline, metrics
2. ✅ **Storage strategy** - **Hybrid** (disk RunBundle + thin task.meta, see report Part 2.4)
3. ✅ **Context manager** - ContextManager class with capture → process → inject flow (see report Part 2.2)
4. ✅ **Memory management** - Lazy loading with content-addressed storage (see report Part 2.6)
5. ✅ **Workspace context** - **Both with override** (default at test level, override at runAgent, see report Part 7.4)
6. ✅ **Loop patterns** - `until()` helper in `vibeWorkflow` context (see report Part 7.3)
7. ✅ **API naming** - **`vibeWorkflow`** chosen over `vibePipeline` (see report Part 7.3)

**Implementation Status:**
- ✅ All critical design decisions finalized (see `.claude/docs/vibecheck/finalized-decisions.md`)
- ✅ Documentation complete for user-facing APIs
- 🚧 Implementation in progress (see implementation-plan.mdx for roadmap)

**Still to decide (implementation details):**
- RunBundle cleanup/retention policy (TTL vs manual cleanup)
- Test strategy for ContextManager (unit vs integration)
- Error handling patterns for hook capture failures (retry, fallback, logging)

## Working with Claude Code Hooks

When implementing hook capture:

1. **Reference:** https://docs.claude.com/en/docs/claude-code/hooks
2. **Hook types to capture:**
   - PreToolUse (tool name, inputs)
   - PostToolUse (tool name, inputs, outputs)
   - Notification (messages)
   - Stop/SubagentStop (completion)
3. **Capture pattern:**
   - Write JSON to temp files as hooks fire (non-blocking)
   - After run: Read all temp files
   - Correlate PreToolUse + PostToolUse by timestamp/sequence
   - Extract git state, file changes, processed messages
4. **Injection:**
   - Populate RunResult object
   - Store in Vitest flow (task.meta or fixture)
   - Make accessible to test code and reporters

## Notes for Future Claude Code Instances

- This project is in **design phase** - implementation is minimal
- **Start with:** `.claude/docs/vibecheck/implementation-plan.mdx` for roadmap
- **API decisions:** Refer to research documents before implementing
- **RunContext is central:** Everything auto-captures, users never manually manage
- **Dual API:** Plan for both vibeTest (evaluation) and vibeWorkflow (automation)
- **Vitest v3 only:** Pin version, use stable fixture/annotation APIs
- **DX above all:** Hide Vitest complexity, expose simple primitives
