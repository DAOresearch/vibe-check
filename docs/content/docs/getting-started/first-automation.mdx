---
title: First Automation
description: Build your first multi-stage agent pipeline in 10 minutes
sidebar:
  order: 5
---

[Getting Started](./) > First Automation

---

## What You'll Build

A three-stage refactoring pipeline that:
1. Analyzes code for issues
2. Applies fixes automatically
3. Runs tests to verify changes

**Estimated time:** 10 minutes

---

## Prerequisites

- Node.js 18+ or Bun installed
- Vibe Check installed (`npm install @dao/vibe-check` or `bun add @dao/vibe-check`)
- Claude Code CLI configured
- A Git repository to work with

---

## Step 1: Create Your Test File

Create `refactor-pipeline.test.ts`:

```typescript
import { vibeWorkflow, defineAgent } from '@dao/vibe-check';
```

---

## Step 2: Define Your Agents

Add three specialized agents:

```typescript
// Analyzer: reads and analyzes code
const analyzer = defineAgent({
  name: 'code-analyzer',
  model: 'claude-sonnet-4',
  tools: ['Read', 'Grep', 'Glob']
});

// Fixer: applies refactorings
const fixer = defineAgent({
  name: 'refactor',
  model: 'claude-opus-4',
  tools: ['Read', 'Edit', 'Write']
});

// Tester: runs tests
const tester = defineAgent({
  name: 'tester',
  model: 'claude-haiku-4',
  tools: ['Bash', 'Read']
});
```

**Why different models?**
- Analyzer: Sonnet balances speed and accuracy
- Fixer: Opus provides highest quality refactoring
- Tester: Haiku is fast and cost-effective for running tests

---

## Step 3: Build the Pipeline

Add your workflow:

```typescript
vibeWorkflow('refactor pipeline', async (wf) => {
  // Stage 1: Analyze
  const analysis = await wf.stage('analyze', {
    agent: analyzer,
    prompt: '/analyze codebase for refactoring opportunities in src/'
  });

  console.log('Analysis complete:', {
    filesScanned: analysis.files.stats().total,
    issuesFound: analysis.todos.filter(t => t.status === 'pending').length
  });

  // Stage 2: Apply fixes
  const fixes = await wf.stage('refactor', {
    agent: fixer,
    prompt: '/apply recommended refactorings from analysis',
    context: analysis  // Pass analysis context
  });

  console.log('Refactoring complete:', {
    filesChanged: fixes.files.stats().total,
    cost: fixes.metrics.totalCostUsd
  });

  // Stage 3: Run tests
  const tests = await wf.stage('test', {
    agent: tester,
    prompt: '/run npm test and verify changes'
  });

  console.log('Tests complete:', {
    testsPassed: tests.todos.every(t => t.status === 'completed')
  });

  // Cumulative metrics
  console.log('\nPipeline summary:', {
    totalFilesChanged: wf.files.allChanged().length,
    totalCost: analysis.metrics.totalCostUsd! +
               fixes.metrics.totalCostUsd! +
               tests.metrics.totalCostUsd!
  });
}, {
  defaults: { workspace: '/path/to/your/repo' }
});
```

---

## Step 4: Run the Pipeline

```bash
bun test refactor-pipeline.test.ts
# or
npm test refactor-pipeline.test.ts
```

You'll see:
1. Analysis progress and findings
2. Refactoring changes being applied
3. Test execution results
4. Cumulative pipeline summary

---

## Step 5: View the Results

### Terminal Output

```
✓ refactor pipeline (45s)

Analysis complete: {
  filesScanned: 12,
  issuesFound: 8
}

Refactoring complete: {
  filesChanged: 7,
  cost: 1.23
}

Tests complete: {
  testsPassed: true
}

Pipeline summary: {
  totalFilesChanged: 7,
  totalCost: 1.85
}
```

### HTML Report

Open `.vibe-reports/index.html` to see:
- Stage-by-stage timeline
- File changes with diffs
- Tool call details
- Cost breakdown
- Todo tracking

---

## Step 6: Add Error Recovery (Optional)

Make your pipeline more resilient:

```typescript
vibeWorkflow('resilient pipeline', async (wf) => {
  const analysis = await wf.stage('analyze', {
    agent: analyzer,
    prompt: '/analyze codebase'
  });

  const fixes = await wf.stage('refactor', {
    agent: fixer,
    prompt: '/apply refactorings',
    context: analysis
  });

  // Test with retry logic
  let testsPassed = false;
  let attempt = 0;

  while (!testsPassed && attempt++ < 3) {
    const tests = await wf.stage(`test-attempt-${attempt}`, {
      agent: tester,
      prompt: '/run tests'
    });

    testsPassed = tests.todos.every(t => t.status === 'completed');

    if (!testsPassed && attempt < 3) {
      // Fix failing tests
      await wf.stage(`fix-tests-${attempt}`, {
        agent: fixer,
        prompt: '/fix failing tests'
      });
    }
  }

  expect(testsPassed).toBe(true);
});
```

---

## Step 7: Add Conditional Logic (Optional)

Execute stages based on results:

```typescript
vibeWorkflow('conditional pipeline', async (wf) => {
  const analysis = await wf.stage('analyze', {
    agent: analyzer,
    prompt: '/analyze'
  });

  // Only refactor if issues found
  if (analysis.todos.filter(t => t.status === 'pending').length > 0) {
    await wf.stage('refactor', {
      agent: fixer,
      prompt: '/apply fixes',
      context: analysis
    });
  }

  // Only run expensive tests if code changed
  if (wf.files.allChanged().length > 0) {
    await wf.stage('integration-tests', {
      agent: tester,
      prompt: '/run integration tests'
    });
  }
});
```

---

## What You Learned

✅ Creating specialized agents for different tasks
✅ Building multi-stage pipelines with `vibeWorkflow`
✅ Passing context between stages
✅ Tracking cumulative state across stages
✅ Adding error recovery and conditional logic

---

## Next Steps

### Explore More Patterns

- **[Building Pipelines Guide](/guides/automation/pipelines/)** - Advanced pipeline patterns
- **[Multi-Agent Orchestration](/guides/automation/orchestration/)** - Coordinating multiple agents
- **[vibeWorkflow API](/api/vibeWorkflow/)** - Complete API reference

### Try These Enhancements

1. **Add quality gates:**
   ```typescript
   const fixes = await wf.stage('refactor', { ... });
   expect(fixes).toHaveNoErrorsInLogs();
   expect(fixes).toStayUnderCost(3.00);
   ```

2. **Use loop helpers:**
   ```typescript
   await wf.until(
     (result) => result.todos.every(t => t.status === 'completed'),
     async () => wf.stage('fix', { agent: fixer, prompt: '/fix' }),
     { maxIterations: 3 }
   );
   ```

3. **Track cumulative changes:**
   ```typescript
   const allChanges = wf.files.allChanged();
   const tsFiles = allChanges.filter(f => f.path.endsWith('.ts'));
   console.log(`Changed ${tsFiles.length} TypeScript files`);
   ```

---

## Troubleshooting

### Pipeline times out

Increase timeout:
```typescript
vibeWorkflow('long pipeline', async (wf) => {
  // ...
}, { timeout: 300000 });  // 5 minutes
```

### Stages fail

Add error checking:
```typescript
const result = await wf.stage('risky', { ... });
if (result.messages.some(m => m.summary.includes('error'))) {
  await wf.stage('rollback', { ... });
}
```

### High costs

Use cheaper models:
```typescript
const costEffectiveAgent = defineAgent({
  model: 'claude-haiku-4'  // Much cheaper
});
```

---

[← Back to Getting Started](./) | [Next: First Evaluation →](/getting-started/first-evaluation/)
