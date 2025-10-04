# First Evaluation

> Benchmark your first agent in 5 minutes

[Getting Started](./) > First Evaluation

---

## What You'll Build

A simple benchmark that:
1. Runs an agent on a refactoring task
2. Tracks cost, tokens, and duration
3. Asserts quality with custom matchers
4. Generates a detailed report

**Estimated time:** 5 minutes

---

## Prerequisites

- Node.js 18+ or Bun installed
- Vibe Check installed (`npm install @dao/vibe-check` or `bun add @dao/vibe-check`)
- Claude Code CLI configured
- A Git repository to test with

---

## Step 1: Create Your Test File

Create `benchmark.test.ts`:

```typescript
import { vibeTest, defineAgent } from '@dao/vibe-check';
```

---

## Step 2: Define Your Agent

```typescript
const sonnet = defineAgent({
  name: 'sonnet-refactor',
  model: 'claude-sonnet-4',
  tools: ['Read', 'Edit', 'Grep']
});
```

---

## Step 3: Write Your First Test

```typescript
vibeTest('benchmark sonnet on refactoring', async ({ runAgent, expect }) => {
  const result = await runAgent({
    agent: sonnet,
    prompt: '/refactor src/index.ts for better readability',
    workspace: '/path/to/your/repo'
  });

  // Metrics
  console.log('Metrics:', {
    tokens: result.metrics.totalTokens,
    cost: result.metrics.totalCostUsd,
    duration: result.metrics.durationMs,
    files: result.metrics.filesChanged
  });

  // Assertions
  expect(result).toHaveChangedFiles(['src/index.ts']);
  expect(result).toStayUnderCost(3.00);  // $3 max
  expect(result).toCompleteAllTodos();
});
```

---

## Step 4: Run the Test

```bash
bun test benchmark.test.ts
# or
npm test benchmark.test.ts
```

You'll see:
```
✓ benchmark sonnet on refactoring (18s)

Metrics: {
  tokens: 12450,
  cost: 1.24,
  duration: 17832,
  files: 1
}
```

---

## Step 5: Add More Assertions

Expand your test with quality checks:

```typescript
vibeTest('comprehensive benchmark', async ({ runAgent, expect }) => {
  const result = await runAgent({
    agent: sonnet,
    prompt: '/refactor src/',
    workspace: '/path/to/your/repo'
  });

  // File assertions
  expect(result).toHaveChangedFiles(['src/**/*.ts']);
  expect(result).toHaveNoDeletedFiles();

  // Tool assertions
  expect(result).toHaveUsedTool('Edit', { min: 1 });
  expect(result).toUseOnlyTools(['Read', 'Edit', 'Grep']);

  // Quality assertions
  expect(result).toCompleteAllTodos();
  expect(result).toHaveNoErrorsInLogs();

  // Cost/performance
  expect(result).toStayUnderCost(5.00);
  expect(result.metrics.durationMs!).toBeLessThan(30000);  // 30s

  // Metrics logging
  console.log({
    cost: result.metrics.totalCostUsd,
    tokens: result.metrics.totalTokens,
    duration: `${(result.metrics.durationMs! / 1000).toFixed(1)}s`,
    efficiency: result.files.stats().total / result.metrics.totalCostUsd!
  });
});
```

---

## Step 6: Compare Models

Add tests for different models:

```typescript
const opus = defineAgent({ model: 'claude-opus-4' });
const sonnet = defineAgent({ model: 'claude-sonnet-4' });
const haiku = defineAgent({ model: 'claude-haiku-4' });

const refactorPrompt = '/refactor src/index.ts';
const workspace = '/path/to/your/repo';

vibeTest('opus benchmark', async ({ runAgent }) => {
  const result = await runAgent({
    agent: opus,
    prompt: refactorPrompt,
    workspace
  });

  console.log('Opus:', {
    cost: result.metrics.totalCostUsd,
    files: result.files.stats().total,
    quality: result.todos.filter(t => t.status === 'completed').length
  });
});

vibeTest('sonnet benchmark', async ({ runAgent }) => {
  const result = await runAgent({
    agent: sonnet,
    prompt: refactorPrompt,
    workspace
  });

  console.log('Sonnet:', {
    cost: result.metrics.totalCostUsd,
    files: result.files.stats().total,
    quality: result.todos.filter(t => t.status === 'completed').length
  });
});

vibeTest('haiku benchmark', async ({ runAgent }) => {
  const result = await runAgent({
    agent: haiku,
    prompt: refactorPrompt,
    workspace
  });

  console.log('Haiku:', {
    cost: result.metrics.totalCostUsd,
    files: result.files.stats().total,
    quality: result.todos.filter(t => t.status === 'completed').length
  });
});
```

**Sample output:**
```
Opus: { cost: 4.32, files: 8, quality: 12 }
Sonnet: { cost: 1.24, files: 6, quality: 9 }
Haiku: { cost: 0.18, files: 3, quality: 5 }
```

---

## Step 7: Add LLM-Based Evaluation (Optional)

Use an LLM judge for quality assessment:

```typescript
import { judge } from '@dao/vibe-check';

const qualityRubric = {
  criteria: [
    { name: 'correctness', weight: 0.5 },
    { name: 'maintainability', weight: 0.3 },
    { name: 'readability', weight: 0.2 }
  ],
  passingScore: 0.8
};

vibeTest('quality gate', async ({ runAgent, expect }) => {
  const result = await runAgent({
    agent: opus,
    prompt: '/refactor with quality focus',
    workspace: '/path/to/your/repo'
  });

  // LLM-based quality check
  await expect(result).toPassRubric(qualityRubric);
});
```

---

## Step 8: Matrix Testing (Optional)

Test multiple configurations at once:

```typescript
import { test } from 'vitest';

test.for([
  { model: 'haiku', budget: 0.5 },
  { model: 'sonnet', budget: 2.0 },
  { model: 'opus', budget: 5.0 }
])('benchmark $model under $budget USD',
  async ({ model, budget, runAgent, expect }) => {
    const agent = defineAgent({ model: `claude-${model}-4` });

    const result = await runAgent({
      agent,
      prompt: '/refactor src/',
      workspace: '/path/to/your/repo'
    });

    expect(result).toStayUnderCost(budget);

    console.log(`${model}:`, {
      cost: result.metrics.totalCostUsd,
      files: result.files.stats().total
    });
  }
);

// Generates 3 tests automatically!
```

---

## What You Learned

✅ Running benchmarks with `vibeTest`
✅ Tracking metrics (cost, tokens, duration)
✅ Using custom matchers for assertions
✅ Comparing multiple models
✅ LLM-based quality evaluation
✅ Matrix testing for configurations

---

## Next Steps

### Explore More Patterns

- **[Benchmarking Guide](../guides/evaluation/benchmarking.md)** - Advanced benchmarking patterns
- **[Matrix Testing](../guides/evaluation/matrix-testing.md)** - Test multiple configurations
- **[vibeTest API](../api/vibeTest.md)** - Complete API reference
- **[Custom Matchers](../api/matchers.md)** - All available assertions

### Try These Enhancements

1. **Track results over time:**
   ```typescript
   const results = [];
   vibeTest('track results', async ({ runAgent }) => {
     const result = await runAgent({ ... });
     results.push({
       date: new Date().toISOString(),
       cost: result.metrics.totalCostUsd,
       files: result.files.stats().total
     });
   });
   ```

2. **Set performance baselines:**
   ```typescript
   const baseline = { cost: 2.0, duration: 25000 };

   vibeTest('no regression', async ({ runAgent, expect }) => {
     const result = await runAgent({ ... });
     expect(result.metrics.totalCostUsd!).toBeLessThanOrEqual(baseline.cost * 1.1);
     expect(result.metrics.durationMs!).toBeLessThanOrEqual(baseline.duration * 1.1);
   });
   ```

3. **Add custom metrics:**
   ```typescript
   vibeTest('custom metrics', async ({ runAgent }) => {
     const result = await runAgent({ ... });

     const efficiency = result.files.stats().total / result.metrics.totalCostUsd!;
     const tokensPerFile = result.metrics.totalTokens! / result.files.stats().total;

     console.log({ efficiency, tokensPerFile });
   });
   ```

---

## Troubleshooting

### Test times out

Increase timeout:
```typescript
vibeTest('long test', async ({ runAgent }) => {
  // ...
}, 120000);  // 2 minutes
```

### Assertions fail

Check the actual values:
```typescript
const result = await runAgent({ ... });
console.log('Actual cost:', result.metrics.totalCostUsd);
console.log('Files changed:', result.files.stats());
```

### Want more detail

Enable verbose output:
```typescript
const result = await runAgent({ ... });

// Detailed metrics
console.log('Full metrics:', result.metrics);

// File details
for (const file of result.files.changed()) {
  console.log(`${file.changeType}: ${file.path}`);
}

// Tool details
for (const tool of result.tools.all()) {
  console.log(`${tool.name}: ${tool.durationMs}ms`);
}
```

---

[← Back to Getting Started](./) | [Previous: First Automation](./first-automation.md)
