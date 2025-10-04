---
title: Matrix Testing
description: Test multiple configurations with parametric patterns
---

[Guides](../) > [Evaluation](./) > Matrix Testing

---

## Overview

Matrix testing allows you to test multiple configurations (models, prompts, settings) in parallel by generating Cartesian products of test parameters. Vibe-check provides two approaches: `defineTestSuite` for simple cases and Vitest's `test.for` for advanced scenarios with fixture access.

**Use matrix testing for:**
- Comparing multiple models
- Testing different prompt variations
- Validating across configurations
- Performance regression testing
- Cost-quality trade-off analysis

---

## Basic Matrix with defineTestSuite

### Simple Cartesian Product

```typescript
import { defineTestSuite, vibeTest, defineAgent } from '@dao/vibe-check';

defineTestSuite({
  matrix: {
    model: ['haiku', 'sonnet', 'opus'],
    maxTurns: [5, 10]
  },
  test: ({ model, maxTurns }) => {
    vibeTest(`${model} with ${maxTurns} turns`, async ({ runAgent, expect }) => {
      const agent = defineAgent({
        model: `claude-${model}-4`,
        timeouts: { maxTurns }
      });

      const result = await runAgent({
        agent,
        prompt: '/refactor src/index.ts'
      });

      expect(result).toStayUnderCost(5.00);
      expect(result).toCompleteAllTodos();
    });
  }
});

// Generates 6 tests:
// - haiku with 5 turns
// - haiku with 10 turns
// - sonnet with 5 turns
// - sonnet with 10 turns
// - opus with 5 turns
// - opus with 10 turns
```

### Multiple Dimensions

```typescript
defineTestSuite({
  matrix: {
    model: ['sonnet', 'opus'],
    prompt: [
      '/refactor for readability',
      '/refactor for performance'
    ],
    workspace: ['/path/to/repo1', '/path/to/repo2']
  },
  test: ({ model, prompt, workspace }) => {
    vibeTest(`${model} - ${prompt.split(' ')[2]} - repo${workspace.slice(-1)}`,
      async ({ runAgent }) => {
        const agent = defineAgent({ model: `claude-${model}-4` });

        const result = await runAgent({
          agent,
          prompt,
          workspace
        });

        console.log({
          model,
          objective: prompt.split(' ')[2],
          files: result.files.stats().total,
          cost: result.metrics.totalCostUsd
        });
      }
    );
  }
});

// Generates 8 tests (2 models × 2 prompts × 2 workspaces)
```

---

## Advanced: test.for with Fixtures

Vitest's `test.for` provides better integration with fixtures and test context:

### Basic test.for

```typescript
import { test } from 'vitest';
import { defineAgent } from '@dao/vibe-check';

test.for([
  { model: 'haiku', budget: 0.5 },
  { model: 'sonnet', budget: 2.0 },
  { model: 'opus', budget: 5.0 }
])('benchmark $model under $budget USD', async ({ model, budget, runAgent, expect }) => {
  const agent = defineAgent({ model: `claude-${model}-4` });

  const result = await runAgent({
    agent,
    prompt: '/refactor'
  });

  expect(result).toStayUnderCost(budget);
}, { timeout: 60000 });
```

**Key advantage:** Direct access to `runAgent` and `expect` from fixtures!

### Nested Parameters

```typescript
const models = ['haiku', 'sonnet', 'opus'];
const prompts = [
  { text: '/refactor for readability', focus: 'readability' },
  { text: '/refactor for performance', focus: 'performance' }
];

// Cartesian product
const combinations = models.flatMap(model =>
  prompts.map(prompt => ({ model, ...prompt }))
);

test.for(combinations)(
  '$model optimizing for $focus',
  async ({ model, text, focus, runAgent, expect }) => {
    const agent = defineAgent({ model: `claude-${model}-4` });

    const result = await runAgent({
      agent,
      prompt: text
    });

    expect(result).toCompleteAllTodos();

    // Track results by focus
    console.log(`${model} (${focus}):`, {
      files: result.files.stats().total,
      cost: result.metrics.totalCostUsd
    });
  }
);
```

---

## Model Comparison Matrix

### Cost vs Quality

```typescript
const costQualityMatrix = [
  { model: 'haiku', expectedCost: 0.3, minFiles: 3 },
  { model: 'sonnet', expectedCost: 1.5, minFiles: 5 },
  { model: 'opus', expectedCost: 4.0, minFiles: 8 }
];

test.for(costQualityMatrix)(
  '$model: cost ~$expectedCost, files >=$minFiles',
  async ({ model, expectedCost, minFiles, runAgent, expect }) => {
    const agent = defineAgent({ model: `claude-${model}-4` });

    const result = await runAgent({
      agent,
      prompt: '/refactor src/'
    });

    // Cost constraint
    expect(result.metrics.totalCostUsd!).toBeLessThan(expectedCost * 1.2);

    // Quality expectation
    expect(result.files.stats().total).toBeGreaterThanOrEqual(minFiles);

    console.log(`${model}:`, {
      cost: result.metrics.totalCostUsd,
      files: result.files.stats().total,
      efficiency: result.files.stats().total / result.metrics.totalCostUsd!
    });
  }
);
```

### Speed vs Accuracy

```typescript
const speedAccuracyMatrix = [
  { model: 'haiku', maxDuration: 20000, minTodos: 3 },
  { model: 'sonnet', maxDuration: 40000, minTodos: 5 },
  { model: 'opus', maxDuration: 60000, minTodos: 8 }
];

test.for(speedAccuracyMatrix)(
  '$model: <${maxDuration}ms, >=${minTodos} todos',
  async ({ model, maxDuration, minTodos, runAgent, expect }) => {
    const agent = defineAgent({ model: `claude-${model}-4` });

    const start = Date.now();
    const result = await runAgent({ agent, prompt: '/implement feature' });
    const duration = Date.now() - start;

    expect(duration).toBeLessThan(maxDuration);
    expect(result.todos.filter(t => t.status === 'completed').length)
      .toBeGreaterThanOrEqual(minTodos);
  }
);
```

---

## Prompt Variations

### Testing Prompt Formats

```typescript
const promptVariations = [
  { format: 'imperative', text: 'Refactor the code for readability' },
  { format: 'question', text: 'How can we refactor this code for better readability?' },
  { format: 'slash-command', text: '/refactor-for-readability' },
  { format: 'context', text: 'The code needs to be more readable. Please refactor it.' }
];

test.for(promptVariations)(
  'prompt format: $format',
  async ({ format, text, runAgent }) => {
    const agent = defineAgent({ model: 'claude-sonnet-4' });

    const result = await runAgent({
      agent,
      prompt: text
    });

    console.log(`${format}:`, {
      files: result.files.stats().total,
      tokens: result.metrics.totalTokens,
      completed: result.todos.filter(t => t.status === 'completed').length
    });
  }
);
```

### A/B Testing

```typescript
const abTest = [
  { variant: 'A', prompt: '/refactor', description: 'control' },
  { variant: 'B', prompt: '/refactor with emphasis on maintainability', description: 'treatment' }
];

test.for(abTest)(
  'A/B test: variant $variant ($description)',
  async ({ variant, prompt, runAgent }) => {
    const agent = defineAgent({ model: 'claude-sonnet-4' });

    const result = await runAgent({ agent, prompt });

    console.log(`Variant ${variant}:`, {
      files: result.files.stats().total,
      cost: result.metrics.totalCostUsd,
      quality: result.todos.filter(t => t.status === 'completed').length
    });
  }
);
```

---

## Configuration Matrix

### Tool Constraints

```typescript
const toolConfigs = [
  { name: 'unrestricted', tools: undefined },
  { name: 'read-only', tools: ['Read', 'Grep', 'Glob'] },
  { name: 'safe-write', tools: ['Read', 'Write', 'Edit'] }
];

test.for(toolConfigs)(
  'tool config: $name',
  async ({ name, tools, runAgent, expect }) => {
    const agent = defineAgent({
      model: 'claude-sonnet-4',
      tools
    });

    const result = await runAgent({
      agent,
      prompt: '/analyze and fix'
    });

    if (tools) {
      expect(result).toUseOnlyTools(tools);
    }

    console.log(`${name}:`, {
      toolCalls: result.tools.all().length,
      files: result.files.stats().total
    });
  }
);
```

### Timeout Configurations

```typescript
const timeoutConfigs = [
  { turns: 5, timeout: 30000 },
  { turns: 10, timeout: 60000 },
  { turns: 20, timeout: 120000 }
];

test.for(timeoutConfigs)(
  'maxTurns=$turns, timeout=${timeout}ms',
  async ({ turns, timeout, runAgent }) => {
    const agent = defineAgent({
      model: 'claude-sonnet-4',
      timeouts: { maxTurns: turns, timeoutMs: timeout }
    });

    const result = await runAgent({
      agent,
      prompt: '/complex-refactor'
    });

    console.log(`${turns} turns:`, {
      duration: result.metrics.durationMs,
      completed: result.todos.every(t => t.status === 'completed')
    });
  },
  { timeout: timeout + 10000 }  // Test timeout = agent timeout + buffer
);
```

---

## Quality Matrix

### Rubric Variations

```typescript
import { judge } from '@dao/vibe-check';

const rubricVariations = [
  {
    name: 'balanced',
    rubric: {
      criteria: [
        { name: 'correctness', weight: 0.5 },
        { name: 'maintainability', weight: 0.5 }
      ]
    }
  },
  {
    name: 'correctness-focused',
    rubric: {
      criteria: [
        { name: 'correctness', weight: 0.8 },
        { name: 'maintainability', weight: 0.2 }
      ]
    }
  }
];

test.for(rubricVariations)(
  'rubric: $name',
  async ({ name, rubric, runAgent, judge, expect }) => {
    const agent = defineAgent({ model: 'claude-opus-4' });

    const result = await runAgent({
      agent,
      prompt: '/refactor'
    });

    const evaluation = await judge(result, {
      rubric,
      throwOnFail: false
    });

    console.log(`${name}:`, {
      passed: evaluation.passed,
      score: evaluation.score
    });

    expect(evaluation.passed).toBe(true);
  }
);
```

---

## Regression Testing

### Baseline Comparison

```typescript
const baselines = [
  { version: 'v1', cost: 2.0, files: 5, tokens: 40000 },
  { version: 'v2', cost: 1.8, files: 6, tokens: 38000 }
];

test.for(baselines)(
  'regression test: $version',
  async ({ version, cost, files, tokens, runAgent, expect }) => {
    const agent = defineAgent({ model: 'claude-sonnet-4' });

    const result = await runAgent({
      agent,
      prompt: '/refactor'
    });

    // No regression
    expect(result.metrics.totalCostUsd!).toBeLessThanOrEqual(cost * 1.1);
    expect(result.files.stats().total).toBeGreaterThanOrEqual(files * 0.9);
    expect(result.metrics.totalTokens!).toBeLessThanOrEqual(tokens * 1.1);

    console.log(`${version}:`, {
      costDelta: ((result.metrics.totalCostUsd! - cost) / cost * 100).toFixed(1) + '%',
      filesDelta: ((result.files.stats().total - files) / files * 100).toFixed(1) + '%'
    });
  }
);
```

---

## Best Practices

### 1. Use Descriptive Test Names

```typescript
// ✅ Good: Clear parameter interpolation
test.for(models)('benchmark $model on refactoring', ...)

// ❌ Bad: Generic name
test.for(models)('test', ...)
```

### 2. Control for Variables

```typescript
// ✅ Good: Same base config across tests
const baseConfig = { timeouts: { maxTurns: 10 } };

test.for(models)('$model', async ({ model, runAgent }) => {
  const agent = defineAgent({
    model: `claude-${model}-4`,
    ...baseConfig  // Consistent
  });
  // ...
});
```

### 3. Track Results Systematically

```typescript
const results: Array<{ model: string; cost: number; files: number }> = [];

test.for(models)('$model', async ({ model, runAgent }) => {
  const agent = defineAgent({ model: `claude-${model}-4` });
  const result = await runAgent({ agent, prompt: '/refactor' });

  results.push({
    model,
    cost: result.metrics.totalCostUsd!,
    files: result.files.stats().total
  });
});

test('analyze results', () => {
  console.table(results);
  // Add assertions or analysis
});
```

### 4. Set Appropriate Timeouts

```typescript
// ✅ Good: Per-test timeout
test.for(models)('$model', async ({ model, runAgent }) => {
  // ...
}, { timeout: 120000 });  // 2 minutes per test

// ❌ Bad: Default timeout may be too short
test.for(models)('$model', async ({ model, runAgent }) => {
  // Might timeout on slower models
});
```

---

## Related Documentation

- **[Benchmarking Guide](/guides/evaluation/benchmarking/)** - Model comparison patterns
- **[vibeTest API](/../api/vibeTest/)** - Complete API reference
- **[Vitest test.for](https://vitest.dev/api/#test-for)** - Vitest documentation
- **[Custom Matchers](/../api/matchers/)** - Assertion helpers

---

[← Back to Evaluation Guides](./)
