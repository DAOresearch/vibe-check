---
title: Architecture Overview
description: Technical deep-dive into Vibe Check's internal design
---

[← Back to Contributing](/contributing/)

---

## Table of Contents

- [System Overview](#system-overview)
- [Context Flow Architecture](#context-flow-architecture)
- [ContextManager Class](#contextmanager-class)
- [RunBundle Structure](#runbundle-structure)
- [Storage Strategy](#storage-strategy)
- [Hook Integration](#hook-integration)
- [File Change Detection](#file-change-detection)
- [Vitest Integration](#vitest-integration)

---

## System Overview

Vibe Check is built on a **capture → process → inject** architecture that automatically records all agent execution context without requiring manual management from users.

### Core Principles

1. **Auto-capture everything** - Git state, file changes, tool calls, hooks, costs
2. **Lazy loading** - Never load all data into memory; provide accessors
3. **Disk as source of truth** - RunBundle on disk is canonical; memory is ephemeral
4. **Thin IPC** - Only summary data in `task.meta`; reporters read from disk
5. **DX-first** - Hide all Vitest/storage complexity from users

### Key Components

```
┌─────────────────────────────────────────────────────────────┐
│                     User-Facing API                          │
│  vibeTest()  vibeWorkflow()  defineAgent()  matchers         │
└─────────────────────┬───────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────┐
│                  ContextManager                              │
│  • Manages RunBundle lifecycle                               │
│  • Captures SDK events + hook payloads                       │
│  • Correlates PreToolUse ↔ PostToolUse                       │
│  • Computes file deltas via git                              │
│  • Generates lazy RunResult                                  │
└─────────────────────┬───────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────┐
│                   RunBundle (disk)                           │
│  .vibe-artifacts/{testId}/                                   │
│    events.ndjson   ← SDK stream                              │
│    hooks.ndjson    ← Claude Code hooks                       │
│    summary.json    ← Finalized metadata                      │
│    files/          ← Content-addressed file snapshots        │
└─────────────────────┬───────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────┐
│                 Vitest Integration                           │
│  • test.extend → fixtures (runAgent, judge)                  │
│  • task.meta → thin summary + bundleDir pointer              │
│  • Reporters → read from disk using bundleDir                │
└──────────────────────────────────────────────────────────────┘
```

---

## Context Flow Architecture

**Pattern**: capture → process → inject → access

### Lifecycle Diagram

```
┌──────────────────────────────────────────────────────────────────┐
│ 1. SETUP                                                          │
│   [vitest] start                                                  │
│     → fixture setup                                               │
│       → ContextManager created                                    │
│       → bundleDir prepared (.vibe-artifacts/{testId})             │
│       → base git snapshot (if workspace is git-managed)           │
└──────────────────────────────────────────────────────────────────┘
                                ↓
┌──────────────────────────────────────────────────────────────────┐
│ 2. EXECUTION                                                      │
│   [test begins]                                                   │
│     → runAgent() starts                                           │
│       → attach AbortSignal from test context                      │
│       → for-await SDK stream:                                     │
│           ├─ write SDK event to events.ndjson                     │
│           ├─ accumulate metrics                                   │
│           └─ annotate key milestones (tools, todos)               │
│       → Claude hooks fire per tool                                │
│           └─ hook-runner writes JSON → hooks.ndjson               │
└──────────────────────────────────────────────────────────────────┘
                                ↓
┌──────────────────────────────────────────────────────────────────┐
│ 3. FINALIZATION                                                   │
│   [runAgent() ends]                                               │
│     → ContextManager.finalize():                                  │
│       ├─ parse hooks.ndjson                                       │
│       ├─ correlate tool calls (PreToolUse ↔ PostToolUse)          │
│       ├─ compute file changes (hooks + git diff)                  │
│       ├─ write summary.json                                       │
│       └─ make lazy RunResult from bundle                          │
│     → return RunResult to test                                    │
└──────────────────────────────────────────────────────────────────┘
                                ↓
┌──────────────────────────────────────────────────────────────────┐
│ 4. ASSERTION & REPORTING                                          │
│   [test code]                                                     │
│     → assertions / judge run                                      │
│       → lazily read from bundle as needed                         │
│     → test ends                                                   │
│       → write small meta: { cost, tokens, duration, bundleDir }   │
│   [reporter]                                                      │
│     → onTestCaseResult() reads summary.json                       │
│     → renders HTML/terminal output                                │
└──────────────────────────────────────────────────────────────────┘
```

### Key Principle

**Zero manual management by users.** All execution state is auto-captured, processed, and made available through the lazy `RunResult` API.

---

## ContextManager Class

The **ContextManager** orchestrates the entire lifecycle of execution context capture and finalization.

### Responsibilities

1. **Prepare bundle directory** - Create `.vibe-artifacts/{testId}/` structure
2. **Capture SDK events** - Write to `events.ndjson` during agent run
3. **Capture hook payloads** - Write to `hooks.ndjson` via hook script
4. **Accumulate metrics** - Track tokens, cost, duration in-memory
5. **Stream annotations** - Forward tool/todo updates to Vitest reporters
6. **Finalize context** - Correlate hooks, compute file changes, write summary
7. **Generate RunResult** - Create lazy accessors to bundle data

### Class Structure

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

  async onSDKEvent(evt: SDKEvent): Promise<void>
  async onHookPayload(json: unknown): Promise<void>
  async finalize(): Promise<RunResult>
}
```

### Event Handlers

**`onSDKEvent(evt)`** - Called from `runAgent`'s for-await loop

```typescript
async onSDKEvent(evt: SDKEvent) {
  // Append to NDJSON
  await this.evtWriter.write(evt);

  // Accumulate metrics (tokens, cost, turns)
  accumulateMetrics(this.summary.metrics, evt);

  // Stream DX breadcrumbs to reporters
  if (isTodoUpdate(evt)) {
    await this.opts.annotate?.(`TODOs: ${briefTodos(evt)}`, 'todo');
  }
  if (isTool(evt)) {
    await this.opts.annotate?.(`Tool: ${toolLabel(evt)}`, 'tool');
  }
}
```

**`onHookPayload(json)`** - Called by hook-runner script

```typescript
async onHookPayload(json: unknown) {
  // Append hook event to NDJSON
  await this.hookWriter.write(json);
}
```

**`finalize()`** - Called after agent completes

```typescript
async finalize(): Promise<RunResult> {
  // 1. Read all captured hook events
  const hooks = await readNDJSON(path.join(this.bundleDir, 'hooks.ndjson'));

  // 2. Correlate PreToolUse ↔ PostToolUse into structured ToolCall records
  const { toolCalls, fileChanges } = correlateAndDiff(hooks, this.opts.workspace);

  // 3. Minimize for summary (save space)
  this.summary.toolCalls = toolCalls.map(minimizeForSummary);
  this.summary.fileStats = statsFor(fileChanges);

  // 4. Write summary.json (reporters read this)
  await fs.writeFile(
    path.join(this.bundleDir, 'summary.json'),
    JSON.stringify(this.summary, null, 2)
  );

  // 5. Create lazy RunResult (doesn't load files into memory)
  return makeLazyRunResult({
    bundleDir: this.bundleDir,
    summary: this.summary,
    annotate: this.opts.annotate
  });
}
```

---

## RunBundle Structure

### Disk Layout

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

### File Formats

**`events.ndjson`** - Newline-delimited JSON, one SDK event per line

```json
{"type":"message","role":"assistant","content":"...","ts":1234567890}
{"type":"tool_use","name":"Edit","input":{...},"ts":1234567891}
{"type":"usage","tokens":123,"cost_usd":0.01,"ts":1234567892}
```

**`hooks.ndjson`** - Newline-delimited JSON, one hook event per line

```json
{"type":"PreToolUse","tool_name":"Edit","tool_input":{...},"ts":1234567890}
{"type":"PostToolUse","tool_name":"Edit","tool_response":{...},"ts":1234567891}
```

**`summary.json`** - Structured summary (not NDJSON)

```json
{
  "metrics": {
    "totalTokens": 1234,
    "totalCostUsd": 0.42,
    "durationMs": 5678
  },
  "toolCalls": [
    {"name":"Edit","ok":true,"startedAt":123,"endedAt":456}
  ],
  "fileStats": {
    "added": 1,
    "modified": 2,
    "deleted": 0,
    "total": 3
  }
}
```

### Design Decisions

| Decision | Rationale |
|----------|-----------|
| **NDJSON for events/hooks** | Streaming writes (non-blocking); one append per event |
| **Content-addressed storage** | Deduplication; files only stored once even if unchanged |
| **Lazy loading** | Never load all files into memory; use `.text()` accessors |
| **Gzip for large files** | Save disk space for files >10MB |
| **summary.json** | Fast reporter access without parsing full NDJSON |

---

## Storage Strategy

**Decision**: **Hybrid disk bundle + thin meta** (finalized-decisions.md Part 2.4)

### Comparison of Strategies

| Strategy | Verdict | Why |
|----------|---------|-----|
| All in `task.meta` | ❌ | Size limits; serialization overhead; IPC bloat |
| Only fixture state (memory) | ❌ | Reporters can't read worker memory; OOM risk |
| Global singleton | ❌ | Race conditions; leaks; breaks parallel runners |
| **Hybrid: disk bundle + thin meta** | ✅ | **Robust, scalable; reporters read from disk** |

### Implementation

**During test:**
- RunBundle on disk is **source of truth**
- `RunResult` provides **lazy accessors** to test code
- `task.meta` carries **only thin summary**: `{ cost, tokens, duration, bundleDir }`

**In reporters:**
- Read `bundleDir` from `task.meta`
- Load `summary.json` from disk
- Read files/events/hooks as needed

**Benefits:**
- ✅ Scales to 100+ large files
- ✅ No IPC overhead for reporters
- ✅ Test code gets ergonomic lazy API
- ✅ No memory bloat in worker processes

---

## Hook Integration

### Data Sources

Vibe Check captures execution data from two sources:

1. **Claude Agent SDK stream** - Messages, todos, usage/cost
2. **Claude Code hooks** - PreToolUse/PostToolUse, Notification, Stop/SubagentStop, SessionStart/End

### Hook Capture Pattern

#### 1. Configure Claude Code hooks

Write a small hook script (`.claude/hooks/vibe-hook.js`) and configure it in `.claude/settings.json`:

```json
{
  "hooks": {
    "PreToolUse": ".claude/hooks/vibe-hook.js",
    "PostToolUse": ".claude/hooks/vibe-hook.js"
  }
}
```

#### 2. Hook script writes to bundle

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

#### 3. Correlate events after run completes

```typescript
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

  // Mark incomplete calls (PreToolUse without PostToolUse)
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

**Correlation key:** `(session_id, tool_name, tool_input_hash)` or `tool_seq`

---

## File Change Detection

### When

After `PostToolUse` events or at run end (in `ContextManager.finalize()`)

### How

1. **Build set of changed paths** from hook payloads (Write/Edit/Bash output)
2. **Verify with git** if workspace is git-managed:
   ```bash
   git diff --name-status
   ```
3. **Read only changed files** (before/after)
4. **Compute SHA256**, store in content-addressed paths:
   ```
   files/before/{sha256}
   files/after/{sha256}
   ```
5. **Create `FileChange` objects** with lazy loaders:
   ```typescript
   interface FileChange {
     path: string;
     changeType: 'added' | 'modified' | 'deleted' | 'renamed';
     before?: {
       sha256: string;
       size: number;
       text(): Promise<string>;  // Lazy load
       stream(): NodeJS.ReadableStream;
     };
     after?: { /* same */ };
   }
   ```

### Memory Strategy

- ✅ Never load all file contents into memory
- ✅ `result.files.get('path').before.text()` reads on demand
- ✅ Files >10MB stored gzipped, decompressed transparently
- ✅ Matchers default to sampled diffs unless `.full()` requested

---

## Vitest Integration

### Fixtures (`test.extend`)

```typescript
export const vibeTest = base.extend<VibeTestContext>({
  runAgent: async ({ task }, use) => {
    const ctx = new ContextManager({ testId: task.id, ... });
    await use(ctx.runAgent.bind(ctx));
    await ctx.cleanup?.();
  },
  judge: async ({}, use) => {
    const j = createJudge();
    await use(j.evaluate.bind(j));
  },
});
```

**Provides:**
- `runAgent`: Boots ContextManager, executes agent, returns RunResult
- `judge`: LLM evaluation
- `annotate`: Forward to `context.annotate()` (Vitest v3)
- `expect`: Bound to test context (for snapshots + concurrency)
- `task`: Access to Vitest task metadata

### Annotations (`context.annotate`)

Stream tool starts/ends, todo updates during run:

```typescript
await ctx.annotate('Tool start: Edit', 'tool');
await ctx.annotate('TODOs: 3 pending, 1 in_progress', 'todo');
```

Reporters consume via `onTestAnnotate` hook.

### Task Metadata (`task.meta`)

Store **thin summary only**:

```typescript
task.meta.metrics = { cost: 0.42, tokens: 1234, duration: 5678 };
task.meta.bundleDir = '/path/to/.vibe-artifacts/test-123';
```

**Keep meta small** (JSON-serializable, <10KB). Reporters read full data from disk.

### AbortSignal

Pipe Vitest's `signal` to Claude SDK stream for clean cancellation on timeout/bail:

```typescript
const stream = query({ prompt, options: { signal: task.context.signal } });
```

---

## Related Documentation

- **[Implementation Plan](../../.claude/docs/vibecheck/implementation-plan.mdx)** - Roadmap and milestones
- **[Finalized Decisions](/../.claude/docs/vibecheck/finalized-decisions/)** - All design decisions
- **[Development Setup](/contributing/development/)** - Local dev environment

---

[← Back to Contributing](/contributing/)
