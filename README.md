# @dao/vibe-check

> **Automation _and_ Evaluation for Claude Code — on top of Vitest.**
> Run agent workflows as pipelines. Benchmark models & configs at scale. Ship with **rich terminal + HTML reports** by default.

- **Automation:** orchestrate multi‑step agent pipelines, chain agents, capture artifacts and metrics.
- **Evaluation:** matrix test prompts/agents, track cost & quality, and gate releases with LLM judges.
- **Killer feature:** production‑grade **reporting**—costs, tokens, timelines, transcripts, todos, artifacts.

Built for **Vitest v3**. TypeScript‑first. Streaming‑friendly.

---

## Quick Start

### 1) Install

```bash
bun add -D @dao/vibe-check vitest
```

### 2) Create `vitest.config.ts`

```typescript
import { defineVibeConfig } from '@dao/vibe-check';

export default defineVibeConfig({
  test: { include: ['tests/**/*.test.ts'] },
});
```

### 3) First Automation — "Analyze then Fix"

```typescript
// tests/automation.example.test.ts
import { vibeTest, defineAgent, prompt } from '@dao/vibe-check';

const analyzer = defineAgent({
  name: 'analyzer',
  tools: ['Read', 'Grep'],
  source: { type: 'temp' }, // safe isolated workspace
});

const fixer = defineAgent({
  name: 'fixer',
  tools: ['Edit', 'Read', 'Bash(git *)'],
  source: { type: 'temp' },
});

vibeTest('analyze → fix pipeline', async ({ runAgent, expect }) => {
  const analysis = await runAgent({
    agent: analyzer,
    prompt: prompt({ command: '/analyze', text: 'Scan auth module @src/auth/**.ts' }),
  });

  const fixes = await runAgent({
    agent: fixer,
    prompt: prompt({
      command: '/fix-issues',
      text: `Address the problems discovered.`,
      attachments: ['.vibe-artifacts/last-analysis.json'],
    }),
  });

  expect(fixes).toCompleteAllTodos();
  expect(fixes).toHaveNoErrorsInLogs();
});
```

Run with `bun test`. You'll get:
- ✅ Terminal cost summary
- 📊 HTML report at `./vibe-report.html` (transcripts, tools, todos, artifacts)

### 4) First Evaluation — Benchmark Two Agents

```typescript
// tests/eval.example.test.ts
import { defineTestSuite, defineAgent, vibeTest, prompt, RubricSchema } from '@dao/vibe-check';

const rubric = RubricSchema.parse({
  criteria: [
    { id: 'correctness', description: 'Keeps behavior', weight: 0.5, required: true, kind: 'llm' },
    { id: 'readability', description: 'Improves clarity', weight: 0.3, kind: 'llm' },
    { id: 'modern_patterns', description: 'Uses modern TS patterns', weight: 0.2, kind: 'llm' },
  ],
  passingScore: 0.75,
  evaluationMethod: 'llm',
});

defineTestSuite({
  matrix: {
    agent: [
      defineAgent({ name: 'fast', model: 'claude-haiku-3-5', tools: ['Read', 'Edit'], source: { type: 'temp' } }),
      defineAgent({ name: 'quality', model: 'claude-opus-4', tools: ['Read', 'Edit'], source: { type: 'temp' } }),
    ],
  },
  test: ({ agent }) => {
    vibeTest(`${agent.name} refactor`, async ({ runAgent, judge, expect }) => {
      const result = await runAgent({
        agent,
        prompt: prompt({ command: '/refactor', text: 'Refactor @src/utils/legacy.ts to modern TS' }),
      });

      const evaln = await judge(result, { rubric, throwOnFail: false });
      expect(result).toCompleteAllTodos();
      expect(evaln.score!).toBeGreaterThan(0.75);
    });
  },
});
```

---

## Why vibe‑check?

Two jobs, one tool:

### As an Automation Suite
1. Run **agent pipelines** (multi‑step tasks)
2. **Orchestrate multiple agents** with different tools
3. Get **production‑grade reporting** on every run
4. Reuse **Vitest** infra you already know (fixtures, reporters, CI)

### As an Evaluation Framework
1. **Benchmark** models, prompts, tools, MCP servers
2. **Matrix test** every combination in parallel
3. Track **costs, tokens, duration, todos** per run
4. Enforce **quality gates** with matchers and LLM‑based judges

> Whether you're automating or evaluating, you get **rich terminal + HTML reports** with transcripts and tool timelines.

---

## Complete Documentation

📚 **[Full Documentation →](./docs/)**

### Learn the Basics
- 🚀 **[Getting Started](./docs/getting-started/)** - Tutorials for first-time users
- 📖 **[Guides](./docs/guides/)** - How-to guides for automation, evaluation, and agents
- 🧪 **[Recipes](./docs/recipes/)** - Copy-paste patterns for common scenarios
- 💡 **[Examples](./docs/examples/)** - Real-world code examples

### API & Reference
- 📚 **[API Reference](./docs/api/)** - Complete TypeScript API documentation
- 🔧 **[Advanced Topics](./docs/guides/advanced/)** - Isolation, cost optimization, CI/CD

### Integration & Development
- 🤖 **[Claude Code Integration](./docs/claude-code/)** - Scaffold, workflows, templates
- 🛠️ **[Contributing](./docs/contributing/)** - Architecture and development guides

---

## Core Concepts

### Prompts (atomic units)

`prompt()` creates a self‑contained, streamable input (command + text + attachments). Use prompts as reusable test "atoms."

```typescript
const REFACTOR_TO_TS = prompt({
  command: '/refactor',
  text: 'Migrate @src/legacy/*.js to TypeScript',
  attachments: ['docs/refactor-notes.md'],
});
```

### Agents (where/how execution happens)

Agents declare model, tools/MCP, source (workspace), timeouts, system prompts, and custom slash‑commands.

```typescript
const agent = defineAgent({
  name: 'default',
  model: 'claude-3-5-sonnet-latest',
  tools: ['Read', 'Edit', 'Grep', 'Bash(git *)'],
  source: { type: 'temp' },             // default-safe workspace
  systemPrompt: { preset: 'base', append: 'Prefer explicit types.' },
});
```

### Results (what you get back)

Every run yields a structured `RunResult`: messages, toolCalls, todos, metrics `{ tokens, cost, duration }`, artifacts[].

### Reporting (always on)

Terminal summaries + an HTML report with transcripts, tool timelines, todo status, costs, tokens, and artifact links.

### Matchers (quality gates)

`toStayUnderCost`, `toCompleteAllTodos`, `toUseOnlyTools`, `toHaveNoErrorsInLogs`, `toPassRubric`.

### Judges (LLM evaluation)

Schema‑validated rubrics with hybrid (programmatic + LLM) evaluation. Throw on fail or inspect scores and rationales.

---

## API Quick Reference

### `vibeTest(name, fn, timeout?)`

Vitest test with vibe‑check fixtures: `{ runAgent, judge, artifacts, metrics, task, expect }`.

### `prompt(input)`

Create a reusable, streamable prompt.

```typescript
function prompt(text: string): AsyncIterablePrompt
function prompt(options: {
  text: string;
  command?: string;         // include slash command (e.g., '/refactor')
  attachments?: string[];   // file paths (images/docs) included in the prompt
}): AsyncIterablePrompt
```

### `defineAgent(spec): Agent`

```typescript
type AgentSpec = {
  name?: string;
  model?: string;                            // default: 'claude-3-5-sonnet-latest'
  tools?: string[];                          // allowed tools / MCP names
  mcpServers?: Record<string, { url: string; tools?: string[] }>;
  source?: SourceSpec;                       // default: { type: 'temp' }
  timeouts?: { maxTurns?: number; timeoutMs?: number };
  systemPrompt?: { preset?: string; append?: string; appendFromFile?: string };
  commands?: Record<string, CommandDefinition>;
};
```

### `runAgent(options): Promise<RunResult>`

```typescript
type RunAgentOptions = {
  prompt: string | AsyncIterablePrompt;
  agent?: Agent;                 // default agent with safe defaults if omitted
  override?: Partial<AgentSpec>; // per-run overrides (e.g., model, timeouts)
};

type RunResult = {
  messages: Array<{ role: 'system'|'user'|'assistant'|'tool'; content: unknown; ts: number }>;
  toolCalls: ToolCallRecord[];
  todos: TodoItem[];
  metrics: { totalTokens?: number; totalCostUsd?: number; durationMs?: number };
  artifacts: string[]; // file paths captured
};
```

**[→ Complete API Reference](./docs/api/)**

---

## Project Source Management

Agents run inside a source (workspace). Three modes:
- `{ type: 'temp' }` (default) – fresh, isolated workspace per run. Safe to try anything.
- `{ type: 'local', path, isolate? = true }` – work from a local folder with automatic isolation. Original files are never modified.
- `{ type: 'git', url, branch?, commit?, depth?, worktree?: { ... } }` – run against a repository reference with isolation and configurable cleanup.

**Safety:** All modes support isolation-first behavior. Use cleanup policies to keep workspaces for debugging or remove them automatically.

**[→ Full Source Management Guide](./docs/guides/agents/sources.md)**

---

## Matrix Testing

Rule: Any array in matrix is a dimension. Vibe‑check expands to the Cartesian product.

```typescript
defineTestSuite({
  name: 'refactor-matrix',
  matrix: {
    agent: [
      defineAgent({ name: 'sonnet', model: 'claude-sonnet-4-5', tools: ['Read', 'Edit'], source: { type: 'temp' } }),
      defineAgent({ name: 'opus',   model: 'claude-opus-4',     tools: ['Read', 'Edit'], source: { type: 'temp' } }),
    ],
    maxTurns: [8, 16],
  },
  test: ({ agent, maxTurns }) => {
    vibeTest(`${agent.name} in ${maxTurns} turns`, async ({ runAgent, expect }) => {
      const result = await runAgent({
        agent,
        prompt: prompt({ command: '/refactor', text: 'Refactor @src/index.ts' }),
        override: { timeouts: { maxTurns } },
      });
      expect(result).toCompleteAllTodos();
    });
  },
});
```

**Debugging:** Use `--grep` to run subsets, e.g., `bun test --grep "opus.*16"`.

**[→ Complete Matrix Testing Guide](./docs/guides/evaluation/matrix-testing.md)**

---

## LLM Judges & Rubrics

Use rubrics to evaluate subjective quality.

```typescript
import { RubricSchema, vibeTest } from '@dao/vibe-check';

const rubric = RubricSchema.parse({
  criteria: [
    { id: 'thoroughness', description: 'Finds critical issues', weight: 0.6, required: true, kind: 'llm' },
    { id: 'actionability', description: 'Suggestions are actionable', weight: 0.4, kind: 'llm' },
  ],
  passingScore: 0.8,
  evaluationMethod: 'llm',
});

vibeTest('review quality', async ({ runAgent, judge, expect }) => {
  const result = await runAgent({ prompt: '/review-pr 42' });
  const evaluation = await judge(result, { rubric, throwOnFail: true });
  expect(evaluation.score!).toBeGreaterThan(0.8);
});
```

**[→ Complete Judge & Rubric Guide](./docs/api/judge.md)**

---

## Custom Matchers

We ship:
- `toStayUnderCost(maxUsd)` - Enforce cost budgets
- `toCompleteAllTodos()` - Verify all tasks completed
- `toUseOnlyTools(allowlist)` - Validate tool usage
- `toHaveNoErrorsInLogs()` - Check for errors
- `toPassRubric(rubric)` - LLM-based quality check

Augment via standard `expect.extend` patterns.

**[→ Complete Matchers Reference](./docs/api/matchers.md)**

---

## Status

- ✅ Design finalized (API‑first, DX‑first)
- ✅ Complete documentation structure
- 🚧 Implementation tracking: fixtures, runner, reporters, judges
- 🧪 Examples kept compile‑ready and minimal

---

## Contributing

We welcome contributions! See our [Contributing Guide](./docs/contributing/) for:
- [Architecture Overview](./docs/contributing/architecture.md)
- [Implementation Plan](./docs/contributing/implementation-plan.md)
- [Development Setup](./docs/contributing/development.md)

---

## License

MIT

---

Built with ❤️ for developers who measure twice and ship once.
