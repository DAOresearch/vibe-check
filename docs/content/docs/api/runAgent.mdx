---
title: runAgent
description: Execute an agent and get auto-captured execution context
---

[API Reference](/api/) > runAgent

---

## Overview

`runAgent` executes a Claude Code agent and returns a comprehensive `RunResult` with auto-captured execution context including git state, file changes, tool calls, todos, metrics, and timeline.

**Key features:**
- **Auto-capture**: Git state, file changes, and tool calls captured automatically via hooks
- **Lazy loading**: File contents loaded on-demand to handle large changesets
- **Cost tracking**: Tokens, cost (USD), and duration tracked automatically
- **Rich context**: Messages, todos, timeline unified from SDK and hooks

---

## Signature

```typescript
async function runAgent(options: RunAgentOptions): Promise<RunResult>
```

### RunAgentOptions

```typescript
interface RunAgentOptions {
  /** Agent configuration */
  agent?: Agent;

  /** Prompt to send to the agent */
  prompt: string | AsyncIterablePrompt;

  /** Override agent settings for this run */
  override?: Partial<AgentSpec>;

  /** Workspace directory (overrides workflow/test defaults) */
  workspace?: string;

  /** Context from previous run (for handoff) */
  context?: RunResult;
}
```

---

## RunResult

The canonical result of an agent run with auto-captured context.

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

**See:** [Types Reference](/api/types/) for supporting types (`FileChange`, `ToolCall`, `TimelineEvent`)

---

## Examples

### Basic Execution

```typescript
import { runAgent, defineAgent } from '@dao/vibe-check';

const agent = defineAgent({
  name: 'refactor',
  model: 'claude-sonnet-4'
});

const result = await runAgent({
  agent,
  prompt: '/refactor src/index.ts'
});

console.log('Cost:', result.metrics.totalCostUsd);
console.log('Files changed:', result.files.stats().total);
```

### Accessing Git State

```typescript
const result = await runAgent({
  agent,
  prompt: '/fix-types',
  workspace: '/path/to/repo'
});

// Git commits
console.log('Before:', result.git.before?.head);
console.log('After:', result.git.after?.head);
console.log('Dirty:', result.git.after?.dirty);

// Diff summary
const diff = await result.git.diffSummary();
for (const file of diff) {
  console.log(`${file.change} ${file.path}`);
}
```

### Working with File Changes

```typescript
const result = await runAgent({
  agent,
  prompt: '/refactor'
});

// Get all changed files
const files = result.files.changed();
console.log(`Changed ${files.length} files`);

// Filter by glob
const tsFiles = result.files.filter('src/**/*.ts');

// Get specific file
const indexFile = result.files.get('src/index.ts');
if (indexFile) {
  const before = await indexFile.before?.text();
  const after = await indexFile.after?.text();
  console.log('Before:', before);
  console.log('After:', after);

  // Get patch
  const patch = await indexFile.patch('unified');
  console.log(patch);
}

// File stats
const stats = result.files.stats();
console.log('Added:', stats.added);
console.log('Modified:', stats.modified);
console.log('Deleted:', stats.deleted);
console.log('Renamed:', stats.renamed);
```

### Tool Call Inspection

```typescript
const result = await runAgent({
  agent,
  prompt: '/refactor'
});

// Check tool usage
const bashCount = result.tools.used('Bash');
console.log(`Bash called ${bashCount} times`);

// Find specific tool call
const firstEdit = result.tools.findFirst('Edit');
if (firstEdit) {
  console.log('Edit input:', firstEdit.input);
  console.log('Edit output:', firstEdit.output);
  console.log('Duration:', firstEdit.durationMs, 'ms');
}

// All tool calls
for (const call of result.tools.all()) {
  console.log(`${call.name} (${call.durationMs}ms) - ${call.ok ? 'OK' : 'FAILED'}`);
}
```

### Todo Tracking

```typescript
const result = await runAgent({
  agent,
  prompt: '/implement-feature'
});

// Check todos
const completed = result.todos.filter(t => t.status === 'completed');
const pending = result.todos.filter(t => t.status === 'pending');

console.log('Completed:', completed.length);
console.log('Pending:', pending.length);

// List incomplete todos
for (const todo of pending) {
  console.log('- [ ]', todo.text);
}
```

### Messages and Timeline

```typescript
const result = await runAgent({
  agent,
  prompt: '/refactor'
});

// Messages (summarized)
for (const msg of result.messages) {
  console.log(`[${msg.role}] ${msg.summary}`);

  // Load full content if needed
  if (msg.role === 'assistant') {
    const full = await msg.load();
    console.log(full);
  }
}

// Unified timeline
for await (const event of result.timeline.events()) {
  if (event.type === 'sdk-message') {
    console.log(`Message from ${event.role} at ${event.ts}`);
  } else if (event.type === 'hook') {
    console.log(`Hook: ${event.name} at ${event.ts}`);
  } else if (event.type === 'todo') {
    console.log(`Todos updated: ${event.items.length} items`);
  }
}
```

### Agent Overrides

```typescript
const result = await runAgent({
  agent: baseAgent,
  prompt: '/refactor',
  override: {
    model: 'claude-opus-4',  // Override model
    timeouts: {
      maxTurns: 20,         // Override max turns
      timeoutMs: 600000     // 10 min timeout
    },
    tools: ['Read', 'Edit', 'Grep']  // Restrict tools
  }
});
```

### Context Handoff

```typescript
// First agent analyzes
const analysis = await runAgent({
  agent: analyzer,
  prompt: '/analyze codebase'
});

// Second agent gets context
const fixes = await runAgent({
  agent: fixer,
  prompt: '/fix issues found',
  context: analysis  // Pass previous result
});

// Access both contexts
console.log('Analysis files:', analysis.files.stats().total);
console.log('Fix files:', fixes.files.stats().total);
```

### Workspace Override

```typescript
// In vibeWorkflow with defaults
vibeWorkflow(
  'multi-repo',
  async (wf) => {
    // Uses workflow default
    await wf.stage('main-repo', {
      agent,
      prompt: '/update'
    });

    // Override for specific stage
    await wf.stage('docs-repo', {
      agent,
      prompt: '/update-docs',
      workspace: '/path/to/docs'  // Override
    });
  },
  { defaults: { workspace: '/path/to/main' } }
);
```

### Metrics and Cost

```typescript
const result = await runAgent({
  agent,
  prompt: '/refactor'
});

console.log('Metrics:', {
  tokens: result.metrics.totalTokens,
  cost: `$${result.metrics.totalCostUsd?.toFixed(4)}`,
  duration: `${(result.metrics.durationMs! / 1000).toFixed(1)}s`,
  toolCalls: result.metrics.toolCalls,
  filesChanged: result.metrics.filesChanged
});
```

### Error Handling

```typescript
try {
  const result = await runAgent({
    agent,
    prompt: '/complex-task'
  });

  // Check for errors in logs
  const errors = result.messages.filter(m =>
    m.summary.toLowerCase().includes('error')
  );

  if (errors.length > 0) {
    console.error('Found errors:', errors);
  }

  // Check incomplete tool calls
  const failed = result.tools.all().filter(t => !t.ok);
  if (failed.length > 0) {
    console.error('Failed tools:', failed.map(t => t.name));
  }

} catch (error) {
  console.error('Agent execution failed:', error);
}
```

---

## Auto-Capture Details

### What Gets Captured Automatically

1. **Git State**
   - Commit hash before/after
   - Dirty state (uncommitted changes)
   - Changed file paths from `git diff --name-status`

2. **File Changes**
   - Correlated from tool calls (Write, Edit) and git diff
   - Before/after content (lazy loaded)
   - Change type (added, modified, deleted, renamed)
   - Content-addressed storage (deduplicated)

3. **Tool Calls**
   - Correlated from PreToolUse + PostToolUse hooks
   - Input/output (JSON-safe)
   - Duration, success/failure
   - Working directory

4. **Metrics**
   - Tokens from SDK stream
   - Cost calculated from usage
   - Wall-clock duration
   - Tool call count
   - File change count

5. **Messages & Todos**
   - Conversation messages (summarized)
   - Todo list with status tracking
   - Timestamps

6. **Timeline**
   - Unified events from SDK + hooks
   - Chronological ordering
   - Support for batched events

### Storage (RunBundle)

All execution data is persisted to disk in a RunBundle:

```
.vibe-artifacts/{testId}/
  events.ndjson         # SDK stream events
  hooks.ndjson          # Hook payloads
  summary.json          # Finalized summary
  files/
    before/{sha256}     # File content (before)
    after/{sha256}      # File content (after)
```

**Benefits:**
- Scales to 100+ file changes
- No memory bloat (lazy loading)
- Reporters read from disk
- Audit trail preserved

---

## Performance Considerations

### Lazy Loading

File contents are **never** loaded into memory automatically:

```typescript
// Efficient: only loads files you access
const tsFiles = result.files.filter('**/*.ts');
for (const file of tsFiles) {
  const content = await file.after?.text();  // Loaded on-demand
  // process content
}
```

### Large Files

Files >10MB are gzipped automatically:

```typescript
const largeFile = result.files.get('bundle.js');
// Decompressed transparently
const content = await largeFile.after?.text();

// Or stream for very large files
const stream = largeFile.after?.stream();
```

### Content-Addressed Storage

Duplicate file content is stored only once:

```typescript
// If file is unchanged, before and after share same SHA256
const file = result.files.get('config.json');
if (file.before?.sha256 === file.after?.sha256) {
  console.log('File unchanged (content match)');
}
```

---

## Related Documentation

- **[vibeTest](/api/vibeTest/)** - Evaluation and benchmarking
- **[vibeWorkflow](/api/vibeWorkflow/)** - Multi-stage pipelines
- **[Types Reference](/api/types/)** - RunResult, FileChange, ToolCall types
- **[Custom Matchers](/api/matchers/)** - Assertions on RunResult
- **[defineAgent](/api/defineAgent/)** - Agent configuration

---

[← Back to API Reference](/api/)
