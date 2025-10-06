# Vibe-Check Documentation Structure Plan v1.4

**Status:** Complete (Ready for Implementation)
**Date:** 2025-10-06
**Spec Version:** v1.4-beta.4
**Estimated Total Pages:** 47 pages
**Estimated Total Effort:** 25-30 hours (writing + examples + validation)

---

## Executive Summary

This plan defines the complete documentation structure for rebuilding vibe-check docs from scratch using the Diátaxis framework and technical specification v1.4-beta.4 as the authoritative source.

**Key Decisions:**
- **Framework:** Diátaxis (Tutorials, How-To Guides, Reference, Explanation)
- **Source of Truth:** Technical Specification v1.4-beta.4 (3370 lines, implementation-ready)
- **Technology:** Astro Starlight with MDX
- **Rebuild Scope:** All 47 pages from scratch (nuke existing outdated content)

**Coverage:**
- ✅ All 53 specification issues from Phase 2.1 resolved
- ✅ All 12 critical API mismatches addressed
- ✅ All new v1.4 features documented (AgentExecution, cumulative state, watchers, cleanup)
- ✅ Complete spec Section 1-7 coverage
- ✅ Progressive learning path (beginner → advanced)

**Organization:**
- **Tutorials (5 pages):** Installation → Quickstart → First Test → First Automation → First Evaluation
- **How-To Guides (16 pages):** Task-oriented recipes for common scenarios
- **API Reference (18 pages):** Complete type and function documentation
- **Explanation (8 pages):** Concepts, architecture, design decisions

---

## 1. Folder Structure

```
docs/content/docs/
├── index.mdx                          # Homepage (splash template)
├── about-documentation.mdx            # Diátaxis framework explanation
│
├── getting-started/                   # TUTORIALS (Learning-Oriented)
│   ├── index.mdx                      # Getting Started hub
│   ├── installation.mdx               # Install & configure
│   ├── quickstart.mdx                 # 5-minute intro
│   ├── first-test.mdx                 # Your first vibeTest
│   ├── first-automation.mdx           # Your first vibeWorkflow
│   └── first-evaluation.mdx           # Using judge
│
├── guides/                            # HOW-TO GUIDES (Task-Oriented)
│   ├── index.mdx                      # Guides hub
│   │
│   ├── testing/                       # Testing guides
│   │   ├── index.mdx
│   │   ├── reactive-watchers.mdx      # AgentExecution.watch()
│   │   ├── cumulative-state.mdx       # Multi-run state tracking
│   │   ├── custom-matchers.mdx        # Using matchers
│   │   └── matrix-testing.mdx         # defineTestSuite
│   │
│   ├── automation/                    # Automation guides
│   │   ├── index.mdx
│   │   ├── building-workflows.mdx     # Multi-stage workflows
│   │   ├── loop-patterns.mdx          # until() helper
│   │   └── error-handling.mdx         # Graceful degradation
│   │
│   ├── evaluation/                    # Evaluation guides
│   │   ├── index.mdx
│   │   ├── using-judge.mdx            # LLM-based evaluation
│   │   ├── rubrics.mdx                # Creating rubrics
│   │   └── benchmarking.mdx           # Comparing models/prompts
│   │
│   └── advanced/                      # Advanced guides
│       ├── index.mdx
│       ├── mcp-servers.mdx            # Model Context Protocol
│       ├── cost-optimization.mdx      # Model selection & budgets
│       ├── bundle-cleanup.mdx         # Managing .vibe-artifacts
│       └── multi-modal-prompts.mdx    # Images & files
│
├── api/                               # REFERENCE (Information-Oriented)
│   ├── index.mdx                      # API Reference hub
│   │
│   ├── core/                          # Core API functions
│   │   ├── index.mdx
│   │   ├── vibeTest.mdx               # Test function
│   │   ├── vibeWorkflow.mdx           # Workflow function
│   │   ├── runAgent.mdx               # Execute agent
│   │   ├── defineAgent.mdx            # Configure agent
│   │   ├── judge.mdx                  # LLM evaluation
│   │   └── prompt.mdx                 # Multi-modal prompts
│   │
│   ├── types/                         # Type definitions
│   │   ├── index.mdx
│   │   ├── test-context.mdx           # VibeTestContext
│   │   ├── workflow-context.mdx       # WorkflowContext
│   │   ├── agent-execution.mdx        # AgentExecution class
│   │   ├── run-result.mdx             # RunResult interface
│   │   ├── partial-result.mdx         # PartialRunResult
│   │   ├── file-change.mdx            # FileChange interface
│   │   ├── tool-call.mdx              # ToolCall interface
│   │   ├── rubric.mdx                 # Rubric & JudgeResult
│   │   └── configuration.mdx          # AgentConfig, RunAgentOptions
│   │
│   └── utilities/                     # Utilities & matchers
│       ├── index.mdx
│       ├── matchers.mdx               # Custom matchers
│       └── config.mdx                 # defineVibeConfig
│
└── explanation/                       # EXPLANATION (Understanding-Oriented)
    ├── index.mdx                      # Explanation hub
    │
    ├── concepts/                      # Core concepts
    │   ├── index.mdx
    │   ├── dual-api.mdx               # vibeTest vs vibeWorkflow
    │   ├── auto-capture.mdx           # Context capture system
    │   ├── lazy-loading.mdx           # Memory-efficient design
    │   └── diátaxis.mdx               # Doc framework (meta)
    │
    ├── architecture/                  # Architecture
    │   ├── index.mdx
    │   ├── overview.mdx               # System architecture
    │   ├── context-manager.mdx        # ContextManager lifecycle
    │   ├── run-bundle.mdx             # Storage structure
    │   └── hook-integration.mdx       # Claude Code hooks
    │
    └── design/                        # Design decisions
        ├── index.mdx
        ├── why-vitest.mdx             # Why Vitest v3
        ├── storage-strategy.mdx       # Disk bundle + thin meta
        ├── thenable-pattern.mdx       # AgentExecution design
        └── graceful-degradation.mdx   # Error handling
```

**Total:** 47 pages across 4 major categories

---

## 2. Page Inventory

### TUTORIALS (Getting Started)

#### getting-started/index.mdx

**Category:** Tutorial Hub
**Sidebar Position:** 0
**Length:** 100-150 lines
**Audience:** Anyone new to vibe-check
**Prerequisites:** None

**Purpose:**
Hub page that guides users to the right tutorial based on their goals.

**Content Outline:**
1. Welcome & overview (what is vibe-check)
2. "Choose your path" cards:
   - Test & evaluate agents → first-test.mdx
   - Automate workflows → first-automation.mdx
   - Benchmark models → first-evaluation.mdx
3. Prerequisites (Node.js, basic TypeScript)
4. Quick links to installation

**Spec Sections:** None (navigation page)

**Cross-References:**
- Links to: installation.mdx, first-test.mdx, first-automation.mdx, first-evaluation.mdx
- Linked from: Homepage (index.mdx)

---

#### getting-started/installation.mdx

**Category:** Tutorial
**Sidebar Position:** 1
**Length:** 250-300 lines
**Audience:** Complete beginners installing vibe-check
**Prerequisites:** Node.js 18+, package manager

**Purpose:**
Guide users through installing vibe-check, configuring Vitest, and verifying the setup works.

**Learning Outcomes:**
- Install @dao/vibe-check package
- Configure vitest.config.ts
- Understand reporter setup
- Verify installation with hello-world test

**Content Outline:**
1. Prerequisites verification
   - Node.js version check: `node --version`
   - Package manager (pnpm/npm/bun)
2. Installation steps
   ```bash
   pnpm add -D @dao/vibe-check vitest vite
   ```
3. Configuration
   - Create vitest.config.ts
   - Use `defineVibeConfig()` helper
   - Configure reporters (VibeCostReporter, VibeHtmlReporter)
4. Setup file
   - Add `@dao/vibe-check/setup` to setupFiles
   - Explain what setup does (register matchers)
5. Verification
   - Create `tests/hello.test.ts`
   - Simple vibeTest example
   - Run `vitest`
   - Explain expected output
6. Troubleshooting common issues
7. Next steps → quickstart.mdx

**Spec Sections:**
- Section 5.1 (Dependencies)
- Section 2.7 (defineVibeConfig)

**Code Examples:**
```typescript
// vitest.config.ts
import { defineVibeConfig } from '@dao/vibe-check/config';

export default defineVibeConfig({
  test: {
    // Your custom config
  },
});

// tests/hello.test.ts
import { vibeTest } from '@dao/vibe-check';

vibeTest('hello world', async ({ runAgent, expect }) => {
  const result = await runAgent({
    prompt: 'Say hello'
  });

  expect(result).toBeDefined();
});
```

**Cross-References:**
- Previous: getting-started/index.mdx
- Next: quickstart.mdx
- Reference: api/utilities/config.mdx (defineVibeConfig)

---

#### getting-started/quickstart.mdx

**Category:** Tutorial
**Sidebar Position:** 2
**Length:** 200-250 lines
**Audience:** Users who just installed vibe-check
**Prerequisites:** Installation complete

**Purpose:**
5-minute introduction to core concepts through a simple working example.

**Learning Outcomes:**
- Understand vibeTest fixture pattern
- Execute an agent with runAgent
- Use basic matcher
- Read test results

**Content Outline:**
1. What you'll build: Simple test that runs an agent
2. Create test file: `tests/quickstart.test.ts`
3. Write simplest test:
   ```typescript
   vibeTest('agent can execute', async ({ runAgent, expect }) => {
     const result = await runAgent({
       prompt: 'Count to 5'
     });

     expect(result).toBeDefined();
     expect(result.metrics.totalCostUsd).toBeLessThan(1);
   });
   ```
4. Run test: `vitest`
5. Understand output:
   - Pass/fail status
   - Cost reporter output
   - HTML report location
6. Explore RunResult:
   - `result.metrics` (cost, tokens, duration)
   - `result.messages` (conversation)
   - `result.files` (file changes)
7. Next steps:
   - Write real tests → first-test.mdx
   - Build automation → first-automation.mdx

**Spec Sections:**
- Section 2.1 (vibeTest)
- Section 2.4 (runAgent)
- Section 1.5 (RunResult)

**Cross-References:**
- Previous: installation.mdx
- Next: first-test.mdx, first-automation.mdx
- Reference: api/core/vibeTest.mdx, api/core/runAgent.mdx

---

#### getting-started/first-test.mdx

**Category:** Tutorial
**Sidebar Position:** 3
**Length:** 400-500 lines
**Audience:** Developers ready to write real tests
**Prerequisites:** Quickstart complete

**Purpose:**
Build a complete test that validates agent behavior using matchers and reactive watchers.

**Learning Outcomes:**
- Write meaningful test assertions
- Use custom matchers (toCompleteAllTodos, toHaveChangedFiles)
- Add reactive watchers for fail-fast behavior
- Interpret detailed test results

**Content Outline:**
1. Scenario: Test an agent that refactors code
2. Write test with matchers:
   ```typescript
   vibeTest('refactor adds tests', async ({ runAgent, expect }) => {
     const result = await runAgent({
       prompt: '/refactor src/auth.ts --add-tests'
     });

     expect(result).toCompleteAllTodos();
     expect(result).toHaveChangedFiles(['src/auth.ts', 'src/auth.test.ts']);
     expect(result).toStayUnderCost(2.00);
   });
   ```
3. Add reactive watcher (fail-fast):
   ```typescript
   const execution = runAgent({ prompt: '/refactor src/' });
   execution.watch(({ files }) => {
     expect(files.changed()).not.toContain('database');
   });
   const result = await execution;
   ```
4. Run and analyze results
5. Add judge for quality:
   ```typescript
   const judgment = await judge(result, {
     rubric: {
       name: 'Code Quality',
       criteria: [
         { name: 'has_tests', description: 'Added test coverage' },
         { name: 'no_todos', description: 'No TODO comments' }
       ]
     }
   });
   expect(judgment.passed).toBe(true);
   ```
6. Best practices:
   - When to use watchers vs matchers
   - How to choose matchers
   - Cost budgeting
7. Next steps → guides for advanced patterns

**Spec Sections:**
- Section 2.1 (vibeTest with examples)
- Section 1.2 (AgentExecution.watch)
- Section 2.8 (Custom matchers)
- Section 2.4 (judge)

**Cross-References:**
- Previous: quickstart.mdx
- Next: first-automation.mdx, guides/testing/reactive-watchers.mdx
- Reference: api/core/vibeTest.mdx, api/utilities/matchers.mdx

---

#### getting-started/first-automation.mdx

**Category:** Tutorial
**Sidebar Position:** 4
**Length:** 400-500 lines
**Audience:** Developers ready to build workflows
**Prerequisites:** Quickstart complete

**Purpose:**
Build a multi-stage workflow that chains agents together to accomplish a complex task.

**Learning Outcomes:**
- Create vibeWorkflow with multiple stages
- Pass context between stages
- Use cumulative state across stages
- Implement loops with until() helper

**Content Outline:**
1. Scenario: Build a "analyze → fix → test" pipeline
2. Create workflow:
   ```typescript
   vibeWorkflow('refactor pipeline', async (wf) => {
     const analyze = await wf.stage('analyze', {
       agent: analyzer,
       prompt: '/analyze src/'
     });

     const fix = await wf.stage('fix', {
       agent: fixer,
       prompt: `/fix ${analyze.bundleDir}/summary.json`
     });

     const test = await wf.stage('test', {
       agent: tester,
       prompt: '/test'
     });
   });
   ```
3. Add loop for retries:
   ```typescript
   const results = await wf.until(
     (latest) => latest.tools.succeeded().length > 0,
     () => wf.stage('retry', { prompt: '/fix' }),
     { maxIterations: 3 }
   );
   ```
4. Access cumulative state:
   ```typescript
   const allFiles = wf.files.allChanged();
   const byStage = wf.files.byStage('fix');
   ```
5. Best practices:
   - When to use workflows vs tests
   - Stage naming conventions
   - Error handling in pipelines
6. Next steps → guides for advanced workflows

**Spec Sections:**
- Section 2.2 (vibeWorkflow)
- Section 1.4 (WorkflowContext, until helper)

**Cross-References:**
- Previous: first-test.mdx
- Next: first-evaluation.mdx, guides/automation/building-workflows.mdx
- Reference: api/core/vibeWorkflow.mdx

---

#### getting-started/first-evaluation.mdx

**Category:** Tutorial
**Sidebar Position:** 5
**Length:** 400-500 lines
**Audience:** Developers ready to benchmark agents
**Prerequisites:** first-test.mdx complete

**Purpose:**
Set up evaluation tests to compare models, prompts, or configurations using matrix testing and judge.

**Learning Outcomes:**
- Use matrix testing with defineTestSuite
- Create evaluation rubrics
- Use judge for LLM-based quality assessment
- Analyze cost vs quality tradeoffs

**Content Outline:**
1. Scenario: Compare Sonnet vs Haiku on a refactoring task
2. Create matrix test:
   ```typescript
   defineTestSuite({
     matrix: {
       model: ['claude-3-5-sonnet-latest', 'claude-3-5-haiku-latest'],
       maxTurns: [5, 10]
     },
     test: ({ model, maxTurns }) => {
       vibeTest(`${model} in ${maxTurns} turns`, async ({ runAgent, judge, expect }) => {
         const result = await runAgent({
           model,
           maxTurns,
           prompt: '/refactor src/auth.ts'
         });

         const judgment = await judge(result, {
           rubric: {
             name: 'Refactor Quality',
             criteria: [
               { name: 'correctness', description: 'Code works', weight: 0.5 },
               { name: 'style', description: 'Readable', weight: 0.3 },
               { name: 'tests', description: 'Has tests', weight: 0.2 }
             ]
           }
         });

         expect(result).toStayUnderCost(3);
         expect(judgment.passed).toBe(true);
       });
     }
   });
   ```
3. Run evaluation suite
4. Analyze results:
   - Cost comparison
   - Quality scores
   - Speed vs quality tradeoffs
5. Best practices:
   - Choosing evaluation metrics
   - Setting up baselines
   - Tracking improvements over time
6. Next steps → guides for advanced evaluation

**Spec Sections:**
- Section 2.6 (defineTestSuite)
- Section 2.4 (judge)
- Section 1.10 (Rubric)

**Cross-References:**
- Previous: first-automation.mdx
- Next: guides/evaluation/benchmarking.mdx
- Reference: api/core/judge.mdx, guides/evaluation/rubrics.mdx

---

### HOW-TO GUIDES (Guides Section)

#### guides/index.mdx

**Category:** Guide Hub
**Length:** 150-200 lines
**Audience:** Users looking for task-specific solutions

**Purpose:**
Hub page organizing all how-to guides by category.

**Content Outline:**
1. Overview of guide categories
2. Testing guides:
   - Reactive watchers for fail-fast
   - Cumulative state tracking
   - Custom matchers
   - Matrix testing
3. Automation guides:
   - Building workflows
   - Loop patterns
   - Error handling
4. Evaluation guides:
   - Using judge
   - Creating rubrics
   - Benchmarking
5. Advanced guides:
   - MCP servers
   - Cost optimization
   - Bundle cleanup
   - Multi-modal prompts
6. Quick navigation cards

**Spec Sections:** None (navigation)

---

#### guides/testing/reactive-watchers.mdx

**Category:** How-To Guide
**Length:** 600-800 lines
**Audience:** Developers who want fail-fast testing
**Prerequisites:** first-test.mdx complete

**Purpose:**
Implement reactive watchers to abort agent execution early when constraints are violated.

**Problem Solved:**
- Don't wait for full run if budget exceeded
- Detect file violations immediately
- Enforce constraints during execution

**Content Outline:**
1. Problem: Why watchers?
   - Example: Agent modifying database files
   - Example: Cost running away
2. Solution: AgentExecution.watch()
3. Basic syntax:
   ```typescript
   const execution = runAgent({ prompt: '/refactor' });
   execution.watch(({ metrics }) => {
     expect(metrics.totalCostUsd).toBeLessThan(5);
   });
   const result = await execution;
   ```
4. PartialRunResult interface (what watchers receive)
5. Execution guarantees:
   - Sequential execution
   - Fail-fast on throw
   - No race conditions
6. When watchers run:
   - PostToolUse events
   - TodoUpdate events
   - Notification events
7. Common patterns:
   - Cost budget enforcement
   - File change monitoring
   - Tool usage limits
   - Combined constraints
8. Multiple watchers (chaining):
   ```typescript
   execution
     .watch(({ metrics }) => expect(metrics.totalCostUsd).toBeLessThan(3))
     .watch(({ tools }) => expect(tools.failed().length).toBeLessThan(2))
     .watch(({ files }) => expect(files.changed()).not.toContain('db'));
   ```
9. Best practices:
   - When to use watchers vs matchers
   - Performance considerations
   - Error messages
10. Troubleshooting

**Spec Sections:**
- Section 1.2 (AgentExecution class)
- Section 1.3 (PartialRunResult)
- Section 2.1 examples (watch usage)

**Cross-References:**
- Tutorial: getting-started/first-test.mdx
- Reference: api/types/agent-execution.mdx, api/types/partial-result.mdx
- Related: guides/testing/custom-matchers.mdx

---

#### guides/testing/cumulative-state.mdx

**Category:** How-To Guide
**Length:** 600-800 lines
**Audience:** Developers running multiple agents in one test
**Prerequisites:** first-test.mdx complete

**Purpose:**
Track state across multiple runAgent() calls within a single test.

**Problem Solved:**
- Need to track all file changes across multiple agents
- Want to see total tool usage from all runs
- Need unified timeline of events

**Content Outline:**
1. Problem: Multi-agent workflows in tests
2. Solution: Cumulative state accessors
3. Accessing cumulative state:
   ```typescript
   vibeTest('multi-agent refactor', async ({ runAgent, files, tools, expect }) => {
     const analyze = await runAgent({ prompt: '/analyze' });
     const fix = await runAgent({ prompt: '/fix' });

     // Cumulative state across both runs
     expect(files.changed()).toHaveLength(10);
     expect(tools.used('Edit')).toBeGreaterThan(5);
   });
   ```
4. `context.files` accessor:
   - changed() - all files
   - get(path) - specific file
   - filter(glob) - pattern matching
   - stats() - aggregated stats
5. `context.tools` accessor:
   - all() - all calls
   - used(name) - count by name
   - findFirst(name) - first usage
   - failed() - failed calls
   - succeeded() - successful calls
6. `context.timeline` accessor:
   - events() - async iterable
7. Combining with individual results:
   ```typescript
   expect(analyze).toHaveUsedTool('Read');
   expect(fix).toHaveChangedFiles(['src/**']);
   expect(files.stats().total).toBe(10);  // Cumulative
   ```
8. Use cases:
   - Multi-agent pipelines
   - Iterative refinement
   - Progressive testing
9. Best practices
10. Comparison: Cumulative vs Individual state

**Spec Sections:**
- Section 1.1 (VibeTestContext cumulative accessors)
- Section 4.4 (_TestContextManager implementation)

**Cross-References:**
- Tutorial: getting-started/first-test.mdx
- Reference: api/types/test-context.mdx
- Related: guides/automation/building-workflows.mdx

---

#### guides/testing/custom-matchers.mdx

**Category:** How-To Guide
**Length:** 500-600 lines
**Audience:** Developers writing test assertions
**Prerequisites:** first-test.mdx complete

**Purpose:**
Use vibe-check's custom matchers for common agent testing scenarios.

**Content Outline:**
1. Overview of custom matchers
2. File matchers:
   - toHaveChangedFiles(paths) - with glob support
   - toHaveNoDeletedFiles()
   - Examples with patterns
3. Tool matchers:
   - toHaveUsedTool(name, opts?)
   - toUseOnlyTools(allowlist)
   - Examples
4. Quality matchers:
   - toCompleteAllTodos()
   - toHaveNoErrorsInLogs()
   - toPassRubric(rubric)
   - Examples
5. Cost matchers:
   - toStayUnderCost(maxUsd)
   - Examples
6. Hook matchers:
   - toHaveCompleteHookData() - strict mode
   - When to use (debugging)
7. Combining matchers:
   ```typescript
   expect(result).toCompleteAllTodos();
   expect(result).toHaveChangedFiles(['src/**/*.ts']);
   expect(result).toStayUnderCost(2);
   ```
8. Best practices:
   - Matcher vs manual assertion
   - Error messages
   - Composition
9. Comparison: Matchers vs judge()

**Spec Sections:**
- Section 2.8 (Custom matchers)

**Cross-References:**
- Tutorial: getting-started/first-test.mdx
- Reference: api/utilities/matchers.mdx
- Related: guides/evaluation/using-judge.mdx

---

#### guides/testing/matrix-testing.mdx

**Category:** How-To Guide
**Length:** 400-500 lines
**Audience:** Developers benchmarking configurations
**Prerequisites:** first-evaluation.mdx complete

**Purpose:**
Generate test combinations from matrices to benchmark multiple configurations.

**Content Outline:**
1. Problem: Testing many configurations
2. Solution: defineTestSuite with matrix
3. Basic usage:
   ```typescript
   defineTestSuite({
     matrix: {
       model: ['sonnet', 'haiku'],
       maxTurns: [5, 10]
     },
     test: ({ model, maxTurns }) => {
       vibeTest(`${model} in ${maxTurns}`, async ({ runAgent }) => {
         // 4 tests generated
       });
     }
   });
   ```
4. Advanced patterns:
   - Multi-dimensional matrices
   - Conditional skips
   - Custom naming
5. Analyzing matrix results
6. Best practices:
   - Matrix size (avoid explosions)
   - Naming conventions
   - Result organization
7. Use cases:
   - Model comparison
   - Prompt optimization
   - Tool configuration

**Spec Sections:**
- Section 2.6 (defineTestSuite)

**Cross-References:**
- Tutorial: getting-started/first-evaluation.mdx
- Related: guides/evaluation/benchmarking.mdx

---

#### guides/automation/building-workflows.mdx

**Category:** How-To Guide
**Length:** 700-900 lines
**Audience:** Developers building multi-stage pipelines
**Prerequisites:** first-automation.mdx complete

**Purpose:**
Build complex multi-stage workflows that chain agents together.

**Content Outline:**
1. Problem: Multi-step automation
2. Solution: vibeWorkflow with stages
3. Basic workflow:
   ```typescript
   vibeWorkflow('deploy', async (wf) => {
     await wf.stage('build', { prompt: '/build' });
     await wf.stage('test', { prompt: '/test' });
     await wf.stage('deploy', { prompt: '/deploy' });
   });
   ```
4. Passing context between stages:
   ```typescript
   const analyze = await wf.stage('analyze', { prompt: '/analyze' });
   await wf.stage('fix', {
     prompt: prompt({
       text: 'Fix issues',
       files: [`${analyze.bundleDir}/summary.json`]
     })
   });
   ```
5. Accessing cumulative state:
   - wf.files.allChanged()
   - wf.files.byStage('fix')
   - wf.tools.all()
   - wf.timeline.events()
6. Stage configuration:
   - Workspace overrides
   - Model selection per stage
   - Tool restrictions
7. Patterns:
   - Sequential pipelines
   - Parallel stages (Promise.all)
   - Conditional stages
8. Best practices:
   - Stage naming
   - Error propagation
   - State management
9. Use cases:
   - CI/CD pipelines
   - Data processing
   - Content generation

**Spec Sections:**
- Section 2.2 (vibeWorkflow)
- Section 1.4 (WorkflowContext)

**Cross-References:**
- Tutorial: getting-started/first-automation.mdx
- Reference: api/core/vibeWorkflow.mdx
- Related: guides/automation/loop-patterns.mdx

---

#### guides/automation/loop-patterns.mdx

**Category:** How-To Guide
**Length:** 500-600 lines
**Audience:** Developers building iterative workflows
**Prerequisites:** guides/automation/building-workflows.mdx

**Purpose:**
Implement loops and retries in workflows using the until() helper.

**Content Outline:**
1. Problem: Iterative refinement
2. Solution: wf.until() helper
3. Basic loop:
   ```typescript
   const results = await wf.until(
     (latest) => latest.tools.succeeded().length > 0,
     () => wf.stage('retry', { prompt: '/fix' }),
     { maxIterations: 3 }
   );
   ```
4. until() signature:
   - predicate: (latest: RunResult) => boolean
   - body: () => Promise<RunResult>
   - opts: { maxIterations }
5. Common patterns:
   - Loop until tests pass
   - Loop until todos complete
   - Judge-driven loops (quality threshold)
   - Manual retries
6. Accessing loop results:
   ```typescript
   console.log(`Took ${results.length} iterations`);
   ```
7. Manual loops (alternative):
   ```typescript
   let passed = false;
   while (!passed) {
     const result = await wf.stage('improve', { prompt: '/improve' });
     const judgment = await judge(result, { rubric });
     passed = judgment.passed;
   }
   ```
8. Best practices:
   - Max iterations
   - Loop termination
   - Infinite loop prevention
9. Use cases:
   - Code improvement cycles
   - Test-driven development
   - Progressive refinement

**Spec Sections:**
- Section 1.4 (WorkflowContext.until)
- Section 2.2 examples

**Cross-References:**
- Previous: guides/automation/building-workflows.mdx
- Reference: api/types/workflow-context.mdx
- Related: guides/evaluation/using-judge.mdx

---

#### guides/automation/error-handling.mdx

**Category:** How-To Guide
**Length:** 600-700 lines
**Audience:** Developers building robust workflows
**Prerequisites:** guides/automation/building-workflows.mdx

**Purpose:**
Handle errors gracefully in workflows using vibe-check's error handling patterns.

**Content Outline:**
1. Problem: Failures in production pipelines
2. Vibe-check's graceful degradation policy
3. Hook capture failures:
   - What happens when hooks fail
   - Warning messages (stderr)
   - hookCaptureStatus field
4. Git detection errors:
   - When git commands fail
   - Continuing without git state
5. Strict mode with matchers:
   ```typescript
   expect(result).toHaveCompleteHookData();
   ```
6. Error logging standards:
   - `[vibe-check]` prefix
   - stderr vs stdout
   - Structured messages
7. Workflow error handling:
   ```typescript
   try {
     await wf.stage('risky', { prompt: '/experimental' });
   } catch (error) {
     await wf.stage('fallback', { prompt: '/safe' });
   }
   ```
8. Best practices:
   - When to fail fast
   - When to continue
   - Logging for debugging
9. Troubleshooting guide

**Spec Sections:**
- Section 4.2.2 (Error handling & git detection)
- Section 7.1 (Graceful degradation policy)

**Cross-References:**
- Reference: api/types/run-result.mdx (hookCaptureStatus)
- Related: explanation/design/graceful-degradation.mdx

---

#### guides/evaluation/using-judge.mdx

**Category:** How-To Guide
**Length:** 700-900 lines
**Audience:** Developers evaluating agent quality
**Prerequisites:** first-evaluation.mdx complete

**Purpose:**
Use LLM-based judge for subjective quality evaluation.

**Content Outline:**
1. Problem: Subjective quality metrics
2. Solution: judge() with rubrics
3. Basic usage:
   ```typescript
   const judgment = await judge(result, {
     rubric: {
       name: 'Code Quality',
       criteria: [
         { name: 'correctness', description: 'Works', weight: 0.5 },
         { name: 'style', description: 'Readable', weight: 0.3 },
         { name: 'tests', description: 'Tested', weight: 0.2 }
       ],
       passThreshold: 0.7
     }
   });

   expect(judgment.passed).toBe(true);
   ```
4. Rubric structure (array of criteria)
5. Custom instructions:
   ```typescript
   await judge(result, {
     rubric: securityRubric,
     instructions: 'Be strict about security issues'
   });
   ```
6. Custom result schemas (Zod):
   ```typescript
   const CustomSchema = z.object({
     passed: z.boolean(),
     issues: z.array(z.object({
       severity: z.enum(['critical', 'major', 'minor']),
       description: z.string()
     }))
   });

   const judgment = await judge<z.infer<typeof CustomSchema>>(result, {
     rubric: myRubric,
     resultFormat: CustomSchema
   });
   ```
7. Throw on failure:
   ```typescript
   await judge(result, {
     rubric: strictRubric,
     throwOnFail: true  // Fails test immediately
   });
   ```
8. Multiple rubrics (security + performance + style)
9. Automatic evidence inclusion:
   - File contents
   - Tool usage
   - Metrics
10. Best practices:
    - Writing clear criteria
    - Using weights effectively
    - Combining with matchers
11. Cost considerations (judge uses tokens)

**Spec Sections:**
- Section 2.4 (judge function)
- Section 1.10 (Rubric, DefaultJudgmentResult)
- Section 6.4 (Judge implementation)

**Cross-References:**
- Tutorial: getting-started/first-evaluation.mdx
- Reference: api/core/judge.mdx
- Related: guides/evaluation/rubrics.mdx

---

#### guides/evaluation/rubrics.mdx

**Category:** How-To Guide
**Length:** 600-700 lines
**Audience:** Developers creating evaluation criteria
**Prerequisites:** guides/evaluation/using-judge.mdx

**Purpose:**
Create effective rubrics for LLM-based evaluation.

**Content Outline:**
1. What is a rubric?
2. Rubric structure (array format):
   ```typescript
   {
     name: string,
     criteria: Array<{
       name: string,
       description: string,
       weight?: number,
       threshold?: number
     }>,
     model?: string,
     passThreshold?: number
   }
   ```
3. Simple rubrics (equal weights):
   ```typescript
   {
     name: 'PR Checklist',
     criteria: [
       { name: 'has_tests', description: 'Has tests' },
       { name: 'no_todos', description: 'No TODO comments' }
     ]
   }
   ```
4. Weighted rubrics:
   ```typescript
   criteria: [
     { name: 'security', description: 'Secure', weight: 0.7 },
     { name: 'features', description: 'Complete', weight: 0.3 }
   ]
   ```
5. Per-criterion thresholds:
   ```typescript
   {
     name: 'critical',
     description: 'No security vulnerabilities',
     weight: 1.0,
     threshold: 1.0  // Must be perfect
   }
   ```
6. Custom judge models:
   ```typescript
   {
     name: 'Complex Review',
     criteria: [...],
     model: 'claude-opus-4'  // Use more powerful model
   }
   ```
7. Best practices:
   - Writing clear descriptions
   - Choosing weights
   - Setting thresholds
   - When to use custom models
8. Example rubrics:
   - Code quality
   - Security review
   - Documentation completeness
   - Test coverage
9. Runtime validation with RubricSchema

**Spec Sections:**
- Section 1.10 (Rubric interface)
- Section 5.4 (RubricSchema for validation)

**Cross-References:**
- Related: guides/evaluation/using-judge.mdx
- Reference: api/types/rubric.mdx

---

#### guides/evaluation/benchmarking.mdx

**Category:** How-To Guide
**Length:** 600-800 lines
**Audience:** Developers comparing models/prompts
**Prerequisites:** first-evaluation.mdx, guides/evaluation/using-judge.mdx

**Purpose:**
Set up systematic benchmarks to compare models, prompts, or configurations.

**Content Outline:**
1. Problem: Which model/prompt/config is best?
2. Solution: Matrix testing + judge + cost tracking
3. Basic benchmark:
   ```typescript
   defineTestSuite({
     matrix: {
       model: ['sonnet', 'opus', 'haiku'],
       prompt: ['brief', 'detailed']
     },
     test: ({ model, prompt }) => {
       vibeTest(`${model} with ${prompt}`, async ({ runAgent, judge }) => {
         const result = await runAgent({ model, prompt: prompts[prompt] });
         const judgment = await judge(result, { rubric: qualityRubric });

         // Store results for comparison
         results.push({
           model,
           prompt,
           cost: result.metrics.totalCostUsd,
           quality: judgment.score,
           duration: result.metrics.durationMs
         });
       });
     }
   });
   ```
4. Analyzing results:
   - Cost comparison tables
   - Quality vs cost tradeoffs
   - Speed vs quality tradeoffs
5. Statistical significance
6. Baseline establishment
7. Tracking over time
8. Best practices:
   - Consistent test scenarios
   - Multiple runs for variance
   - Controlling variables
   - Documenting baselines
9. Use cases:
   - Model selection
   - Prompt optimization
   - Tool configuration tuning
   - MCP server comparison

**Spec Sections:**
- Section 2.6 (defineTestSuite)
- Section 5.6 (Model selection guide)

**Cross-References:**
- Tutorial: getting-started/first-evaluation.mdx
- Related: guides/advanced/cost-optimization.mdx

---

#### guides/advanced/mcp-servers.mdx

**Category:** How-To Guide
**Length:** 700-900 lines
**Audience:** Developers extending agent capabilities
**Prerequisites:** first-test.mdx complete

**Purpose:**
Configure and use Model Context Protocol (MCP) servers to extend agent capabilities.

**Content Outline:**
1. What is MCP?
2. Why use MCP servers?
3. Basic configuration:
   ```typescript
   const dbAgent = defineAgent({
     name: 'db-admin',
     mcpServers: {
       database: {
         command: 'npx',
         args: ['@modelcontextprotocol/server-postgres'],
         env: {
           POSTGRES_URL: process.env.DATABASE_URL
         },
         allowedTools: ['query', 'schema']
       }
     }
   });
   ```
4. Common MCP servers:
   - Database (@mcp/postgres)
   - Filesystem (@mcp/filesystem)
   - Docker (@mcp/docker)
   - Git (@mcp/git)
5. Per-stage MCP config:
   ```typescript
   await wf.stage('migrate', {
     prompt: '/migrate',
     mcpServers: { database: dbConfig }
   });
   ```
6. Security considerations:
   - allowedTools whitelist
   - Environment variables
   - Path restrictions
7. Resource cleanup (automatic)
8. Error handling (server failures)
9. Best practices:
   - Security first
   - Tool whitelisting
   - Server lifecycle
   - Testing MCP servers
10. Troubleshooting

**Spec Sections:**
- Section 1.9 (MCPServerConfig)
- Section 2.9 (MCP server examples)

**Cross-References:**
- Reference: api/types/configuration.mdx (MCPServerConfig)
- Examples from spec Section 2.9

---

#### guides/advanced/cost-optimization.mdx

**Category:** How-To Guide
**Length:** 600-700 lines
**Audience:** Developers optimizing costs
**Prerequisites:** first-test.mdx complete

**Purpose:**
Optimize agent costs using model selection and budget enforcement.

**Content Outline:**
1. Problem: Managing AI costs
2. Understanding costs:
   - Token usage
   - Model pricing
   - Cost tracking in results
3. DEFAULT_MODEL constant:
   ```typescript
   // .env
   VIBE_DEFAULT_MODEL=claude-3-5-haiku-latest
   ```
4. Model selection guide:
   | Use Case | Model | Why |
   |----------|-------|-----|
   | Local dev | sonnet | Balance |
   | CI | haiku | Cheap & fast |
   | Complex | opus | High capability |
   | Judge | haiku | Cost-effective |
5. Per-agent model override:
   ```typescript
   const cheapAgent = defineAgent({
     name: 'formatter',
     // Uses DEFAULT_MODEL (haiku in CI)
   });

   const smartAgent = defineAgent({
     name: 'architect',
     model: 'claude-3-5-opus-latest'
   });
   ```
6. Budget enforcement:
   ```typescript
   execution.watch(({ metrics }) => {
     expect(metrics.totalCostUsd).toBeLessThan(5);
   });
   ```
7. Cost matchers:
   ```typescript
   expect(result).toStayUnderCost(2.00);
   ```
8. Environment-based defaults:
   - Local: sonnet for quality
   - CI: haiku for speed
9. Strategies:
   - Use cheaper models where possible
   - Set budget guardrails
   - Track costs over time
   - Optimize prompts
10. Monitoring & alerts

**Spec Sections:**
- Section 1.13 (DEFAULT_MODEL)
- Section 5.6 (Model selection & cost optimization)

**Cross-References:**
- Reference: api/types/configuration.mdx
- Related: guides/evaluation/benchmarking.mdx

---

#### guides/advanced/bundle-cleanup.mdx

**Category:** How-To Guide
**Length:** 500-600 lines
**Audience:** Developers managing disk space
**Prerequisites:** Installation complete

**Purpose:**
Manage .vibe-artifacts directory to prevent unbounded disk usage.

**Content Outline:**
1. Problem: Bundles accumulate indefinitely
2. What are RunBundles?
   - .vibe-artifacts/{testId}/ structure
   - events.ndjson, hooks.ndjson, summary.json
   - files/ directory
3. Automatic cleanup (30-day default):
   ```typescript
   // vitest.config.ts
   export default defineVibeConfig({
     cleanup: {
       maxAgeDays: 7,
       minFreeDiskMb: 1000,
       disabled: false
     }
   });
   ```
4. Manual cleanup API:
   ```typescript
   import { cleanupBundles } from '@dao/vibe-check/artifacts';

   const result = await cleanupBundles({ maxAgeDays: 7 });
   console.log(`Deleted ${result.deleted} bundles`);
   ```
5. Protected bundles:
   ```bash
   touch .vibe-artifacts/important-test/.vibe-keep
   ```
6. CI configuration (maxAgeDays: 1)
7. Disk space monitoring
8. Best practices:
   - Local: 30-day retention
   - CI: 1-day retention
   - Protect critical tests
9. Troubleshooting disk space

**Spec Sections:**
- Section 3.5 (Bundle cleanup policy)

**Cross-References:**
- Reference: explanation/architecture/run-bundle.mdx
- Related: explanation/architecture/overview.mdx

---

#### guides/advanced/multi-modal-prompts.mdx

**Category:** How-To Guide
**Length:** 500-600 lines
**Audience:** Developers using images/files
**Prerequisites:** first-test.mdx complete

**Purpose:**
Create multi-modal prompts that include images and file contents.

**Content Outline:**
1. Problem: Passing images/docs to agent
2. Solution: prompt() helper
3. Images:
   ```typescript
   const result = await runAgent({
     prompt: prompt({
       text: 'Review this UI mockup',
       images: ['designs/login.png']
     })
   });
   ```
4. Files:
   ```typescript
   prompt({
     text: 'Implement this feature',
     files: ['docs/prd.md', 'docs/api-spec.yaml']
   })
   ```
5. Combining text + images + files:
   ```typescript
   prompt({
     text: 'Review the design and implement',
     images: ['mockup.png'],
     files: ['requirements.md'],
     command: '/implement'
   })
   ```
6. Slash commands
7. Image formats (paths, buffers)
8. File loading (async, lazy)
9. Error handling (missing files)
10. Best practices:
    - File size limits
    - Image optimization
    - Content organization
11. Use cases:
    - Design reviews
    - PRD implementation
    - Screenshot analysis
    - Document processing

**Spec Sections:**
- Section 2.4 (prompt function)
- Section 6.5 (prompt implementation)

**Cross-References:**
- Reference: api/core/prompt.mdx
- Tutorial: getting-started/first-test.mdx

---

### API REFERENCE (API Section)

#### api/index.mdx

**Category:** Reference Hub
**Length:** 200-250 lines
**Audience:** Developers looking up API details

**Purpose:**
Hub page for all API reference documentation with quick navigation.

**Content Outline:**
1. Overview of vibe-check APIs
2. Core API quick reference:
   - vibeTest - Test function
   - vibeWorkflow - Workflow function
   - runAgent - Execute agent
   - defineAgent - Configure agent
   - judge - LLM evaluation
   - prompt - Multi-modal prompts
3. Type reference:
   - Test & Workflow contexts
   - Execution types
   - Result types
   - Configuration types
4. Utilities:
   - Custom matchers
   - Config helpers
5. Quick links to most common APIs
6. Search tips

**Spec Sections:** None (navigation)

**Cross-References:**
- Links to all API pages
- Linked from homepage, guides

---

#### api/core/vibeTest.mdx

**Category:** Reference
**Length:** 800-1000 lines
**Audience:** Developers using vibeTest
**Prerequisites:** None

**Purpose:**
Complete reference documentation for the vibeTest function.

**Content Outline:**
1. Overview
2. Signature:
   ```typescript
   function vibeTest(
     name: string,
     fn: (ctx: VibeTestContext) => Promise<void> | void,
     timeoutOrOpts?: number | { timeout?: number }
   ): void
   ```
3. Parameters:
   - name: Test name (string)
   - fn: Test function receiving context
   - timeoutOrOpts: Timeout or options
4. VibeTestContext interface (full):
   - runAgent(opts): AgentExecution
   - judge<T>(result, opts): Promise<T>
   - expect: Vitest expect
   - annotate(msg, type?, attach?): Promise<void>
   - task: Vitest task metadata
   - files: FilesAccessor (cumulative)
   - tools: ToolsAccessor (cumulative)
   - timeline: TimelineAccessor (cumulative)
5. Test modifiers:
   - vibeTest.skip
   - vibeTest.only
   - vibeTest.concurrent
   - vibeTest.sequential
   - vibeTest.todo
   - vibeTest.fails
6. Examples:
   - Basic test
   - With watchers
   - With judge
   - Multiple agents (cumulative state)
   - Concurrent tests
7. Best practices:
   - When to use vibeTest vs vibeWorkflow
   - Test organization
   - Timeout configuration
8. Type safety examples
9. Related documentation links

**Spec Sections:**
- Section 2.1 (vibeTest signature and examples)
- Section 1.1 (VibeTestContext)

**Cross-References:**
- Tutorial: getting-started/first-test.mdx
- Guide: guides/testing/reactive-watchers.mdx
- Type: api/types/test-context.mdx

---

#### api/core/vibeWorkflow.mdx

**Category:** Reference
**Length:** 800-1000 lines
**Audience:** Developers building workflows

**Purpose:**
Complete reference for the vibeWorkflow function.

**Content Outline:**
1. Overview
2. Signature:
   ```typescript
   function vibeWorkflow(
     name: string,
     fn: (ctx: WorkflowContext) => Promise<void>,
     options?: {
       timeout?: number;
       defaults?: { workspace?: string; model?: string }
     }
   ): void
   ```
3. Parameters
4. WorkflowContext interface (full):
   - stage(name, opts): AgentExecution
   - files: { allChanged(), byStage() }
   - tools: { all() }
   - timeline: { events() }
   - until(predicate, body, opts?): Promise<RunResult[]>
   - defaults: { workspace?, model? }
5. Workflow modifiers:
   - vibeWorkflow.skip
   - vibeWorkflow.only
   - vibeWorkflow.todo
6. Examples:
   - Sequential pipeline
   - Parallel stages
   - Loops with until()
   - Multi-repo workflow (workspace override)
   - Cumulative state access
7. Best practices:
   - Stage naming
   - Error handling
   - State management
8. Type safety
9. Related docs

**Spec Sections:**
- Section 2.2 (vibeWorkflow)
- Section 1.4 (WorkflowContext)

**Cross-References:**
- Tutorial: getting-started/first-automation.mdx
- Guide: guides/automation/building-workflows.mdx
- Type: api/types/workflow-context.mdx

---

#### api/core/runAgent.mdx

**Category:** Reference
**Length:** 1000-1200 lines
**Audience:** All developers

**Purpose:**
Complete reference for runAgent function and AgentExecution.

**Content Outline:**
1. Overview
2. Signature:
   ```typescript
   function runAgent(opts: RunAgentOptions): AgentExecution
   ```
3. RunAgentOptions (full interface):
   - prompt: string | AsyncIterable<SDKUserMessage>
   - model?: string
   - allowedTools?: string[]
   - mcpServers?: Record<string, MCPServerConfig>
   - timeoutMs?: number
   - maxTurns?: number
   - systemPrompt?: string | { preset?, append? }
   - workspace?: string
   - context?: RunResult
4. Return type: AgentExecution (thenable class)
5. AgentExecution methods:
   - watch(fn: WatcherFn): this
   - then(...): Promise<RunResult>
   - catch(...): Promise<...>
   - finally(...): Promise<RunResult>
   - abort(reason?): void
6. Thenable behavior:
   - Fully awaitable
   - Works with Promise.all/race
   - NOT a Promise subclass
7. Reactive watchers section:
   - watch() method details
   - Execution guarantees (sequential, fail-fast)
   - PartialRunResult interface
   - When watchers run
   - Multiple watchers
8. Examples:
   - Basic usage
   - With watchers
   - With abort
   - Thenable interface
   - Advanced patterns
9. Best practices
10. Type safety
11. Related docs

**Spec Sections:**
- Section 2.4 (runAgent)
- Section 1.2 (AgentExecution)
- Section 1.3 (PartialRunResult)
- Section 1.9 (RunAgentOptions)

**Cross-References:**
- Tutorial: getting-started/first-test.mdx
- Guide: guides/testing/reactive-watchers.mdx
- Types: api/types/agent-execution.mdx, api/types/run-result.mdx

---

#### api/core/defineAgent.mdx

**Category:** Reference
**Length:** 600-800 lines
**Audience:** Developers configuring agents

**Purpose:**
Complete reference for defineAgent function.

**Content Outline:**
1. Overview
2. Signature:
   ```typescript
   function defineAgent(
     config: Partial<AgentConfig> & { name: string }
   ): AgentConfig
   ```
3. AgentConfig interface (full):
   - name: string (required)
   - model?: string (defaults to DEFAULT_MODEL)
   - systemPrompt?: string | { preset?, append? }
   - allowedTools?: string[]
   - mcpServers?: Record<string, MCPServerConfig>
   - timeoutMs?: number
   - maxTurns?: number
   - workspace?: string
4. DEFAULT_MODEL constant:
   - Environment variable VIBE_DEFAULT_MODEL
   - Default fallback: claude-3-5-sonnet-latest
5. Examples:
   - Basic agent
   - With custom model
   - With tool restrictions
   - With MCP servers
   - With workspace
   - With system prompt
6. Implementation note (uses DEFAULT_MODEL)
7. Best practices:
   - Agent naming
   - Model selection
   - Tool security
8. Related docs

**Spec Sections:**
- Section 2.3 (defineAgent)
- Section 1.12 (AgentConfig)
- Section 1.13 (DEFAULT_MODEL)

**Cross-References:**
- Tutorial: getting-started/first-test.mdx
- Guide: guides/advanced/cost-optimization.mdx
- Type: api/types/configuration.mdx

---

#### api/core/judge.mdx

**Category:** Reference
**Length:** 900-1100 lines
**Audience:** Developers using LLM evaluation

**Purpose:**
Complete reference for judge function.

**Content Outline:**
1. Overview
2. Signature:
   ```typescript
   function judge<T = DefaultJudgmentResult>(
     result: RunResult,
     options: {
       rubric: Rubric;
       instructions?: string;
       resultFormat?: z.ZodType<T>;
       throwOnFail?: boolean;
     }
   ): Promise<T>
   ```
3. Parameters:
   - result: RunResult to evaluate
   - options.rubric: Evaluation criteria (array)
   - options.instructions: Custom guidance
   - options.resultFormat: Zod schema for type safety
   - options.throwOnFail: Error on failure
4. Rubric structure (full):
   ```typescript
   {
     name: string,
     criteria: Array<{
       name: string,
       description: string,
       weight?: number,
       threshold?: number
     }>,
     model?: string,
     passThreshold?: number
   }
   ```
5. DefaultJudgmentResult (full)
6. Examples:
   - Basic evaluation
   - Weighted criteria
   - Custom instructions
   - Custom result schema (Zod)
   - Throw on failure
   - Multiple rubrics
7. Implementation details:
   - How judge works internally
   - Automatic evidence inclusion
   - Prompt formatting
8. Error handling:
   - JudgmentFailedError
   - Zod validation errors
9. Best practices:
   - Writing clear criteria
   - Using weights
   - Combining with matchers
10. Type safety
11. Related docs

**Spec Sections:**
- Section 2.4 (judge function)
- Section 1.10 (Rubric, DefaultJudgmentResult)
- Section 6.4 (Judge implementation)

**Cross-References:**
- Tutorial: getting-started/first-evaluation.mdx
- Guide: guides/evaluation/using-judge.mdx, guides/evaluation/rubrics.mdx
- Type: api/types/rubric.mdx

---

#### api/core/prompt.mdx

**Category:** Reference
**Length:** 700-900 lines
**Audience:** All developers

**Purpose:**
Complete reference for prompt function.

**Content Outline:**
1. Overview
2. Signature:
   ```typescript
   function prompt(config: {
     text?: string;
     images?: Array<string | Buffer>;
     files?: Array<string>;
     command?: string;
   }): AsyncIterable<SDKUserMessage>
   ```
3. Parameters:
   - text: Text content
   - images: Image paths or buffers
   - files: File paths (content read automatically)
   - command: Slash command
4. Return type: AsyncIterable<SDKUserMessage>
5. Examples:
   - Simple text
   - With images
   - With files
   - With command
   - Combining all
   - Reusable prompts
6. Implementation details:
   - Async generator pattern
   - Image encoding (base64)
   - File loading (lazy)
   - Error resilience
7. Error handling:
   - File loading failures
   - Image loading failures
8. Best practices:
   - File size limits
   - Content organization
   - Error handling
9. Migration from v1.2:
   - attachments → images + files
   - Return type change
10. Related docs

**Spec Sections:**
- Section 2.4 (prompt function)
- Section 6.5 (prompt implementation)

**Cross-References:**
- Tutorial: getting-started/first-test.mdx
- Guide: guides/advanced/multi-modal-prompts.mdx

---

### API REFERENCE - Types

#### api/types/index.mdx

**Category:** Type Reference Hub
**Length:** 200-250 lines

**Purpose:**
Hub for all type definitions with quick navigation.

**Content Outline:**
1. Overview of type categories
2. Context types:
   - VibeTestContext
   - WorkflowContext
3. Execution types:
   - AgentExecution
   - PartialRunResult
4. Result types:
   - RunResult
   - FileChange
   - ToolCall
5. Configuration types:
   - AgentConfig
   - RunAgentOptions
   - MCPServerConfig
6. Evaluation types:
   - Rubric
   - DefaultJudgmentResult
7. Quick links

---

#### api/types/test-context.mdx

**Category:** Type Reference
**Length:** 600-800 lines

**Purpose:**
Complete VibeTestContext interface documentation.

**Content Outline:**
1. Overview
2. Full interface definition
3. Properties:
   - runAgent(opts): AgentExecution
   - judge<T>(...): Promise<T>
   - expect: typeof expect
   - annotate(...): Promise<void>
   - task: TestContext['task']
   - files: FilesAccessor
   - tools: ToolsAccessor
   - timeline: TimelineAccessor
4. FilesAccessor interface (full)
5. ToolsAccessor interface (full)
6. TimelineAccessor interface (full)
7. Usage examples
8. Type guards
9. Related types

**Spec Sections:**
- Section 1.1 (VibeTestContext)

---

#### api/types/workflow-context.mdx

**Category:** Type Reference
**Length:** 500-700 lines

**Purpose:**
Complete WorkflowContext interface documentation.

**Content Outline:**
1. Overview
2. Full interface
3. Methods and properties
4. Files accessor (by stage)
5. Tools accessor (with stage context)
6. Timeline accessor (with stage context)
7. until() helper
8. defaults
9. Usage examples

**Spec Sections:**
- Section 1.4 (WorkflowContext)

---

#### api/types/agent-execution.mdx

**Category:** Type Reference
**Length:** 700-900 lines

**Purpose:**
Complete AgentExecution class documentation.

**Content Outline:**
1. Overview
2. Class definition
3. Thenable behavior (not Promise subclass)
4. Methods:
   - watch(fn): this
   - then(...): Promise<RunResult>
   - catch(...): Promise<...>
   - finally(...): Promise<RunResult>
   - abort(reason?): void
5. WatcherFn type
6. Execution guarantees
7. Usage examples
8. Type guards

**Spec Sections:**
- Section 1.2 (AgentExecution)

---

#### api/types/run-result.mdx

**Category:** Type Reference
**Length:** 900-1100 lines

**Purpose:**
Complete RunResult interface documentation.

**Content Outline:**
1. Overview
2. Full interface (all fields)
3. Properties:
   - bundleDir
   - metrics
   - messages (with load())
   - todos
   - git (before/after, diffSummary())
   - files (FilesAccessor)
   - tools (ToolsAccessor)
   - timeline (TimelineAccessor)
   - hookCaptureStatus
   - annotate?()
4. Lazy loading design
5. Usage examples
6. Type guards

**Spec Sections:**
- Section 1.5 (RunResult)

---

#### api/types/partial-result.mdx

**Category:** Type Reference
**Length:** 400-600 lines

**Purpose:**
Complete PartialRunResult interface documentation.

**Content Outline:**
1. Overview (used by watchers)
2. Full interface
3. Properties (in-progress metrics)
4. Difference from RunResult
5. Usage in watchers
6. Examples

**Spec Sections:**
- Section 1.3 (PartialRunResult)

---

#### api/types/file-change.mdx

**Category:** Type Reference
**Length:** 500-700 lines

**Purpose:**
Complete FileChange interface documentation.

**Content Outline:**
1. Overview
2. Full interface
3. Properties:
   - path
   - changeType
   - oldPath
   - before (lazy)
   - after (lazy)
   - stats
   - patch()
4. Lazy loading (text() vs stream())
5. Usage examples
6. When to use text() vs stream()

**Spec Sections:**
- Section 1.6 (FileChange)

---

#### api/types/tool-call.mdx

**Category:** Type Reference
**Length:** 400-600 lines

**Purpose:**
Complete ToolCall interface documentation.

**Content Outline:**
1. Overview
2. Full interface
3. Properties
4. Correlation from hooks
5. Usage examples

**Spec Sections:**
- Section 1.7 (ToolCall)

---

#### api/types/rubric.mdx

**Category:** Type Reference
**Length:** 600-800 lines

**Purpose:**
Complete Rubric and DefaultJudgmentResult documentation.

**Content Outline:**
1. Overview
2. Rubric interface (full)
3. DefaultJudgmentResult interface (full)
4. Examples (simple, weighted, threshold)
5. Runtime validation (RubricSchema)
6. Usage with judge()

**Spec Sections:**
- Section 1.10 (Rubric, DefaultJudgmentResult)
- Section 5.4 (RubricSchema)

---

#### api/types/configuration.mdx

**Category:** Type Reference
**Length:** 700-900 lines

**Purpose:**
Complete configuration type documentation.

**Content Outline:**
1. Overview
2. AgentConfig interface (full)
3. RunAgentOptions interface (full)
4. MCPServerConfig interface (full)
5. DEFAULT_MODEL constant
6. Usage examples

**Spec Sections:**
- Section 1.12 (AgentConfig)
- Section 1.9 (RunAgentOptions, MCPServerConfig)
- Section 1.13 (DEFAULT_MODEL)

---

### API REFERENCE - Utilities

#### api/utilities/matchers.mdx

**Category:** Reference
**Length:** 700-900 lines

**Purpose:**
Complete custom matchers reference.

**Content Outline:**
1. Overview
2. File matchers:
   - toHaveChangedFiles(paths)
   - toHaveNoDeletedFiles()
3. Tool matchers:
   - toHaveUsedTool(name, opts?)
   - toUseOnlyTools(allowlist)
4. Quality matchers:
   - toCompleteAllTodos()
   - toHaveNoErrorsInLogs()
   - toPassRubric(rubric)
5. Cost matchers:
   - toStayUnderCost(maxUsd)
6. Hook matchers:
   - toHaveCompleteHookData()
7. Usage examples for each
8. Type definitions
9. Comparison: matchers vs judge

**Spec Sections:**
- Section 2.8 (Custom matchers)

---

#### api/utilities/config.mdx

**Category:** Reference
**Length:** 400-500 lines

**Purpose:**
defineVibeConfig reference.

**Content Outline:**
1. Overview
2. Signature
3. Default configuration
4. Customization options
5. Cleanup configuration
6. Reporter configuration
7. Examples

**Spec Sections:**
- Section 2.7 (defineVibeConfig)
- Section 3.5 (Cleanup config)

---

### EXPLANATION (Explanation Section)

#### explanation/index.mdx

**Category:** Explanation Hub
**Length:** 150-200 lines

**Purpose:**
Hub for conceptual and architectural documentation.

**Content Outline:**
1. Overview of explanation docs
2. Core concepts
3. Architecture
4. Design decisions
5. Navigation

---

#### explanation/concepts/dual-api.mdx

**Category:** Explanation
**Length:** 500-600 lines

**Purpose:**
Explain why vibe-check has two APIs (vibeTest and vibeWorkflow).

**Content Outline:**
1. The dual purpose:
   - Automation suite
   - Evaluation framework
2. vibeTest design:
   - Testing-focused
   - Quality gates
   - Benchmarking
3. vibeWorkflow design:
   - Automation-focused
   - Multi-stage pipelines
   - Production use
4. Shared primitives
5. When to use which
6. Design rationale

**Spec Sections:**
- Introduction (dual purpose)
- Section 2.1 vs 2.2

---

#### explanation/concepts/auto-capture.mdx

**Category:** Explanation
**Length:** 600-700 lines

**Purpose:**
Explain the automatic context capture system.

**Content Outline:**
1. The problem: Manual artifact management
2. The solution: Auto-capture via hooks
3. What gets captured:
   - Git state
   - File changes
   - Tool calls
   - Hook events
   - Metrics
4. How it works:
   - Hook integration
   - ContextManager lifecycle
   - Correlation (Pre + Post)
5. Benefits:
   - No manual tracking
   - Rich reporting
   - Deep assertions
6. Design philosophy

**Spec Sections:**
- Section 4.1 (Hook capture protocol)
- Section 4.2 (ContextManager)

---

#### explanation/concepts/lazy-loading.mdx

**Category:** Explanation
**Length:** 500-600 lines

**Purpose:**
Explain the memory-efficient lazy loading design.

**Content Outline:**
1. The problem: Loading 100+ files into memory
2. The solution: Lazy accessors
3. How it works:
   - Content-addressed storage
   - SHA256 hashing
   - text() vs stream()
   - Decompression (gzip)
4. Benefits:
   - Memory efficiency
   - Scalability
   - Performance
5. When to use text() vs stream()
6. Design tradeoffs

**Spec Sections:**
- Section 1.6 (FileChange lazy loading)
- Section 3.1 (RunBundle structure)

---

#### explanation/architecture/overview.mdx

**Category:** Explanation
**Length:** 800-1000 lines

**Purpose:**
High-level system architecture overview.

**Content Outline:**
1. System overview
2. Core principles
3. Key components:
   - User-facing API
   - ContextManager
   - RunBundle (disk)
   - Vitest integration
4. Context flow (capture → process → inject)
5. Lifecycle diagram
6. Component interactions

**Spec Sections:**
- Architecture Overview section from spec

---

#### explanation/architecture/context-manager.mdx

**Category:** Explanation
**Length:** 700-900 lines

**Purpose:**
Detailed ContextManager implementation explanation.

**Content Outline:**
1. What is ContextManager?
2. Responsibilities
3. Lifecycle:
   - Setup
   - Capture
   - Process
   - Finalize
4. Event handlers
5. Correlation algorithm
6. File change detection
7. Implementation details

**Spec Sections:**
- Section 4.2 (ContextManager API)
- Section 6.1 (Tool call correlation algorithm)

---

#### explanation/architecture/run-bundle.mdx

**Category:** Explanation
**Length:** 600-700 lines

**Purpose:**
Explain RunBundle storage structure.

**Content Outline:**
1. What is a RunBundle?
2. Directory structure
3. File formats:
   - events.ndjson
   - hooks.ndjson
   - summary.json
   - files/ (content-addressed)
4. Design decisions:
   - NDJSON for streaming
   - Content addressing
   - Gzip compression
5. Benefits
6. Cleanup policy

**Spec Sections:**
- Section 3.1 (RunBundle structure)
- Section 3.2 (summary.json schema)
- Section 3.5 (Cleanup policy)

---

#### explanation/architecture/hook-integration.mdx

**Category:** Explanation
**Length:** 600-700 lines

**Purpose:**
Explain Claude Code hook integration.

**Content Outline:**
1. What are Claude Code hooks?
2. Data sources (SDK + hooks)
3. Hook capture pattern
4. Hook script implementation
5. Correlation algorithm
6. Graceful degradation
7. Error handling

**Spec Sections:**
- Section 4.1 (Hook capture protocol)
- Section 4.2.2 (Error handling)

---

#### explanation/design/why-vitest.mdx

**Category:** Explanation
**Length:** 500-600 lines

**Purpose:**
Explain why Vitest v3 was chosen.

**Content Outline:**
1. Requirements
2. Vitest v3 benefits:
   - Fast
   - TypeScript-first
   - Fixtures
   - Reporters
   - Concurrent
3. Design alignment
4. Alternatives considered

**Spec Sections:**
- Design decisions doc

---

#### explanation/design/storage-strategy.mdx

**Category:** Explanation
**Length:** 600-700 lines

**Purpose:**
Explain storage strategy (disk bundle + thin meta).

**Content Outline:**
1. Requirements
2. Alternatives evaluated:
   - All in task.meta (rejected)
   - Only fixture state (rejected)
   - Global singleton (rejected)
   - Hybrid (chosen)
3. Hybrid approach:
   - Disk bundle (source of truth)
   - Thin meta (summary + pointer)
   - Lazy accessors (test code)
4. Benefits
5. Tradeoffs

**Spec Sections:**
- Storage strategy from design decisions
- Section 4.3 (Reporter interface)

---

#### explanation/design/thenable-pattern.mdx

**Category:** Explanation
**Length:** 500-600 lines

**Purpose:**
Explain AgentExecution thenable design.

**Content Outline:**
1. The problem: Reactive testing
2. Why not Promise subclass?
3. Thenable pattern:
   - Fully awaitable
   - Custom methods (watch, abort)
   - Works with Promise.all/race
4. Benefits
5. Implementation notes

**Spec Sections:**
- Section 1.2 (AgentExecution)
- v1.4-alpha.2 changelog

---

#### explanation/design/graceful-degradation.mdx

**Category:** Explanation
**Length:** 500-600 lines

**Purpose:**
Explain graceful degradation error handling policy.

**Content Outline:**
1. The philosophy: Tests pass/fail on assertions, not infrastructure
2. Graceful degradation:
   - Hook failures → warnings, not errors
   - Git detection failures → continue
   - Partial data → flag in hookCaptureStatus
3. User control:
   - toHaveCompleteHookData() for strict mode
4. Error logging standards
5. Troubleshooting
6. Design rationale

**Spec Sections:**
- Section 4.2.2 (Error handling & git detection)
- Section 7.1 (Graceful degradation policy)

---

## 3. Sidebar Configuration

```typescript
// astro.config.mjs
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

export default defineConfig({
  integrations: [
    starlight({
      title: 'Vibe Check',
      description: 'Automation and Evaluation framework for Claude Code agents',
      social: {
        github: 'https://github.com/DAOresearch/vibe-check',
      },
      sidebar: [
        {
          label: 'Getting Started',
          items: [
            { label: 'Overview', link: '/getting-started/' },
            { label: 'Installation', link: '/getting-started/installation/' },
            { label: 'Quickstart', link: '/getting-started/quickstart/' },
            { label: 'First Test', link: '/getting-started/first-test/' },
            { label: 'First Automation', link: '/getting-started/first-automation/' },
            { label: 'First Evaluation', link: '/getting-started/first-evaluation/' },
          ],
        },
        {
          label: 'Guides',
          items: [
            { label: 'Overview', link: '/guides/' },
            {
              label: 'Testing',
              collapsed: true,
              items: [
                { label: 'Reactive Watchers', link: '/guides/testing/reactive-watchers/' },
                { label: 'Cumulative State', link: '/guides/testing/cumulative-state/' },
                { label: 'Custom Matchers', link: '/guides/testing/custom-matchers/' },
                { label: 'Matrix Testing', link: '/guides/testing/matrix-testing/' },
              ],
            },
            {
              label: 'Automation',
              collapsed: true,
              items: [
                { label: 'Building Workflows', link: '/guides/automation/building-workflows/' },
                { label: 'Loop Patterns', link: '/guides/automation/loop-patterns/' },
                { label: 'Error Handling', link: '/guides/automation/error-handling/' },
              ],
            },
            {
              label: 'Evaluation',
              collapsed: true,
              items: [
                { label: 'Using Judge', link: '/guides/evaluation/using-judge/' },
                { label: 'Creating Rubrics', link: '/guides/evaluation/rubrics/' },
                { label: 'Benchmarking', link: '/guides/evaluation/benchmarking/' },
              ],
            },
            {
              label: 'Advanced',
              collapsed: true,
              items: [
                { label: 'MCP Servers', link: '/guides/advanced/mcp-servers/' },
                { label: 'Cost Optimization', link: '/guides/advanced/cost-optimization/' },
                { label: 'Bundle Cleanup', link: '/guides/advanced/bundle-cleanup/' },
                { label: 'Multi-Modal Prompts', link: '/guides/advanced/multi-modal-prompts/' },
              ],
            },
          ],
        },
        {
          label: 'API Reference',
          collapsed: true,
          items: [
            { label: 'Overview', link: '/api/' },
            {
              label: 'Core API',
              collapsed: true,
              items: [
                { label: 'vibeTest', link: '/api/core/vibetest/' },
                { label: 'vibeWorkflow', link: '/api/core/vibeworkflow/' },
                { label: 'runAgent', link: '/api/core/runagent/' },
                { label: 'defineAgent', link: '/api/core/defineagent/' },
                { label: 'judge', link: '/api/core/judge/' },
                { label: 'prompt', link: '/api/core/prompt/' },
              ],
            },
            {
              label: 'Type Definitions',
              collapsed: true,
              items: [
                { label: 'Overview', link: '/api/types/' },
                { label: 'VibeTestContext', link: '/api/types/test-context/' },
                { label: 'WorkflowContext', link: '/api/types/workflow-context/' },
                { label: 'AgentExecution', link: '/api/types/agent-execution/' },
                { label: 'RunResult', link: '/api/types/run-result/' },
                { label: 'PartialRunResult', link: '/api/types/partial-result/' },
                { label: 'FileChange', link: '/api/types/file-change/' },
                { label: 'ToolCall', link: '/api/types/tool-call/' },
                { label: 'Rubric', link: '/api/types/rubric/' },
                { label: 'Configuration', link: '/api/types/configuration/' },
              ],
            },
            {
              label: 'Utilities',
              collapsed: true,
              items: [
                { label: 'Custom Matchers', link: '/api/utilities/matchers/' },
                { label: 'defineVibeConfig', link: '/api/utilities/config/' },
              ],
            },
          ],
        },
        {
          label: 'Explanation',
          collapsed: true,
          items: [
            { label: 'Overview', link: '/explanation/' },
            {
              label: 'Core Concepts',
              collapsed: true,
              items: [
                { label: 'Dual API Design', link: '/explanation/concepts/dual-api/' },
                { label: 'Auto-Capture System', link: '/explanation/concepts/auto-capture/' },
                { label: 'Lazy Loading', link: '/explanation/concepts/lazy-loading/' },
              ],
            },
            {
              label: 'Architecture',
              collapsed: true,
              items: [
                { label: 'Overview', link: '/explanation/architecture/overview/' },
                { label: 'ContextManager', link: '/explanation/architecture/context-manager/' },
                { label: 'RunBundle Structure', link: '/explanation/architecture/run-bundle/' },
                { label: 'Hook Integration', link: '/explanation/architecture/hook-integration/' },
              ],
            },
            {
              label: 'Design Decisions',
              collapsed: true,
              items: [
                { label: 'Why Vitest', link: '/explanation/design/why-vitest/' },
                { label: 'Storage Strategy', link: '/explanation/design/storage-strategy/' },
                { label: 'Thenable Pattern', link: '/explanation/design/thenable-pattern/' },
                { label: 'Graceful Degradation', link: '/explanation/design/graceful-degradation/' },
              ],
            },
          ],
        },
      ],
    }),
  ],
});
```

---

## 4. Content Mapping Matrix

| Spec Section | Category | Primary Doc Page(s) | Supporting Pages | Priority |
|--------------|----------|---------------------|------------------|----------|
| 1.1 VibeTestContext | Reference | api/types/test-context.mdx | api/core/vibeTest.mdx | P0 |
| 1.2 AgentExecution | Reference | api/types/agent-execution.mdx | api/core/runAgent.mdx, guides/testing/reactive-watchers.mdx | P0 |
| 1.3 PartialRunResult | Reference | api/types/partial-result.mdx | guides/testing/reactive-watchers.mdx | P0 |
| 1.4 WorkflowContext | Reference | api/types/workflow-context.mdx | api/core/vibeWorkflow.mdx | P0 |
| 1.5 RunResult | Reference | api/types/run-result.mdx | All API pages | P0 |
| 1.6 FileChange | Reference | api/types/file-change.mdx | - | P1 |
| 1.7 ToolCall | Reference | api/types/tool-call.mdx | - | P1 |
| 1.8 TimelineEvent | Reference | api/types/run-result.mdx (timeline section) | - | P1 |
| 1.9 RunAgentOptions | Reference | api/core/runAgent.mdx, api/types/configuration.mdx | - | P0 |
| 1.10 Rubric | Reference | api/types/rubric.mdx | api/core/judge.mdx, guides/evaluation/rubrics.mdx | P0 |
| 1.12 AgentConfig | Reference | api/types/configuration.mdx | api/core/defineAgent.mdx | P0 |
| 1.13 DEFAULT_MODEL | Reference | api/types/configuration.mdx | guides/advanced/cost-optimization.mdx | P1 |
| 2.1 vibeTest | Reference | api/core/vibeTest.mdx | getting-started/first-test.mdx | P0 |
| 2.2 vibeWorkflow | Reference | api/core/vibeWorkflow.mdx | getting-started/first-automation.mdx | P0 |
| 2.3 defineAgent | Reference | api/core/defineAgent.mdx | - | P0 |
| 2.4 Standalone Functions | Reference | api/core/runAgent.mdx, api/core/judge.mdx, api/core/prompt.mdx | - | P0 |
| 2.6 defineTestSuite | Guide | guides/testing/matrix-testing.mdx | getting-started/first-evaluation.mdx | P1 |
| 2.7 defineVibeConfig | Reference | api/utilities/config.mdx | getting-started/installation.mdx | P1 |
| 2.8 Custom Matchers | Reference | api/utilities/matchers.mdx | guides/testing/custom-matchers.mdx | P0 |
| 2.9 MCP Server Examples | Guide | guides/advanced/mcp-servers.mdx | api/types/configuration.mdx | P1 |
| 3.1-3.2 RunBundle | Explanation | explanation/architecture/run-bundle.mdx | - | P2 |
| 3.5 Bundle Cleanup | Guide | guides/advanced/bundle-cleanup.mdx | - | P1 |
| 4.1 Hook Capture | Explanation | explanation/architecture/hook-integration.mdx | - | P2 |
| 4.2 ContextManager | Explanation | explanation/architecture/context-manager.mdx | - | P2 |
| 4.2.2 Error Handling | Explanation + Guide | explanation/design/graceful-degradation.mdx, guides/automation/error-handling.mdx | - | P1 |
| 4.3 Reporter Interface | Explanation | (No dedicated page, mentioned in architecture) | - | P3 |
| 5.1 Dependencies | Tutorial | getting-started/installation.mdx | - | P0 |
| 5.6 Cost Optimization | Guide | guides/advanced/cost-optimization.mdx | - | P1 |
| 6.1-6.5 Algorithms | Explanation | explanation/architecture/context-manager.mdx | - | P2 |
| 7.1 Graceful Degradation | Explanation | explanation/design/graceful-degradation.mdx | - | P2 |

**Coverage Validation:**
- ✅ All spec sections (1.1-7.1) mapped
- ✅ No gaps
- ✅ Clear primary vs supporting pages
- ✅ Priority flags for implementation order

---

## 5. Cross-Reference Graph

### Entry Points (No Prerequisites)

```
Homepage (index.mdx)
  ├→ getting-started/index.mdx
  ├→ guides/index.mdx
  ├→ api/index.mdx
  └→ explanation/index.mdx
```

### Tutorial Flow (Learning Path)

```
getting-started/installation.mdx
  ↓
getting-started/quickstart.mdx
  ↓
  ├→ getting-started/first-test.mdx
  │   ↓
  │   ├→ guides/testing/reactive-watchers.mdx
  │   ├→ guides/testing/cumulative-state.mdx
  │   └→ guides/testing/custom-matchers.mdx
  │
  ├→ getting-started/first-automation.mdx
  │   ↓
  │   ├→ guides/automation/building-workflows.mdx
  │   ├→ guides/automation/loop-patterns.mdx
  │   └→ guides/automation/error-handling.mdx
  │
  └→ getting-started/first-evaluation.mdx
      ↓
      ├→ guides/evaluation/using-judge.mdx
      ├→ guides/evaluation/rubrics.mdx
      └→ guides/evaluation/benchmarking.mdx
```

### Reference Dependencies

```
api/core/vibeTest.mdx
  → api/types/test-context.mdx
  → api/types/agent-execution.mdx
  → api/types/run-result.mdx

api/core/runAgent.mdx
  → api/types/agent-execution.mdx
  → api/types/partial-result.mdx
  → api/types/run-result.mdx
  → api/types/configuration.mdx

api/core/judge.mdx
  → api/types/rubric.mdx
  → api/types/run-result.mdx

api/types/agent-execution.mdx
  → api/types/partial-result.mdx
```

### Bidirectional Links

Every page should have:
- **Links FROM:** Pages it references (dependencies)
- **Links TO:** Pages that reference it (usage)
- **Related:** Sibling pages in same category

**Example: guides/testing/reactive-watchers.mdx**
- Links FROM (dependencies):
  - getting-started/first-test.mdx (prerequisite)
  - api/types/agent-execution.mdx (reference)
  - api/types/partial-result.mdx (reference)
- Links TO (used by):
  - guides/testing/cumulative-state.mdx (related)
  - guides/automation/building-workflows.mdx (advanced)
- Related:
  - guides/testing/custom-matchers.mdx
  - guides/testing/matrix-testing.mdx

---

## 6. Implementation Order

### Phase 1: Critical Path (Week 1) - 20 hours

**Goal:** Users can install and run first test

**Day 1-2: Setup & Installation (6 hours)**
1. Homepage: index.mdx
2. About: about-documentation.mdx
3. Getting Started Hub: getting-started/index.mdx
4. Installation: getting-started/installation.mdx
5. Quickstart: getting-started/quickstart.mdx

**Day 3-4: Core Reference (10 hours)**
6. API Hub: api/index.mdx
7. vibeTest: api/core/vibeTest.mdx
8. runAgent: api/core/runAgent.mdx
9. Core types:
   - api/types/index.mdx
   - api/types/test-context.mdx
   - api/types/agent-execution.mdx
   - api/types/run-result.mdx
   - api/types/partial-result.mdx

**Day 5: First Tutorial (4 hours)**
10. First Test: getting-started/first-test.mdx

**Validation:**
- User can: install → quickstart → first test
- All links work
- Code examples run
- No TypeScript errors

---

### Phase 2: Core Features (Week 2) - 18 hours

**Goal:** Users can build automations and use judge

**Day 1-2: Automation (8 hours)**
1. vibeWorkflow: api/core/vibeWorkflow.mdx
2. WorkflowContext: api/types/workflow-context.mdx
3. First Automation: getting-started/first-automation.mdx
4. Building Workflows: guides/automation/building-workflows.mdx

**Day 3-4: Evaluation (8 hours)**
5. judge: api/core/judge.mdx
6. prompt: api/core/prompt.mdx
7. Rubric type: api/types/rubric.mdx
8. Using Judge: guides/evaluation/using-judge.mdx
9. Creating Rubrics: guides/evaluation/rubrics.mdx
10. First Evaluation: getting-started/first-evaluation.mdx

**Day 5: Matchers (2 hours)**
11. Custom Matchers: api/utilities/matchers.mdx
12. Matchers Guide: guides/testing/custom-matchers.mdx

**Validation:**
- Users can build workflows
- Users can use judge
- Examples work

---

### Phase 3: Testing Guides (Week 3) - 10 hours

**Goal:** Advanced testing patterns documented

1. Reactive Watchers: guides/testing/reactive-watchers.mdx (3 hours)
2. Cumulative State: guides/testing/cumulative-state.mdx (3 hours)
3. Matrix Testing: guides/testing/matrix-testing.mdx (2 hours)
4. Loop Patterns: guides/automation/loop-patterns.mdx (2 hours)

---

### Phase 4: Advanced Guides (Week 3-4) - 12 hours

**Goal:** Advanced features fully documented

1. MCP Servers: guides/advanced/mcp-servers.mdx (3 hours)
2. Cost Optimization: guides/advanced/cost-optimization.mdx (3 hours)
3. Bundle Cleanup: guides/advanced/bundle-cleanup.mdx (2 hours)
4. Multi-Modal Prompts: guides/advanced/multi-modal-prompts.mdx (2 hours)
5. Error Handling: guides/automation/error-handling.mdx (2 hours)

---

### Phase 5: Remaining Types & Config (Week 4) - 8 hours

**Goal:** Complete type reference

1. defineAgent: api/core/defineAgent.mdx (2 hours)
2. Configuration types: api/types/configuration.mdx (2 hours)
3. FileChange: api/types/file-change.mdx (1 hour)
4. ToolCall: api/types/tool-call.mdx (1 hour)
5. defineVibeConfig: api/utilities/config.mdx (1 hour)
6. Benchmarking: guides/evaluation/benchmarking.mdx (1 hour)

---

### Phase 6: Explanation (Week 4-5) - 12 hours

**Goal:** Architecture & concepts documented

**Concepts (4 hours)**
1. Explanation Hub: explanation/index.mdx
2. Concepts Hub: explanation/concepts/index.mdx
3. Dual API: explanation/concepts/dual-api.mdx
4. Auto-Capture: explanation/concepts/auto-capture.mdx
5. Lazy Loading: explanation/concepts/lazy-loading.mdx

**Architecture (6 hours)**
6. Architecture Hub: explanation/architecture/index.mdx
7. Overview: explanation/architecture/overview.mdx
8. ContextManager: explanation/architecture/context-manager.mdx
9. RunBundle: explanation/architecture/run-bundle.mdx
10. Hook Integration: explanation/architecture/hook-integration.mdx

**Design (2 hours)**
11. Design Hub: explanation/design/index.mdx
12. Why Vitest: explanation/design/why-vitest.mdx
13. Storage Strategy: explanation/design/storage-strategy.mdx
14. Thenable Pattern: explanation/design/thenable-pattern.mdx
15. Graceful Degradation: explanation/design/graceful-degradation.mdx

---

### Phase 7: Hubs & Polish (Week 5) - 4 hours

**Goal:** Complete navigation, polish

1. Guides Hub: guides/index.mdx
2. Testing Hub: guides/testing/index.mdx
3. Automation Hub: guides/automation/index.mdx
4. Evaluation Hub: guides/evaluation/index.mdx
5. Advanced Hub: guides/advanced/index.mdx
6. Final link validation
7. Search optimization
8. Mobile testing

---

**Total Estimated Effort: 84 hours (10-11 working days)**

**Dependencies:**
- Phase 1 must complete before others (installation prerequisite)
- Phase 2 builds on Phase 1
- Phases 3-6 can run in parallel (different categories)
- Phase 7 requires all others complete

---

## 7. Frontmatter Standards

### Standard Template

```yaml
---
title: Page Title (50 chars max, capitalize major words)
description: One sentence SEO description (155 chars max)
sidebar:
  order: 1  # Position within parent group
---
```

### Tutorial Pages

```yaml
---
title: Installation
description: Install and configure vibe-check for your project
sidebar:
  order: 1
  badge:
    text: Tutorial
    variant: note
---
```

### How-To Guide Pages

```yaml
---
title: Reactive Watchers
description: Implement fail-fast testing with reactive watchers
sidebar:
  order: 1
  badge:
    text: Guide
    variant: tip
---
```

### Reference Pages

```yaml
---
title: vibeTest
description: Complete API reference for the vibeTest function
sidebar:
  order: 1
# No badge for reference pages
---
```

### Explanation Pages

```yaml
---
title: Auto-Capture System
description: Understanding how vibe-check automatically captures execution context
sidebar:
  order: 1
  badge:
    text: Concept
    variant: caution
---
```

### Hub Pages

```yaml
---
title: Getting Started
description: Tutorials to help you get started with vibe-check
sidebar:
  order: 0
---
```

---

## 8. Validation Checklist

### Completeness

- [x] All 47 pages defined
- [x] Every spec section (1.1-7.1) mapped
- [x] All 12 critical API mismatches addressed:
  - [x] Rubric structure (array, not object)
  - [x] AgentExecution return type
  - [x] Cumulative state accessors
  - [x] prompt() API (images/files)
  - [x] hookCaptureStatus field
  - [x] Bundle cleanup policy
  - [x] MCP server examples
  - [x] DEFAULT_MODEL constant
  - [x] AgentConfig interface
  - [x] Watcher execution guarantees
  - [x] Timeline batching
  - [x] Error handling & graceful degradation
- [x] All new v1.4 features documented:
  - [x] AgentExecution class
  - [x] Reactive watchers (.watch())
  - [x] Cumulative state (files, tools, timeline)
  - [x] Bundle cleanup (cleanupBundles)
  - [x] PartialRunResult
  - [x] hookCaptureStatus
  - [x] Graceful degradation policy

### Diátaxis Compliance

- [x] Tutorials: Learning-oriented, step-by-step (5 pages)
- [x] How-To Guides: Task-oriented, problem-solving (16 pages)
- [x] Reference: Information-oriented, accurate (18 pages)
- [x] Explanation: Understanding-oriented, conceptual (8 pages)
- [x] No category mixing
- [x] Clear category assignment for each page

### Navigation & UX

- [x] Installation within 1 click from homepage
- [x] Progressive disclosure (basic → advanced)
- [x] Clear learning paths (tutorial → guide → reference)
- [x] Logical sidebar hierarchy
- [x] All pages have "next steps" links
- [x] Cross-references form valid graph (no orphans)
- [x] Search-friendly titles and descriptions

### Starlight Requirements

- [x] Valid Astro Starlight configuration
- [x] Sidebar navigation complete
- [x] Page ordering logical
- [x] Frontmatter follows Starlight conventions
- [x] Link format correct (`/path/to/page/`)

### Specification Alignment

- [x] All type definitions match spec v1.4 Section 1
- [x] All API signatures match spec v1.4 Section 2
- [x] All examples from spec v1.4 used
- [x] Breaking changes from v1.4 changelogs addressed
- [x] No v1.2/v1.3 artifacts

---

## 9. Success Metrics

### Documentation Quality

- User can complete installation → first test in <15 minutes
- User can find answer to question in <3 clicks
- All code examples are copy-paste ready
- Zero TypeScript errors in code blocks
- 100% spec coverage (all sections mapped)

### User Experience

- Mobile-friendly navigation
- Fast search results
- Clear cross-references
- Progressive disclosure (beginner → expert)
- Consistent terminology with spec

### Implementation Readiness

- Writer can pick up any page and write it (clear outline)
- Spec sections clearly mapped (no ambiguity)
- Examples sourced from spec (no invention needed)
- Cross-references identified (link targets clear)

---

## Appendices

### Appendix A: Spec Section Quick Reference

```
SECTION 1: CORE TYPE DEFINITIONS
1.1  VibeTestContext         → api/types/test-context.mdx
1.2  AgentExecution          → api/types/agent-execution.mdx
1.3  PartialRunResult        → api/types/partial-result.mdx
1.4  WorkflowContext         → api/types/workflow-context.mdx
1.5  RunResult               → api/types/run-result.mdx
1.6  FileChange              → api/types/file-change.mdx
1.7  ToolCall                → api/types/tool-call.mdx
1.8  TimelineEvent           → api/types/run-result.mdx
1.9  RunAgentOptions         → api/types/configuration.mdx
1.10 Rubric & JudgeResult    → api/types/rubric.mdx
1.12 AgentConfig             → api/types/configuration.mdx
1.13 Constants (DEFAULT_MODEL) → api/types/configuration.mdx

SECTION 2: API SIGNATURES
2.1  vibeTest                → api/core/vibeTest.mdx
2.2  vibeWorkflow            → api/core/vibeWorkflow.mdx
2.3  defineAgent             → api/core/defineAgent.mdx
2.4  Standalone Functions    → api/core/runAgent.mdx, judge.mdx, prompt.mdx
2.6  defineTestSuite         → guides/testing/matrix-testing.mdx
2.7  defineVibeConfig        → api/utilities/config.mdx
2.8  Custom Matchers         → api/utilities/matchers.mdx
2.9  MCP Server Examples     → guides/advanced/mcp-servers.mdx

SECTION 3: STORAGE & DATA CONTRACTS
3.1-3.2 RunBundle Structure  → explanation/architecture/run-bundle.mdx
3.5  Bundle Cleanup          → guides/advanced/bundle-cleanup.mdx

SECTION 4: INTEGRATION CONTRACTS
4.1  Hook Capture Protocol   → explanation/architecture/hook-integration.mdx
4.2  ContextManager API      → explanation/architecture/context-manager.mdx
4.2.2 Error Handling         → explanation/design/graceful-degradation.mdx
4.3  Reporter Interface      → (Mentioned in architecture overview)

SECTION 5: IMPLEMENTATION REQUIREMENTS
5.1  Dependencies            → getting-started/installation.mdx
5.6  Cost Optimization       → guides/advanced/cost-optimization.mdx

SECTION 6: KEY ALGORITHMS
6.1-6.5 (All)                → explanation/architecture/context-manager.mdx

SECTION 7: ERROR HANDLING
7.1  Graceful Degradation    → explanation/design/graceful-degradation.mdx
```

### Appendix B: Breaking Changes from v1.2/v1.3

These changes MUST be documented in migration guides:

**v1.4-beta.1 (Rubric unification):**
- Rubric changed from object to array structure
- `criteria: { name: {...} }` → `criteria: [{ name, description, weight }]`
- Removed: validateRubric(), createStructuredRubric()
- Migration guide needed in api/core/judge.mdx

**v1.4-alpha.2 (AgentExecution):**
- runAgent() returns AgentExecution (not Promise<RunResult>)
- Thenable class, not Promise subclass
- Added: .watch(), .abort() methods
- Migration guide needed in api/core/runAgent.mdx

**v1.4-alpha.1 (SDK integration):**
- prompt() renamed: attachments → images + files
- Return type: AsyncIterable<SDKUserMessage>
- Migration guide needed in api/core/prompt.mdx

**All documented in relevant API reference pages with migration examples.**

### Appendix C: Examples Inventory

All code examples sourced from spec v1.4:

**From Section 2.1 (vibeTest):**
- Basic test (line 1015)
- Reactive watchers (line 1022-1036)
- Cumulative state (line 1042-1072)
- With judge (line 1078-1104)

**From Section 2.2 (vibeWorkflow):**
- Sequential pipeline (examples throughout)
- until() loops (examples)

**From Section 2.4 (judge):**
- All judge examples (multiple throughout)

**From Section 2.9 (MCP servers):**
- Database server example (line 1406-1418)
- Filesystem server (line 1421-1434)
- Multiple servers (line 1437-1464)

**From Section 6.5 (prompt):**
- Multi-modal examples (implementation section)

**Total: 50+ code examples, all from spec v1.4**

---

## Final Notes

### Implementation Workflow

1. **Review & Approve Plan:** Stakeholders review this plan
2. **Set Up Tracking:** Create GitHub issues/project board for 47 pages
3. **Parallel Execution:**
   - Phase 1-2 (critical path): Sequential
   - Phase 3-6 (categories): Parallel (4 writers)
4. **Validation:** After each phase, validate checklist
5. **Final Audit:** Run through entire site before launch

### Quality Assurance

- **Code Examples:** All must be tested and work
- **Links:** Automated link checking
- **Types:** TypeScript validation of all code blocks
- **Search:** Test search for common queries
- **Mobile:** Test navigation on mobile

### Maintenance

- **Single Source of Truth:** Spec v1.4 is authoritative
- **Update Process:** Spec changes → docs PRs
- **Versioning:** Docs versioned with releases
- **Feedback:** GitHub Discussions for doc feedback

---

**End of Documentation Structure Plan v1.4**

**Status:** ✅ Complete and ready for implementation

**Next Steps:**
1. Review plan with stakeholders
2. Create implementation tracking (GitHub Project)
3. Assign pages to writers
4. Begin Phase 1 (critical path)
5. Iterate based on feedback

**Questions? Contact:** [Project maintainers]
