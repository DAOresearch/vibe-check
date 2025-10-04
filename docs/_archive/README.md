# ARCHIVED: Original README.md

> **Archived on:** 2025-10-04
> **Replaced by:** Root README.md (adopted from readme-exp.mdx structure)
> **Reason:** Restructured to Diátaxis framework with 69% reduction (1665 → 368 lines)

This file is preserved for historical reference and content migration. The new documentation structure is organized in `/docs/` following the Diátaxis framework (tutorials, guides, recipes, reference).

See `MIGRATION_GUIDE.md` for the complete migration plan.

---

# Vibe Check

> Vitest-based testing framework for Claude Code slash commands and workflows

Test, benchmark, and evaluate your Claude Code slash commands with different models, tools, and configurations. Built on Vitest with custom matchers, cost tracking, and LLM-based evaluation.

## What is Vibe Check?

**Vibe Check** (`@dao/vibe-check`) is a DX-first testing harness for validating Claude Code workflows. Write tests for your slash commands, run them with different configurations in parallel, track costs and quality metrics, and use LLM-based judges for evaluation.

### Primary Use Case: Claude Code Testing & Benchmarking

Test your Claude Code slash commands with:
- **Different models** - Compare Sonnet vs Opus performance
- **Different tools** - Test with various tool combinations
- **Different MCP servers** - Benchmark with different configurations
- **Parallel execution** - Run the same command with 10 configs simultaneously
- **Cost tracking** - Monitor token usage and costs across runs
- **Quality metrics** - Track todo completion, tool usage, execution time

### Secondary Use Case: LLM as a Judge

Import Vibe Check into any Vitest project to use its LLM judge capabilities for evaluating test outputs.

## Features

- **vibeTest** - Extended Vitest with Claude Code fixtures and typed context
- **Custom Matchers** - `toStayUnderCost()`, `toCompleteAllTodos()`, `toPassRubric()`, `toUseOnlyTools()`, `toHaveNoErrorsInLogs()`
- **Matrix Testing** - Cartesian product test generation for multi-config benchmarking
- **Cost Tracking** - Automatic cost and token usage monitoring
- **Reporters** - CLI cost summaries and rich HTML reports with transcripts
- **Judge/Rubric System** - LLM-based evaluation with hybrid (programmatic + AI) scoring
- **Artifact Management** - Capture agent outputs, diffs, and logs

## Quick Start

### Install

```bash
bun install @dao/vibe-check
```

### Write Your First Test

```typescript
import { vibeTest, prompt, defineAgent } from '@dao/vibe-check';

const agent = defineAgent({
  tools: ['Edit', 'Read', 'Bash(git *)'],
  source: { type: 'temp' },
  timeouts: { maxTurns: 8 },
});

vibeTest('refactor stays under budget', async ({ runAgent, expect }) => {
  const result = await runAgent({
    prompt: prompt({
      text: 'Refactor this file @src/index.ts',
      command: '/refactor'
    }),
    agent,
  });

  expect(result).toStayUnderCost(3.50);
  expect(result).toOnlyEdit(["src/index.ts"]);
  expect(result).toHaveNoErrorsInLogs();
});
```

### Configure Vitest

```typescript
import { defineVibeConfig } from '@dao/vibe-check';

export default defineVibeConfig({
  test: {
    include: ['tests/**/*.test.ts'],
  },
});
```

### Run Tests

```bash
bun test
```

**Output:**
- ✅ Console with per-test cost summaries
- 📊 HTML report at `./vibe-report.html` with transcripts and tool timelines
- 🎯 Rubric evaluation results

## Prompt Builder API

Build prompts as reusable, testable units with the `prompt()` function. Prompts combine command, text, and attachments into atomic units designed for matrix testing.

### API Signature

```typescript
// Simple text-only prompts
function prompt(text: string): AsyncIterablePrompt

// Prompts with options (text goes in options)
function prompt(options: {
  text: string
  command?: string
  attachments?: string[]
}): AsyncIterablePrompt
```

Returns an async iterator compatible with [Claude's streaming API](https://docs.claude.com/en/api/agent-sdk/streaming-vs-single-mode).

### Simple Prompts

```typescript
import { prompt, vibeTest } from '@dao/vibe-check';

// Store as const for reuse
const refactorPrompt = prompt('Refactor this component to use hooks');

vibeTest('refactor test', async ({ runAgent }) => {
  const result = await runAgent({ prompt: refactorPrompt });
  // ...
});
```

### Prompts with Attachments

Attach images and external files - they're automatically processed:

```typescript
const designPrompt = prompt({
  text: 'Implement this landing page design',
  attachments: ['designs/hero.png', 'designs/mobile-view.png']
});

const codeReviewPrompt = prompt({
  text: 'Review this implementation @src/auth.ts @src/auth.test.ts',
  attachments: ['external-security-audit.pdf']
});
```

### Prompts with Commands

Combine slash commands with text and context:

```typescript
const prdPrompt = prompt({
  text: 'Create a PRD for OAuth integration @docs/current-auth.md',
  command: '/prd'
});

const reviewPrompt = prompt({
  text: 'Check for security vulnerabilities in @src/auth.ts @src/api/auth-middleware.ts',
  command: '/review-pr'
});
```

### Reusable Prompt Patterns

Store prompts as constants for consistency across tests:

```typescript
// prompts.ts
export const REFACTOR_TO_HOOKS = prompt('Refactor to React hooks');
export const ADD_TESTS = prompt('Add comprehensive unit tests');
export const SECURITY_REVIEW = prompt({
  text: 'Review for security issues',
  command: '/review-pr'
});

// test.ts
import { REFACTOR_TO_HOOKS, ADD_TESTS } from './prompts';

vibeTest('refactor workflow', async ({ runAgent }) => {
  await runAgent({ prompt: REFACTOR_TO_HOOKS });
  await runAgent({ prompt: ADD_TESTS });
});
```

### Composing Prompts

Build prompts dynamically:

```typescript
function createReviewPrompt(fileRefs: string) {
  return prompt({
    text: `Review this code for quality and security ${fileRefs}`,
    command: '/review-pr'
  });
}

vibeTest('review suite', async ({ runAgent }) => {
  const authReview = createReviewPrompt('@src/auth/**/*.ts');
  const apiReview = createReviewPrompt('@src/api/**/*.ts');

  await runAgent({ prompt: authReview });
  await runAgent({ prompt: apiReview });
});
```

### Matrix Testing with Prompts

Arrays of prompts automatically create test dimensions (covered in [Matrix Testing](#matrix-testing)):

```typescript
const prompts = [
  prompt('Implement feature A @specs/feature-a.md'),
  prompt('Implement feature B @specs/feature-b.md'),
  prompt({
    text: 'Implement feature C @specs/feature-c.md',
    attachments: ['designs/feature-c-mockup.png']
  })
];

// Each prompt becomes a test case
defineTestSuite({
  matrix: { prompts },  // 3 test runs
  // ...
});
```

## Agent Builder & Configuration

Agents define **where** and **how** prompts execute. While prompts specify **what to do**, agents configure the execution environment: model, tools, project source, system prompts, and custom commands.

### Simple Agent Definition

Most tests need minimal configuration:

```typescript
import { defineAgent, vibeTest } from '@dao/vibe-check';

const defaultAgent = defineAgent({
  tools: ['Read', 'Edit', 'Grep'],
  source: { type: 'temp' },  // Isolated temporary workspace
});

vibeTest('refactor test', async ({ runAgent }) => {
  const result = await runAgent({
    prompt: prompt('Refactor @src/index.ts'),
    agent: defaultAgent,
  });

  expect(result).toCompleteAllTodos();
});
```

### Agent Configuration Options

```typescript
const agent = defineAgent({
  name?: string;                        // Agent identifier for matrix testing
  model?: string;                       // Default: 'claude-3-5-sonnet-latest'
  tools?: string[];                     // Allowed tools (security allowlist)
  mcpServers?: Record<string, MCPServerConfig>;  // Custom MCP servers
  timeouts?: {
    maxTurns?: number;
    timeoutMs?: number;
  };
  source?: SourceSpec;                  // Where code lives (temp/local/git)
  systemPrompt?: SystemPromptSpec;      // Agent persona/instructions
  commands?: Record<string, CommandDefinition>;  // Custom slash commands
});
```

### Project Sources

Agents support three source types with automatic isolation:

#### Temporary Source (Default)

Creates isolated temporary workspace:

```typescript
const agent = defineAgent({
  source: { type: 'temp' }  // Fresh workspace per run
});
```

#### Local Source

Work with local files, automatically isolated:

```typescript
// Local directory (auto-isolated if git repo)
const agent = defineAgent({
  source: {
    type: 'local',
    path: './my-project',
    isolate: true,  // Default: true
  }
});

// Shorthand
const agent = defineAgent({
  source: './my-project'  // Auto-converts to LocalSource
});
```

**Isolation behavior:**
- If directory is a git repo → creates worktree
- If not a git repo → copies to temp workspace
- Original files never modified

#### Git Source

Clone repositories with branch/commit control:

```typescript
const agent = defineAgent({
  source: {
    type: 'git',
    url: 'https://github.com/acme/app.git',
    branch: 'main',
    commit: 'abc123',  // Optional: pin to commit
    depth: 1,          // Shallow clone
    worktree: {
      isolate: true,   // Default: true
      cleanup: 'always'  // 'always' | 'on-success' | 'never'
    }
  }
});

// Shorthand with GitHub
const agent = defineAgent({
  source: 'gh:acme/app#main@abc123'
});
```

### Worktree Isolation

All sources support automatic worktree isolation for parallel, safe execution:

```typescript
const agent = defineAgent({
  source: {
    type: 'git',
    url: 'gh:acme/app',
    worktree: {
      isolate: true,           // Create isolated worktree per run
      mode: 'auto',            // 'auto' | 'branch' | 'detached'
      cleanup: 'on-success',   // Clean worktree after successful run
      baseDir: './worktrees'   // Where to create worktrees
    }
  }
});
```

**Cleanup policies:**
- `'always'` - Remove worktree after every run
- `'on-success'` - Remove only if test passes
- `'never'` - Keep worktree for debugging

### System Prompts

Customize agent behavior with preset personas:

```typescript
const agent = defineAgent({
  systemPrompt: {
    preset: 'security-auditor',  // Built-in presets
    append: 'Focus on authentication flows.'
  }
});

// Available presets:
// - 'base' - General purpose
// - 'refactorer' - Code improvement focus
// - 'security-auditor' - Security analysis
// - 'test-writer' - Test generation
```

Load custom instructions from files:

```typescript
const agent = defineAgent({
  systemPrompt: {
    preset: 'base',
    appendFromFile: './prompts/custom-instructions.md'
  }
});
```

### Custom Slash Commands

Extend agents with custom commands:

```typescript
import { defineAgent } from '@dao/vibe-check';

const agent = defineAgent({
  commands: {
    '/scan-secrets': {
      description: 'Scan repository for exposed secrets',
      preflight: async (ctx) => {
        // Run before agent starts
        await validateGitRepo(ctx.cwd);
      },
      transformPrompt: (prompt) => {
        // Modify prompt before execution
        return `${prompt}\n\nUse Trufflehog patterns for secret detection.`;
      },
      postprocess: async (ctx, result) => {
        // Run after agent completes
        await generateSecurityReport(result);
      }
    }
  }
});

vibeTest('security scan', async ({ runAgent }) => {
  const result = await runAgent({
    prompt: '/scan-secrets @src/',
    agent
  });

  expect(result.artifacts).toContain('security-report.md');
});
```

### Agent Overrides

Override agent config per test:

```typescript
const baseAgent = defineAgent({
  model: 'claude-sonnet-4-5',
  tools: ['Read', 'Edit'],
  source: { type: 'temp' }
});

vibeTest('expensive operation', async ({ runAgent }) => {
  const result = await runAgent({
    prompt: prompt('Complex refactor @src/'),
    agent: baseAgent,
    override: {
      model: 'claude-opus-4',  // Upgrade model for this test
      timeouts: { maxTurns: 50 }
    }
  });
});
```

### Matrix Testing with Agents

Compare agent configurations:

```typescript
import { defineTestSuite, defineAgent } from '@dao/vibe-check';

defineTestSuite({
  matrix: {
    agent: [
      defineAgent({
        name: 'fast',
        model: 'claude-haiku-3-5',
        source: { type: 'temp' }
      }),
      defineAgent({
        name: 'quality',
        model: 'claude-opus-4',
        source: 'gh:acme/app#main'  // Test on real repo
      })
    ]
  },
  test: ({ agent }) => {
    vibeTest(`${agent.name} refactor`, async ({ runAgent, expect }) => {
      const result = await runAgent({
        prompt: prompt({
          text: 'Refactor authentication module',
          command: '/refactor'
        }),
        agent
      });

      expect(result).toCompleteAllTodos();

      // Compare costs in HTML report
      task.meta.cost = result.metrics.totalCostUsd;
    });
  }
});
```

### Agent Registry (Optional)

For teams sharing agent configs:

```typescript
// agents.ts
import { defineAgents, defineAgent } from '@dao/vibe-check';

export const agents = defineAgents({
  default: defineAgent({
    source: { type: 'temp' },
    tools: ['Read', 'Edit', 'Grep']
  }),

  security: defineAgent({
    name: 'security',
    model: 'claude-opus-4',
    tools: ['Read', 'Grep', 'Glob'],
    source: 'gh:acme/app#main',
    systemPrompt: { preset: 'security-auditor' }
  }),

  refactor: defineAgent({
    name: 'refactor',
    tools: ['Read', 'Edit', 'Bash(git *)'],
    source: './src',
    systemPrompt: { preset: 'refactorer' }
  })
});

// test.ts
import { agents } from './agents';

vibeTest('security scan', async ({ runAgent }) => {
  await runAgent({
    prompt: '/scan-secrets',
    agent: agents.security  // Or string: 'security'
  });
});
```

## Common Testing Scenarios

### Quality Gates for Slash Commands

Ensure your custom commands meet quality standards:

```typescript
const prdAgent = defineAgent({
  tools: ['Write', 'Read', 'WebFetch'],
  source: { type: 'temp' },
});

vibeTest('PRD includes all required sections', async ({ runAgent, expect }) => {
  const result = await runAgent({
    prompt: prompt({
      text: 'Implement OAuth authentication',
      command: '/prd'
    }),
    agent: prdAgent,
  });

  // Structural assertions
  expect(result.artifacts).toContain('PRD.md');

  // Content quality (read the artifact)
  const prd = await result.readArtifact('PRD.md');
  expect(prd).toMatch(/## Problem Statement/);
  expect(prd).toMatch(/## Success Metrics/);
  expect(prd).toMatch(/## Technical Requirements/);

  // Completeness
  expect(result).toCompleteAllTodos();
  expect(result).toHaveNoErrorsInLogs();
});
```

### Model Performance Benchmarking

Compare accuracy vs cost tradeoffs:

```typescript
const fastAgent = defineAgent({
  model: 'claude-haiku-3-5',
  source: { type: 'temp' },
});

const qualityAgent = defineAgent({
  model: 'claude-opus-4',
  source: { type: 'temp' },
});

vibeTest('model comparison', async ({ runAgent, judge, expect }) => {
  const reviewPrompt = prompt({
    text: 'Review PR 42',
    command: '/review-pr'
  });

  const fast = await runAgent({
    prompt: reviewPrompt,
    agent: fastAgent,
  });

  const quality = await runAgent({
    prompt: reviewPrompt,
    agent: qualityAgent,
  });

  const fastEval = await judge(fast, { rubric: reviewQualityRubric });
  const qualityEval = await judge(quality, { rubric: reviewQualityRubric });

  // Quality model should score higher
  expect(qualityEval.score).toBeGreaterThan(fastEval.score);

  // But cost 3-5x more
  expect(quality.metrics.totalCostUsd).toBeGreaterThan(
    fast.metrics.totalCostUsd * 3
  );

  console.log(`Fast: $${fast.metrics.totalCostUsd?.toFixed(2)} (score: ${fastEval.score})`);
  console.log(`Quality: $${quality.metrics.totalCostUsd?.toFixed(2)} (score: ${qualityEval.score})`);
});
```

### Tool Allowlisting for Safety

Verify agents only use permitted tools:

```typescript
const readOnlyAgent = defineAgent({
  tools: ['Read', 'Grep', 'Glob'],  // No Edit, Bash, Write
  source: { type: 'local', path: './src' },
});

vibeTest('read-only operations stay safe', async ({ runAgent, expect }) => {
  const result = await runAgent({
    prompt: prompt({
      text: 'Analyze codebase for security issues',
      command: '/analyze'
    }),
    agent: readOnlyAgent,
  });

  // Verify no mutations
  expect(result).toUseOnlyTools(['Read', 'Grep', 'Glob']);
  expect(result.artifacts).toHaveLength(0);  // No files created

  // But still completed the analysis
  expect(result).toCompleteAllTodos();
});
```

### MCP Server Integration Testing

Validate custom MCP servers work correctly:

```typescript
const dbAgent = defineAgent({
  tools: ['mcp__database__*'],  // Only DB tools
  mcpServers: {
    database: {
      url: 'http://localhost:3000',
      tools: ['query', 'schema']
    },
  },
  source: { type: 'temp' },
});

vibeTest('database MCP queries correctly', async ({ runAgent, expect }) => {
  const result = await runAgent({
    prompt: prompt('Find all active users created in the last 30 days'),
    agent: dbAgent,
  });

  // Verify correct tool usage
  expect(result.toolCalls).toContainEqual(
    expect.objectContaining({
      name: 'mcp__database__query',
      ok: true
    })
  );

  // Verify no errors
  expect(result).toHaveNoErrorsInLogs();
});
```

## Matrix Testing

**Matrix testing is simple:** provide an array, get test dimensions. No complex setup required.

Run the same test across multiple configurations for comprehensive benchmarking. Any array in the `matrix` object creates a test dimension.

### Simple Matrix (Start Here)

Compare two models with a single array:

```typescript
import { defineTestSuite, vibeTest, prompt, defineAgent } from '@dao/vibe-check';

defineTestSuite({
  matrix: {
    model: ['claude-sonnet-4-5', 'claude-opus-4'],  // Array = test dimension
  },
  test: ({ model }) => {
    const agent = defineAgent({
      model,
      source: { type: 'temp' },
    });

    vibeTest(`${model} refactor`, async ({ runAgent, expect }) => {
      const result = await runAgent({
        prompt: prompt({
          text: 'Refactor this file @src/index.ts',
          command: '/refactor'
        }),
        agent,
      });

      expect(result).toCompleteAllTodos();
      expect(result).toStayUnderCost(5.00);
    });
  },
});
```

**That's it.** Generates **2 tests** with clear names: `claude-sonnet-4-5 refactor`, `claude-opus-4 refactor`

### Multi-Dimensional Matrix

**Add more arrays for Cartesian product:**

```typescript
defineTestSuite({
  matrix: {
    model: ['sonnet', 'opus'],      // 2 values
    maxTurns: [5, 10],              // 2 values = 2×2 = 4 tests
  },
  test: ({ model, maxTurns }) => {
    const agent = defineAgent({
      model: `claude-${model}-4`,
      source: { type: 'temp' },
      timeouts: { maxTurns },
    });

    vibeTest(`${model} in ${maxTurns} turns`, async ({ runAgent, expect }) => {
      const result = await runAgent({
        prompt: prompt({
          text: 'Refactor this utility file @src/utils.ts',
          command: '/refactor'
        }),
        agent,
      });

      expect(result).toCompleteAllTodos();
    });
  },
});
```

Generates **4 tests** automatically (2 models × 2 turn limits). Matrix dimensions multiply - that's the only math needed.

### Filtering Results

Debug or run subset of matrix tests:

```bash
# Run only Opus tests
bun test --grep "opus"

# Run only 5-turn tests
bun test --grep "5 turns"

# Run specific combination
bun test --grep "sonnet.*10 turns"
```

### Advanced: Multi-Variable Matrix

For comprehensive benchmarking with metadata:

```typescript
defineTestSuite({
  name: 'comprehensive-benchmark',
  matrix: {
    agent: [
      defineAgent({
        name: 'sonnet-minimal',
        model: 'claude-sonnet-4',
        tools: ['Edit', 'Read'],
        source: { type: 'temp' },
      }),
      defineAgent({
        name: 'sonnet-full',
        model: 'claude-sonnet-4',
        tools: ['Edit', 'Read', 'Grep', 'Bash(git *)'],
        source: { type: 'temp' },
      }),
      defineAgent({
        name: 'opus-minimal',
        model: 'claude-opus-4',
        tools: ['Edit', 'Read'],
        source: { type: 'temp' },
      }),
      defineAgent({
        name: 'opus-full',
        model: 'claude-opus-4',
        tools: ['Edit', 'Read', 'Grep', 'Bash(git *)'],
        source: { type: 'temp' },
      }),
    ],
  },
  test: ({ agent }) => {
    vibeTest(agent.name, async ({ runAgent, expect, task }) => {
      // Store for comparison in HTML report
      task.meta.agentName = agent.name;

      const result = await runAgent({
        prompt: prompt({
          text: 'Refactor this file @src/index.ts',
          command: '/refactor'
        }),
        agent,
      });

      expect(result).toCompleteAllTodos();

      // Store results for analysis
      task.meta.cost = result.metrics.totalCostUsd;
      task.meta.duration = result.metrics.durationMs;
    });
  },
});
```

Generates **4 tests** (4 agent configs). Check HTML report for side-by-side comparison.

## Assertions & Matchers

Vibe Check extends Vitest's `expect` with domain-specific matchers for agent testing.

### Cost Assertions

Fail tests that exceed budget:

```typescript
expect(result).toStayUnderCost(5.00);  // Fails if > $5.00
```

**Use in CI** to prevent expensive regressions:

```typescript
vibeTest('refactor stays cheap', async ({ runAgent, expect }) => {
  const result = await runAgent({ prompt: '/refactor' });
  expect(result).toStayUnderCost(2.00);
});
```

**Typical failure:**
```
AssertionError: Cost limit exceeded
  Expected: <= $5.00
  Actual:   $7.32
```

### Todo Completion

Verify agent completed all its tasks:

```typescript
expect(result).toCompleteAllTodos();
```

**Use to ensure** slash commands finish what they start:

```typescript
vibeTest('implementation completes', async ({ runAgent, expect }) => {
  const result = await runAgent({ prompt: '/implement-auth' });
  expect(result).toCompleteAllTodos();
});
```

**Typical failure:**
```
AssertionError: Incomplete todos
  Remaining: "Fix type errors", "Add tests"
```

### Tool Allowlisting

Verify agents only use permitted tools:

```typescript
expect(result).toUseOnlyTools(['Edit', 'Read', 'Grep']);
```

**Use cases:**
- Security: Ensure read-only operations
- Compliance: Restrict file system access
- Debugging: Validate tool selection logic

```typescript
vibeTest('analysis stays read-only', async ({ runAgent, expect }) => {
  const result = await runAgent({
    prompt: '/analyze codebase',
    allowedTools: ['Read', 'Grep', 'Glob'],
  });

  expect(result).toUseOnlyTools(['Read', 'Grep', 'Glob']);
  expect(result.artifacts).toHaveLength(0);  // No files created
});
```

**Typical failure:**
```
AssertionError: Unexpected tool usage
  Unexpected: Bash, TodoWrite
  Expected: Edit, Read, Grep
```

### Error Detection

Check for errors in agent logs:

```typescript
expect(result).toHaveNoErrorsInLogs();
```

Scans for:
- Error messages (`"Error:"`, `"Exception:"`)
- Failed tool calls (`ok: false`)
- Stack traces

**Typical failure:**
```
AssertionError: Errors found in logs
  - Message 5: "Error: File not found"
  - Tool call: Edit failed with "Permission denied"
```

### Combining Matchers

Build comprehensive quality gates:

```typescript
vibeTest('quality gate', async ({ runAgent, expect }) => {
  const result = await runAgent({ prompt: '/implement-auth' });

  // All must pass
  expect(result).toStayUnderCost(10.00);
  expect(result).toCompleteAllTodos();
  expect(result).toHaveNoErrorsInLogs();
  expect(result).toUseOnlyTools(['Edit', 'Read', 'Bash(git *)']);

  // Structural checks
  expect(result.artifacts).toContain('auth.ts');
  expect(result.artifacts).toContain('auth.test.ts');
});
```

### Standard Vitest Matchers

All standard matchers work on `result` fields:

```typescript
// Metrics
expect(result.metrics.durationMs).toBeLessThan(60_000);  // < 1 minute
expect(result.metrics.totalTokens).toBeGreaterThan(1000);

// Messages
expect(result.messages).toHaveLength(10);
expect(result.messages[0].role).toBe('user');

// Tool calls
expect(result.toolCalls.length).toBeGreaterThan(5);
expect(result.toolCalls).toContainEqual(
  expect.objectContaining({ name: 'Edit', ok: true })
);

// Artifacts
expect(result.artifacts).toHaveLength(3);
expect(result.artifacts[0]).toMatch(/\.test\.ts$/);
```

## Structured Results

Every test receives a `RunResult` with:

```typescript
interface RunResult {
  messages: AgentMessage[];      // Full conversation transcript
  toolCalls: ToolCallRecord[];   // All tool invocations
  todos: TodoItem[];             // Todo list state
  metrics: {
    totalTokens?: number;
    totalCostUsd?: number;
    durationMs?: number;
  };
  artifacts: string[];           // Generated file paths
}
```

## Debugging & Error Handling

### Accessing Transcripts

When tests fail, inspect the full conversation:

```typescript
vibeTest('debug conversation', async ({ runAgent, artifacts }) => {
  const result = await runAgent({ prompt: '/complex-task' });

  // Save full transcript for debugging
  await artifacts.saveText(
    'transcript.json',
    JSON.stringify(result.messages, null, 2)
  );

  // Query specific messages
  const errors = result.messages.filter(m =>
    m.role === 'assistant' && /error|fail/i.test(String(m.content))
  );

  expect(errors).toHaveLength(0);
});
```

### Handling Timeouts

Set appropriate timeouts for expensive operations:

```typescript
vibeTest('long-running task', async ({ runAgent, expect }) => {
  const result = await runAgent({
    prompt: '/implement-feature',
    timeoutMs: 600_000,  // 10 minutes
    maxTurns: 50,
  });

  expect(result).toCompleteAllTodos();
}, 650_000);  // Vitest timeout > agent timeout
```

### Cost Overruns

Handle unexpected costs gracefully:

```typescript
vibeTest('cost-aware task', async ({ runAgent, expect }) => {
  const budget = 5.00;

  try {
    const result = await runAgent({
      prompt: '/expensive-task',
      costBudget: budget,  // Agent stops at budget
    });

    expect(result).toStayUnderCost(budget);
  } catch (error) {
    if (error.code === 'COST_EXCEEDED') {
      // Handle gracefully - log for review
      expect(error.costIncurred).toBeLessThan(budget * 1.1); // 10% buffer
    } else {
      throw error;
    }
  }
});
```

### Inspecting Tool Calls

Debug tool usage patterns:

```typescript
vibeTest('analyze tool usage', async ({ runAgent }) => {
  const result = await runAgent({ prompt: '/refactor' });

  // Find failed tool calls
  const failed = result.toolCalls.filter(call => !call.ok);
  if (failed.length > 0) {
    console.log('Failed tools:', failed.map(f => `${f.name}: ${f.error}`));
  }

  // Count tool usage
  const toolCounts = result.toolCalls.reduce((acc, call) => {
    acc[call.name] = (acc[call.name] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  console.log('Tool usage:', toolCounts);
});
```

### Using HTML Report

All test runs generate `./vibe-report.html` with:
- Full conversation transcripts
- Tool usage timeline
- Todo completion tracking
- Per-test cost breakdown
- Artifact links

Open the report to visually debug failed tests:

```bash
# Run tests
bun test

# Open report
open vibe-report.html
```

## LLM-Based Evaluation

Use LLM judges to evaluate subjective quality criteria that are hard to test programmatically.

### When to Use LLM Judges

**Use judges for:**
- Code quality and maintainability
- Documentation clarity
- Test coverage adequacy
- Architecture decisions
- Security considerations

**Use programmatic matchers for:**
- Cost budgets (`toStayUnderCost`)
- Todo completion (`toCompleteAllTodos`)
- Tool usage (`toUseOnlyTools`)
- File existence (`expect(result.artifacts).toContain`)

### Schema-Validated Rubrics

Define type-safe rubrics with Zod:

```typescript
import { vibeTest, RubricSchema } from '@dao/vibe-check';

const codeReviewRubric = RubricSchema.parse({
  criteria: [
    {
      id: 'thoroughness',
      description: 'Review identifies important issues and suggests fixes',
      weight: 0.6,
      required: true,
      kind: 'llm'
    },
    {
      id: 'actionability',
      description: 'Feedback is constructive and specific',
      weight: 0.4,
      kind: 'llm'
    },
  ],
  passingScore: 0.75,
  evaluationMethod: 'llm'
});

vibeTest('code review quality', async ({ runAgent, judge }) => {
  const result = await runAgent({
    prompt: '/review-pr 42',
  });

  const evaluation = await judge(result, {
    rubric: codeReviewRubric,
    throwOnFail: true,
  });

  // evaluation.details shows per-criterion scores:
  // {
  //   thoroughness: { score: 0.85, reason: 'Identified 3 critical issues...' },
  //   actionability: { score: 0.70, reason: 'Suggestions are specific but...' }
  // }
});
```

### Evaluation Methods

#### Programmatic
Fast, deterministic checks using rule-based logic:

```typescript
{
  id: 'has_tests',
  description: 'Implementation includes test files',
  kind: 'programmatic',  // Checks result.artifacts for *.test.ts
  weight: 0.2
}
```

#### LLM
Subjective quality assessment using AI:

```typescript
{
  id: 'code_quality',
  description: 'Code follows best practices and is maintainable',
  kind: 'llm',  // LLM reads code and evaluates
  weight: 0.5
}
```

#### Hybrid (Recommended)
Combines programmatic gates with LLM evaluation:

```typescript
const hybridRubric = RubricSchema.parse({
  criteria: [
    {
      id: 'has_implementation',
      description: 'Feature is implemented with proper structure',
      weight: 0.2,
      required: true,
      kind: 'programmatic'  // Fast: checks result.artifacts
    },
    {
      id: 'implementation_quality',
      description: 'Implementation is correct and handles edge cases',
      weight: 0.5,
      kind: 'llm'  // LLM validates logic
    },
    {
      id: 'maintainability',
      description: 'Code is readable and follows conventions',
      weight: 0.3,
      kind: 'llm'
    }
  ],
  passingScore: 0.75,
  evaluationMethod: 'hybrid'  // Programmatic first, then LLM
});
```

**Benefits:**
- Programmatic checks fail fast (cheaper)
- LLM only evaluates if programmatic passes
- Best balance of speed and depth

### Handling Failures

```typescript
vibeTest('handle evaluation failures', async ({ runAgent, judge, expect }) => {
  const result = await runAgent({
    prompt: '/implement-feature',
  });

  const evaluation = await judge(result, {
    rubric: qualityRubric,
    throwOnFail: false,  // Handle manually
  });

  if (!evaluation.passed) {
    // Log detailed failure reasons
    for (const [criterion, detail] of Object.entries(evaluation.details)) {
      if (detail.score < 0.7) {
        console.log(`Failed ${criterion}: ${detail.reason}`);
      }
    }
  }

  expect(evaluation.score).toBeGreaterThan(0.6);  // Allow partial credit
});
```

## Reporters

### Cost Reporter (CLI)

Tracks total cost across all tests:

```
[vibe] Total tests: 12, total cost: $0.47
```

### HTML Reporter

Rich HTML report with:
- Per-test cost and duration
- Full conversation transcripts
- Tool usage timeline
- Todo completion status
- Artifacts and diffs

## Using as LLM Judge in Other Projects

Import Vibe Check's judge capabilities in any Vitest project for LLM-based evaluation:

```typescript
import { test, expect } from 'vitest';
import { createJudge, RubricSchema } from '@dao/vibe-check';

// Example: Evaluate API response quality
test('API response quality', async () => {
  const judge = createJudge();

  // Your function that generates content
  const apiResponse = await generateProductDescription({
    product: 'Wireless Headphones',
    features: ['noise-canceling', 'bluetooth 5.0', '30h battery']
  });

  const qualityRubric = RubricSchema.parse({
    criteria: [
      {
        id: 'accuracy',
        description: 'Description accurately reflects product features',
        weight: 0.4,
        kind: 'llm'
      },
      {
        id: 'engagement',
        description: 'Description is engaging and persuasive',
        weight: 0.3,
        kind: 'llm'
      },
      {
        id: 'completeness',
        description: 'All features are mentioned',
        weight: 0.3,
        kind: 'programmatic'
      }
    ],
    passingScore: 0.75,
    evaluationMethod: 'hybrid'
  });

  const evaluation = await judge.evaluate(apiResponse, {
    rubric: qualityRubric,
    context: {
      input: 'Wireless Headphones with noise-canceling',
      expectedFeatures: ['noise-canceling', 'bluetooth', 'battery']
    }
  });

  expect(evaluation.passed).toBe(true);
  expect(evaluation.score).toBeGreaterThan(0.75);
});

// Example: Schema-based evaluation
test('structured output validation', async () => {
  const judge = createJudge();

  const generatedSQL = await llm.generateSQL('Get all active users');

  const sqlRubric = RubricSchema.parse({
    criteria: [
      {
        id: 'syntax',
        description: 'SQL syntax is valid',
        weight: 0.5,
        required: true,
        kind: 'programmatic'
      },
      {
        id: 'efficiency',
        description: 'Query is optimized and efficient',
        weight: 0.3,
        kind: 'llm'
      },
      {
        id: 'correctness',
        description: 'Query correctly filters for active users',
        weight: 0.2,
        kind: 'llm'
      }
    ],
    passingScore: 0.8,
    evaluationMethod: 'hybrid'
  });

  const evaluation = await judge.evaluate(generatedSQL, {
    rubric: sqlRubric,
    schema: z.object({
      query: z.string(),
      reasoning: z.string()
    })
  });

  expect(evaluation.passed).toBe(true);

  // Access structured output
  console.log('Reasoning:', evaluation.schema.reasoning);
});
```

## Architecture

Built on **Vitest v3.x** with:
- **Fixtures** - Lazy-initialized test context (`runAgent`, `judge`, `artifacts`, `metrics`)
- **Agent Runner** - Integrates with Claude Agent SDK for streaming sessions
- **Structured Capture** - Records messages, tools, todos, costs from agent runs
- **Matrix Generation** - Cartesian product expansion for multi-config testing
- **Hybrid Judges** - Programmatic + LLM evaluation for comprehensive scoring

**Key Components:**
```
src/
├── test/
│   ├── vibeTest.ts          # Extended test with fixtures
│   ├── context.ts           # TestContext augmentation
│   └── matchers.ts          # Custom expect matchers
├── runner/
│   └── agentRunner.ts       # Claude SDK integration
├── judge/
│   ├── rubric.ts            # Rubric schema (Zod)
│   └── llmJudge.ts          # Hybrid evaluation
├── reporters/
│   ├── cost.ts              # CLI cost reporter
│   └── html.ts              # Rich HTML report
├── matrix/
│   └── defineTestSuite.ts   # Matrix test generation
└── artifacts/
    └── ArtifactManager.ts   # Output tracking
```

## Development Automation

This repository also includes a complete Claude Code scaffold for development automation:

- **Templates** - Task templates (simple/standard/complex)
- **Slash Commands** - `/prd`, `/create-task`, `/review-pr`, `/tdd-component`
- **Specialized Agents** - Security, performance, test coverage, code quality, documentation reviewers
- **GitHub Workflows** - Automated PRD implementation, PR reviews, CI auto-fixes

📚 **[View Claude Code Scaffold Documentation](./docs/CLAUDE_CODE_SCAFFOLD.md)**

📚 **[View GitHub Workflows Documentation](./docs/WORKFLOWS.md)**

## Documentation

- **[GitHub Workflows Guide](./docs/WORKFLOWS.md)** - Automated development workflows
- **[Claude Code Scaffold](./docs/CLAUDE_CODE_SCAFFOLD.md)** - Templates, commands, and agents

## Project Status

**Vibe Check is in active development.**

Current state:
- ✅ Design complete - [Code skeletons](./.claude/docs/vibecheck/code_skel.mdx) and [implementation plan](./.claude/docs/vibecheck/implementation-plan.mdx)
- ✅ Claude Code scaffold - Complete with templates, commands, agents, workflows
- 🚧 Core framework - Implementation in progress
- 🚧 Reporters - Planned
- 🚧 Judge system - Planned

## Development

```bash
# Install dependencies
bun install

# Type check
bun run typecheck

# Lint and format
bun run lint

# Run checks
bun run check
```

## Example Use Cases

### 1. Benchmark Slash Command Across Models

Test custom commands with different models to find the sweet spot:

```typescript
import { defineTestSuite, vibeTest, defineAgent, RubricSchema } from '@dao/vibe-check';

const authQualityRubric = RubricSchema.parse({
  criteria: [
    {
      id: 'security',
      description: 'Implementation includes proper authentication, authorization, and session management',
      weight: 0.4,
      kind: 'llm'
    },
    {
      id: 'completeness',
      description: 'Includes login, logout, password reset, and session handling',
      weight: 0.3,
      kind: 'programmatic'
    },
    {
      id: 'testing',
      description: 'Comprehensive test coverage for auth flows',
      weight: 0.3,
      kind: 'programmatic'
    }
  ],
  passingScore: 0.8,
  evaluationMethod: 'hybrid'
});

defineTestSuite({
  matrix: {
    agent: [
      defineAgent({
        name: 'sonnet',
        model: 'claude-sonnet-4-5',
        source: { type: 'temp' },
        timeouts: { maxTurns: 30 },
      }),
      defineAgent({
        name: 'opus',
        model: 'claude-opus-4',
        source: { type: 'temp' },
        timeouts: { maxTurns: 30 },
      }),
    ],
  },
  test: ({ agent }) => {
    vibeTest(`/implement auth with ${agent.name}`, async ({ runAgent, judge, expect, task }) => {
      const result = await runAgent({
        prompt: prompt({
          text: 'Implement JWT-based authentication system',
          command: '/implement'
        }),
        agent,
      });

      // Quality gate
      const evaluation = await judge(result, {
        rubric: authQualityRubric,
        throwOnFail: false,
      });

      // Store for comparison
      task.meta.agentName = agent.name;
      task.meta.score = evaluation.score;
      task.meta.cost = result.metrics.totalCostUsd;

      expect(result).toCompleteAllTodos();
      expect(evaluation.score).toBeGreaterThan(0.8);

      console.log(`${agent.name}: $${result.metrics.totalCostUsd?.toFixed(2)}, score: ${evaluation.score.toFixed(2)}`);
    });
  },
});
```

### 2. Progressive Tool Access Testing

Validate that restricted tool access maintains safety without sacrificing capability:

```typescript
const analysisAgent = defineAgent({
  name: 'analyzer',
  tools: ['Read', 'Grep', 'Glob'],  // Read-only
  source: 'gh:acme/app#main',
  timeouts: { maxTurns: 15 },
});

const fixAgent = defineAgent({
  name: 'fixer',
  tools: ['Edit', 'Read', 'Bash(git *)'],  // Write access
  source: 'gh:acme/app#main',
  timeouts: { maxTurns: 20 },
});

vibeTest('security analysis tool restrictions', async ({ runAgent, expect }) => {
  // Phase 1: Read-only analysis
  const analysis = await runAgent({
    prompt: prompt({
      text: 'Analyze security vulnerabilities in authentication flow',
      command: '/analyze'
    }),
    agent: analysisAgent,
  });

  expect(analysis).toUseOnlyTools(['Read', 'Grep', 'Glob']);
  expect(analysis.artifacts).toHaveLength(0);  // No files created
  expect(analysis).toCompleteAllTodos();

  // Phase 2: Fix with write access
  const fixes = await runAgent({
    prompt: prompt({
      text: `Fix issues found in previous analysis\n\nIssues:\n${analysis.summary}`,
      command: '/fix-issues'
    }),
    agent: fixAgent,
  });

  expect(fixes.artifacts.length).toBeGreaterThan(0);  // Files were modified
  expect(fixes).toCompleteAllTodos();
  expect(fixes).toHaveNoErrorsInLogs();
});
```

### 3. Cost-Quality Tradeoff Analysis

Find the optimal model for your use case:

```typescript
import { defineAgent, RubricSchema } from '@dao/vibe-check';

const refactorQualityRubric = RubricSchema.parse({
  criteria: [
    {
      id: 'correctness',
      description: 'Refactored code maintains original functionality',
      weight: 0.4,
      required: true,
      kind: 'llm'
    },
    {
      id: 'modern_patterns',
      description: 'Uses modern JavaScript/TypeScript patterns (async/await, const/let, arrow functions)',
      weight: 0.3,
      kind: 'llm'
    },
    {
      id: 'readability',
      description: 'Code is more readable and maintainable',
      weight: 0.3,
      kind: 'llm'
    }
  ],
  passingScore: 0.75,
  evaluationMethod: 'llm'
});

vibeTest('cost vs quality analysis', async ({ runAgent, judge, expect }) => {
  const agents = [
    defineAgent({ name: 'haiku', model: 'claude-haiku-3-5', source: { type: 'temp' }, timeouts: { maxTurns: 15 } }),
    defineAgent({ name: 'sonnet', model: 'claude-sonnet-4-5', source: { type: 'temp' }, timeouts: { maxTurns: 15 } }),
    defineAgent({ name: 'opus', model: 'claude-opus-4', source: { type: 'temp' }, timeouts: { maxTurns: 15 } }),
  ];
  const results = [];

  const refactorPrompt = prompt({
    text: 'Refactor this legacy file to TypeScript @src/legacy/utils.js',
    command: '/refactor'
  });

  for (const agent of agents) {
    const result = await runAgent({
      prompt: refactorPrompt,
      agent,
    });

    const evaluation = await judge(result, {
      rubric: refactorQualityRubric,
      throwOnFail: false,
    });

    results.push({
      agent: agent.name,
      cost: result.metrics.totalCostUsd,
      score: evaluation.score,
      duration: result.metrics.durationMs,
    });
  }

  // Print comparison table
  console.table(results);

  // Validate: Higher-tier models score better
  expect(results[2].score).toBeGreaterThan(results[0].score);  // opus > haiku

  // But cost more
  expect(results[2].cost).toBeGreaterThan(results[0].cost);

  // Find best value
  const valueScore = results.map(r => r.score / (r.cost || 1));
  console.log('Best value:', results[valueScore.indexOf(Math.max(...valueScore))].agent);
});
```

## License

MIT

## Contributing

Contributions welcome! (Contributing guidelines coming soon)

---

**Built with ❤️ using [Claude Code](https://claude.com/claude-code)**
