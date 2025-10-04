# API Reference

> Complete TypeScript reference for Vibe Check

[Home](../) > API Reference

This section provides complete API documentation with TypeScript type signatures, parameters, return values, and examples.

---

## Core API

### [vibeTest](./vibeTest.md)
The main test function with Vibe Check fixtures and context.

```typescript
vibeTest(name: string, fn: TestFunction, timeout?: number): void
```

**Provides:**
- `runAgent` - Execute agents
- `judge` - LLM-based evaluation
- `artifacts` - Save test artifacts
- `expect` - Custom matchers

---

### [prompt](./prompt.md)
Create reusable, streamable prompts.

```typescript
function prompt(text: string): AsyncIterablePrompt
function prompt(options: {
  text: string;
  command?: string;
  attachments?: string[];
}): AsyncIterablePrompt
```

**Returns:** Async iterable compatible with Claude's streaming API

---

### [defineAgent](./defineAgent.md)
Configure agent execution environment.

```typescript
function defineAgent(spec: AgentSpec): Agent

interface AgentSpec {
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

### [runAgent](./runAgent.md)
Execute an agent and get structured results.

```typescript
async function runAgent(options: RunAgentOptions): Promise<RunResult>

interface RunAgentOptions {
  prompt: string | AsyncIterablePrompt;
  agent?: Agent;
  override?: Partial<AgentSpec>;
}

interface RunResult {
  messages: AgentMessage[];
  toolCalls: ToolCallRecord[];
  todos: TodoItem[];
  metrics: RunMetrics;
  artifacts: string[];
}
```

---

### [judge](./judge.md)
LLM-based evaluation with rubrics.

```typescript
async function judge(
  result: RunResult,
  options: {
    rubric: Rubric;
    throwOnFail?: boolean;
  }
): Promise<JudgeResult>

interface JudgeResult {
  passed: boolean;
  score?: number;
  details?: Record<string, CriterionResult>;
}
```

---

## Matchers

### [Custom Matchers](./matchers.md)
Quality assertions for agent results.

Available matchers:
- `toStayUnderCost(maxUsd: number)` - Enforce cost budgets
- `toCompleteAllTodos()` - Verify all tasks completed
- `toUseOnlyTools(allowlist: string[])` - Validate tool usage
- `toHaveNoErrorsInLogs()` - Check for errors in messages
- `toPassRubric(rubric: Rubric)` - LLM-based quality check

---

## Types

### [TypeScript Types](./types.md)
Complete type reference for all interfaces, types, and enums.

**Major types:**
- `Agent` - Agent configuration
- `RunResult` - Agent execution results
- `Rubric` - Evaluation criteria
- `SourceSpec` - Project source configuration
- `ToolCallRecord` - Tool invocation details
- `TodoItem` - Todo list item

---

## Matrix Testing

### [defineTestSuite](../guides/evaluation/matrix-testing.md)
Generate test combinations from arrays.

```typescript
defineTestSuite({
  name?: string;
  matrix: Record<string, any[]>;
  test: (combination: Record<string, any>) => void;
}): void
```

**Example:**
```typescript
defineTestSuite({
  matrix: {
    model: ['haiku', 'sonnet', 'opus'],
    maxTurns: [5, 10],
  },
  test: ({ model, maxTurns }) => {
    vibeTest(`${model} in ${maxTurns} turns`, async ({ runAgent }) => {
      // Test implementation
    });
  },
});
```

Generates **6 tests** (3 models × 2 turn limits)

---

## Configuration

### [defineVibeConfig](./types.md#definevibeconfig)
Configure Vitest with Vibe Check reporters and settings.

```typescript
function defineVibeConfig(config?: UserConfig): UserConfig
```

Adds:
- Vibe Check reporters (cost + HTML)
- TypeScript setup
- Sensible test timeouts

---

## Related Documentation

- **[Guides](../guides/)** - How to use the API in practice
- **[Recipes](../recipes/)** - Working code examples
- **[Examples](../examples/)** - Real-world usage

---

[← Back to Documentation Home](../)
