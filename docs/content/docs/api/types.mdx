---
title: types
description: Complete TypeScript type definitions for Vibe Check
---

[API Reference](/api/) > Types

---

## Core Types

### RunResult

The canonical result of an agent run with auto-captured execution context.

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

---

### FileChange

One changed file with safe, lazy content access.

```typescript
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
```

#### Usage Examples

```typescript
const file = result.files.get('src/index.ts');

// Lazy load content
const before = await file.before?.text();
const after = await file.after?.text();

// Stream large files
const stream = file.after?.stream();
stream.pipe(process.stdout);

// Get diff patch
const patch = await file.patch('unified');
console.log(patch);

// Check if file was deleted
if (file.changeType === 'deleted') {
  console.log('File was removed');
}
```

---

### ToolCall

Structured tool invocation with inputs, outputs, and timing.

```typescript
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
```

#### Usage Examples

```typescript
// Find tool calls
const editCalls = result.tools.all().filter(t => t.name === 'Edit');

// Check duration
const slowCalls = result.tools.all().filter(t => t.durationMs! > 5000);

// Inspect failed tools
const failed = result.tools.all().filter(t => !t.ok);
for (const call of failed) {
  console.error(`${call.name} failed:`, call.input);
}
```

---

### TimelineEvent

Unified timeline events from SDK stream and Claude Code hooks.

```typescript
export type TimelineEvent =
  | { type: 'sdk-message'; role: 'assistant' | 'user' | 'tool'; ts: number; ref?: number }
  | { type: 'hook'; name: 'PreToolUse' | 'PostToolUse' | 'Notification' | 'Stop' | 'SubagentStop' | 'SessionStart' | 'SessionEnd'; ts: number; ref?: number }
  | { type: 'todo'; ts: number; items: Array<{ text: string; status: string }> };
```

#### Usage Examples

```typescript
for await (const event of result.timeline.events()) {
  switch (event.type) {
    case 'sdk-message':
      console.log(`[${event.role}] message at ${event.ts}`);
      break;
    case 'hook':
      console.log(`Hook: ${event.name} at ${event.ts}`);
      break;
    case 'todo':
      console.log(`Todos: ${event.items.length} items`);
      break;
  }
}
```

---

## Context Types

### VibeTestContext

Test context provided to `vibeTest` functions.

```typescript
type VibeTestContext = {
  runAgent(opts: RunAgentOptions): Promise<RunResult>;
  judge(res: RunResult, opts: { rubric: Rubric; throwOnFail?: boolean }): Promise<JudgeResult>;
  expect: typeof import('vitest')['expect'];
  annotate(message: string, type?: string, attachment?: TestAttachment): Promise<void>;
  task: import('vitest').TestContext['task'];
};
```

---

### WorkflowContext

Workflow context provided to `vibeWorkflow` functions.

```typescript
type WorkflowContext = {
  stage(name: string, opts: RunAgentOptions): Promise<RunResult>;

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

  until(
    predicate: (latest: RunResult) => boolean | Promise<boolean>,
    body: () => Promise<RunResult>,
    opts?: { maxIterations?: number }
  ): Promise<RunResult[]>;

  defaults: { workspace?: string; model?: string };
};
```

---

## Agent Configuration Types

### Agent

Configured agent ready for execution.

```typescript
export interface Agent {
  name?: string;
  model?: string;
  tools?: string[];
  mcpServers?: Record<string, MCPServerConfig>;
  source?: SourceSpec;
  timeouts?: { maxTurns?: number; timeoutMs?: number };
  systemPrompt?: SystemPromptSpec;
  commands?: Record<string, CommandDefinition>;
}
```

---

### AgentSpec

Agent configuration specification for `defineAgent`.

```typescript
export interface AgentSpec {
  name?: string;
  model?: string;
  tools?: string[];
  mcpServers?: Record<string, MCPServerConfig>;
  source?: SourceSpec;
  timeouts?: { maxTurns?: number; timeoutMs?: number };
  systemPrompt?: SystemPromptSpec;
  commands?: Record<string, CommandDefinition>;
}
```

---

### RunAgentOptions

Options for executing an agent.

```typescript
export interface RunAgentOptions {
  agent?: Agent;
  prompt: string | AsyncIterablePrompt;
  override?: Partial<AgentSpec>;
  workspace?: string;
  context?: RunResult;
}
```

---

### SourceSpec

Project source configuration.

```typescript
export type SourceSpec =
  | { type: 'git'; repo: string; ref?: string }
  | { type: 'local'; path: string }
  | { type: 'archive'; url: string };
```

---

### MCPServerConfig

MCP server configuration.

```typescript
export interface MCPServerConfig {
  command: string;
  args?: string[];
  env?: Record<string, string>;
}
```

---

### SystemPromptSpec

System prompt configuration.

```typescript
export type SystemPromptSpec =
  | string
  | { file: string }
  | { template: string; variables: Record<string, unknown> };
```

---

### CommandDefinition

Custom command definition.

```typescript
export interface CommandDefinition {
  description: string;
  prompt: string | ((args: Record<string, unknown>) => string);
  args?: Record<string, { type: string; required?: boolean; description?: string }>;
}
```

---

## Evaluation Types

### Rubric

Evaluation criteria for judge.

```typescript
export interface Rubric {
  criteria: Array<{
    name: string;
    weight: number;
    description?: string;
  }>;
  passingScore?: number;
}
```

---

### JudgeResult

Result of LLM-based evaluation.

```typescript
export interface JudgeResult {
  passed: boolean;
  score?: number;
  details?: Record<string, CriterionResult>;
}

export interface CriterionResult {
  score: number;
  reasoning?: string;
}
```

---

## Prompt Types

### AsyncIterablePrompt

Streamable prompt type.

```typescript
export interface AsyncIterablePrompt extends AsyncIterable<string> {
  text: string;
  command?: string;
  attachments?: string[];
}
```

---

### PromptOptions

Options for creating prompts.

```typescript
export interface PromptOptions {
  text: string;
  command?: string;
  attachments?: string[];
}
```

---

## Test Types

### TestAttachment

Attachment for test annotations.

```typescript
export interface TestAttachment {
  path?: string;
  body?: string | Buffer;
  contentType?: string;
}
```

---

### TodoItem

Todo list item from agent execution.

```typescript
export interface TodoItem {
  text: string;
  status: 'pending' | 'in_progress' | 'completed';
}
```

---

## Matcher Types

Custom matcher extensions to Vitest's `expect`.

```typescript
declare global {
  namespace Vi {
    interface Assertion {
      // File matchers
      toHaveChangedFiles(paths: string[]): void;
      toHaveNoDeletedFiles(): void;

      // Tool matchers
      toHaveUsedTool(name: string, opts?: { min?: number; max?: number }): void;
      toUseOnlyTools(allowlist: string[]): void;

      // Quality matchers
      toCompleteAllTodos(): void;
      toHaveNoErrorsInLogs(): void;
      toStayUnderCost(maxUsd: number): void;
      toPassRubric(rubric: Rubric): Promise<void>;
    }
  }
}
```

---

## Internal Types

### RunBundle

On-disk structure for execution artifacts (internal, not exposed to users).

```
.vibe-artifacts/{testId}/
  events.ndjson         # SDK stream events
  hooks.ndjson          # Hook payloads
  summary.json          # Finalized summary
  files/
    before/{sha256}     # File content (before)
    after/{sha256}      # File content (after)
```

---

### Summary

Internal summary structure (written to `summary.json`).

```typescript
interface Summary {
  metrics: {
    totalTokens?: number;
    totalCostUsd?: number;
    durationMs?: number;
  };
  toolCalls: Array<{
    name: string;
    ok: boolean;
    durationMs?: number;
  }>;
  fileStats: {
    added: number;
    modified: number;
    deleted: number;
    renamed: number;
    total: number;
  };
  git?: {
    before?: { head: string; dirty: boolean };
    after?: { head: string; dirty: boolean };
  };
}
```

---

## Type Guards

Useful type guards for working with results.

```typescript
// Check if file was added
function isAdded(file: FileChange): boolean {
  return file.changeType === 'added';
}

// Check if tool call succeeded
function isSuccessful(call: ToolCall): boolean {
  return call.ok;
}

// Check if todo is completed
function isCompleted(todo: TodoItem): boolean {
  return todo.status === 'completed';
}
```

---

## Related Documentation

- **[vibeTest](/api/vibeTest/)** - Test API using these types
- **[vibeWorkflow](/api/vibeWorkflow/)** - Workflow API using these types
- **[runAgent](/api/runAgent/)** - Agent execution with RunResult
- **[Custom Matchers](/api/matchers/)** - Matchers operating on these types

---

[← Back to API Reference](/api/)
