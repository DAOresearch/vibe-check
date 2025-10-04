# Holistic Documentation Architecture

> **Complete documentation system design for Vibe Check**
> Combines existing content with new structure following Diátaxis framework

## Design Philosophy

### Principles

1. **User-Journey Oriented** - Documentation organized by what users are trying to accomplish
2. **Progressive Disclosure** - Start simple, reveal complexity as needed
3. **Diátaxis Framework** - Clear separation of tutorials, guides, reference, explanation
4. **Separation of Concerns** - Product docs vs development docs vs design docs
5. **Discoverability** - Intuitive naming, clear navigation, comprehensive indexes

### User Personas

| Persona | Needs | Entry Point |
|---------|-------|-------------|
| **First-time User** | Quick start, basic concepts | `getting-started/` |
| **Automation Builder** | Pipeline patterns, orchestration | `guides/automation/` + `recipes/automation/` |
| **Evaluation Engineer** | Benchmarking, matrix testing, rubrics | `guides/evaluation/` + `recipes/evaluation/` |
| **API User** | Type signatures, function references | `api/` |
| **Claude Code User** | Scaffold, workflows, templates | `claude-code/` |
| **Contributor** | Architecture, implementation plans | `contributing/` |

## Documentation Structure

### Root README.md

**Purpose**: Product overview, high-level positioning, quick navigation
**Source**: Adopt `readme-exp.mdx` structure (520 lines, reference-style)
**Contents**:
- Product tagline & value proposition
- "Why vibe-check?" (dual identity: automation + evaluation)
- Quick Start (both automation + evaluation paths)
- Core Concepts (brief)
- Link to full documentation tree
- API Reference (consolidated)
- Status & license

**Why readme-exp.mdx?**
- 3x shorter (scannable)
- Clearer product positioning
- Reporting as "killer feature"
- Dual Quick Start examples
- TypeScript-first with consolidated API reference

---

## Directory Structure

```
/
├── README.md                          # Product overview (from readme-exp.mdx)
│
├── docs/                              # Complete documentation tree
│   ├── README.md                     # Documentation hub with navigation
│   │
│   ├── getting-started/              # TUTORIALS (learning-oriented)
│   │   ├── README.md                 # Quick start hub
│   │   ├── installation.md           # Install & setup
│   │   ├── first-automation.md       # Tutorial: first pipeline
│   │   ├── first-evaluation.md       # Tutorial: first benchmark
│   │   └── concepts.md               # Core concepts explained
│   │
│   ├── guides/                       # HOW-TO GUIDES (problem-oriented)
│   │   ├── README.md                 # Guide index
│   │   ├── automation/
│   │   │   ├── README.md
│   │   │   ├── pipelines.md          # Building agent pipelines
│   │   │   ├── orchestration.md      # Multi-agent orchestration
│   │   │   └── error-handling.md     # Debugging & error handling
│   │   ├── evaluation/
│   │   │   ├── README.md
│   │   │   ├── benchmarking.md       # Model benchmarking
│   │   │   ├── matrix-testing.md     # Matrix testing deep dive
│   │   │   └── quality-gates.md      # Setting up quality gates
│   │   ├── agents/
│   │   │   ├── README.md
│   │   │   ├── configuration.md      # Agent configuration guide
│   │   │   ├── sources.md            # Project source management
│   │   │   ├── tools.md              # Tool allowlisting & MCP
│   │   │   └── system-prompts.md     # System prompts & personas
│   │   └── advanced/
│   │       ├── README.md
│   │       ├── isolation.md          # Worktree isolation deep dive
│   │       ├── cost-optimization.md  # Cost tracking & optimization
│   │       ├── ci-cd.md              # CI/CD integration
│   │       └── custom-matchers.md    # Writing custom matchers
│   │
│   ├── recipes/                      # COOKBOOK (copy-paste patterns)
│   │   ├── README.md                 # Recipe collection index
│   │   ├── automation/
│   │   │   ├── README.md
│   │   │   ├── analyze-fix-pipeline.md
│   │   │   ├── multi-agent-review.md
│   │   │   └── progressive-tool-access.md
│   │   └── evaluation/
│   │       ├── README.md
│   │       ├── model-comparison.md
│   │       ├── cost-quality-tradeoff.md
│   │       └── tool-safety-testing.md
│   │
│   ├── api/                          # REFERENCE (information-oriented)
│   │   ├── README.md                 # API overview
│   │   ├── vibeTest.md              # vibeTest API
│   │   ├── prompt.md                # prompt() API
│   │   ├── defineAgent.md           # defineAgent() API
│   │   ├── runAgent.md              # runAgent() API
│   │   ├── judge.md                 # judge() & rubrics API
│   │   ├── matchers.md              # Custom matchers reference
│   │   └── types.md                 # TypeScript types reference
│   │
│   ├── claude-code/                  # Claude Code integration
│   │   ├── README.md                 # Overview
│   │   ├── scaffold.md               # Scaffold system
│   │   ├── workflows.md              # GitHub workflows
│   │   ├── templates.md              # Task templates
│   │   └── agents.md                 # Specialized agents
│   │
│   ├── contributing/                 # EXPLANATION (understanding-oriented)
│   │   ├── README.md                 # Contributor guide
│   │   ├── architecture.md           # System architecture
│   │   ├── implementation-plan.md    # Implementation roadmap
│   │   └── development.md            # Dev setup & workflows
│   │
│   └── examples/                     # Real-world examples
│       ├── README.md                 # Examples index
│       ├── basic/
│       │   ├── simple-test.md
│       │   ├── cost-gate.md
│       │   └── tool-allowlist.md
│       ├── automation/
│       │   ├── pipeline-example.md
│       │   └── multi-agent-example.md
│       └── evaluation/
│           ├── benchmark-example.md
│           └── rubric-example.md
│
└── .claude/                          # Internal design docs (contributors)
    └── docs/
        └── vibecheck/
            ├── implementation-plan.mdx
            ├── code_skel.mdx
            ├── agent-config-dx.mdx
            ├── readme-architectural-comparison.md
            └── documentation-architecture.md (this file)
```

---

## Content Migration Plan

### Phase 1: Root README

**Source**: `readme-exp.mdx`
**Target**: `README.md`
**Changes**:
- Keep structure as-is (ToC, dual Quick Start, API Reference)
- Add "Documentation" section linking to `docs/README.md`
- Preserve "killer feature" reporting emphasis
- Maintain concise, scannable style

### Phase 2: Getting Started

**Sources**:
- `README.md` Quick Start section
- `readme-exp.mdx` Quick Start section

**Targets**:
- `docs/getting-started/installation.md` - Install & config
- `docs/getting-started/first-automation.md` - Pipeline tutorial (from readme-exp example)
- `docs/getting-started/first-evaluation.md` - Benchmark tutorial (from readme-exp example)
- `docs/getting-started/concepts.md` - Core Concepts section (from readme-exp)

### Phase 3: Guides

**Sources**:
- `README.md` sections:
  - Prompt Builder API → `docs/guides/automation/prompts.md`
  - Agent Builder & Configuration → `docs/guides/agents/configuration.md`
  - Project Sources → `docs/guides/agents/sources.md`
  - Matrix Testing → `docs/guides/evaluation/matrix-testing.md`
  - Debugging & Error Handling → `docs/guides/automation/error-handling.md`
  - LLM-Based Evaluation → `docs/guides/evaluation/quality-gates.md`

**New guides to create**:
- `docs/guides/automation/pipelines.md` - Chaining agents, passing artifacts
- `docs/guides/automation/orchestration.md` - Multi-agent workflows
- `docs/guides/evaluation/benchmarking.md` - Model comparison strategies
- `docs/guides/agents/tools.md` - Tool allowlisting, MCP integration
- `docs/guides/advanced/isolation.md` - Worktree isolation mechanics
- `docs/guides/advanced/cost-optimization.md` - Cost tracking & budgets
- `docs/guides/advanced/ci-cd.md` - CI/CD integration patterns

### Phase 4: Recipes

**Sources**:
- `README.md` "Common Testing Scenarios" section
- `README.md` "Example Use Cases" section

**Targets**:
- `docs/recipes/automation/analyze-fix-pipeline.md` - From Quick Start example
- `docs/recipes/automation/multi-agent-review.md` - Read-only analysis + write fixes
- `docs/recipes/automation/progressive-tool-access.md` - From "Progressive Tool Access Testing"
- `docs/recipes/evaluation/model-comparison.md` - From "Model Performance Benchmarking"
- `docs/recipes/evaluation/cost-quality-tradeoff.md` - From "Cost-Quality Tradeoff Analysis"
- `docs/recipes/evaluation/tool-safety-testing.md` - From "Tool Allowlisting for Safety"

### Phase 5: API Reference

**Sources**:
- `readme-exp.mdx` API Reference section
- `README.md` scattered API examples

**Targets**:
- `docs/api/vibeTest.md` - Complete API with fixtures
- `docs/api/prompt.md` - prompt() signatures & examples
- `docs/api/defineAgent.md` - AgentSpec type & options
- `docs/api/runAgent.md` - RunResult & execution
- `docs/api/judge.md` - Rubric schema & evaluation
- `docs/api/matchers.md` - All custom matchers
- `docs/api/types.md` - Complete TypeScript reference

### Phase 6: Claude Code

**Sources**:
- `docs/CLAUDE_CODE_SCAFFOLD.md`
- `docs/WORKFLOWS.md`

**Targets**:
- `docs/claude-code/scaffold.md` - From CLAUDE_CODE_SCAFFOLD.md
- `docs/claude-code/workflows.md` - From WORKFLOWS.md
- `docs/claude-code/templates.md` - Task template system
- `docs/claude-code/agents.md` - Specialized agent system

### Phase 7: Contributing

**Sources**:
- `.claude/docs/vibecheck/implementation-plan.mdx`
- `.claude/docs/vibecheck/code_skel.mdx`
- `README.md` Architecture section

**Targets**:
- `docs/contributing/architecture.md` - System design
- `docs/contributing/implementation-plan.md` - Roadmap & milestones
- `docs/contributing/development.md` - Dev setup, testing, CI

### Phase 8: Examples

**Sources**:
- `README.md` Quick Start example
- `README.md` "Example Use Cases" section

**Targets**:
- `docs/examples/basic/` - Simple examples (cost gate, tool allowlist)
- `docs/examples/automation/` - Pipeline & multi-agent examples
- `docs/examples/evaluation/` - Benchmark & rubric examples

---

## Navigation & Discovery

### docs/README.md (Hub)

```markdown
# Vibe Check Documentation

> Complete documentation for the automation and evaluation platform for Claude Code

## Quick Navigation

- 🚀 [Getting Started](./getting-started/) - Tutorials and quick start
- 📖 [Guides](./guides/) - How-to guides for common tasks
- 🧪 [Recipes](./recipes/) - Copy-paste patterns and examples
- 📚 [API Reference](./api/) - Complete API documentation
- 🤖 [Claude Code Integration](./claude-code/) - Scaffold, workflows, and templates
- 🛠️ [Contributing](./contributing/) - Architecture and development guides
- 💡 [Examples](./examples/) - Real-world code examples

## Documentation by Use Case

### I want to automate agent workflows
1. [First Automation Tutorial](./getting-started/first-automation.md)
2. [Building Pipelines](./guides/automation/pipelines.md)
3. [Multi-Agent Orchestration](./guides/automation/orchestration.md)
4. [Automation Recipes](./recipes/automation/)

### I want to evaluate and benchmark agents
1. [First Evaluation Tutorial](./getting-started/first-evaluation.md)
2. [Model Benchmarking](./guides/evaluation/benchmarking.md)
3. [Matrix Testing](./guides/evaluation/matrix-testing.md)
4. [Evaluation Recipes](./recipes/evaluation/)

### I want to look up API details
- [vibeTest](./api/vibeTest.md)
- [defineAgent](./api/defineAgent.md)
- [prompt](./api/prompt.md)
- [Custom Matchers](./api/matchers.md)
- [TypeScript Types](./api/types.md)

### I want to integrate with Claude Code
- [Scaffold System](./claude-code/scaffold.md)
- [GitHub Workflows](./claude-code/workflows.md)
- [Task Templates](./claude-code/templates.md)

### I want to contribute
- [Architecture Overview](./contributing/architecture.md)
- [Implementation Plan](./contributing/implementation-plan.md)
- [Development Setup](./contributing/development.md)
```

### Breadcrumbs & Cross-Links

Every page includes:
- **Breadcrumb navigation** at top: `Home > Guides > Automation > Pipelines`
- **Related pages** at bottom: "See also: [Orchestration](../orchestration.md), [Error Handling](../error-handling.md)"
- **Next steps** suggestions: "Next: Learn about [Multi-Agent Orchestration](./orchestration.md)"

---

## File Naming Conventions

1. **Use lowercase with hyphens**: `matrix-testing.md`, not `Matrix_Testing.md`
2. **Be descriptive**: `first-automation.md`, not `tutorial1.md`
3. **Consistent plurals**: `guides/`, `recipes/`, `examples/`
4. **README.md for indexes**: Every directory has `README.md` as entry point

---

## Documentation Style Guide

### Headings

- **H1 (#)**: Page title only
- **H2 (##)**: Main sections
- **H3 (###)**: Subsections
- **H4 (####)**: Details (use sparingly)

### Code Examples

- **Always include imports**: Show complete, runnable examples
- **Use comments**: Explain non-obvious code
- **Show output**: Include expected results/console output
- **TypeScript-first**: All examples use TypeScript

### Structure

1. **TL;DR** at top for quick reference
2. **Explanation** of what and why
3. **Example** showing how
4. **Related pages** at bottom

### Voice

- **Active voice**: "Run the test" not "The test should be run"
- **Direct**: "You can..." not "One might..."
- **Concise**: Remove filler words
- **Practical**: Focus on what developers need to do

---

## Benefits of This Architecture

### For Users

✅ **Clear entry points** - Know where to start based on goal
✅ **Progressive disclosure** - Simple first, complexity revealed as needed
✅ **Multiple paths** - Tutorials, guides, recipes, reference all available
✅ **Easy discovery** - Intuitive naming, comprehensive navigation
✅ **Copy-paste ready** - Recipes provide working code

### For Maintainers

✅ **Separation of concerns** - Product/dev/design docs separate
✅ **Scalable** - Easy to add new guides/recipes/examples
✅ **Clear ownership** - Each directory has clear purpose
✅ **Reduced duplication** - Single source of truth per topic
✅ **Easy updates** - Related content grouped together

### For Contributors

✅ **Contribution clarity** - Know where to add new content
✅ **Architecture visibility** - Design docs in `.claude/docs/`
✅ **Implementation guidance** - Plans and roadmaps accessible
✅ **Development setup** - Clear onboarding path

---

## Implementation Checklist

- [x] Design documentation architecture
- [ ] Create folder structure
- [ ] Migrate root README (from readme-exp.mdx)
- [ ] Create docs/README.md hub
- [ ] Migrate getting-started/ content
- [ ] Migrate guides/ content
- [ ] Create recipes/ from Common Scenarios
- [ ] Extract API reference to docs/api/
- [ ] Move Claude Code docs to docs/claude-code/
- [ ] Create contributing/ section
- [ ] Extract examples/ from use cases
- [ ] Add breadcrumbs to all pages
- [ ] Add cross-links between related pages
- [ ] Validate all links
- [ ] Update all references to old paths

---

## Next Steps

1. **Create folder structure** - Build directory tree
2. **Migrate root README** - Adopt readme-exp.mdx as base
3. **Create hub pages** - docs/README.md and section READMEs
4. **Migrate content** - Move and reorganize existing docs
5. **Add navigation** - Breadcrumbs, cross-links, indexes
6. **Validate** - Test all links, ensure completeness
