---
title: Model Benchmarking
description: Compare models, track costs, and enforce quality gates with vibeTest
---

[Guides](../) > [Evaluation](./) > Model Benchmarking

---

## Overview

`vibeTest` is designed for benchmarking models, tracking performance metrics, and enforcing quality gates. It provides structured execution context, cost tracking, and custom matchers for comprehensive evaluation.

**Use vibeTest for:**
- Comparing model performance
- Tracking costs and tokens
- Quality gates with assertions
- Matrix testing configurations
- LLM-based evaluation

---

## Basic Benchmarking

### Single Model Test

```typescript
import { vibeTest, defineAgent } from '@dao/vibe-check';

const sonnet = defineAgent({
  name: 'sonnet',
  model: 'claude-sonnet-4'
});

vibeTest('benchmark sonnet on refactoring', async ({ runAgent, expect }) => {
  const result = await runAgent({
    agent: sonnet,
    prompt: '/refactor src/index.ts'
  });

  // Assert file changes
  expect(result).toHaveChangedFiles(['src/index.ts']);

  // Assert cost
  expect(result).toStayUnderCost(3.00);  // $3.00 USD

  // Assert completion
  expect(result).toCompleteAllTodos();

  // Metrics
  console.log({
    tokens: result.metrics.totalTokens,
    cost: result.metrics.totalCostUsd,
    duration: result.metrics.durationMs,
    files: result.metrics.filesChanged
  });
});
```

### Comparing Models

```typescript
const opus = defineAgent({ model: 'claude-opus-4' });
const sonnet = defineAgent({ model: 'claude-sonnet-4' });
const haiku = defineAgent({ model: 'claude-haiku-4' });

vibeTest('opus benchmark', async ({ runAgent }) => {
  const result = await runAgent({
    agent: opus,
    prompt: '/refactor'
  });
  console.log('Opus:', {
    cost: result.metrics.totalCostUsd,
    quality: result.files.stats().total
  });
});

vibeTest('sonnet benchmark', async ({ runAgent }) => {
  const result = await runAgent({
    agent: sonnet,
    prompt: '/refactor'
  });
  console.log('Sonnet:', {
    cost: result.metrics.totalCostUsd,
    quality: result.files.stats().total
  });
});

vibeTest('haiku benchmark', async ({ runAgent }) => {
  const result = await runAgent({
    agent: haiku,
    prompt: '/refactor'
  });
  console.log('Haiku:', {
    cost: result.metrics.totalCostUsd,
    quality: result.files.stats().total
  });
});
```

---

## Cost Tracking

### Budget Constraints

```typescript
vibeTest('stay under budget', async ({ runAgent, expect }) => {
  const result = await runAgent({
    agent: haiku,
    prompt: '/fix-types'
  });

  expect(result).toStayUnderCost(0.50);  // $0.50 max
  expect(result.metrics.totalTokens!).toBeLessThan(10000);
});
```

### Cost-Quality Trade-offs

```typescript
vibeTest('opus quality vs cost', async ({ runAgent, expect }) => {
  const result = await runAgent({
    agent: opus,
    prompt: '/refactor with high quality'
  });

  // Willing to pay more for quality
  expect(result).toStayUnderCost(10.00);
  expect(result).toCompleteAllTodos();
  expect(result.files.stats().total).toBeGreaterThan(5);
});

vibeTest('haiku speed vs quality', async ({ runAgent, expect }) => {
  const result = await runAgent({
    agent: haiku,
    prompt: '/quick fixes'
  });

  // Prioritize cost over extensive changes
  expect(result).toStayUnderCost(0.25);
  expect(result.metrics.durationMs!).toBeLessThan(30000); // 30s
});
```

---

## Quality Gates

### File Assertions

```typescript
vibeTest('correct files modified', async ({ runAgent, expect }) => {
  const result = await runAgent({
    agent: sonnet,
    prompt: '/refactor TypeScript files only'
  });

  expect(result).toHaveChangedFiles(['src/**/*.ts']);
  expect(result).toHaveNoDeletedFiles();

  // Verify no unintended changes
  const jsFiles = result.files.filter('**/*.js');
  expect(jsFiles.length).toBe(0);
});
```

### Tool Usage Constraints

```typescript
vibeTest('safe tool usage', async ({ runAgent, expect }) => {
  const result = await runAgent({
    agent: constrained,
    prompt: '/refactor without running commands'
  });

  expect(result).toUseOnlyTools(['Read', 'Edit', 'Grep']);
  expect(result.tools.used('Bash')).toBe(0);
});
```

### Todo Completion

```typescript
vibeTest('complete all tasks', async ({ runAgent, expect }) => {
  const result = await runAgent({
    agent: implementer,
    prompt: '/implement feature completely'
  });

  expect(result).toCompleteAllTodos();

  // Detailed check
  const pending = result.todos.filter(t => t.status === 'pending');
  expect(pending.length).toBe(0);
});
```

---

## LLM-Based Evaluation

### Quality Rubrics

```typescript
import { judge } from '@dao/vibe-check';

const codeQualityRubric = {
  criteria: [
    { name: 'correctness', weight: 0.4 },
    { name: 'maintainability', weight: 0.3 },
    { name: 'readability', weight: 0.2 },
    { name: 'performance', weight: 0.1 }
  ],
  passingScore: 0.8
};

vibeTest('quality gate', async ({ runAgent, expect }) => {
  const result = await runAgent({
    agent: opus,
    prompt: '/refactor with quality focus'
  });

  await expect(result).toPassRubric(codeQualityRubric);
});
```

### Custom Evaluation

```typescript
vibeTest('manual judge evaluation', async ({ runAgent, judge, expect }) => {
  const result = await runAgent({
    agent: sonnet,
    prompt: '/refactor'
  });

  const evaluation = await judge(result, {
    rubric: codeQualityRubric,
    throwOnFail: false
  });

  expect(evaluation.passed).toBe(true);
  expect(evaluation.score!).toBeGreaterThan(0.8);

  // Inspect criteria
  if (evaluation.details) {
    for (const [criterion, result] of Object.entries(evaluation.details)) {
      console.log(`${criterion}: ${result.score} - ${result.reasoning}`);
    }
  }
});
```

---

## Performance Metrics

### Duration Tracking

```typescript
vibeTest('speed benchmark', async ({ runAgent, expect }) => {
  const start = Date.now();

  const result = await runAgent({
    agent: haiku,
    prompt: '/quick fix'
  });

  const duration = Date.now() - start;

  expect(duration).toBeLessThan(15000);  // 15s max
  expect(result.metrics.durationMs!).toBeLessThan(15000);
});
```

### Token Efficiency

```typescript
vibeTest('token efficiency', async ({ runAgent, expect }) => {
  const result = await runAgent({
    agent: sonnet,
    prompt: '/refactor efficiently'
  });

  const filesChanged = result.files.stats().total;
  const tokens = result.metrics.totalTokens!;
  const tokensPerFile = tokens / filesChanged;

  expect(tokensPerFile).toBeLessThan(5000);  // Efficient
  console.log(`Tokens per file: ${tokensPerFile.toFixed(0)}`);
});
```

### Throughput Metrics

```typescript
vibeTest('throughput', async ({ runAgent }) => {
  const result = await runAgent({
    agent: sonnet,
    prompt: '/refactor all files'
  });

  const filesPerSecond = result.files.stats().total /
    (result.metrics.durationMs! / 1000);

  const tokensPerSecond = result.metrics.totalTokens! /
    (result.metrics.durationMs! / 1000);

  console.log(`Throughput: ${filesPerSecond.toFixed(2)} files/s`);
  console.log(`Token rate: ${tokensPerSecond.toFixed(0)} tok/s`);
});
```

---

## Comparative Benchmarks

### Side-by-Side Comparison

```typescript
interface BenchmarkResult {
  model: string;
  cost: number;
  tokens: number;
  duration: number;
  filesChanged: number;
  todosCompleted: number;
}

const results: BenchmarkResult[] = [];

vibeTest('opus benchmark', async ({ runAgent }) => {
  const r = await runAgent({ agent: opus, prompt: '/refactor' });
  results.push({
    model: 'opus',
    cost: r.metrics.totalCostUsd!,
    tokens: r.metrics.totalTokens!,
    duration: r.metrics.durationMs!,
    filesChanged: r.files.stats().total,
    todosCompleted: r.todos.filter(t => t.status === 'completed').length
  });
});

vibeTest('sonnet benchmark', async ({ runAgent }) => {
  const r = await runAgent({ agent: sonnet, prompt: '/refactor' });
  results.push({
    model: 'sonnet',
    cost: r.metrics.totalCostUsd!,
    tokens: r.metrics.totalTokens!,
    duration: r.metrics.durationMs!,
    filesChanged: r.files.stats().total,
    todosCompleted: r.todos.filter(t => t.status === 'completed').length
  });
});

vibeTest('compare results', () => {
  console.table(results);

  // Find best on each metric
  const cheapest = results.reduce((a, b) => a.cost < b.cost ? a : b);
  const fastest = results.reduce((a, b) => a.duration < b.duration ? a : b);
  const mostFiles = results.reduce((a, b) => a.filesChanged > b.filesChanged ? a : b);

  console.log('Cheapest:', cheapest.model);
  console.log('Fastest:', fastest.model);
  console.log('Most files:', mostFiles.model);
});
```

### Score-Based Ranking

```typescript
function calculateScore(result: BenchmarkResult): number {
  // Lower cost is better (inverse)
  const costScore = 1 / (result.cost + 0.01);

  // Lower duration is better (inverse)
  const speedScore = 1 / (result.duration / 1000 + 0.1);

  // More files is better
  const outputScore = result.filesChanged;

  // Weighted combination
  return (costScore * 0.3) + (speedScore * 0.3) + (outputScore * 0.4);
}

vibeTest('rank models', () => {
  const ranked = results
    .map(r => ({ ...r, score: calculateScore(r) }))
    .sort((a, b) => b.score - a.score);

  console.log('Ranking:');
  ranked.forEach((r, i) => {
    console.log(`${i + 1}. ${r.model}: ${r.score.toFixed(2)}`);
  });
});
```

---

## Regression Testing

### Performance Baselines

```typescript
const baseline = {
  cost: 2.5,
  tokens: 45000,
  duration: 25000,
  filesChanged: 8
};

vibeTest('no performance regression', async ({ runAgent, expect }) => {
  const result = await runAgent({
    agent: sonnet,
    prompt: '/refactor'
  });

  expect(result.metrics.totalCostUsd!).toBeLessThanOrEqual(baseline.cost * 1.1);
  expect(result.metrics.totalTokens!).toBeLessThanOrEqual(baseline.tokens * 1.1);
  expect(result.metrics.durationMs!).toBeLessThanOrEqual(baseline.duration * 1.1);
  expect(result.files.stats().total).toBeGreaterThanOrEqual(baseline.filesChanged * 0.9);
});
```

### Quality Baselines

```typescript
const qualityBaseline = 0.85;

vibeTest('maintain quality', async ({ runAgent, judge, expect }) => {
  const result = await runAgent({
    agent: sonnet,
    prompt: '/refactor'
  });

  const evaluation = await judge(result, {
    rubric: codeQualityRubric,
    throwOnFail: false
  });

  expect(evaluation.score!).toBeGreaterThanOrEqual(qualityBaseline);
});
```

---

## Best Practices

### 1. Use Consistent Prompts

```typescript
const refactorPrompt = '/refactor src/ for maintainability';

// ✅ Good: Same prompt for fair comparison
vibeTest('opus', async ({ runAgent }) => {
  await runAgent({ agent: opus, prompt: refactorPrompt });
});

vibeTest('sonnet', async ({ runAgent }) => {
  await runAgent({ agent: sonnet, prompt: refactorPrompt });
});

// ❌ Bad: Different prompts
vibeTest('opus', async ({ runAgent }) => {
  await runAgent({ agent: opus, prompt: '/refactor everything' });
});

vibeTest('sonnet', async ({ runAgent }) => {
  await runAgent({ agent: sonnet, prompt: '/quick refactor' });
});
```

### 2. Control for Variables

```typescript
const config = {
  timeouts: { maxTurns: 10 },
  tools: ['Read', 'Edit', 'Grep']
};

// ✅ Good: Same configuration
vibeTest('opus controlled', async ({ runAgent }) => {
  await runAgent({
    agent: opus,
    prompt: refactorPrompt,
    override: config
  });
});

vibeTest('sonnet controlled', async ({ runAgent }) => {
  await runAgent({
    agent: sonnet,
    prompt: refactorPrompt,
    override: config
  });
});
```

### 3. Track Multiple Metrics

```typescript
// ✅ Good: Comprehensive metrics
vibeTest('comprehensive benchmark', async ({ runAgent }) => {
  const result = await runAgent({ agent: sonnet, prompt: '/refactor' });

  console.log({
    cost: result.metrics.totalCostUsd,
    tokens: result.metrics.totalTokens,
    duration: result.metrics.durationMs,
    files: result.files.stats(),
    tools: result.tools.all().length,
    todos: result.todos.length
  });
});

// ❌ Bad: Single metric
vibeTest('incomplete benchmark', async ({ runAgent }) => {
  const result = await runAgent({ agent: sonnet, prompt: '/refactor' });
  console.log('Cost:', result.metrics.totalCostUsd);
});
```

### 4. Use Quality Gates

```typescript
// ✅ Good: Quality + performance
vibeTest('balanced benchmark', async ({ runAgent, expect }) => {
  const result = await runAgent({ agent: sonnet, prompt: '/refactor' });

  expect(result).toStayUnderCost(3.00);
  expect(result).toCompleteAllTodos();
  await expect(result).toPassRubric(codeQualityRubric);
});

// ❌ Bad: Cost only
vibeTest('cost-only benchmark', async ({ runAgent, expect }) => {
  const result = await runAgent({ agent: sonnet, prompt: '/refactor' });
  expect(result).toStayUnderCost(3.00);
});
```

---

## Related Documentation

- **[Matrix Testing](/guides/evaluation/matrix-testing/)** - Test multiple configurations
- **[vibeTest API](/../api/vibeTest/)** - Complete API reference
- **[Custom Matchers](/../api/matchers/)** - All available matchers
- **[judge](/../api/judge/)** - LLM-based evaluation
- **[First Evaluation Tutorial](/../getting-started/first-evaluation/)** - Step-by-step guide

---

[← Back to Evaluation Guides](./)
