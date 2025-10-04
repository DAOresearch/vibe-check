# Examples

> Real-world code examples for Vibe Check

[Home](../) > Examples

Examples are **complete, runnable code** that demonstrate real-world usage of Vibe Check. Each example includes full context, setup, and explanation.

---

## Basic Examples

Simple, single-file examples to get started quickly.

- **[Simple Test](./basic/simple-test.md)** - Minimal vibeTest with assertions
- **[Cost Gate](./basic/cost-gate.md)** - Enforce budget with toStayUnderCost
- **[Tool Allowlist](./basic/tool-allowlist.md)** - Verify read-only operations

---

## Automation Examples

Multi-step pipelines and agent orchestration.

- **[Pipeline Example](./automation/pipeline-example.md)** - Analyze → Fix → Verify workflow
- **[Multi-Agent Example](./automation/multi-agent-example.md)** - Parallel specialized reviewers

---

## Evaluation Examples

Benchmarking, matrix testing, and quality evaluation.

- **[Benchmark Example](./evaluation/benchmark-example.md)** - Compare Haiku vs Sonnet vs Opus
- **[Rubric Example](./evaluation/rubric-example.md)** - LLM judge with hybrid evaluation

---

## How to Use Examples

Each example includes:

1. **Overview** - What the example demonstrates
2. **Setup** - Dependencies and configuration needed
3. **Code** - Complete, runnable implementation
4. **Output** - Expected results and reports
5. **Explanation** - Key concepts and patterns used
6. **Next Steps** - Related examples and guides

### Running Examples

```bash
# Clone the repo
git clone https://github.com/dao/vibe-check.git
cd vibe-check

# Install dependencies
bun install

# Run an example
bun test examples/basic/simple-test.test.ts
```

---

## Example Index by Use Case

### I want to learn the basics
1. [Simple Test](./basic/simple-test.md) - First vibeTest
2. [Cost Gate](./basic/cost-gate.md) - Budget enforcement
3. [Tool Allowlist](./basic/tool-allowlist.md) - Safety validation

### I want to build pipelines
1. [Pipeline Example](./automation/pipeline-example.md) - Multi-step workflow
2. [Multi-Agent Example](./automation/multi-agent-example.md) - Agent coordination

### I want to benchmark agents
1. [Benchmark Example](./evaluation/benchmark-example.md) - Model comparison
2. [Rubric Example](./evaluation/rubric-example.md) - Quality evaluation

---

## Related Documentation

- **[Getting Started](../getting-started/)** - Tutorials for first-time users
- **[Recipes](../recipes/)** - Copy-paste patterns
- **[Guides](../guides/)** - How-to guides for specific tasks
- **[API Reference](../api/)** - Complete API documentation

---

[← Back to Documentation Home](../)
