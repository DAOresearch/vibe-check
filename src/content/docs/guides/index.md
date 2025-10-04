# Guides

> How-to guides for building automations, running evaluations, and configuring agents

[Home](../) > Guides

Guides are **problem-oriented** documentation that help you accomplish specific tasks. Each guide assumes you've completed [Getting Started](../getting-started/) and provides step-by-step instructions for a particular goal.

---

## Automation

Build multi-step agent pipelines and orchestrate workflows.

- **[Building Pipelines](./automation/pipelines.md)** - Chain agents, pass artifacts, handle errors
- **[Multi-Agent Orchestration](./automation/orchestration.md)** - Coordinate multiple agents with different tools
- **[Error Handling & Debugging](./automation/error-handling.md)** - Debug failed runs, inspect transcripts

---

## Evaluation

Benchmark models, track costs, and enforce quality standards.

- **[Model Benchmarking](./evaluation/benchmarking.md)** - Compare model performance and cost
- **[Matrix Testing](./evaluation/matrix-testing.md)** - Test multiple configurations in parallel
- **[Quality Gates](./evaluation/quality-gates.md)** - Use matchers and LLM judges

---

## Agents

Configure agents with models, tools, sources, and system prompts.

- **[Agent Configuration](./agents/configuration.md)** - Complete guide to defineAgent()
- **[Project Sources](./agents/sources.md)** - temp, local, git sources with isolation
- **[Tools & MCP](./agents/tools.md)** - Tool allowlisting and MCP server integration
- **[System Prompts](./agents/system-prompts.md)** - Presets and custom instructions

---

## Advanced

Deep dives into isolation, cost tracking, CI/CD, and extensibility.

- **[Worktree Isolation](./advanced/isolation.md)** - How isolation works, cleanup policies
- **[Cost Optimization](./advanced/cost-optimization.md)** - Track costs, set budgets, optimize runs
- **[CI/CD Integration](./advanced/ci-cd.md)** - Run in CI, publish reports, gate merges
- **[Custom Matchers](./advanced/custom-matchers.md)** - Write your own quality assertions

---

## Related Documentation

- **[Recipes](../recipes/)** - Copy-paste code patterns for common scenarios
- **[API Reference](../api/)** - Complete TypeScript function and type reference
- **[Examples](../examples/)** - Real-world code examples

---

[← Back to Documentation Home](../)
