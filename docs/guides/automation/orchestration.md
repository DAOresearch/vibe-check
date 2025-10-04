# Multi-Agent Orchestration

> Coordinating multiple agents with cumulative context

[Guides](../) > [Automation](./) > Multi-Agent Orchestration

---

## Overview

Multi-agent orchestration in vibe-check leverages `vibeWorkflow` to coordinate multiple specialized agents, share context between them, and track cumulative state across the entire workflow.

**Key capabilities:**
- Specialized agents for different tasks
- Automatic context accumulation
- Shared workspace and state
- Agent-to-agent handoff
- Cumulative file and tool tracking

---

## Basic Multi-Agent Pattern

```typescript
import { vibeWorkflow, defineAgent } from '@dao/vibe-check';

// Define specialized agents
const analyzer = defineAgent({
  name: 'code-analyzer',
  model: 'claude-sonnet-4',
  tools: ['Read', 'Grep', 'Glob']
});

const refactor = defineAgent({
  name: 'refactor',
  model: 'claude-opus-4',
  tools: ['Read', 'Edit', 'Write']
});

const tester = defineAgent({
  name: 'tester',
  model: 'claude-haiku-4',
  tools: ['Bash', 'Read']
});

vibeWorkflow('refactor pipeline', async (wf) => {
  // Agent 1: Analyze
  const analysis = await wf.stage('analyze', {
    agent: analyzer,
    prompt: '/analyze codebase for refactoring opportunities'
  });

  // Agent 2: Refactor (with analysis context)
  const changes = await wf.stage('refactor', {
    agent: refactor,
    prompt: '/apply recommended refactorings',
    context: analysis
  });

  // Agent 3: Test
  const tests = await wf.stage('test', {
    agent: tester,
    prompt: '/run tests and verify changes'
  });

  // All agents' work is tracked cumulatively
  console.log(`Total files changed: ${wf.files.allChanged().length}`);
});
```

---

## Agent Specialization

### By Capability

Assign agents based on their strengths:

```typescript
const securityAgent = defineAgent({
  name: 'security',
  model: 'claude-opus-4',  // Most capable for security
  tools: ['Read', 'Grep'],
  systemPrompt: 'You are a security expert. Focus on vulnerabilities.'
});

const performanceAgent = defineAgent({
  name: 'performance',
  model: 'claude-sonnet-4',
  tools: ['Read', 'Edit', 'Bash'],
  systemPrompt: 'You are a performance optimization expert.'
});

const documentationAgent = defineAgent({
  name: 'docs',
  model: 'claude-haiku-4',  // Cost-effective for docs
  tools: ['Read', 'Write'],
  systemPrompt: 'You document code changes clearly.'
});

vibeWorkflow('comprehensive review', async (wf) => {
  const security = await wf.stage('security-review', {
    agent: securityAgent,
    prompt: '/review code for security issues'
  });

  const perf = await wf.stage('performance-review', {
    agent: performanceAgent,
    prompt: '/analyze and optimize performance'
  });

  const docs = await wf.stage('documentation', {
    agent: documentationAgent,
    prompt: '/update documentation for all changes'
  });
});
```

### By Tool Access

Restrict tools per agent:

```typescript
const readOnlyAgent = defineAgent({
  name: 'analyzer',
  tools: ['Read', 'Grep', 'Glob']  // No write access
});

const writerAgent = defineAgent({
  name: 'implementer',
  tools: ['Read', 'Write', 'Edit']  // Can modify files
});

const runnerAgent = defineAgent({
  name: 'tester',
  tools: ['Bash', 'Read']  // Can execute commands
});

vibeWorkflow('controlled pipeline', async (wf) => {
  // Analysis only (no modifications)
  const analysis = await wf.stage('analyze', {
    agent: readOnlyAgent,
    prompt: '/analyze code structure'
  });

  // Implementation (write access)
  const impl = await wf.stage('implement', {
    agent: writerAgent,
    prompt: '/implement changes based on analysis'
  });

  // Testing (execution access)
  const test = await wf.stage('test', {
    agent: runnerAgent,
    prompt: '/run test suite'
  });
});
```

---

## Context Handoff Patterns

### Explicit Context Passing

```typescript
vibeWorkflow('explicit handoff', async (wf) => {
  const analyze = await wf.stage('analyze', {
    agent: analyzer,
    prompt: '/analyze for bugs'
  });

  // Explicit: Pass analysis to fixer
  const fix = await wf.stage('fix', {
    agent: fixer,
    prompt: '/fix bugs found in analysis',
    context: analyze  // Explicit handoff
  });

  // Fixer's changes available to reviewer
  const review = await wf.stage('review', {
    agent: reviewer,
    prompt: '/review all fixes',
    context: fix
  });
});
```

### Cumulative Context

```typescript
vibeWorkflow('cumulative context', async (wf) => {
  await wf.stage('agent1', {
    agent: agent1,
    prompt: '/task1'
  });

  await wf.stage('agent2', {
    agent: agent2,
    prompt: '/task2'
  });

  await wf.stage('agent3', {
    agent: agent3,
    prompt: '/task3'
  });

  // All agents' changes are tracked cumulatively
  const allFiles = wf.files.allChanged();
  const allTools = wf.tools.all();

  // Final agent sees everything
  await wf.stage('finalizer', {
    agent: finalAgent,
    prompt: `/finalize based on ${allFiles.length} file changes`
  });
});
```

---

## Specialized Workflows

### Review Pipeline

```typescript
const codeReviewer = defineAgent({
  name: 'code-reviewer',
  systemPrompt: 'Review code for quality, correctness, and best practices.'
});

const securityReviewer = defineAgent({
  name: 'security-reviewer',
  systemPrompt: 'Review code for security vulnerabilities.'
});

const performanceReviewer = defineAgent({
  name: 'performance-reviewer',
  systemPrompt: 'Review code for performance issues and optimizations.'
});

vibeWorkflow('comprehensive code review', async (wf) => {
  // Parallel reviews (sequential for now, parallel in future)
  const codeReview = await wf.stage('code-quality', {
    agent: codeReviewer,
    prompt: '/review for code quality'
  });

  const securityReview = await wf.stage('security', {
    agent: securityReviewer,
    prompt: '/review for security issues'
  });

  const perfReview = await wf.stage('performance', {
    agent: performanceReviewer,
    prompt: '/review for performance'
  });

  // Consolidate findings
  const allIssues = [
    ...codeReview.todos,
    ...securityReview.todos,
    ...perfReview.todos
  ];

  console.log(`Total review findings: ${allIssues.length}`);
});
```

### Implementation Pipeline

```typescript
const designer = defineAgent({
  name: 'designer',
  systemPrompt: 'Design system architecture and interfaces.'
});

const implementer = defineAgent({
  name: 'implementer',
  systemPrompt: 'Implement features based on design.'
});

const tester = defineAgent({
  name: 'tester',
  systemPrompt: 'Write comprehensive tests.'
});

vibeWorkflow('feature implementation', async (wf) => {
  // 1. Design
  const design = await wf.stage('design', {
    agent: designer,
    prompt: '/design authentication system'
  });

  // 2. Implement based on design
  const impl = await wf.stage('implement', {
    agent: implementer,
    prompt: '/implement authentication based on design',
    context: design
  });

  // 3. Test implementation
  const tests = await wf.stage('test', {
    agent: tester,
    prompt: '/write tests for authentication',
    context: impl
  });

  // Verify all stages completed
  expect(tests).toCompleteAllTodos();
});
```

---

## Agent Communication

### Via Shared Workspace

Agents communicate through file changes:

```typescript
vibeWorkflow('shared workspace', async (wf) => {
  // Agent 1 creates plan file
  await wf.stage('planner', {
    agent: planner,
    prompt: '/create implementation plan in PLAN.md'
  });

  // Agent 2 reads and follows plan
  await wf.stage('implementer', {
    agent: implementer,
    prompt: '/read PLAN.md and implement features'
  });

  // Agent 3 reads and verifies against plan
  await wf.stage('verifier', {
    agent: verifier,
    prompt: '/verify implementation matches PLAN.md'
  });
});
```

### Via Context Results

Agents access previous results:

```typescript
vibeWorkflow('result-based communication', async (wf) => {
  const scan = await wf.stage('scan', {
    agent: scanner,
    prompt: '/scan for issues'
  });

  // Next agent can access scan.todos, scan.files, etc.
  const issueCount = scan.todos.filter(t =>
    t.status === 'pending'
  ).length;

  await wf.stage('fix', {
    agent: fixer,
    prompt: `/fix ${issueCount} issues found by scanner`
  });
});
```

---

## Iterative Multi-Agent Loops

### Until Consensus

```typescript
import { judge } from '@dao/vibe-check';

const rubric = {
  criteria: [
    { name: 'quality', weight: 1.0 }
  ],
  passingScore: 0.9
};

vibeWorkflow('iterative improvement', async (wf) => {
  let approved = false;
  let iteration = 0;

  while (!approved && iteration++ < 3) {
    // Implementer makes changes
    const impl = await wf.stage(`implement-${iteration}`, {
      agent: implementer,
      prompt: '/implement feature with high quality'
    });

    // Reviewer evaluates
    const review = await wf.stage(`review-${iteration}`, {
      agent: reviewer,
      prompt: '/review implementation quality'
    });

    // Judge decides
    const evaluation = await judge(review, {
      rubric,
      throwOnFail: false
    });

    approved = evaluation.passed;

    if (!approved && iteration < 3) {
      // Fixer addresses issues
      await wf.stage(`fix-${iteration}`, {
        agent: fixer,
        prompt: `/fix quality issues: ${JSON.stringify(evaluation.details)}`
      });
    }
  }

  expect(approved).toBe(true);
});
```

### Round-Robin Collaboration

```typescript
vibeWorkflow('round-robin', async (wf) => {
  let result = await wf.stage('initial', {
    agent: agent1,
    prompt: '/start implementation'
  });

  // Pass work between agents in rounds
  for (let round = 1; round <= 3; round++) {
    result = await wf.stage(`agent1-round-${round}`, {
      agent: agent1,
      prompt: '/improve implementation',
      context: result
    });

    result = await wf.stage(`agent2-round-${round}`, {
      agent: agent2,
      prompt: '/refine and optimize',
      context: result
    });

    result = await wf.stage(`agent3-round-${round}`, {
      agent: agent3,
      prompt: '/add tests and docs',
      context: result
    });
  }
});
```

---

## Model Mixing

### By Task Complexity

```typescript
const opusAgent = defineAgent({
  name: 'opus',
  model: 'claude-opus-4'  // Most capable
});

const sonnetAgent = defineAgent({
  name: 'sonnet',
  model: 'claude-sonnet-4'  // Balanced
});

const haikuAgent = defineAgent({
  name: 'haiku',
  model: 'claude-haiku-4'  // Fast and cheap
});

vibeWorkflow('model mixing', async (wf) => {
  // Complex task: use Opus
  const architecture = await wf.stage('design', {
    agent: opusAgent,
    prompt: '/design complex distributed system architecture'
  });

  // Medium task: use Sonnet
  const implementation = await wf.stage('implement', {
    agent: sonnetAgent,
    prompt: '/implement core features',
    context: architecture
  });

  // Simple task: use Haiku
  const docs = await wf.stage('document', {
    agent: haikuAgent,
    prompt: '/write API documentation'
  });

  // Cost optimization: ~70% cheaper than all-Opus
});
```

### By Cost vs Quality

```typescript
vibeWorkflow('cost-optimized', async (wf) => {
  // Fast iteration with Haiku
  let result = await wf.stage('draft', {
    agent: haikuAgent,
    prompt: '/draft initial implementation'
  });

  // Quality check with Opus
  const review = await wf.stage('review', {
    agent: opusAgent,
    prompt: '/review for correctness and quality'
  });

  // Fixes with Sonnet (balanced)
  if (review.todos.some(t => t.status === 'pending')) {
    result = await wf.stage('refine', {
      agent: sonnetAgent,
      prompt: '/refine based on review feedback'
    });
  }
});
```

---

## Tracking Agent Activity

### Per-Agent Metrics

```typescript
vibeWorkflow('track agents', async (wf) => {
  await wf.stage('agent1', { agent: agent1, prompt: '/task1' });
  await wf.stage('agent2', { agent: agent2, prompt: '/task2' });
  await wf.stage('agent3', { agent: agent3, prompt: '/task3' });

  // Group metrics by stage (which corresponds to agent)
  const stages = wf.tools.all().reduce((acc, { stage, call }) => {
    if (!acc[stage]) {
      acc[stage] = { tools: [], files: new Set() };
    }
    acc[stage].tools.push(call.name);
    return acc;
  }, {} as Record<string, any>);

  // Files changed per stage
  const allFiles = wf.files.allChanged();
  // Note: file-to-stage mapping available via wf.files.byStage()

  console.log('Activity by agent:', stages);
});
```

### Agent Performance

```typescript
vibeWorkflow('performance tracking', async (wf) => {
  const start1 = Date.now();
  const r1 = await wf.stage('agent1', { agent: agent1, prompt: '/task1' });
  const duration1 = Date.now() - start1;

  const start2 = Date.now();
  const r2 = await wf.stage('agent2', { agent: agent2, prompt: '/task2' });
  const duration2 = Date.now() - start2;

  console.log(`Agent 1: ${duration1}ms, ${r1.metrics.totalCostUsd} USD`);
  console.log(`Agent 2: ${duration2}ms, ${r2.metrics.totalCostUsd} USD`);

  // Compare efficiency
  const efficiency1 = r1.files.stats().total / duration1;
  const efficiency2 = r2.files.stats().total / duration2;

  console.log(`Agent 1 efficiency: ${efficiency1.toFixed(2)} files/ms`);
  console.log(`Agent 2 efficiency: ${efficiency2.toFixed(2)} files/ms`);
});
```

---

## Best Practices

### 1. Assign Agents by Expertise

```typescript
// ✅ Good: Specialized agents
const securityAgent = defineAgent({ systemPrompt: 'Security expert...' });
const perfAgent = defineAgent({ systemPrompt: 'Performance expert...' });

// ❌ Bad: Generic agent for everything
const genericAgent = defineAgent({ systemPrompt: 'Do everything...' });
```

### 2. Use Explicit Context Handoff

```typescript
// ✅ Good: Explicit context
const analysis = await wf.stage('analyze', { ... });
const fix = await wf.stage('fix', { context: analysis });

// ❌ Bad: Implicit assumptions
await wf.stage('analyze', { ... });
await wf.stage('fix', { ... });  // Doesn't know about analysis
```

### 3. Track Cumulative State

```typescript
// ✅ Good: Use cumulative context
const allChanges = wf.files.allChanged();
if (allChanges.length > 20) {
  await wf.stage('extra-review', { ... });
}

// ❌ Bad: Ignore cumulative state
// Each agent works in isolation
```

### 4. Mix Models Strategically

```typescript
// ✅ Good: Match model to task complexity
await wf.stage('design', { agent: opusAgent, ... });      // Complex
await wf.stage('implement', { agent: sonnetAgent, ... }); // Medium
await wf.stage('docs', { agent: haikuAgent, ... });       // Simple

// ❌ Bad: Always use most expensive model
await wf.stage('simple-task', { agent: opusAgent, ... }); // Wasteful
```

---

## Related Documentation

- **[Building Pipelines](./pipelines.md)** - Pipeline patterns
- **[vibeWorkflow API](../../api/vibeWorkflow.md)** - Complete API reference
- **[defineAgent](../../api/defineAgent.md)** - Agent configuration
- **[RunResult](../../api/types.md#runresult)** - Understanding results

---

[← Back to Automation Guides](./)
