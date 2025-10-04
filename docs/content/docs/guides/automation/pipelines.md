---
title: Building Pipelines
description: Multi-stage agent workflows with vibeWorkflow
---

[Guides](../) > [Automation](./) > Building Pipelines

---

## Overview

`vibeWorkflow` is designed for building multi-stage agent pipelines with automatic context accumulation, loop helpers, and cumulative state tracking.

**When to use vibeWorkflow:**
- Multi-stage agent pipelines
- Iterative workflows with loops and retries
- Production automation
- Coordinating multiple agents
- Long-running workflows

**When to use vibeTest instead:**
- Benchmarking and evaluation
- Quality gates with assertions
- Model comparison

---

## Basic Pipeline

A simple three-stage pipeline:

```typescript
import { vibeWorkflow, defineAgent } from '@dao/vibe-check';

const analyzer = defineAgent({ name: 'analyzer' });
const fixer = defineAgent({ name: 'fixer' });
const tester = defineAgent({ name: 'tester' });

vibeWorkflow('refactor pipeline', async (wf) => {
  // Stage 1: Analyze codebase
  const analysis = await wf.stage('analyze', {
    agent: analyzer,
    prompt: '/analyze codebase for refactoring opportunities'
  });

  // Stage 2: Apply fixes
  const fixes = await wf.stage('fix', {
    agent: fixer,
    prompt: '/apply recommended refactorings'
  });

  // Stage 3: Run tests
  const tests = await wf.stage('test', {
    agent: tester,
    prompt: '/run tests and verify changes'
  });

  // Access cumulative state
  console.log(`Total files changed: ${wf.files.allChanged().length}`);
  console.log(`Total tool calls: ${wf.tools.all().length}`);
});
```

---

## Stage Execution

### Sequential Stages

Stages execute sequentially by default:

```typescript
vibeWorkflow('sequential pipeline', async (wf) => {
  const step1 = await wf.stage('step1', {
    agent: agent1,
    prompt: '/task1'
  });

  const step2 = await wf.stage('step2', {
    agent: agent2,
    prompt: '/task2'
  });

  const step3 = await wf.stage('step3', {
    agent: agent3,
    prompt: '/task3'
  });
});
```

### Context Handoff

Pass results between stages:

```typescript
vibeWorkflow('context handoff', async (wf) => {
  const analyze = await wf.stage('analyze', {
    agent: analyzer,
    prompt: '/analyze'
  });

  // Use analysis results in next stage
  const fix = await wf.stage('fix', {
    agent: fixer,
    prompt: `/fix issues found in analysis`,
    context: analyze  // Explicit handoff
  });
});
```

---

## Iterative Workflows

### Loop Until Condition

Use `until()` for iterative workflows:

```typescript
vibeWorkflow('iterative fix', async (wf) => {
  const analyze = await wf.stage('analyze', {
    agent: analyzer,
    prompt: '/analyze'
  });

  // Loop until all todos are completed
  await wf.until(
    (latest) => latest.todos.every(t => t.status === 'completed'),
    async () => wf.stage('fix', {
      agent: fixer,
      prompt: '/fix remaining issues'
    }),
    { maxIterations: 3 }
  );

  expect(wf.files.allChanged().length).toBeGreaterThan(0);
});
```

### Manual Loops

For custom loop logic:

```typescript
vibeWorkflow('custom loop', async (wf) => {
  let allTestsPass = false;
  let attempt = 0;

  while (!allTestsPass && attempt++ < 5) {
    const result = await wf.stage(`attempt-${attempt}`, {
      agent: implementer,
      prompt: '/implement feature and run tests'
    });

    // Check if tests passed
    allTestsPass = result.todos.every(t =>
      t.status === 'completed' && t.text.includes('tests pass')
    );

    if (!allTestsPass && attempt < 5) {
      await wf.stage(`fix-${attempt}`, {
        agent: fixer,
        prompt: '/fix failing tests'
      });
    }
  }

  expect(allTestsPass).toBe(true);
});
```

---

## Conditional Execution

### Based on Results

```typescript
vibeWorkflow('conditional stages', async (wf) => {
  const analyze = await wf.stage('analyze', {
    agent: analyzer,
    prompt: '/analyze'
  });

  // Conditional: large changeset requires deep review
  if (analyze.files.stats().total > 10) {
    await wf.stage('deep-review', {
      agent: deepReviewer,
      prompt: '/perform deep code review'
    });
  }

  const build = await wf.stage('build', {
    agent: builder,
    prompt: '/build project'
  });

  // Conditional: only deploy if build succeeded
  if (build.todos.every(t => t.status === 'completed')) {
    await wf.stage('deploy', {
      agent: deployer,
      prompt: '/deploy to staging'
    });
  }
});
```

### Based on File Changes

```typescript
vibeWorkflow('conditional by files', async (wf) => {
  const changes = await wf.stage('make-changes', {
    agent: updater,
    prompt: '/update dependencies'
  });

  // Run different stages based on what changed
  const tsFiles = changes.files.filter('**/*.ts');
  const configFiles = changes.files.filter('**/package.json');

  if (tsFiles.length > 0) {
    await wf.stage('typecheck', {
      agent: typechecker,
      prompt: '/run TypeScript checks'
    });
  }

  if (configFiles.length > 0) {
    await wf.stage('install', {
      agent: installer,
      prompt: '/reinstall dependencies'
    });
  }
});
```

---

## Error Recovery

### Retry Logic

```typescript
vibeWorkflow('resilient pipeline', async (wf) => {
  let buildSuccess = false;
  let attempt = 0;

  while (!buildSuccess && attempt++ < 3) {
    const build = await wf.stage(`build-attempt-${attempt}`, {
      agent: builder,
      prompt: '/build project'
    });

    // Check for errors in logs
    buildSuccess = !build.messages.some(m =>
      m.summary.toLowerCase().includes('error')
    );

    if (!buildSuccess && attempt < 3) {
      // Analyze and fix errors before retry
      await wf.stage(`fix-attempt-${attempt}`, {
        agent: fixer,
        prompt: '/analyze and fix build errors'
      });
    }
  }

  expect(buildSuccess).toBe(true);
});
```

### Fallback Strategies

```typescript
vibeWorkflow('fallback pipeline', async (wf) => {
  const optimize = await wf.stage('optimize', {
    agent: optimizer,
    prompt: '/optimize performance'
  });

  // Try aggressive optimization first
  let result = await wf.stage('aggressive-opt', {
    agent: aggressiveOptimizer,
    prompt: '/apply aggressive optimizations'
  });

  // Fall back to safe optimization if aggressive fails
  if (result.messages.some(m => m.summary.includes('error'))) {
    result = await wf.stage('safe-opt', {
      agent: safeOptimizer,
      prompt: '/apply safe optimizations only'
    });
  }
});
```

---

## Workspace Management

### Default Workspace

```typescript
vibeWorkflow(
  'single-repo workflow',
  async (wf) => {
    // All stages use default workspace
    await wf.stage('update', {
      agent: updater,
      prompt: '/update code'
    });

    await wf.stage('test', {
      agent: tester,
      prompt: '/run tests'
    });
  },
  {
    defaults: { workspace: '/path/to/repo' }
  }
);
```

### Multi-Repository

```typescript
vibeWorkflow(
  'multi-repo workflow',
  async (wf) => {
    // Main repo (uses default)
    await wf.stage('update-main', {
      agent: updater,
      prompt: '/update main repo'
    });

    // Override workspace for docs repo
    await wf.stage('update-docs', {
      agent: docUpdater,
      prompt: '/update documentation',
      workspace: '/path/to/docs-repo'  // Override
    });

    // Back to main repo
    await wf.stage('commit', {
      agent: committer,
      prompt: '/commit all changes'
    });
  },
  {
    defaults: { workspace: '/path/to/main-repo' }
  }
);
```

---

## Cumulative State

### File Changes

```typescript
vibeWorkflow('track file changes', async (wf) => {
  await wf.stage('stage1', { agent: agent1, prompt: '/task1' });
  await wf.stage('stage2', { agent: agent2, prompt: '/task2' });
  await wf.stage('stage3', { agent: agent3, prompt: '/task3' });

  // All files changed across all stages
  const allFiles = wf.files.allChanged();
  console.log('Total files changed:', allFiles.length);

  // Files changed in specific stage
  const stage2Files = wf.files.byStage('stage2');
  console.log('Stage 2 files:', stage2Files.map(f => f.path));

  // Filter cumulative changes
  const tsFiles = allFiles.filter(f => f.path.endsWith('.ts'));
  console.log('TypeScript files changed:', tsFiles.length);
});
```

### Tool Usage

```typescript
vibeWorkflow('track tool usage', async (wf) => {
  await wf.stage('stage1', { agent: agent1, prompt: '/task1' });
  await wf.stage('stage2', { agent: agent2, prompt: '/task2' });

  // All tool calls with stage info
  const toolsByStage = wf.tools.all().reduce((acc, { stage, call }) => {
    acc[stage] = acc[stage] || [];
    acc[stage].push(call.name);
    return acc;
  }, {} as Record<string, string[]>);

  console.log('Tools by stage:', toolsByStage);
});
```

### Timeline Events

```typescript
vibeWorkflow('track timeline', async (wf) => {
  await wf.stage('stage1', { agent: agent1, prompt: '/task1' });
  await wf.stage('stage2', { agent: agent2, prompt: '/task2' });

  // Unified timeline across all stages
  for await (const { stage, evt } of wf.timeline.events()) {
    if (evt.type === 'sdk-message') {
      console.log(`[${stage}] Message from ${evt.role}`);
    } else if (evt.type === 'tool') {
      console.log(`[${stage}] Tool: ${evt.name}`);
    }
  }
});
```

---

## Advanced Patterns

### Quality-Driven Pipeline

```typescript
import { vibeWorkflow, judge } from '@dao/vibe-check';

const qualityRubric = {
  criteria: [
    { name: 'correctness', weight: 0.5 },
    { name: 'maintainability', weight: 0.5 }
  ],
  passingScore: 0.8
};

vibeWorkflow('quality-driven', async (wf) => {
  let passed = false;
  let iterations = 0;

  while (!passed && iterations++ < 3) {
    const result = await wf.stage(`refactor-${iterations}`, {
      agent: refactor,
      prompt: '/refactor with quality focus'
    });

    const evaluation = await judge(result, {
      rubric: qualityRubric,
      throwOnFail: false
    });

    passed = evaluation.passed;

    if (!passed && iterations < 3) {
      await wf.stage(`fix-${iterations}`, {
        agent: fixer,
        prompt: `/improve quality: ${JSON.stringify(evaluation.details)}`
      });
    }
  }

  expect(passed).toBe(true);
});
```

### Parallel Stages (Future)

```typescript
// Note: Parallel execution planned for future release
// Current implementation is sequential

vibeWorkflow('parallel tests', async (wf) => {
  const analyze = await wf.stage('analyze', {
    agent: analyzer,
    prompt: '/analyze'
  });

  // Future: parallel execution
  // const [unit, integration, e2e] = await Promise.all([
  //   wf.stage('unit-tests', { ... }),
  //   wf.stage('integration-tests', { ... }),
  //   wf.stage('e2e-tests', { ... })
  // ]);

  // Current: sequential
  const unit = await wf.stage('unit-tests', {
    agent: unitTester,
    prompt: '/run unit tests'
  });

  const integration = await wf.stage('integration-tests', {
    agent: integrationTester,
    prompt: '/run integration tests'
  });
});
```

### DAG Execution (Future)

```typescript
// Future: DAG-based dependencies
// vibeWorkflow('dag pipeline', async (wf) => {
//   const [lint, typecheck] = await wf.parallel([
//     { name: 'lint', agent: linter, prompt: '/lint' },
//     { name: 'typecheck', agent: typechecker, prompt: '/typecheck' }
//   ]);
//
//   // Depends on both lint and typecheck
//   const build = await wf.stage('build', {
//     agent: builder,
//     prompt: '/build',
//     dependsOn: ['lint', 'typecheck']
//   });
// });
```

---

## Best Practices

### 1. Use Descriptive Stage Names

```typescript
// ✅ Good: Clear stage names
await wf.stage('analyze-dependencies', { ... });
await wf.stage('update-packages', { ... });
await wf.stage('run-tests', { ... });

// ❌ Bad: Generic names
await wf.stage('step1', { ... });
await wf.stage('step2', { ... });
```

### 2. Set Iteration Limits

```typescript
// ✅ Good: Explicit max iterations
await wf.until(
  (result) => result.todos.every(t => t.status === 'completed'),
  async () => wf.stage('fix', { ... }),
  { maxIterations: 5 }  // Prevent infinite loops
);

// ❌ Bad: Unbounded loop
while (!condition) {
  await wf.stage('retry', { ... });  // Could loop forever
}
```

### 3. Handle Errors Gracefully

```typescript
// ✅ Good: Error handling and recovery
const result = await wf.stage('risky-operation', { ... });
if (result.messages.some(m => m.summary.includes('error'))) {
  await wf.stage('rollback', { ... });
  throw new Error('Pipeline failed, rolled back');
}

// ❌ Bad: No error handling
await wf.stage('risky-operation', { ... });
// Continue regardless of errors
```

### 4. Use Cumulative State

```typescript
// ✅ Good: Leverage cumulative context
const allChanges = wf.files.allChanged();
if (allChanges.some(f => f.path.includes('critical'))) {
  await wf.stage('extra-review', { ... });
}

// ❌ Bad: Ignore cumulative state
// Each stage works in isolation without awareness of prior changes
```

---

## Related Documentation

- **[vibeWorkflow API](/../api/vibeWorkflow/)** - Complete API reference
- **[Orchestration Guide](/guides/automation/orchestration/)** - Multi-agent coordination
- **[RunResult](../../api/types.md#runresult)** - Understanding execution results
- **[First Automation Tutorial](/../getting-started/first-automation/)** - Step-by-step guide

---

[← Back to Automation Guides](./)
