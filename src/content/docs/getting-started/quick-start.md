---
title: Quick Start
description: Get up and running with Vibe Check in 5 minutes
---

# Quick Start

Get up and running with Vibe Check in 5 minutes.

## Installation

```bash
bun add -D @dao/vibe-check vitest
```

## Two Ways to Use Vibe Check

### 1. Automation with `vibeWorkflow`

Build multi-step agent pipelines:

```typescript
import { vibeWorkflow, defineAgent } from '@dao/vibe-check';

vibeWorkflow('deploy pipeline', async (wf) => {
  // Stage 1: Build
  const build = await wf.stage('build', {
    agent: defineAgent({ model: 'claude-sonnet-4' }),
    prompt: '/build'
  });

  // Stage 2: Test
  await wf.stage('test', {
    agent: defineAgent({ model: 'claude-sonnet-4' }),
    prompt: '/test',
    context: build
  });
});
```

### 2. Evaluation with `vibeTest`

Benchmark models and enforce quality gates:

```typescript
import { vibeTest, defineAgent } from '@dao/vibe-check';

vibeTest('benchmark sonnet vs opus', async ({ runAgent, expect }) => {
  const result = await runAgent({
    agent: defineAgent({ model: 'claude-sonnet-4' }),
    prompt: '/refactor src/'
  });

  expect(result).toStayUnderCost(2.00);
  expect(result).toCompleteAllTodos();
  expect(result).toHaveNoErrorsInLogs();
});
```

## Run Your Tests

```bash
bun test
```

## View Results

Vibe Check automatically generates:

- **Terminal output** with cost summaries
- **HTML reports** with transcripts, timelines, and artifacts
- **Detailed metrics** for every agent run

## Next Steps

- [First Automation](/getting-started/first-automation/) - Build a complete pipeline
- [First Evaluation](/getting-started/first-evaluation/) - Benchmark agents
- [API Reference](/api/) - Explore the full API
