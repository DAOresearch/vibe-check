Below is a **research‑driven design report** for `@dao/vibe-check`, focused on Vitest v3’s *full* API surface and on a first‑class **RunContext** architecture that auto‑captures execution state from Claude Code hooks and exposes it ergonomically to users, matchers, reporters, and pipelines.

I cite the most load‑bearing claims from primary docs as footnote‑style references inline.

---

## Part 1 — Vitest API Surface Audit (deep, actionable)

### 1) What you already use (and how far you can push it)

| Area                           | What you’re using today                                            | How far it goes                                                                                                                                                 | Headroom                                                                                                                                                                       |
| ------------------------------ | ------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Fixtures via `test.extend`** | Provide `runAgent`, `judge`, `artifacts`, `metrics` in `vibeTest`. | Smart/lazy init; supports automatic fixtures and per‑suite overrides. ([Vitest][1])                                                                             | Add **default/injected fixtures** per project (`provide`), **scoped overrides** with `test.scoped` for nested suites, and **auto** fixtures for capture daemons. ([Vitest][1]) |
| **Task metadata**              | Store cost + paths; read in reporters.                             | It’s a **one‑way** channel from test to main process; designed to pass structured, serializable data to reporters. Experimental; pin version. ([Vitest][2])     | Store only **small summaries + pointers** in `task.meta` (avoid big payloads). Reporters load the real data from disk.                                                         |
| **Reporters**                  | Cost + HTML.                                                       | Vitest v3 exposes a rich lifecycle: per‑test hooks (`onTestCaseReady/Result`), suite/module hooks, and **`onTestAnnotate`** for live annotations. ([Vitest][3]) | Use `onTestAnnotate` to render **live tool/todo timelines** and attach files saved during the run; combine with `attachmentsDir` behavior. ([Vitest][3])                       |
| **Snapshots & matchers**       | Custom matchers; standard snapshots.                               | Concurrency requires **context‑bound `expect`** (`{ expect }`) for snapshots. ([Vitest][4])                                                                     | Provide asymmetric/property matchers for structured `RunResult` (e.g., `toHaveChangedFiles`, `toHaveUsedTool`).                                                                |
| **Matrix**                     | Custom `defineTestSuite` that expands Cartesian products.          | Works today.                                                                                                                                                    | Consider **`test.for`** (Vitest v3) to run parametrized cases *with* access to TestContext (better than `test.each` for fixtures). ([Vitest][4])                               |

### 2) Unused APIs with clear upside for automation & DX

1. **Test Annotations & Attachments**
   Vitest v3 adds `context.annotate(message, type?, attachment?)` and a corresponding reporter hook `onTestAnnotate`. Reporters receive annotations; when attachments include a `path`, Vitest moves files into an **`attachmentsDir`** and rewrites the path for the reporter. This is perfect for **streaming milestones** during agent runs (tool call started/finished, todos updated) and for attaching files like **NDJSON timelines**, **HTML diffs**, and **transcripts** in real time. ([Vitest][1])

2. **Abortable Test Signals**
   Every test gets a **`signal: AbortSignal`**. If a test times out, is cancelled, or a bail condition triggers, Vitest aborts that signal. Pipe this into `runAgent` so the underlying Claude stream cancels immediately + your hook runner shuts down cleanly. ([Vitest][1])

3. **Per‑suite Scoped Values**
   `test.scoped()` can override fixture values (e.g., default workspace, rate limits, or LLM model) for a specific suite and all nested tests—cleaner than ad‑hoc env vars. ([Vitest][1])

4. **Project‑level defaults & `provide`**
   Vitest’s *projects* let you run the same tests under multiple configurations. Combine with **injected/default fixtures** and **Node API `vitest.provide`** to supply environment‑specific values (e.g., default workspaces, MCP endpoints, per‑project secrets) without wiring boilerplate. ([Vitest][1])

5. **Node API (programmatic control)**
   The Node API exposes `createVitest`, `start`, `collect`, `runTestSpecifications`, and global `vitest.state` (experimental) for integrating test runs with external orchestration. This enables a “run headless evaluations as a job” mode, and advanced multi‑run reporting merges (`mergeReports`). ([Vitest][5])

6. **Bench mode**
   Vitest supports **`bench()`** (Tinybench) and `vitest bench` to run performance benchmarks separately from tests. This can benchmark **agent latency**, **token throughput**, or **tool bottlenecks** across models/configs. ([Vitest][6])

7. **Browser/UI mode (optional)**
   If you choose to integrate with Vitest UI later, annotations will naturally visualize in a browser runner. (No hard dependency today.)

### 3) Advanced/undocumented-ish patterns worth adopting

* **Live annotate → HTML**: call `annotate` inside `runAgent` on tool start/end and todo changes; your reporter assembles a **timeline** without parsing stdout. This is formally supported via `onTestAnnotate`. ([Vitest][3])
* **Provided context + injected fixtures**: shape per‑project defaults (e.g., workspace, default model) from the **main thread** using `vitest.provide`, then read them as *injected* fixtures in tests. ([Vitest][5])
* **Meta as index**: store **small summaries** (counts, money, durations) + **paths** to big artifacts in `task.meta`; let reporters load the rest from disk. (Task meta is JSON‑serialized across workers; keep it lean.) ([Vitest][2])

### 4) Limitations & proposed workarounds

* **Task meta size/serialization**: meta is serialized through worker ports/IPC; it must be JSON‑compatible and small. → Store **pointers** (directories) and **tiny summaries** only. ([Vitest][2])
* **Parametrized tests**: `test.each` doesn’t integrate TestContext; prefer **`test.for`** when you want parameters *and* fixtures. ([Vitest][4])
* **Reporters are not controllers**: reporters can’t mutate ongoing tests; use `annotate` for real‑time events and keep heavy processing off the hot path. ([Vitest][3])

---

## Part 2 — RunContext Architecture & Context Management (prescriptive)

### 2.1 Context Flow Architecture (capture → process → inject → access)

**Goal:** *Zero* manual management by users. All execution state is **auto‑captured** during the run and **exposed ergonomically** afterwards.

**Where the data comes from**

* **Claude Agent SDK (stream)** → messages, todos, usage/cost (streaming `query()`), designed for async event handling and cost tracking. ([Claude Docs][7])
* **Claude Code hooks** → PreToolUse/PostToolUse, Notification, Stop/SubagentStop, SessionStart/End, with **cwd**, **session_id**, and **transcript_path** in every payload. Inputs include `tool_name`, `tool_input`, `tool_response`. Hooks execute via JSON on stdin → you can save that JSON *as‑is*. ([Claude Docs][8])

**Flow (high level)**

1. **Before first agent call in a test**
   Fixture boots a **ContextManager**. It prepares a **RunBundle directory** (per test id) and notes initial **git HEAD** and **untracked/dirty state** if a workspace exists.

2. **During `runAgent`**

   * The Claude **SDK stream** is consumed; **metrics** and **messages** are appended to `events.ndjson` disk file, while minimal in‑memory summaries accrue. ([Claude Docs][7])
   * Project’s **Claude hooks** are configured to run a tiny binary/script that writes each hook’s JSON payload to `hooks/*.jsonl` under the **same RunBundle** (no RPC; just file writes). Each hook write is **non‑blocking**: the hook process exits immediately after writing. ([Claude Docs][8])
   * On **interesting events**, call `context.annotate("Tool: Edit src/x.ts", "tool")` and for heavy artifacts use `annotate` with `attachment.path` (Vitest moves it to `attachmentsDir`). ([Vitest][3])

3. **After the agent finishes**
   ContextManager **processes** hook files: correlate PreToolUse↔PostToolUse into structured ToolCalls, compute **file deltas** (see below), and write `summary.json`. It materializes a **lazy RunResult** object that references the RunBundle on disk (paths + lazy loaders).

4. **Inject into Vitest**

   * Return `RunResult` to test code (full ergonomic API).
   * Write **small `task.meta` summary** (`{cost, tokens, duration, bundleDir}`) so reporters can read the heavy artifacts from disk. ([Vitest][2])
   * Stream **annotations** during run for real‑time reporters. ([Vitest][3])

5. **Reporter renders**
   In `onTestCaseResult`, resolve `testCase.meta()`→`bundleDir`, load `summary.json` and any needed NDJSON/patch files, render transcript, tool timeline, todos, diffs.

**Where does RunContext live?**

* **Primary:** on disk (RunBundle) + **returned RunResult** (lazy handles).
* **Pointer:** `task.meta.bundleDir` (and a tiny summary) for reporters.
  This hybrid is robust (no memory blowups) and plays great with Vitest’s serialization rules. ([Vitest][2])

### 2.2 ContextManager — code sketch (TypeScript)

```ts
// src/runtime/ContextManager.ts
export class ContextManager {
  constructor(private opts: { testId: string; workspace?: string; annotate?: (m:string,t?:string,a?:any)=>Promise<void> }) {}

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

    await fs.writeFile(path.join(this.bundleDir, 'summary.json'), JSON.stringify(this.summary, null, 2));
    return makeLazyRunResult({ bundleDir: this.bundleDir, summary: this.summary, annotate: this.opts.annotate });
  }
}
```

A tiny hook entry‑point (configured in `.claude/settings.json`) simply prints stdin JSON to `hooks.ndjson` (fast, non‑blocking). Hook inputs carry `session_id`, `transcript_path`, `cwd`, `tool_name`, `tool_input`, and `tool_response` across events. ([Claude Docs][8])

### 2.3 Prescriptive capture patterns

1. **Git state**

* **When**: on first use of a workspace per test (fixture setup) and after each `runAgent`.
* **How**: `git rev-parse HEAD`, `git status --porcelain=v1 -z` before/after; keep only commit ids + dirty flags in memory; persist detailed file‑level contents lazily (see “File content”).
* **Storage**: `summary.json` contains `git: { before: { head, dirty }, after: {...} }`, and diffs are materialized per file under `files/{before,after}/{sha256}`.
* **Why**: minimal meta + lazy content is robust and scalable.

2. **File content capture**

* **When**: after `PostToolUse` events or at run end (if no tool divulges paths).
* **How**: build a set of changed paths from hook payloads (e.g., Write/Edit/Bash output), verify with `git diff --name-status` if a Git workspace. Read **only changed files**, compute sha256, and **store contents once** in content‑addressed paths (`files/before/<sha>`, `files/after/<sha>`).
* **Storage**: do **not** inline content into `RunResult`. Return **lazy loaders** (`loadBefore()`, `loadAfter()`).
* **DX**: Matchers use concise APIs (e.g., `result.files.changed(['src/**/*.ts'])`), and only load content if and when needed.

3. **Tool call correlation**

* **How**: Each `PreToolUse` increments a per‑session counter and writes `tool_seq`. When `PostToolUse` arrives, match on `(session_id, tool_name, tool_input hash)` or the local `tool_seq` written by the hook script. Payloads provide `tool_name`, `tool_input`, and `tool_response`. Keep duration, inputs, outputs, `cwd`. ([Claude Docs][8])
* **Error handling**: If no `PostToolUse`, mark call as `ok:false`, set `endedAt: null`, and note `missing_post_event: true`. Reporters can surface this clearly.

4. **Hook data processing**

* **When**: **batch at run end**; **stream lightweight annotations** in real time.
* **How**: append every raw hook JSON to `hooks.ndjson`; after run, parse once and build correlated structures; persist `summary.json`.
* **Filtering**: Keep all hooks (cheap to store); expose only **first‑class** structures in `RunResult` (files, tools, messages, todos, metrics).

### 2.4 Storage & serialization strategy

| Strategy                               | Pros                                                                     | Cons                                               | Verdict           |
| -------------------------------------- | ------------------------------------------------------------------------ | -------------------------------------------------- | ----------------- |
| A. **All in `task.meta`**              | Simple reporter access                                                   | Fragile: size & serialization limits; IPC overhead | ❌ Not recommended |
| B. **Only fixture state (memory)**     | Flexible                                                                 | Reporters can’t read worker memory; risks OOM      | ❌ Not recommended |
| C. **Global singleton**                | Shared across tests                                                      | Race conditions; leaks; parallel runners           | ❌ Not recommended |
| D. **Hybrid: disk bundle + thin meta** | Robust, scalable; reporters read from disk; tests get ergonomic lazy API | Slight complexity; needs path management           | ⭐ **Recommended** |

**Recommendation:** D — **Hybrid**: the disk **RunBundle** is the source of truth; `RunResult` provides lazy accessors; `task.meta` carries only summaries and `bundleDir`. ([Vitest][2])

### 2.5 Access patterns (uniform & ergonomic)

**Test code**

```ts
const result = await runAgent({ agent, prompt: '/refactor' });

// Git & files
result.git.before.head;         // 'abc123'
result.git.after.head;          // 'def789'
const change = result.files.get('src/index.ts');   // typed FileChange
await change.before.text();     // lazy read
await change.after.text();      // lazy read

// Tools & timeline
result.tools.used('Bash');      // boolean / count
result.tools.findFirst('Edit'); // ToolCall | undefined
result.timeline.events();       // iterator over merged SDK + hook events
```

**Reporter**

```ts
onTestCaseResult(tc) {
  const { bundleDir, metrics } = tc.meta();
  const summary = readJSON(join(bundleDir, 'summary.json'));
  renderToolTimeline(summary.toolCalls);
  renderDiffsFromBundle(bundleDir, summary);
}
```

**Matchers**

```ts
expect(result).toHaveChangedFiles(['src/**/*.ts']);
expect(result).toHaveUsedTool('Bash', { min: 1 });
expect(result).toHaveNoDeletedFiles();
```

**Judge**

```ts
const evaluation = await judge(result, { rubric: qualityRubric });
// implementation calls result.files.changed(), result.tools, result.todos, etc.
```

### 2.6 Memory strategy (handles “100 large files”)

* **Canonical on disk**: all raw events and file contents live under **RunBundle** (content-addressed).
* **Lazy accessors**: `result.files.*.text()` streams from disk on demand.
* **Size guards**: If a single file exceeds **10MB**, store gzipped; the accessor decompresses transparently and matchers should default to **sampled diff** unless `.full()` is requested.
* **Meta stays tiny**: only counts + hashes + paths. (Fits Vitest meta rules.) ([Vitest][2])

### 2.7 Vitest lifecycle: sequence diagram (text)

```
[vitest] start
  -> fixture setup (ContextManager created; bundleDir prepared; base git snapshot if workspace)
  -> test begins
     -> runAgent() starts
        -> attach AbortSignal from test context (propagate to SDK & hooks)
           -> for-await SDK stream:
               - write SDK event to events.ndjson
               - accumulate metrics; annotate key milestones
           -> Claude hooks fire per tool; hook-runner writes hook JSON → hooks.ndjson
     -> runAgent() ends
        -> ContextManager.finalize():
             - parse hooks.ndjson → correlate tool calls; compute file changes; write summary.json
             - make lazy RunResult from bundle
        -> return RunResult to test
     -> assertions / judge run, possibly reading lazily from bundle
  -> test ends
     -> write small meta: { cost, tokens, duration, bundleDir, counts... }
  -> reporter.onTestCaseResult() reads summary.json & renders HTML
  -> fixture teardown (no-op; bundle kept unless cleanup policy says otherwise)
```

Citations for supporting APIs: annotations, signal, reporters, task meta. ([Vitest][1])

### 2.8 Patterns from other frameworks — what to adopt

* **Playwright**: fixtures as DI + **`test.step()`** for nested phases; automated **traces** (screens, network) persisted then viewed later. Emulate: treat each tool call or agent phase as a “step” (via `annotate`) and persist artifacts for replay. ([Vitest][9])
* **Jest**: **testEnvironment** captures per‑test resources; call history for mocks is **auto‑collected**. Emulate: *never* ask users to log tool calls; auto‑capture via hooks and expose `.tools.*` like a mock call history. ([GitHub][10])
* **Cypress**: **network intercepts** and a **command log** UI. Emulate: visualize tool calls and FS changes as a scrollable timeline in HTML (command log for agents). ([Jest][11])

---

## Part 3 — Novel Composition Patterns with RunContext

### Pattern A — **Explicit handoff (simple & clear)**

```ts
const analyze = await runAgent({ agent: analyzer, prompt: '/analyze' });
if (analyze.files.changedCount > 10) {
  await annotate('Large change set; running deep checks', 'note');
}
const fix = await runAgent({ agent: fixer, prompt: '/fix', context: analyze });
const newOnly = fix.files.changed().filter(f => !analyze.files.has(f.path));
```

* **DX**: 8/10 (predictable control)
* **Pros**: Easy to read; no magic.
* **Cons**: You thread variables manually.

### Pattern B — **Pipeline accumulator**

```ts
const pipeline = runPipeline({ name: 'refactor' }); // returns helpers + shared bundle

const s1 = await pipeline.stage('analyze',  { agent: analyzer, prompt: '/analyze' });
const s2 = await pipeline.stage('fix',      { agent: fixer,    prompt: '/fix' });

pipeline.files.allChanged();   // cumulative
pipeline.tools.timeline();     // merged across stages
```

* **DX**: 9/10 (great for multi‑stage)
* **Pros**: Central place to diff stages; supports **loops** (see next).
* **Cons**: More API surface.

### Pattern C — **Loop until condition**

```ts
const wf = runWorkflow({ workspace });
let pass = false, n = 0;

while (!pass && n++ < 4) {
  const attempt = await wf.stage('iterate', { agent: fixer, prompt: '/fix' });
  const evaln = await judge(attempt, { rubric, throwOnFail: false });
  pass = evaln.passed;
}
expect(pass).toBe(true);
```

* **DX**: 8/10
* **Pros**: Natural loops; cumulative context in `wf`.
* **Cons**: Users must set sensible iteration caps.

### Pattern D — **Judge‑driven routing**

```ts
const result = await runAgent({ agent: reviewer, prompt: '/review' });
const evaln = await judge(result, { rubric: gate });
if (!evaln.passed) await runAgent({ agent: fixer, prompt: '/fix', context: result });
```

* **DX**: 8/10
* **Pros**: Rubrics become flow control.
* **Cons**: Requires clear rubric semantics.

---

## Part 4 — Alternatives to reporter‑centric automation

1. **“vibeTest for everything”**

* *Concept*: Tests drive both evaluation and pipelines.
* *Pros*: One mental model; integrates with CI easily.
* *Cons*: Pipelines need loops, partial failures, retries; test semantics (pass/fail) don’t map cleanly to long‑running workflows.
* *DX*: 6/10.

2. **Dual API: `vibeTest` + `vibeWorkflow` (recommended)**

* *Concept*: Keep testing semantics in `vibeTest`, introduce **`vibeWorkflow`** for long‑running, possibly non‑assertive pipelines with built‑in steps/loops and the same RunContext.
* *Pros*: Right mental model, can still assert inside.
* *Cons*: Two entry points to document.
* *DX*: 9/10.

3. **Hybrid `describe.workflow` (sugar)**

* *Concept*: Keep a single test runner, but mark suites as workflows (different default timeouts, reporters, and failure semantics).
* *DX*: 8/10; good incremental step.

---

## Part 5 — Reporting & Observability with RunContext

### Real‑time reporting (terminal + HTML)

* Use **`annotate`** to stream “step started/finished” and attach partial artifacts (e.g., rolling NDJSON). Reporters consume `onTestAnnotate`, and because Vitest **moves attachment paths to `attachmentsDir`**, you can safely link them in your HTML. ([Vitest][3])
* For the terminal, add a thin **progress reporter** (count of tools, todos).

### HTML Report (enhancements)

* **Tool timeline**: table or lane diagram; click expands to input/output JSON.
* **Git diff viewer**: render Patch/Unified diffs from bundle files; lazy load big files.
* **File change filters**: by type (A/M/D/R), by glob, by size.
* **Hook event log**: collapse raw hook events with link to transcript path (from hooks). ([Claude Docs][8])

---

## Part 6 — Recommendations & Roadmap

### Immediate wins (next sprint)

1. **Adopt `annotate` in `runAgent`** for tools/todos; wire `onTestAnnotate` in HTML reporter. *Effort: S.* ([Vitest][3])
2. **Switch matrix to `test.for`** for parametric + fixtures; keep your current helper as a thin wrapper. *Effort: S.* ([Vitest][4])
3. **Introduce RunBundle** (disk canonical) + **thin `task.meta`** with `bundleDir`. *Effort: M.* ([Vitest][2])
4. **AbortSignal plumbing** from test context into `runAgent` to cancel SDK stream on timeout/bail. *Effort: S.* ([Vitest][1])
5. **New matchers** against file/tool context (`toHaveChangedFiles`, `toHaveUsedTool`, `toHaveNoDeletedFiles`). *Effort: S.*

### Medium‑term (next quarter)

1. **Pipeline accumulator (`runWorkflow`)** with cumulative RunContext and loop helpers. *Effort: M/L.*
2. **Bench suites** to compare models/tools for latency/cost with `vitest bench`. *Effort: M.* ([Vitest][6])
3. **Project‑injected fixtures**: multi‑project runs for default model/tool/workspace using `provide`. *Effort: M.* ([Vitest][5])

### Long‑term (6–12 months)

1. **Interactive report viewer** (timeline, diff viewer, search).
2. **Vitest UI integration** for streaming agent timelines in browser.

---

## Part 7 — User‑Facing API Design (⭐ CRITICAL)

### 7.1 **RunResult** (complete, DX‑oriented)

```ts
/**
 * Canonical result of an agent run with auto-captured context.
 * All heavy data is persisted in a per-test RunBundle on disk.
 * The object exposes lazy loaders for large contents.
 */
export interface RunResult {
  /** Absolute path to the on-disk bundle (source of truth). */
  readonly bundleDir: string;

  /** High-level metrics (merged SDK usage + wall time). */
  readonly metrics: {
    totalTokens?: number;
    totalCostUsd?: number;
    durationMs?: number;
    toolCalls?: number;
    filesChanged?: number;
  };

  /** Conversation messages (assistant/user/tool), small, summarized. */
  readonly messages: Array<{
    role: 'system' | 'user' | 'assistant' | 'tool';
    summary: string;              // first 120 chars or structured title
    ts: number;
    /** Load full content from bundle on demand */
    load(): Promise<unknown>;
  }>;

  /** Todos recorded by SDK stream, with status at end of run. */
  readonly todos: Array<{ text: string; status: 'pending'|'in_progress'|'completed' }>;

  /** Git state before/after if workspace is git-managed. */
  readonly git: {
    before?: { head: string; dirty: boolean };
    after?:  { head: string; dirty: boolean };
    /** Shortcuts */
    changedCount: number;
    /** Raw `git diff --name-status` as parsed entries */
    diffSummary(): Promise<Array<{ path: string; change: 'A'|'M'|'D'|'R'; oldPath?: string }>>;
  };

  /** File changes correlated from hooks + git; content loaded lazily. */
  readonly files: {
    /** All changed files as structured objects. */
    changed(): FileChange[];
    /** Fast lookup. */
    get(path: string): FileChange | undefined;
    /** Glob filter. */
    filter(glob: string | string[]): FileChange[];
    /** Counts and quick stats. */
    stats(): { added: number; modified: number; deleted: number; renamed: number; total: number };
  };

  /** Tool calls correlated from PreToolUse/PostToolUse. */
  readonly tools: {
    all(): ToolCall[];
    used(name: string): number;            // count
    findFirst(name: string): ToolCall | undefined;
  };

  /** Unified timeline (SDK + hooks); reporters iterate to render. */
  readonly timeline: {
    events(): AsyncIterable<TimelineEvent | TimelineEvent[]>; // supports batching
  };

  /** Convenience: annotate from user tests if desired (forwarded). */
  annotate?(message: string, type?: string, attachment?: { path?: string; body?: string|Buffer; contentType?: string }): Promise<void>;
}

/** One changed file with safe, lazy content access. */
export interface FileChange {
  path: string;
  changeType: 'added'|'modified'|'deleted'|'renamed';
  /** If renamed, previous path. */
  oldPath?: string;

  before?: {
    sha256: string;
    size: number;
    /** Load full text (decompress if gz). */
    text(): Promise<string>;
    /** Stream for very large files. */
    stream(): NodeJS.ReadableStream;
  };

  after?: {
    sha256: string;
    size: number;
    text(): Promise<string>;
    stream(): NodeJS.ReadableStream;
  };

  /** Quick stats for diffs (lines added/removed/chunks). */
  stats?: { added: number; deleted: number; chunks: number };

  /** Render a unified patch (for debugging/reporters). */
  patch(format?: 'unified'|'json'): Promise<string | object>;
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
  /** Raw hook payloads (paths into bundle) for reporters if needed. */
  raw?: { preHookOffset: number; postHookOffset?: number };
}

export type TimelineEvent =
  | { type: 'sdk-message'; role: 'assistant'|'user'|'tool'; ts: number; ref?: number }
  | { type: 'hook'; name: 'PreToolUse'|'PostToolUse'|'Notification'|'Stop'|'SubagentStop'|'SessionStart'|'SessionEnd'; ts: number; ref?: number }
  | { type: 'todo'; ts: number; items: Array<{ text: string; status: string }> };
```

**Access patterns**

```ts
// Git state
result.git.before?.head;
result.git.after?.head;

// File changes
for (const f of result.files.filter('src/**/*.ts')) {
  const before = await f.before?.text();
  const after  = await f.after?.text();
  expect(after).toContain('modern syntax');
}

// Tool calls
expect(result.tools.used('Bash')).toBeGreaterThan(0);
const edit = result.tools.findFirst('Edit');
expect(edit?.ok).toBe(true);
```

### 7.2 **`vibeTest`** — evaluation-first API (with fixtures)

```ts
type VibeTestContext = {
  runAgent(opts: RunAgentOptions): Promise<RunResult>;
  judge(res: RunResult, opts: { rubric: Rubric; throwOnFail?: boolean }): Promise<JudgeResult>;
  expect: typeof import('vitest')['expect'];  // bound to test
  annotate(message: string, type?: string, attachment?: TestAttachment): Promise<void>;
  task: import('vitest').TestContext['task'];
};

export function vibeTest(
  name: string,
  fn: (ctx: VibeTestContext) => Promise<void> | void,
  timeoutOrOpts?: number | { timeout?: number }
): void;
```

**Examples**

```ts
vibeTest('benchmark sonnet correctness', async ({ runAgent, expect }) => {
  const res = await runAgent({ agent: sonnet, prompt: '/refactor src/index.ts' });
  expect(res).toHaveChangedFiles(['src/index.ts']);
  expect(res.metrics.totalCostUsd!).toBeLessThan(3);
});

vibeTest('quality gate', async ({ runAgent, judge, expect }) => {
  const res = await runAgent({ agent: opus, prompt: '/refactor' });
  const gate = await judge(res, { rubric: qualityRubric, throwOnFail: false });
  expect(gate.score!).toBeGreaterThan(0.8);
});
```

### 7.3 **`vibeWorkflow`** — pipeline/automation API (chosen name)

**Why “workflow”?** It better conveys multi‑stage orchestration (vs. “pipeline” which suggests linear transforms). It mirrors Playwright’s notion of *steps* and aligns with automation vocabulary.

```ts
type WorkflowContext = {
  /** Run one stage, returns a RunResult and accumulates into the workflow. */
  stage(name: string, opts: RunAgentOptions): Promise<RunResult>;

  /** Access cumulative state across stages. */
  files: {
    allChanged(): FileChange[];
    byStage(stage?: string): FileChange[];
  };
  tools: {
    all(): Array<{ stage: string; call: ToolCall }>;
  };
  timeline: { events(): AsyncIterable<{ stage: string; evt: TimelineEvent }> };

  /** Loop helpers */
  until(
    predicate: (latest: RunResult) => boolean | Promise<boolean>,
    body: () => Promise<RunResult>,
    opts?: { maxIterations?: number }
  ): Promise<RunResult[]>;

  /** Default workspace & model overrides for this workflow. */
  defaults: { workspace?: string; model?: string };
};

export function vibeWorkflow(
  name: string,
  fn: (ctx: WorkflowContext) => Promise<void>,
  options?: { timeout?: number; defaults?: { workspace?: string; model?: string } }
): void;
```

**Examples (with loops)**

```ts
vibeWorkflow('iterative fix', async (wf) => {
  const analyze = await wf.stage('analyze', { agent: analyzer, prompt: '/analyze' });

  await wf.until(
    (latest) => latest.todos.every(t => t.status === 'completed'),
    async () => wf.stage('fix', { agent: fixer, prompt: '/fix' }),
    { maxIterations: 3 },
  );

  // cumulative assertions if desired
  expect(wf.files.allChanged().length).toBeGreaterThan(0);
});
```

### 7.4 Workspace context (where to specify?)

**Recommendation: Option C (both, with override)**

* **Default at suite/workflow level**: `vibeWorkflow('…', { defaults: { workspace: '/repo' } }, …)`.
* **Override at agent or call site**: `runAgent({ workspace: '/other-repo' })`.
  Rationale: most pipelines share one workspace, but some stages use a different repo (e.g., docs site). This mirrors Vitest’s “projects + injected defaults” pattern. ([Vitest][1])

### 7.5 Shared primitives

* `defineAgent`, `prompt`, `judge`, `RunResult` are shared across both APIs.
* Matchers are available in `vibeTest` by default; in `vibeWorkflow`, you can optionally import `expect` and use them ad‑hoc.

---

## Part 8 — Implementation checklist (how to build it with Vitest/Claude)

1. **ContextManager + RunBundle**

   * Create `.vibe-artifacts/<testId>/` per test.
   * `events.ndjson`, `hooks.ndjson`, `files/{before,after}`, `summary.json`.
   * Provide `makeLazyRunResult(bundleDir)` that exposes the DX API above.

2. **Hook runner**

   * Single node script `bin/vibe-hook` reading stdin JSON, appending to `hooks.ndjson`.
   * Document `.claude/settings.json` wiring.

3. **`runAgent` integration**

   * Pipe **Vitest `signal`** to SDK stream cancellation. ([Vitest][1])
   * On stream events, call `ContextManager.onSDKEvent(evt)` and **`annotate`** milestones. ([Vitest][3])
   * After stream completes, call `ContextManager.finalize()` and return `RunResult`.

4. **Reporter**

   * In `onTestAnnotate`, append to an in‑memory index for live console output; in `onTestCaseResult`, read `summary.json` from `bundleDir` and render HTML with timelines + diffs. ([Vitest][3])

5. **Task meta**

   * Keep meta tiny: `{ metrics, bundleDir }`. Reporters rely on it. ([Vitest][2])

6. **Matrix**

   * Implement wrapper around **`test.for`** to expand matrices with access to fixtures & context. ([Vitest][4])

7. **Bench**

   * Add optional `*.bench.ts` examples measuring per‑model latency/turns. ([Vitest][6])

---

## Appendix — Key sources (primary)

* **Vitest Reporter API** (includes `onTestAnnotate` lifecycle and attachment notes). ([Vitest][3])
* **Vitest Task Metadata (experimental)** — one‑way, JSON‑serializable, read in reporters. ([Vitest][2])
* **Vitest Test Context** — fixtures, `annotate`, `signal`, `onTestFinished`, `test.scoped`, injected/default fixtures. ([Vitest][1])
* **Vitest Node API** — programmatic runs, `provide`, state (experimental). ([Vitest][5])
* **Vitest Test API** — `test.for`, `test.concurrent` snapshot rules. ([Vitest][4])
* **Vitest Bench** — `bench()` and CLI `vitest bench`. ([Vitest][6])
* **Claude Code Hooks** — inputs for PreToolUse/PostToolUse include `tool_name`, `tool_input`, `tool_response`; common fields include `session_id`, `transcript_path`, `cwd`. ([Claude Docs][8])
* **Claude Agent SDK** — `query()` streams events; cost/usage tracking guidance. ([Claude Docs][7])
* **Playwright fixtures & steps/trace** — design inspiration for steps & artifacts. ([Vitest][9])
* **Cypress intercept** — “command log” inspiration for tool timeline. ([Jest][11])
* **Jest environments** — per‑test resource model; call history analogue. ([GitHub][10])

---

# Concrete code to add (drop‑ins)

### 1) Annotated `runAgent` loop (inside your runner)

```ts
for await (const evt of stream) {
  await ctxManager.onSDKEvent(evt);
  // example: milestones
  if (isToolStart(evt)) await annotate?.(`Tool start: ${evt.name}`, 'tool');
  if (isTodoUpdate(evt)) await annotate?.(`TODOs: ${evt.items.length}`, 'todo');
}
```

### 2) Hook script (project‑local)

```ts
#!/usr/bin/env node
// .claude/hooks/vibe-hook.js
import fs from 'node:fs';
import { pipeline } from 'node:stream/promises';
import { createWriteStream } from 'node:fs';
const bundleDir = process.env.VIBE_BUNDLE_DIR; // set by runAgent env

await fs.promises.mkdir(bundleDir, { recursive: true });
const out = createWriteStream(`${bundleDir}/hooks.ndjson`, { flags: 'a' });
let buf = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', c => (buf += c));
process.stdin.on('end', async () => {
  // Parse and re-stringify to ensure single-line NDJSON (handles embedded newlines)
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

### 3) Thin meta (at test end)

```ts
task.meta.metrics = { ...result.metrics };
task.meta.bundleDir = result.bundleDir;
```

---

## Closing: Why this design hits the goals

* **Vitest‑native**: uses fixtures, annotations, reporters, meta, and Node API—no custom runner. ([Vitest][1])
* **DX‑first**: lazy, typed `RunResult` with *before/after* access; matchers stay expressive and fast.
* **Automation‑grade**: `vibeWorkflow` introduces steps, loops, and cumulative context without fighting test semantics.
* **Scalable & safe**: on‑disk RunBundle + thin meta avoids OOM and IPC limits; reporters render rich HTML by reading artifacts directly.
* **Future‑proof**: annotations unlock real‑time UX now and UI‑mode later; `test.for` smooths parametric runs with fixtures. ([Vitest][4])

If you want, I can convert the RunResult and ContextManager API sketches into concrete TypeScript files aligned with your existing `src/` layout and wire up `annotate` + reporters next.

[1]: https://vitest.dev/guide/test-context "Test Context | Guide | Vitest"
[2]: https://vitest.dev/advanced/metadata "Task Metadata | Vitest"
[3]: https://vitest.dev/advanced/api/reporters "Reporters | Vitest"
[4]: https://vitest.dev/api/ "Test API Reference | Vitest"
[5]: https://vitest.dev/advanced/api/vitest "Vitest API | Vitest"
[6]: https://vitest.dev/api/?utm_source=chatgpt.com "Test API Reference"
[7]: https://docs.claude.com/en/api/agent-sdk/typescript?utm_source=chatgpt.com "Agent SDK reference - TypeScript"
[8]: https://docs.claude.com/en/docs/claude-code/hooks "Hooks reference - Claude Docs"
[9]: https://vitest.dev/guide/features?utm_source=chatgpt.com "Features | Guide"
[10]: https://github.com/vitest-dev/vitest/discussions/1863?utm_source=chatgpt.com "How to extend the type definition on `expect` in typescript"
[11]: https://jestjs.io/docs/configuration?utm_source=chatgpt.com "Configuring Jest"
