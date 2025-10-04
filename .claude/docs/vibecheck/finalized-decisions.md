# Finalized API & Architecture Decisions

> **Authority**: This document extracts all finalized decisions from `deep-research-report.md`
> **Purpose**: Source of truth for updating all documentation across multiple sessions
> **Status**: ✅ Research complete, ready for documentation implementation

---

## Executive Summary

The deep research has **FINALIZED** all critical design decisions for vibe-check:

✅ **Dual API**: `vibeTest` (evaluation) + `vibeWorkflow` (automation/pipelines)
✅ **RunResult Interface**: Complete lazy-loading API with git, files, tools, timeline
✅ **Storage Strategy**: Hybrid disk RunBundle + thin task.meta
✅ **Context Architecture**: ContextManager with capture → process → inject flow
✅ **Workspace Context**: Both with override (default at test level, override at runAgent)
✅ **Loop Patterns**: `until()` helper in vibeWorkflow context
✅ **Hook Integration**: Claude Code hooks capture tool calls, files, git state automatically

---

## Part 1: User-Facing API Design

### 1.1 Dual API Decision

**Decision**: Separate APIs for different mental models

**Rationale**:
- Testing semantics (pass/fail) don't map cleanly to long-running workflows
- Pipelines need loops, partial failures, retries
- Different use cases deserve different APIs
- DX Score: 9/10

#### `vibeTest` - Evaluation & Testing

```typescript
type VibeTestContext = {
  runAgent(opts: RunAgentOptions): Promise<RunResult>;
  judge(res: RunResult, opts: { rubric: Rubric; throwOnFail?: boolean }): Promise<JudgeResult>;
  expect: typeof import('vitest')['expect'];
  annotate(message: string, type?: string, attachment?: TestAttachment): Promise<void>;
  task: import('vitest').TestContext['task'];
};

export function vibeTest(
  name: string,
  fn: (ctx: VibeTestContext) => Promise<void> | void,
  timeoutOrOpts?: number | { timeout?: number }
): void;
```

**Use cases:**
- Benchmarking models
- Quality gates with assertions
- Matrix testing configurations

**Example:**
```typescript
vibeTest('benchmark sonnet correctness', async ({ runAgent, expect }) => {
  const res = await runAgent({ agent: sonnet, prompt: '/refactor src/index.ts' });
  expect(res).toHaveChangedFiles(['src/index.ts']);
  expect(res.metrics.totalCostUsd!).toBeLessThan(3);
});
```

#### `vibeWorkflow` - Automation & Pipelines

**Why "workflow" over "pipeline"?** Better conveys multi-stage orchestration; aligns with automation vocabulary (Playwright-style)

```typescript
type WorkflowContext = {
  /** Run one stage, returns RunResult and accumulates into workflow */
  stage(name: string, opts: RunAgentOptions): Promise<RunResult>;

  /** Access cumulative state across stages */
  files: {
    allChanged(): FileChange[];
    byStage(stage?: string): FileChange[];
  };
  tools: {
    all(): Array<{ stage: string; call: ToolCall }>;
  };
  timeline: {
    events(): AsyncIterable<{ stage: string; evt: TimelineEvent }>
  };

  /** Loop helpers */
  until(
    predicate: (latest: RunResult) => boolean | Promise<boolean>,
    body: () => Promise<RunResult>,
    opts?: { maxIterations?: number }
  ): Promise<RunResult[]>;

  /** Default workspace & model overrides for this workflow */
  defaults: { workspace?: string; model?: string };
};

export function vibeWorkflow(
  name: string,
  fn: (ctx: WorkflowContext) => Promise<void>,
  options?: {
    timeout?: number;
    defaults?: { workspace?: string; model?: string }
  }
): void;
```

**Use cases:**
- Multi-stage agent pipelines
- Loop/iteration support
- Production automation
- Long-running workflows with retries

**Example with loops:**
```typescript
vibeWorkflow('iterative fix', async (wf) => {
  const analyze = await wf.stage('analyze', {
    agent: analyzer,
    prompt: '/analyze'
  });

  await wf.until(
    (latest) => latest.todos.every(t => t.status === 'completed'),
    async () => wf.stage('fix', { agent: fixer, prompt: '/fix' }),
    { maxIterations: 3 }
  );

  // Cumulative assertions if desired
  expect(wf.files.allChanged().length).toBeGreaterThan(0);
});
```

### 1.2 Complete RunResult Interface

**The canonical result of an agent run with auto-captured context.**

```typescript
export interface RunResult {
  /** Absolute path to the on-disk bundle (source of truth) */
  readonly bundleDir: string;

  /** High-level metrics (merged SDK usage + wall time) */
  readonly metrics: {
    totalTokens?: number;
    totalCostUsd?: number;
    durationMs?: number;
    toolCalls?: number;
    filesChanged?: number;
  };

  /** Conversation messages (assistant/user/tool), small, summarized */
  readonly messages: Array<{
    role: 'system' | 'user' | 'assistant' | 'tool';
    summary: string;              // first 120 chars or structured title
    ts: number;
    /** Load full content from bundle on demand */
    load(): Promise<unknown>;
  }>;

  /** Todos recorded by SDK stream, with status at end of run */
  readonly todos: Array<{
    text: string;
    status: 'pending' | 'in_progress' | 'completed'
  }>;

  /** Git state before/after if workspace is git-managed */
  readonly git: {
    before?: { head: string; dirty: boolean };
    after?: { head: string; dirty: boolean };
    changedCount: number;
    /** Raw `git diff --name-status` as parsed entries */
    diffSummary(): Promise<Array<{
      path: string;
      change: 'A' | 'M' | 'D' | 'R';
      oldPath?: string
    }>>;
  };

  /** File changes correlated from hooks + git; content loaded lazily */
  readonly files: {
    /** All changed files as structured objects */
    changed(): FileChange[];
    /** Fast lookup */
    get(path: string): FileChange | undefined;
    /** Glob filter */
    filter(glob: string | string[]): FileChange[];
    /** Counts and quick stats */
    stats(): {
      added: number;
      modified: number;
      deleted: number;
      renamed: number;
      total: number
    };
  };

  /** Tool calls correlated from PreToolUse/PostToolUse */
  readonly tools: {
    all(): ToolCall[];
    used(name: string): number;  // count
    findFirst(name: string): ToolCall | undefined;
  };

  /** Unified timeline (SDK + hooks); reporters iterate to render */
  readonly timeline: {
    events(): AsyncIterable<TimelineEvent | TimelineEvent[]>; // supports batching
  };

  /** Convenience: annotate from user tests if desired (forwarded) */
  annotate?(
    message: string,
    type?: string,
    attachment?: {
      path?: string;
      body?: string | Buffer;
      contentType?: string
    }
  ): Promise<void>;
}
```

#### Supporting Types

```typescript
/** One changed file with safe, lazy content access */
export interface FileChange {
  path: string;
  changeType: 'added' | 'modified' | 'deleted' | 'renamed';
  /** If renamed, previous path */
  oldPath?: string;

  before?: {
    sha256: string;
    size: number;
    /** Load full text (decompress if gz) */
    text(): Promise<string>;
    /** Stream for very large files */
    stream(): NodeJS.ReadableStream;
  };

  after?: {
    sha256: string;
    size: number;
    text(): Promise<string>;
    stream(): NodeJS.ReadableStream;
  };

  /** Quick stats for diffs (lines added/removed/chunks) */
  stats?: { added: number; deleted: number; chunks: number };

  /** Render a unified patch (for debugging/reporters) */
  patch(format?: 'unified' | 'json'): Promise<string | object>;
}

export interface ToolCall {
  name: string;
  /** JSON-safe input */
  input: unknown;
  /** JSON-safe output/response if present */
  output?: unknown;
  ok: boolean;
  cwd?: string;
  startedAt: number;
  endedAt?: number;
  durationMs?: number;
  /** Raw hook payloads (paths into bundle) for reporters if needed */
  raw?: { preHookOffset: number; postHookOffset?: number };
}

export type TimelineEvent =
  | { type: 'sdk-message'; role: 'assistant' | 'user' | 'tool'; ts: number; ref?: number }
  | { type: 'hook'; name: 'PreToolUse' | 'PostToolUse' | 'Notification' | 'Stop' | 'SubagentStop' | 'SessionStart' | 'SessionEnd'; ts: number; ref?: number }
  | { type: 'todo'; ts: number; items: Array<{ text: string; status: string }> };
```

### 1.3 Shared Primitives

These are shared across both `vibeTest` and `vibeWorkflow`:

```typescript
// defineAgent - unchanged from current design
function defineAgent(spec: AgentSpec): Agent

// prompt - unchanged
function prompt(text: string): AsyncIterablePrompt

// judge - unchanged
async function judge(
  result: RunResult,
  options: { rubric: Rubric; throwOnFail?: boolean }
): Promise<JudgeResult>

// runAgent - available in both contexts
async function runAgent(options: RunAgentOptions): Promise<RunResult>
```

### 1.4 Custom Matchers

**New matchers using auto-captured RunContext:**

```typescript
// File-based matchers
expect(result).toHaveChangedFiles(['src/**/*.ts'])
expect(result).toHaveNoDeletedFiles()

// Tool-based matchers
expect(result).toHaveUsedTool('Bash', { min: 1 })
expect(result).toUseOnlyTools(['Read', 'Write', 'Edit'])

// Quality matchers
expect(result).toCompleteAllTodos()
expect(result).toHaveNoErrorsInLogs()
expect(result).toStayUnderCost(3.00)  // USD
expect(result).toPassRubric(qualityRubric)
```

### 1.5 Workspace Context Decision

**Decision**: Option C - Both with override

- **Default at suite/workflow level**: `vibeWorkflow('…', { defaults: { workspace: '/repo' } }, …)`
- **Override at call site**: `runAgent({ workspace: '/other-repo' })`

**Rationale**: Most pipelines share one workspace, but some stages use a different repo (e.g., docs site). Mirrors Vitest's "projects + injected defaults" pattern.

---

## Part 2: Architecture Decisions

### 2.1 Context Flow Architecture

**Pattern**: capture → process → inject → access

```
[vitest] start
  -> fixture setup (ContextManager created; bundleDir prepared; base git snapshot)
  -> test begins
     -> runAgent() starts
        -> attach AbortSignal from test context
        -> for-await SDK stream:
            - write SDK event to events.ndjson
            - accumulate metrics; annotate key milestones
        -> Claude hooks fire per tool; hook-runner writes JSON → hooks.ndjson
     -> runAgent() ends
        -> ContextManager.finalize():
             - parse hooks.ndjson → correlate tool calls
             - compute file changes; write summary.json
             - make lazy RunResult from bundle
        -> return RunResult to test
     -> assertions / judge run, possibly reading lazily from bundle
  -> test ends
     -> write small meta: { cost, tokens, duration, bundleDir, counts... }
  -> reporter.onTestCaseResult() reads summary.json & renders HTML
  -> fixture teardown (no-op; bundle kept unless cleanup policy)
```

**Key principle**: Zero manual management by users. All execution state is auto-captured.

### 2.2 ContextManager Class

```typescript
// src/runtime/ContextManager.ts
export class ContextManager {
  constructor(private opts: {
    testId: string;
    workspace?: string;
    annotate?: (m: string, t?: string, a?: any) => Promise<void>
  }) {}

  // Canonical on-disk "bundle" for this test
  public readonly bundleDir = path.join('.vibe-artifacts', sanitize(this.opts.testId));

  // In-memory light summary, persisted to summary.json in finalize()
  private summary: Summary = initSummary();

  // Writer handles (append-only)
  private evtWriter = createNDJSONWriter(path.join(this.bundleDir, 'events.ndjson'));
  private hookWriter = createNDJSONWriter(path.join(this.bundleDir, 'hooks.ndjson'));

  async onSDKEvent(evt: SDKEvent) {
    // called from runAgent's for-await loop
    await this.evtWriter.write(evt);
    accumulateMetrics(this.summary.metrics, evt);
    // stream DX breadcrumbs
    if (isTodoUpdate(evt)) await this.opts.annotate?.(`TODOs: ${briefTodos(evt)}`, 'todo');
    if (isTool(evt)) await this.opts.annotate?.(`Tool: ${toolLabel(evt)}`, 'tool');
  }

  async onHookPayload(json: unknown) {
    // invoked by tiny hook-runner (writes hook JSONL)
    await this.hookWriter.write(json);
  }

  async finalize(): Promise<RunResult> {
    // correlate hooks -> toolCalls, compute file changes, write summary.json
    const hooks = await readNDJSON(path.join(this.bundleDir, 'hooks.ndjson'));
    const { toolCalls, fileChanges } = correlateAndDiff(hooks, this.opts.workspace);
    this.summary.toolCalls = toolCalls.map(minimizeForSummary);
    this.summary.fileStats = statsFor(fileChanges);

    await fs.writeFile(
      path.join(this.bundleDir, 'summary.json'),
      JSON.stringify(this.summary, null, 2)
    );
    return makeLazyRunResult({
      bundleDir: this.bundleDir,
      summary: this.summary,
      annotate: this.opts.annotate
    });
  }
}
```

### 2.3 RunBundle Structure (On Disk)

```
.vibe-artifacts/
  {testId}/
    events.ndjson         # SDK stream events (appended during run)
    hooks.ndjson          # Hook payloads (appended by hook-runner)
    summary.json          # Finalized summary (written at end)
    files/
      before/
        {sha256}          # Content-addressed file content (before)
        {sha256}.gz       # Gzipped if >10MB
      after/
        {sha256}          # Content-addressed file content (after)
        {sha256}.gz
```

**Key decisions:**
- Content-addressed storage (deduplication)
- Lazy loading (never load all files into memory)
- NDJSON for streaming writes (non-blocking)
- Gzip for large files (>10MB)

### 2.4 Storage Strategy Decision

**Decision**: D - Hybrid disk bundle + thin meta (⭐ RECOMMENDED)

| Strategy | Verdict |
|----------|---------|
| All in `task.meta` | ❌ Size & serialization limits; IPC overhead |
| Only fixture state (memory) | ❌ Reporters can't read worker memory; OOM risk |
| Global singleton | ❌ Race conditions; leaks; parallel runners |
| **Hybrid: disk bundle + thin meta** | ✅ **Robust, scalable; reporters read from disk** |

**Implementation:**
- RunBundle on disk is source of truth
- `RunResult` provides lazy accessors to test code
- `task.meta` carries only: `{ cost, tokens, duration, bundleDir, counts }`
- Reporters read full data from disk using `bundleDir` pointer

**Rationale:**
- Scales to 100+ large files
- No IPC overhead for reporters
- Test code gets ergonomic lazy API
- No memory bloat

### 2.5 Hook Integration

**Data sources:**
- **Claude Agent SDK stream**: messages, todos, usage/cost
- **Claude Code hooks**: PreToolUse/PostToolUse, Notification, Stop/SubagentStop, SessionStart/End

**Hook capture pattern:**

1. Configure `.claude/settings.json` to run tiny hook script
2. Hook script writes JSON to `{bundleDir}/hooks.ndjson` (non-blocking)
3. After run completes, parse all hook events
4. Correlate `PreToolUse` ↔ `PostToolUse` into structured `ToolCall` records
5. Extract file paths from tool inputs/outputs
6. Compute file deltas with git

**Hook correlation logic:**
```typescript
// Match PreToolUse with PostToolUse
// Key: (session_id, tool_name, tool_input hash) or tool_seq
function correlateToolCalls(hooks: HookEvent[]): ToolCall[] {
  const pending = new Map<string, PreToolUse>();
  const completed: ToolCall[] = [];

  for (const hook of hooks) {
    if (hook.type === 'PreToolUse') {
      const key = makeKey(hook);
      pending.set(key, hook);
    } else if (hook.type === 'PostToolUse') {
      const key = makeKey(hook);
      const pre = pending.get(key);
      if (pre) {
        completed.push({
          name: hook.tool_name,
          input: pre.tool_input,
          output: hook.tool_response,
          ok: !hook.error,
          startedAt: pre.ts,
          endedAt: hook.ts,
          durationMs: hook.ts - pre.ts,
        });
        pending.delete(key);
      }
    }
  }

  // Mark incomplete calls
  for (const [, pre] of pending) {
    completed.push({
      name: pre.tool_name,
      input: pre.tool_input,
      ok: false,
      startedAt: pre.ts,
      endedAt: null,
      missing_post_event: true,
    });
  }

  return completed;
}
```

### 2.6 File Change Detection

**When**: After `PostToolUse` events or at run end

**How**:
1. Build set of changed paths from hook payloads (Write/Edit/Bash output)
2. Verify with `git diff --name-status` if workspace is git-managed
3. Read **only changed files** before/after
4. Compute SHA256, store in content-addressed paths
5. Create `FileChange` objects with lazy loaders

**Memory strategy**:
- Never load all file contents into memory
- `result.files.get('path').before.text()` reads on demand
- Files >10MB stored gzipped, decompressed transparently
- Matchers default to sampled diffs unless `.full()` requested

### 2.7 Vitest Integration Points

**Fixtures** (`test.extend`):
- `runAgent`: Boots ContextManager, executes agent, returns RunResult
- `judge`: LLM evaluation
- `annotate`: Forward to `context.annotate()` (Vitest v3)
- `expect`: Bound to test context (for snapshots + concurrency)
- `task`: Access to Vitest task metadata

**Annotations** (`context.annotate`):
- Stream tool starts/ends, todo updates during run
- Reporters consume via `onTestAnnotate` hook
- Attachments moved to `attachmentsDir` automatically

**Task Metadata** (`task.meta`):
- Store thin summary: `{ cost, tokens, duration, bundleDir }`
- Reporters read full data from disk
- Keep meta small (JSON-serializable, <10KB)

**AbortSignal**:
- Pipe Vitest's `signal` to Claude SDK stream
- Cancel agent cleanly on timeout/bail

---

## Part 3: Vitest API Usage

### 3.1 Used Vitest APIs

| API | Usage | Headroom |
|-----|-------|----------|
| `test.extend` | Fixtures (`runAgent`, `judge`, `expect`) | Add scoped overrides with `test.scoped` |
| `task.meta` | Store bundleDir + summary | Keep tiny; reporters load from disk |
| Reporters | Cost + HTML reports | Use `onTestAnnotate` for live timelines |
| Matchers | Custom matchers | Add asymmetric/property matchers |
| Matrix | `defineTestSuite` wrapper | Consider `test.for` for fixture access |

### 3.2 New Vitest v3 APIs to Adopt

**1. Test Annotations & Attachments** (⭐ HIGH PRIORITY)
```typescript
context.annotate(message, type?, attachment?)
```
- Stream tool call milestones during agent runs
- Attach NDJSON timelines, HTML diffs in real time
- Reporters receive via `onTestAnnotate` hook

**2. Abortable Test Signals**
```typescript
const { signal } = context;
// Pipe to Claude SDK stream for clean cancellation
```

**3. Per-suite Scoped Values**
```typescript
test.scoped() // Override fixture values per suite
```

**4. Project-level defaults & `provide`**
```typescript
vitest.provide('workspace', '/default/repo')
// Access in tests via injected fixtures
```

**5. `test.for` (parametric with fixtures)**
```typescript
test.for([{ model: 'sonnet' }, { model: 'opus' }])(
  'benchmark $model',
  async ({ runAgent, model }) => { ... }
)
```
Better than `test.each` because it integrates with TestContext

### 3.3 Reporter Lifecycle Hooks

```typescript
class VibeHtmlReporter extends BaseReporter {
  onTestAnnotate(annotation) {
    // Real-time: tool started, todo updated
    // Build live timeline
  }

  onTestCaseResult(testCase) {
    // After test: read bundleDir from meta
    const { bundleDir } = testCase.meta();
    const summary = readJSON(join(bundleDir, 'summary.json'));
    renderToolTimeline(summary.toolCalls);
    renderDiffsFromBundle(bundleDir, summary);
  }

  onTestRunEnd() {
    // Generate HTML report with all test results
  }
}
```

---

## Part 4: Implementation Priorities

### 4.1 Immediate Wins (Next Sprint)

**Effort: Small**
1. ✅ Adopt `annotate` in `runAgent` for tools/todos
2. ✅ Wire `onTestAnnotate` in HTML reporter
3. ✅ Switch matrix to `test.for` (thin wrapper)
4. ✅ AbortSignal plumbing (test context → SDK stream)
5. ✅ New matchers (`toHaveChangedFiles`, `toHaveUsedTool`, `toHaveNoDeletedFiles`)

**Effort: Medium**
1. ✅ Introduce RunBundle (disk canonical) + thin `task.meta` with `bundleDir`

### 4.2 Medium-term (Next Quarter)

**Effort: Medium/Large**
1. ✅ Pipeline accumulator (`vibeWorkflow`) with cumulative RunContext and loop helpers
2. ✅ Bench suites to compare models/tools (`vitest bench`)
3. ✅ Project-injected fixtures (multi-project runs, default model/workspace via `provide`)

### 4.3 Long-term (6-12 months)

1. Interactive report viewer (timeline, diff viewer, search)
2. Vitest UI integration (streaming agent timelines in browser)

---

## Part 5: Documentation Update Checklist

### Files to Update

#### `/docs/api/` - API Reference
- [ ] `vibeTest.md` - Update signature, add complete VibeTestContext type
- [ ] **NEW** `vibeWorkflow.md` - Document workflow API with loop examples
- [ ] `runAgent.md` - Update RunResult interface, remove placeholder types
- [ ] `types.md` - Add complete RunResult, FileChange, ToolCall, TimelineEvent types
- [ ] `matchers.md` - Add file/tool matchers (`toHaveChangedFiles`, `toHaveUsedTool`)
- [ ] `README.md` - Add vibeWorkflow to core API list

#### `/docs/guides/automation/`
- [ ] `pipelines.md` - Rewrite using `vibeWorkflow` with stages and loops
- [ ] `orchestration.md` - Update multi-agent patterns with cumulative context

#### `/docs/guides/evaluation/`
- [ ] `benchmarking.md` - Use real `vibeTest` examples
- [ ] `matrix-testing.md` - Update to reference `test.for` pattern

#### `/docs/getting-started/`
- [ ] `first-automation.md` - Rewrite with `vibeWorkflow`
- [ ] `first-evaluation.md` - Rewrite with `vibeTest`
- [ ] `README.md` - Update quick start with real APIs

#### `/docs/contributing/`
- [ ] `architecture.md` - Document ContextManager, RunBundle, hook capture
- [ ] `implementation-plan.md` - Sync with `.claude/docs/vibecheck/implementation-plan.mdx`

#### `.claude/` - Internal Docs
- [ ] `CLAUDE.md` - Remove "To be decided", add ✅ to Critical Design Decisions
- [ ] `docs/vibecheck/implementation-plan.mdx` - Update with finalized APIs and priorities

#### Root docs
- [ ] `README.md` - Update examples with real API

---

## Part 6: Key Composition Patterns

### Pattern A: Explicit Handoff
```typescript
const analyze = await runAgent({ agent: analyzer, prompt: '/analyze' });
if (analyze.files.changedCount > 10) {
  await annotate('Large change set; running deep checks', 'note');
}
const fix = await runAgent({ agent: fixer, prompt: '/fix', context: analyze });
```
**DX**: 8/10 (predictable, easy to read)

### Pattern B: Pipeline Accumulator
```typescript
const pipeline = runPipeline({ name: 'refactor' });
const s1 = await pipeline.stage('analyze', { agent: analyzer, prompt: '/analyze' });
const s2 = await pipeline.stage('fix', { agent: fixer, prompt: '/fix' });

pipeline.files.allChanged();   // cumulative
pipeline.tools.timeline();     // merged across stages
```
**DX**: 9/10 (great for multi-stage)

### Pattern C: Loop Until Condition
```typescript
const wf = runWorkflow({ workspace });
let pass = false, n = 0;

while (!pass && n++ < 4) {
  const attempt = await wf.stage('iterate', { agent: fixer, prompt: '/fix' });
  const evaln = await judge(attempt, { rubric, throwOnFail: false });
  pass = evaln.passed;
}
expect(pass).toBe(true);
```
**DX**: 8/10 (natural loops)

### Pattern D: Judge-driven Routing
```typescript
const result = await runAgent({ agent: reviewer, prompt: '/review' });
const evaln = await judge(result, { rubric: gate });
if (!evaln.passed) {
  await runAgent({ agent: fixer, prompt: '/fix', context: result });
}
```
**DX**: 8/10 (rubrics as flow control)

---

## Part 7: Code Snippets for Implementation

### Hook Script (project-local)

```typescript
#!/usr/bin/env node
// .claude/hooks/vibe-hook.js
import fs from 'node:fs';
import { createWriteStream } from 'node:fs';

const bundleDir = process.env.VIBE_BUNDLE_DIR; // set by runAgent env

await fs.promises.mkdir(bundleDir, { recursive: true });
const out = createWriteStream(`${bundleDir}/hooks.ndjson`, { flags: 'a' });

let buf = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', c => (buf += c));
process.stdin.on('end', async () => {
  // Parse and re-stringify to ensure single-line NDJSON
  try {
    const json = JSON.parse(buf.trim());
    out.write(JSON.stringify(json) + '\n');
  } catch (error) {
    // Fallback: write as-is if not valid JSON
    out.write(buf.trim() + '\n');
  }
  out.end();
});
```

### Annotated runAgent Loop

```typescript
for await (const evt of stream) {
  await ctxManager.onSDKEvent(evt);
  // Stream milestones
  if (isToolStart(evt)) await annotate?.(`Tool start: ${evt.name}`, 'tool');
  if (isTodoUpdate(evt)) await annotate?.(`TODOs: ${evt.items.length}`, 'todo');
}
```

### Thin Meta (at test end)

```typescript
task.meta.metrics = { ...result.metrics };
task.meta.bundleDir = result.bundleDir;
```

---

## Part 8: Verification Checklist

Before declaring documentation complete:

- [ ] All `/docs/api/` files reference finalized TypeScript signatures
- [ ] No placeholder/speculative APIs remain
- [ ] All examples use real `vibeTest` or `vibeWorkflow`
- [ ] `RunResult` interface matches Part 7.1 exactly
- [ ] ContextManager pattern documented in contributing guide
- [ ] Hook integration pattern explained
- [ ] Storage strategy (hybrid disk bundle) documented
- [ ] Implementation priorities from Part 6 captured
- [ ] `.claude/CLAUDE.md` updated with ✅ checkmarks
- [ ] No "To be decided" markers remain in internal docs

---

## References

**Source**: `.claude/docs/vibecheck/deep-research-report.md` (765 lines)

**Key sections**:
- Part 1: Vitest API Surface Audit
- Part 2: RunContext Architecture & Context Management
- Part 3: Novel Composition Patterns
- Part 6: Recommendations & Roadmap
- Part 7: User-Facing API Design ⭐ CRITICAL
- Part 8: Implementation Checklist

**Related files**:
- `.claude/docs/vibecheck/implementation-plan.mdx` (needs update)
- `CLAUDE.md` (needs update)
- Issue #5: Critical research (now resolved)

---

## Next Steps

**Session 1** (CURRENT): ✅ Created finalized-decisions.md

**Session 2**: Update `/docs/api/` files with authoritative signatures
- Focus: vibeTest.md, vibeWorkflow.md (new), runAgent.md, types.md, matchers.md

**Session 3**: Update guides and getting-started tutorials
- Focus: automation guides, evaluation guides, first-*.md tutorials

**Session 4**: Update internal docs and contributing guides
- Focus: CLAUDE.md, implementation-plan.mdx, architecture.md

**Final**: Verify all checklists complete, no placeholders remain
