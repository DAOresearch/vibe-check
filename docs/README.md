# Vibe Check Documentation

> Complete documentation for the automation and evaluation platform for Claude Code

Welcome to the Vibe Check documentation! This guide will help you build agent pipelines, benchmark models, and ship production-grade AI workflows with confidence.

## Quick Navigation

- 🚀 **[Getting Started](./getting-started/)** - Tutorials and quick start guides
- 📖 **[Guides](./guides/)** - How-to guides for common tasks
- 🧪 **[Recipes](./recipes/)** - Copy-paste patterns and working examples
- 📚 **[API Reference](./api/)** - Complete API documentation
- 🤖 **[Claude Code Integration](./claude-code/)** - Scaffold, workflows, and templates
- 🛠️ **[Contributing](./contributing/)** - Architecture and development guides
- 💡 **[Examples](./examples/)** - Real-world code examples

---

## Documentation by Use Case

### I want to automate agent workflows

Build multi-step pipelines, orchestrate agents, and capture artifacts:

1. [First Automation Tutorial](./getting-started/first-automation.md) - Build your first pipeline
2. [Building Pipelines](./guides/automation/pipelines.md) - Chain agents and pass artifacts
3. [Multi-Agent Orchestration](./guides/automation/orchestration.md) - Coordinate multiple agents
4. [Automation Recipes](./recipes/automation/) - Ready-to-use patterns

### I want to evaluate and benchmark agents

Compare models, track costs, and enforce quality gates:

1. [First Evaluation Tutorial](./getting-started/first-evaluation.md) - Benchmark your first agent
2. [Model Benchmarking](./guides/evaluation/benchmarking.md) - Compare model performance
3. [Matrix Testing](./guides/evaluation/matrix-testing.md) - Test multiple configurations
4. [Evaluation Recipes](./recipes/evaluation/) - Benchmarking patterns

### I want to look up API details

Complete TypeScript reference with examples:

- [vibeTest](./api/vibeTest.md) - Test function with fixtures
- [defineAgent](./api/defineAgent.md) - Agent configuration
- [prompt](./api/prompt.md) - Prompt builder API
- [runAgent](./api/runAgent.md) - Execute agents
- [judge](./api/judge.md) - LLM-based evaluation
- [Custom Matchers](./api/matchers.md) - Quality assertions
- [TypeScript Types](./api/types.md) - Complete type reference

### I want to integrate with Claude Code

Leverage the full Claude Code automation scaffold:

- [Scaffold System](./claude-code/scaffold.md) - Templates, commands, and agents
- [GitHub Workflows](./claude-code/workflows.md) - Automated PR reviews and CI
- [Task Templates](./claude-code/templates.md) - Structured task management
- [Specialized Agents](./claude-code/agents.md) - Security, performance, test coverage reviewers

### I want to contribute

Help build Vibe Check:

- [Architecture Overview](./contributing/architecture.md) - System design and components
- [Implementation Plan](./contributing/implementation-plan.md) - Roadmap and milestones
- [Development Setup](./contributing/development.md) - Local dev environment

---

## What is Vibe Check?

Vibe Check is a **dual-purpose platform** built on Vitest:

### 1. Automation Suite
- Run multi-step agent pipelines
- Orchestrate multiple agents with different tools
- Capture artifacts, metrics, and transcripts
- Get production-grade reporting on every run

### 2. Evaluation Framework
- Benchmark models, prompts, tools, and MCP servers
- Matrix test every configuration in parallel
- Track costs, tokens, duration, and quality
- Enforce quality gates with custom matchers and LLM judges

**Killer feature:** Production-grade **rich terminal + HTML reports** with costs, tokens, timelines, transcripts, todos, and artifacts—on every run.

---

## Getting Help

- **Bug reports**: [GitHub Issues](https://github.com/dao/vibe-check/issues)
- **Feature requests**: [GitHub Discussions](https://github.com/dao/vibe-check/discussions)
- **Questions**: Check [Guides](./guides/) first, then open a discussion

---

## Documentation Structure

### [Getting Started](./getting-started/)
Tutorials for first-time users. Step-by-step walkthroughs to get running quickly.

### [Guides](./guides/)
How-to guides organized by topic: automation, evaluation, agents, and advanced topics.

### [Recipes](./recipes/)
Copy-paste ready patterns for common scenarios. Working code you can adapt.

### [API Reference](./api/)
Complete TypeScript reference for all functions, types, and matchers.

### [Claude Code Integration](./claude-code/)
Documentation for the Claude Code scaffold, workflows, and automation system.

### [Contributing](./contributing/)
Architecture, implementation plans, and development guides for contributors.

### [Examples](./examples/)
Real-world code examples organized by complexity and use case.

---

Built with ❤️ for developers who measure twice and ship once.
