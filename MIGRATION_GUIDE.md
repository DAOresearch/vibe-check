# Documentation Migration Guide

> Step-by-step guide to complete the holistic documentation system

## Current Status

✅ **Completed:**
1. Documentation architecture designed (Diátaxis framework)
2. Complete folder structure created in `docs/`
3. Navigation hub files created for all sections
4. New root README drafted (`README.new.md`)
5. Design documentation saved (`.claude/docs/vibecheck/documentation-architecture.md`)

📋 **Remaining:**
1. Migrate content from existing files
2. Create detailed guide pages
3. Extract recipes from README.md
4. Create example files
5. Update all cross-references
6. Replace old README with new README
7. Clean up temporary files

---

## Folder Structure Created

```
docs/
├── README.md                          # ✅ Documentation hub (DONE)
├── getting-started/
│   ├── README.md                     # ✅ Quick start hub (DONE)
│   ├── installation.md               # TODO
│   ├── first-automation.md           # TODO
│   ├── first-evaluation.md           # TODO
│   └── concepts.md                   # TODO
├── guides/
│   ├── README.md                     # ✅ Guide index (DONE)
│   ├── automation/
│   │   ├── README.md                 # TODO
│   │   ├── pipelines.md              # TODO
│   │   ├── orchestration.md          # TODO
│   │   └── error-handling.md         # TODO
│   ├── evaluation/
│   │   ├── README.md                 # TODO
│   │   ├── benchmarking.md           # TODO
│   │   ├── matrix-testing.md         # TODO
│   │   └── quality-gates.md          # TODO
│   ├── agents/
│   │   ├── README.md                 # TODO
│   │   ├── configuration.md          # TODO
│   │   ├── sources.md                # TODO
│   │   ├── tools.md                  # TODO
│   │   └── system-prompts.md         # TODO
│   └── advanced/
│       ├── README.md                 # TODO
│       ├── isolation.md              # TODO
│       ├── cost-optimization.md      # TODO
│       ├── ci-cd.md                  # TODO
│       └── custom-matchers.md        # TODO
├── recipes/
│   ├── README.md                     # ✅ Recipe index (DONE)
│   ├── automation/
│   │   ├── README.md                 # TODO
│   │   ├── analyze-fix-pipeline.md   # TODO
│   │   ├── multi-agent-review.md     # TODO
│   │   └── progressive-tool-access.md# TODO
│   └── evaluation/
│       ├── README.md                 # TODO
│       ├── model-comparison.md       # TODO
│       ├── cost-quality-tradeoff.md  # TODO
│       └── tool-safety-testing.md    # TODO
├── api/
│   ├── README.md                     # ✅ API overview (DONE)
│   ├── vibeTest.md                   # TODO
│   ├── prompt.md                     # TODO
│   ├── defineAgent.md                # TODO
│   ├── runAgent.md                   # TODO
│   ├── judge.md                      # TODO
│   ├── matchers.md                   # TODO
│   └── types.md                      # TODO
├── claude-code/
│   ├── README.md                     # ✅ Overview (DONE)
│   ├── scaffold.md                   # TODO (migrate from docs/CLAUDE_CODE_SCAFFOLD.md)
│   ├── workflows.md                  # TODO (migrate from docs/WORKFLOWS.md)
│   ├── templates.md                  # TODO
│   └── agents.md                     # TODO
├── contributing/
│   ├── README.md                     # ✅ Contributor guide (DONE)
│   ├── architecture.md               # TODO (extract from README.md)
│   ├── implementation-plan.md        # TODO (migrate from .claude/docs/vibecheck/)
│   └── development.md                # TODO (create new)
└── examples/
    ├── README.md                     # ✅ Examples index (DONE)
    ├── basic/
    │   ├── simple-test.md            # TODO
    │   ├── cost-gate.md              # TODO
    │   └── tool-allowlist.md         # TODO
    ├── automation/
    │   ├── pipeline-example.md       # TODO
    │   └── multi-agent-example.md    # TODO
    └── evaluation/
        ├── benchmark-example.md      # TODO
        └── rubric-example.md         # TODO
```

---

## Migration Steps

### Phase 1: Getting Started Content

**Source**: `README.md` Quick Start + `readme-exp.mdx` Quick Start

#### 1.1 Create `docs/getting-started/installation.md`
Extract from:
- README.md lines 35-86 (Quick Start > Install, Configure, Run)
- Add setup instructions, prerequisites

#### 1.2 Create `docs/getting-started/first-automation.md`
Extract from:
- readme-exp.mdx lines 72-120 (First Automation example)
- Expand with step-by-step walkthrough

#### 1.3 Create `docs/getting-started/first-evaluation.md`
Extract from:
- readme-exp.mdx lines 122-158 (First Evaluation example)
- Expand with explanation of matrix testing and judges

#### 1.4 Create `docs/getting-started/concepts.md`
Extract from:
- readme-exp.mdx lines 162-205 (Core Concepts)
- README.md "What is Vibe Check?" section
- Expand each concept with examples

---

### Phase 2: Guides Content

**Sources**: README.md detailed sections

#### 2.1 Automation Guides

**`docs/guides/automation/pipelines.md`**
- Extract from README.md "Common Testing Scenarios" > pipelines
- Add error handling, artifact passing

**`docs/guides/automation/orchestration.md`**
- Extract from README.md "Common Testing Scenarios" > multi-agent
- Add coordination patterns

**`docs/guides/automation/error-handling.md`**
- Extract from README.md "Debugging & Error Handling"
- Add transcript inspection, timeout handling

#### 2.2 Evaluation Guides

**`docs/guides/evaluation/benchmarking.md`**
- Extract from README.md "Model Performance Benchmarking"
- Add cost vs quality analysis

**`docs/guides/evaluation/matrix-testing.md`**
- Extract from README.md "Matrix Testing" section (lines 672-820)
- Add filtering, debugging tips

**`docs/guides/evaluation/quality-gates.md`**
- Extract from README.md "LLM-Based Evaluation" section
- Add rubric design patterns

#### 2.3 Agent Guides

**`docs/guides/agents/configuration.md`**
- Extract from README.md "Agent Builder & Configuration" (lines 224-524)
- Comprehensive guide to all options

**`docs/guides/agents/sources.md`**
- Extract from README.md "Project Sources" subsections
- Deep dive into temp, local, git sources

**`docs/guides/agents/tools.md`**
- Extract from README.md "Tool Allowlisting for Safety"
- Add MCP server integration examples

**`docs/guides/agents/system-prompts.md`**
- Extract from README.md "System Prompts" section
- Add persona examples, custom instructions

#### 2.4 Advanced Guides

**`docs/guides/advanced/isolation.md`**
- Extract from README.md "Worktree Isolation" section
- Deep dive into mechanics, cleanup policies

**`docs/guides/advanced/cost-optimization.md`**
- Extract from README.md cost tracking examples
- Add budget strategies, optimization tips

**`docs/guides/advanced/ci-cd.md`**
- Extract from docs/WORKFLOWS.md GitHub Actions integration
- Add artifact publishing, quality gates

**`docs/guides/advanced/custom-matchers.md`**
- Extract from README.md custom matchers section
- Add how to write your own matchers

---

### Phase 3: Recipes Content

**Source**: README.md "Common Testing Scenarios" + "Example Use Cases"

#### 3.1 Automation Recipes

**`docs/recipes/automation/analyze-fix-pipeline.md`**
- From readme-exp.mdx Quick Start automation example
- Copy-paste ready code

**`docs/recipes/automation/multi-agent-review.md`**
- From README.md "Progressive Tool Access Testing"
- Specialized reviewers pattern

**`docs/recipes/automation/progressive-tool-access.md`**
- From README.md "Example Use Cases" > #2
- Security-first pattern

#### 3.2 Evaluation Recipes

**`docs/recipes/evaluation/model-comparison.md`**
- From README.md "Example Use Cases" > #1
- Haiku vs Sonnet vs Opus comparison

**`docs/recipes/evaluation/cost-quality-tradeoff.md`**
- From README.md "Example Use Cases" > #3
- Systematic cost vs quality measurement

**`docs/recipes/evaluation/tool-safety-testing.md`**
- From README.md "Tool Allowlisting for Safety"
- Read-only validation pattern

---

### Phase 4: API Reference Content

**Source**: readme-exp.mdx API Reference + README.md scattered examples

#### 4.1 Create API Documentation Files

Each API file should include:
- Function signature with TypeScript types
- Parameter descriptions
- Return value documentation
- Complete code examples
- Common patterns
- Related APIs

**Files to create:**
- `docs/api/vibeTest.md` - Main test function
- `docs/api/prompt.md` - Prompt builder
- `docs/api/defineAgent.md` - Agent configuration
- `docs/api/runAgent.md` - Agent execution
- `docs/api/judge.md` - LLM evaluation
- `docs/api/matchers.md` - All custom matchers
- `docs/api/types.md` - Complete type reference

---

### Phase 5: Claude Code Content

**Sources**: `docs/CLAUDE_CODE_SCAFFOLD.md`, `docs/WORKFLOWS.md`

#### 5.1 Migrate Existing Docs

**`docs/claude-code/scaffold.md`**
- Copy from `docs/CLAUDE_CODE_SCAFFOLD.md`
- Update links to point to new structure

**`docs/claude-code/workflows.md`**
- Copy from `docs/WORKFLOWS.md`
- Update setup instructions

**`docs/claude-code/templates.md`**
- Extract template system from scaffold.md
- Add template examples

**`docs/claude-code/agents.md`**
- Extract specialized agents from scaffold.md
- Add configuration examples

---

### Phase 6: Contributing Content

**Sources**: `.claude/docs/vibecheck/`, `README.md` Architecture section

#### 6.1 Create Contributor Docs

**`docs/contributing/architecture.md`**
- Extract from README.md "Architecture" section
- Add system design diagrams, component breakdown

**`docs/contributing/implementation-plan.md`**
- Copy from `.claude/docs/vibecheck/implementation-plan.mdx`
- Update status, add current progress

**`docs/contributing/development.md`**
- Create new: dev environment setup
- Add: run tests, build, lint, type check
- Add: contribution workflow

---

### Phase 7: Examples Content

**Source**: README.md Quick Start + Example Use Cases

#### 7.1 Basic Examples

**`docs/examples/basic/simple-test.md`**
- Minimal vibeTest example
- Single agent, single assertion

**`docs/examples/basic/cost-gate.md`**
- Simple cost budget enforcement
- Demonstrate toStayUnderCost

**`docs/examples/basic/tool-allowlist.md`**
- Read-only agent validation
- Demonstrate toUseOnlyTools

#### 7.2 Automation Examples

**`docs/examples/automation/pipeline-example.md`**
- Complete analyze → fix → verify pipeline
- Artifact passing, error handling

**`docs/examples/automation/multi-agent-example.md`**
- Parallel specialized reviewers
- Result aggregation

#### 7.3 Evaluation Examples

**`docs/examples/evaluation/benchmark-example.md`**
- Complete model comparison
- Cost and quality metrics

**`docs/examples/evaluation/rubric-example.md`**
- Complete rubric evaluation example
- Hybrid (programmatic + LLM) scoring

---

## Execution Checklist

### Immediate (Phase 0)

- [x] Design documentation architecture
- [x] Create folder structure
- [x] Create navigation hub files
- [x] Draft new root README
- [ ] Review and approve structure

### Short Term (Phases 1-3)

- [ ] Phase 1: Create all Getting Started pages
- [ ] Phase 2: Create all Guide pages
- [ ] Phase 3: Create all Recipe pages

### Medium Term (Phases 4-5)

- [ ] Phase 4: Create all API Reference pages
- [ ] Phase 5: Migrate Claude Code docs

### Long Term (Phases 6-7)

- [ ] Phase 6: Create Contributing docs
- [ ] Phase 7: Create all Example pages

### Finalization

- [ ] Add breadcrumbs to all pages
- [ ] Add cross-links between related pages
- [ ] Validate all internal links
- [ ] Replace `README.md` with `README.new.md`
- [ ] Move old README to `README.old.md` (backup)
- [ ] Delete `readme-exp.mdx` (source merged)
- [ ] Clean up temporary files

---

## Content Sources Mapping

| New File | Source | Lines/Section |
|----------|--------|---------------|
| **Getting Started** |
| installation.md | README.md | Lines 35-86 |
| first-automation.md | readme-exp.mdx | Lines 72-120 |
| first-evaluation.md | readme-exp.mdx | Lines 122-158 |
| concepts.md | readme-exp.mdx | Lines 162-205 |
| **Guides - Automation** |
| pipelines.md | README.md | Lines 527-560, 262-274 |
| orchestration.md | README.md | Lines 1530-1572 |
| error-handling.md | README.md | Lines 989-1096 |
| **Guides - Evaluation** |
| benchmarking.md | README.md | Lines 563-607, 1446-1524 |
| matrix-testing.md | README.md | Lines 672-820 |
| quality-gates.md | README.md | Lines 1098-1248 |
| **Guides - Agents** |
| configuration.md | README.md | Lines 224-524 |
| sources.md | README.md | Lines 267-353 |
| tools.md | README.md | Lines 609-670 |
| system-prompts.md | README.md | Lines 354-382 |
| **Guides - Advanced** |
| isolation.md | README.md | Lines 330-353 |
| cost-optimization.md | README.md | Lines 826-850, 1029-1052 |
| ci-cd.md | docs/WORKFLOWS.md | All |
| custom-matchers.md | README.md | Lines 470-479 |
| **API** |
| *.md | readme-exp.mdx | Lines 365-453 |
| **Claude Code** |
| scaffold.md | docs/CLAUDE_CODE_SCAFFOLD.md | All |
| workflows.md | docs/WORKFLOWS.md | All |

---

## Validation Checklist

Before considering migration complete:

- [ ] All hub README.md files have working links
- [ ] All guide pages exist and are complete
- [ ] All recipes are copy-paste ready
- [ ] All API pages have TypeScript types
- [ ] All examples run successfully
- [ ] All cross-references work
- [ ] Table of contents in docs/README.md is complete
- [ ] Breadcrumbs added to all pages
- [ ] No broken links (run link checker)
- [ ] Old files backed up before deletion

---

## Success Criteria

✅ **Navigation**
- Users can find content in < 3 clicks
- All sections have clear entry points
- Related content is cross-linked

✅ **Content Quality**
- All examples are runnable
- All types are accurate
- All recipes are copy-paste ready
- All guides are actionable

✅ **Discoverability**
- Clear user journey paths
- Progressive disclosure (simple → complex)
- Multiple access patterns (ToC, use case, search)

✅ **Maintainability**
- Single source of truth per topic
- Clear file naming and structure
- Easy to add new content
- Reduced duplication

---

## Notes

- Keep `.claude/docs/vibecheck/` for design/implementation docs
- Existing `docs/CLAUDE_CODE_SCAFFOLD.md` and `docs/WORKFLOWS.md` can be deleted after migration
- Old `README.md` should be saved as `README.old.md` before replacement
- `readme-exp.mdx` can be deleted after new README is finalized
