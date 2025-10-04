# Getting Started with Vibe Check

> Tutorials and quick start guides for first-time users

[Home](../) > Getting Started

## Quick Start

Choose your path based on what you want to accomplish:

### Path 1: Automation

Build multi-stage agent pipelines with `vibeWorkflow`:

```typescript
import { vibeWorkflow, defineAgent } from '@dao/vibe-check';

vibeWorkflow('refactor pipeline', async (wf) => {
  const analysis = await wf.stage('analyze', {
    agent: defineAgent({ model: 'claude-sonnet-4' }),
    prompt: '/analyze codebase'
  });

  await wf.stage('fix', {
    agent: defineAgent({ model: 'claude-opus-4' }),
    prompt: '/apply fixes',
    context: analysis
  });
});
```

**Start here:** [First Automation Tutorial](./first-automation.md)

### Path 2: Evaluation

Benchmark models and enforce quality gates with `vibeTest`:

```typescript
import { vibeTest, defineAgent } from '@dao/vibe-check';

vibeTest('benchmark sonnet', async ({ runAgent, expect }) => {
  const result = await runAgent({
    agent: defineAgent({ model: 'claude-sonnet-4' }),
    prompt: '/refactor src/'
  });

  expect(result).toStayUnderCost(3.00);
  expect(result).toCompleteAllTodos();
});
```

**Start here:** [First Evaluation Tutorial](./first-evaluation.md)

---

## Tutorials

### Installation & Setup
**[Installation Guide](./installation.md)**

Learn how to install Vibe Check, configure Vitest, and set up your first test file.

**Time:** 5 minutes
**Prerequisites:** Node.js 18+, basic TypeScript knowledge

---

### First Automation
**[Build Your First Pipeline](./first-automation.md)**

Create a multi-step automation pipeline that analyzes code and fixes issues.

**What you'll learn:**
- Define agents with different tool access
- Run agents sequentially in a pipeline
- Pass artifacts between steps
- Assert on completion and errors

**Time:** 10 minutes
**Prerequisites:** Installation complete

---

### First Evaluation
**[Benchmark Your First Agent](./first-evaluation.md)**

Compare two agent configurations (e.g., Haiku vs Opus) on the same task.

**What you'll learn:**
- Use matrix testing for benchmarking
- Compare costs and quality across models
- Use LLM judges for evaluation
- Read HTML reports with side-by-side results

**Time:** 15 minutes
**Prerequisites:** Installation complete

---

### Core Concepts
**[Understanding Vibe Check Concepts](./concepts.md)**

Learn the key concepts: prompts, agents, results, matchers, judges, and reporting.

**What you'll learn:**
- How prompts, agents, and results work together
- The role of matchers and judges
- How reporting captures everything

**Time:** 10 minutes
**Prerequisites:** None (can read before installing)

---

## Next Steps

After completing the getting started tutorials:

### For Automation Builders
- [Building Pipelines](../guides/automation/pipelines.md) - Chain agents and handle errors
- [Multi-Agent Orchestration](../guides/automation/orchestration.md) - Coordinate multiple agents
- [Automation Recipes](../recipes/automation/) - Copy-paste patterns

### For Evaluation Engineers
- [Model Benchmarking](../guides/evaluation/benchmarking.md) - Compare model performance
- [Matrix Testing Guide](../guides/evaluation/matrix-testing.md) - Test all combinations
- [Evaluation Recipes](../recipes/evaluation/) - Benchmarking patterns

### For Everyone
- [Agent Configuration Guide](../guides/agents/configuration.md) - Deep dive into agents
- [API Reference](../api/) - Complete TypeScript reference
- [Examples](../examples/) - Real-world code samples

---

## Need Help?

- **Stuck?** Check the [Guides](../guides/) for detailed how-tos
- **Looking for code?** Browse [Recipes](../recipes/) for copy-paste patterns
- **API question?** See [API Reference](../api/) for complete documentation

---

[← Back to Documentation Home](../)
