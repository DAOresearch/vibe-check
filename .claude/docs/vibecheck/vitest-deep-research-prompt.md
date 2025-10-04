# Vitest Deep Research - Maximizing API Surface for Automation & DX Excellence

## Mission

You are tasked with **comprehensive research into Vitest** to discover innovative ways to leverage its **full API surface** for building the best possible developer experience in `@dao/vibe-check`. This is not just about testing—it's about **automation, orchestration, and developer ergonomics**.

Your mission is to go **deep** into Vitest's capabilities and return with:
1. **Novel API surface opportunities** we're not currently using
2. **Alternative approaches** to our current reporter-based automation
3. **Composable primitive patterns** for building pipelines beyond tests
4. **DX innovations** that could differentiate vibe-check from other frameworks

This is **research-driven innovation**: explore, analyze, synthesize, and recommend concrete implementations.

---

## What is vibe-check?

`@dao/vibe-check` is a **dual-purpose framework** built on Vitest v3:

### Dual Identity
1. **Automation Suite** - Run agent pipelines, orchestrate multi-agent workflows, production-grade reporting
2. **Evaluation Framework** - Benchmark models/configs/prompts, matrix testing, quality gates

### Current Vitest Usage
- **Fixtures**: `runAgent`, `judge`, `artifacts`, `metrics` exposed via `vibeTest`
- **Reporters**: Custom reporters for terminal cost tracking + HTML reports with transcripts
- **Matrix Testing**: `defineTestSuite` generates Cartesian product of test configurations
- **Matchers**: Custom matchers for cost gates, todo completion, tool safety, rubric evaluation

### The Primitives
- **`prompt()`** - Atomic, reusable, streamable prompts (command + text + attachments)
- **`defineAgent()`** - Agent config (model, tools, source, timeouts, system prompts, commands)
- **`runAgent()`** - Execute agent, return `RunResult` (messages, toolCalls, todos, metrics, artifacts)
- **`judge()`** - LLM-based evaluation with rubrics, reuses base LLM
- **Reporters** - Cost reporter (terminal), HTML reporter (transcripts, timelines, artifacts)

### The Vision
**Can we compose these primitives in novel ways?**

Example automation pattern you mentioned:
```typescript
// Pipeline: agent → judge → next stage
const stage1 = await runAgent({ agent: analyzer, prompt: '/analyze' });
const validation = await judge(stage1, { rubric });

// If validation passes, move to next stage
if (validation.passed) {
  const stage2 = await runAgent({
    agent: fixer,
    prompt: prompt({
      text: 'Fix issues',
      attachments: [stage1.artifacts]
    })
  });
}
```

**Question**: Can we leverage Vitest's API surface to make this pattern even better?

---

## Current State - Context Files

### Implementation Plan
**File**: `/Users/abuusama/repos/vibe-check/.claude/docs/vibecheck/implementation-plan.mdx`

Key technical details:
- Vitest v3 fixtures with typed context
- `vibeTest` extends Vitest test with custom fixtures
- Agent runner using Claude SDK streaming
- Reporters hook into Vitest lifecycle (onTestAnnotate, onFinished)
- Matrix generation via `defineTestSuite` (Cartesian product)
- Rubric-based judge reuses base LLM for evaluation

### Current README
**File**: `/Users/abuusama/repos/vibe-check/readme-exp.mdx`

Shows current API surface:
- `vibeTest('name', async ({ runAgent, judge, expect }) => { ... })`
- `defineAgent({ name, model, tools, source, timeouts, systemPrompt, commands })`
- `prompt()` builder for reusable prompts
- Custom matchers: `toCompleteAllTodos()`, `toStayUnderCost()`, `toPassRubric()`, etc.
- Matrix testing with `defineTestSuite({ matrix, test })`

### Documentation Architecture
**File**: `/Users/abuusama/repos/vibe-check/.claude/docs/vibecheck/documentation-architecture.md`

Organizational structure for guides, recipes, API reference

---

## Research Mandate

You have **deep research capabilities**. Use them extensively. This is not a quick literature review—this is **investigative research** that will shape the framework's future.

### 1. Vitest API Surface - Complete Exploration

**Study Vitest's documentation comprehensively:**

#### Core Testing APIs
- **Test context**: What's available beyond basic fixtures?
- **Task metadata**: How can we store/retrieve custom data per test?
- **Annotations**: `context.annotate()` - can we use this for real-time updates?
- **Lifecycle hooks**: `beforeEach`, `afterEach`, `beforeAll`, `afterAll` - advanced patterns?
- **Concurrency control**: Sequential suites, concurrent tests, worker limits

#### Advanced Features
- **Custom test environments**: Can we create custom environments for agent isolation?
- **Workspace configuration**: Multi-project setup - could we model agents as "projects"?
- **Benchmark mode**: Vitest has `bench()` - useful for performance comparisons?
- **Snapshot testing**: Advanced snapshot patterns for agent outputs?
- **Inline tests**: `import.meta.vitest` - any use cases?

#### Reporters & Lifecycle
- **Reporter API**: Beyond basic reporting - what hooks exist?
  - `onInit`, `onPathsCollected`, `onCollected`, `onFinished`, `onTaskUpdate`
  - `onTestStart`, `onTestFinish`, `onTestFailed`
  - Real-time updates during test execution?
- **Custom reporters**: Can reporters be interactive? Can they modify test execution?
- **Reporter composition**: Can we chain multiple reporters with data flow?

#### Plugins & Extensions
- **Vitest plugins**: What's the plugin architecture?
- **Vite plugins**: Can we use Vite plugins for novel behaviors?
- **Transform hooks**: Can we transform test files at runtime?

#### Configuration & Runtime
- **defineConfig** patterns: Advanced configuration strategies
- **Runtime API**: Can we invoke Vitest programmatically? (`vitest.run()` API?)
- **Coverage API**: Any coverage primitives we could repurpose?

**Questions to answer:**
1. What Vitest APIs are we **not currently using** that could enhance DX?
2. Can reporters do more than just report? (e.g., conditional test execution, dynamic test generation)
3. Are there undocumented/advanced patterns in Vitest's own test suite?
4. How does Vitest handle streaming/progressive output? Can we leverage this?
5. What's the deepest level of customization Vitest allows?

### 2. Testing Frameworks - DX Patterns Research

**Study how other frameworks handle automation:**

#### Playwright Test
- **Fixtures**: How do they compose fixtures? Dependency injection patterns?
- **Projects**: Multiple browser contexts - parallel to our agents?
- **test.step()**: Nested steps within tests - useful for pipeline stages?
- **Traces**: Rich debugging artifacts - inspiration for our reporting?

#### Jest/Vitest Ecosystem
- **jest-extended**: Custom matchers - what patterns can we adopt?
- **Testing Library**: User-centric testing patterns - applicable to agents?
- **Snapshot testing**: Creative snapshot use cases beyond code

#### Taskfile / Make / Build Tools
- **Dependency DAGs**: Task dependencies - can we model pipelines as DAGs?
- **Incremental execution**: Skip steps if inputs unchanged - applicable to agents?
- **Parallel execution**: Optimal parallelization strategies

**Questions to answer:**
1. How do top frameworks make complex workflows feel simple?
2. What abstraction patterns work best for multi-stage operations?
3. How do they handle errors in pipelines?
4. What debugging experiences are best-in-class?

### 3. Automation & Orchestration Patterns

**Study workflow automation frameworks:**

#### Temporal / Step Functions
- **Workflow primitives**: Activities, signals, queries
- **Durability**: Can Vitest task metadata provide similar guarantees?
- **Error handling**: Retry logic, compensation, saga patterns

#### Apache Airflow / Prefect
- **DAG patterns**: Task dependencies, conditional execution
- **Observability**: Metrics, logs, traces - what can reporters capture?

#### GitHub Actions / CI/CD
- **Job orchestration**: Sequential vs parallel, matrix builds
- **Artifact passing**: Between jobs - similar to our artifact system?
- **Conditional execution**: `if` conditions on jobs/steps

**Questions to answer:**
1. Can we model agent pipelines as Vitest "projects" or "suites"?
2. Should we introduce explicit DAG primitives, or keep linear pipelines?
3. How can we make error recovery in pipelines more ergonomic?
4. Can reporters act as orchestrators, not just observers?

### 4. Novel Composition Patterns

**Explore creative ways to compose our primitives:**

#### Pattern: Pipeline Stages as Tests
```typescript
// Current: All in one test
vibeTest('pipeline', async ({ runAgent }) => {
  const stage1 = await runAgent({ agent: a1, prompt: p1 });
  const stage2 = await runAgent({ agent: a2, prompt: p2 });
  const stage3 = await runAgent({ agent: a3, prompt: p3 });
});

// Alternative: Each stage is a test?
describe('pipeline', () => {
  let stage1Result;

  vibeTest('stage 1: analyze', async ({ runAgent }) => {
    stage1Result = await runAgent({ agent: analyzer, prompt: '/analyze' });
  });

  vibeTest('stage 2: fix', async ({ runAgent }) => {
    const result = await runAgent({
      agent: fixer,
      prompt: prompt({ text: 'fix', attachments: [stage1Result] })
    });
  });
});
```

**Pros/Cons? Better patterns?**

#### Pattern: Judge as Test Filter
```typescript
// Can we use judges to conditionally skip tests?
vibeTest('expensive operation', async ({ runAgent, judge }) => {
  // Run quick analysis first
  const quickCheck = await runAgent({ agent: fastAgent, prompt: '/check' });

  // Judge determines if we should proceed
  const shouldProceed = await judge(quickCheck, { rubric: quickRubric });

  if (!shouldProceed.passed) {
    test.skip('Quick check failed, skipping expensive operation');
    return;
  }

  // Proceed with expensive operation
  const result = await runAgent({ agent: expensiveAgent, prompt: '/deep-analysis' });
});
```

**Is this a good pattern? Better alternatives?**

#### Pattern: Reporters as Automation Controllers
```typescript
// Could a reporter pause/resume tests based on external conditions?
// Could it dynamically adjust concurrency based on cost?
// Could it inject data between tests in a pipeline?

class OrchestrationReporter implements Reporter {
  async onTestStart(test) {
    // Check cost budget, pause if exceeded?
    // Inject artifacts from previous stage?
  }

  async onTestFinish(test) {
    // Store artifacts for next stage?
    // Trigger next test in pipeline?
  }
}
```

**Is this feasible? Advisable?**

#### Pattern: Fixture-Based Pipeline Builder
```typescript
// Could we create a pipeline fixture?
const pipeline = defineFixture(({ runAgent, judge }) => {
  return {
    async stage(config) {
      const result = await runAgent(config);
      return result;
    },
    async validate(result, rubric) {
      return await judge(result, { rubric });
    },
    async conditional(result, rubric, ifPass, ifFail) {
      const validation = await this.validate(result, rubric);
      return validation.passed ? await ifPass() : await ifFail();
    }
  };
});

vibeTest('smart pipeline', async ({ pipeline }) => {
  const analysis = await pipeline.stage({ agent: analyzer, prompt: '/analyze' });

  await pipeline.conditional(
    analysis,
    quickRubric,
    () => pipeline.stage({ agent: deepAgent, prompt: '/deep' }),
    () => pipeline.stage({ agent: fixAgent, prompt: '/quick-fix' })
  );
});
```

**Would this improve DX?**

### 5. Reporting & Observability Innovation

**Explore advanced reporting patterns:**

#### Real-Time Updates
- Can reporters update during test execution (streaming)?
- WebSocket-based live HTML report?
- Terminal UI with live agent status?

#### Interactive Reports
- HTML report with replay functionality?
- Click to re-run individual stages?
- Edit prompts and re-execute in browser?

#### Metrics & Analytics
- Time-series cost tracking across runs?
- Agent performance trends?
- Tool usage heatmaps?

**Questions:**
1. What's the best way to capture agent "events" (tool calls, thinking, errors)?
2. Can we build a "timeline view" of agent execution?
3. Should reporters be pluggable? (e.g., send to Datadog, Grafana, etc.)

### 6. Alternative Automation Approaches

**Beyond reporters - what else could work?**

#### Approach: Vitest as Workflow Engine
Instead of tests, use Vitest infrastructure for pure automation:
- "Tests" are workflow steps
- "Suites" are workflows
- "Reporters" are workflow observers
- Matrix testing becomes parallel workflow execution

**Pros/Cons vs current approach?**

#### Approach: Hybrid Model
- Tests remain tests (evaluation use case)
- Separate `workflow()` API for automation use case
- Share primitives (agents, judge, reporters)

**Would this better serve dual identity?**

#### Approach: Plugin Architecture
- Core: minimal primitives (agent, prompt, judge)
- Plugins: reporters, matchers, matrix, etc.
- Users compose their own framework

**Too much complexity? Right level of modularity?**

---

## Deliverable: Deep Research Report

Provide a **comprehensive research report** with the following structure:

### Part 1: Vitest API Surface Audit (1500-2000 words)

**Complete inventory of Vitest capabilities:**

1. **Currently Used APIs**
   - What we're using now
   - How we're using it
   - Effectiveness rating

2. **Unused APIs with Potential**
   - API surface not currently leveraged
   - Potential use cases for each
   - Implementation complexity
   - DX impact

3. **Advanced/Undocumented Patterns**
   - Patterns found in Vitest's own codebase
   - Creative uses from ecosystem
   - Experimental features

4. **Limitations & Workarounds**
   - What Vitest can't do
   - How we could work around it
   - Should we?

### Part 2: Novel Composition Patterns (1000-1500 words)

**Explore creative ways to use our primitives:**

1. **Pipeline Patterns**
   - 3-5 different approaches to multi-stage pipelines
   - Code examples for each
   - Pros/cons analysis
   - DX score (1-10)

2. **Judge Integration Patterns**
   - How judge can fit into pipelines
   - Conditional execution patterns
   - Validation vs gating vs routing
   - Best practices

3. **Artifact Flow Patterns**
   - Passing data between stages
   - Artifact management strategies
   - Cleanup and storage

4. **Error Handling Patterns**
   - Retry logic
   - Fallback strategies
   - Partial failure handling

### Part 3: Automation Strategy Alternatives (1000-1500 words)

**Alternatives to current reporter-based approach:**

For each alternative, provide:

1. **Core Concept**
   - High-level description
   - Key differences from current approach

2. **API Design**
   - TypeScript signatures
   - Usage examples (simple + advanced)

3. **Implementation Strategy**
   - How it would work (high-level)
   - Integration with existing primitives
   - Migration path from current approach

4. **Pros & Cons**
   - Advantages
   - Disadvantages
   - Trade-offs

5. **DX Analysis**
   - Learning curve
   - Ergonomics
   - Flexibility
   - Overall score (1-10)

**Alternatives to consider:**
- Vitest as pure workflow engine
- Hybrid test/workflow model
- Plugin-based architecture
- Custom DSL on top of Vitest
- Reporter-as-orchestrator pattern
- Fixture-based pipeline builder
- Other creative approaches

### Part 4: Reporting & Observability Innovations (500-1000 words)

**Advanced reporting patterns:**

1. **Real-Time Reporting**
   - Technical feasibility with Vitest
   - Implementation approaches
   - UX mockups (describe, don't build)

2. **Interactive Reports**
   - What's possible
   - What's valuable
   - Implementation complexity

3. **Analytics & Trends**
   - Metrics worth tracking
   - Storage strategies
   - Visualization ideas

4. **Integration Points**
   - Pluggable reporters
   - External observability tools
   - Custom analytics pipelines

### Part 5: Recommendations & Roadmap (500-1000 words)

**Your top recommendations:**

#### Immediate Wins (Next Sprint)
3-5 quick improvements we can make now:
- Specific Vitest APIs to adopt
- Pattern refinements
- DX improvements
- Estimated effort (S/M/L)

#### Medium-Term Enhancements (Next Quarter)
2-3 larger initiatives:
- Major new features/patterns
- Architectural improvements
- Implementation outline
- Expected impact

#### Long-Term Vision (6-12 months)
1-2 bold ideas:
- Game-changing capabilities
- Competitive differentiation
- Research needed
- Why it matters

#### Critical Decision Points
For each major decision:
- **Decision**: What we need to choose
- **Options**: 2-3 viable approaches
- **Recommendation**: Your pick
- **Rationale**: Why this is best
- **Trade-offs**: What we give up

---

## Research Methodology

### 1. Primary Sources
- **Vitest documentation** (official docs, API reference)
- **Vitest GitHub** (source code, issues, discussions, PRs)
- **Vitest test suite** (how they test themselves)
- **Playwright/Jest/Mocha** docs and codebases

### 2. Secondary Sources
- **Blog posts** about advanced Vitest usage
- **Conference talks** about testing frameworks
- **Open source projects** using Vitest creatively
- **Stack Overflow** for edge cases and workarounds

### 3. Experimentation
- **Prototype** small examples where helpful
- **Test assumptions** with code
- **Validate feasibility** of novel ideas

### 4. Analysis Framework

For each API/pattern/approach, evaluate:
- **DX Impact** (1-10): How much does this improve developer experience?
- **Complexity** (Low/Med/High): Implementation difficulty
- **Novelty** (Incremental/Significant/Game-changer): How innovative is this?
- **Risk** (Low/Med/High): Potential downsides or unknowns
- **Priority** (P0/P1/P2/P3): Should we do this? When?

---

## Success Criteria

Your research report should:

✅ **Be comprehensive** - Cover Vitest deeply, not superficially
✅ **Be concrete** - Code examples, not just concepts
✅ **Be actionable** - Clear recommendations with effort estimates
✅ **Be innovative** - Discover non-obvious patterns and opportunities
✅ **Be critical** - Honest pros/cons, don't just advocate
✅ **Be prioritized** - Help us decide what to build next
✅ **Be well-researched** - Cite sources, show depth of investigation
✅ **Be DX-focused** - Always optimize for developer experience
✅ **Be realistic** - Technical feasibility matters
✅ **Be visionary** - Include bold ideas worth exploring

---

## Constraints & Context

### Must Preserve
1. **Vitest-native** - No custom test runners, must use Vitest's infrastructure
2. **Dual identity** - Support both testing and automation equally well
3. **TypeScript-first** - Excellent type inference and autocomplete
4. **Minimal surface** - Simple things should be simple
5. **Rich reporting** - This is our killer feature

### Open Questions
1. Should automation be tests, or separate workflows that share Vitest infra?
2. Can reporters do more than report? Should they?
3. How do we make pipelines feel native to Vitest?
4. What's the right level of abstraction for pipeline orchestration?
5. How do we maximize reuse of judge, artifacts, metrics across patterns?

---

## Examples to Guide Your Research

### Example: Vitest API Deep Dive

When researching an API, go deep:

```markdown
## Task Metadata API

**Current Usage:** We don't use this yet.

**API Surface:**
```typescript
// In test
test.meta.myData = { ... };

// In reporter
onTestFinish(test) {
  const data = test.meta.myData;
}
```

**Potential Use Cases:**
1. Store RunResult in task.meta for reporters to access
2. Store cost metrics for cross-test aggregation
3. Store artifacts for pipeline handoff
4. Store judge results for quality dashboards

**Implementation Sketch:**
```typescript
vibeTest('example', async ({ runAgent, task }) => {
  const result = await runAgent({ ... });

  // Store in task metadata
  task.meta.runResult = result;
  task.meta.cost = result.metrics.totalCostUsd;
});

// Reporter accesses it
class CostReporter {
  onTestFinish(test) {
    const totalCost += test.meta.cost;
  }
}
```

**Pros:**
- Built-in Vitest mechanism
- Reporters can aggregate data
- Persistent across test lifecycle

**Cons:**
- May not work with concurrent tests (race conditions?)
- Serialization limits (can't store functions)
- Documentation says "experimental"

**DX Impact:** 7/10 - Enables cross-test analytics
**Complexity:** Low - Simple object storage
**Risk:** Medium - Experimental API may change
**Priority:** P1 - Could improve reporting immediately
```

### Example: Novel Pattern Exploration

When proposing a pattern, be specific:

```markdown
## Pattern: Fixture-Based Pipeline Builder

**Concept:**
Create a `pipeline` fixture that provides a fluent API for chaining agent operations with built-in validation and error handling.

**API Design:**
```typescript
// Define pipeline fixture
const pipeline = defineFixture(({ runAgent, judge }) => ({
  async execute(config) {
    return await runAgent(config);
  },

  async validate(result, rubric) {
    const evaluation = await judge(result, { rubric });
    if (!evaluation.passed) {
      throw new PipelineValidationError(evaluation);
    }
    return result;
  },

  async branch(result, rubric, onPass, onFail) {
    const evaluation = await judge(result, { rubric });
    return evaluation.passed ? await onPass(result) : await onFail(result);
  }
}));

// Usage
vibeTest('smart pipeline', async ({ pipeline }) => {
  const analysis = await pipeline.execute({
    agent: analyzer,
    prompt: '/analyze'
  });

  const validated = await pipeline.validate(analysis, quickRubric);

  const final = await pipeline.branch(
    validated,
    depthRubric,
    (result) => pipeline.execute({ agent: deepAgent, prompt: '/deep', context: result }),
    (result) => pipeline.execute({ agent: quickAgent, prompt: '/quick-fix', context: result })
  );
});
```

**Implementation:**
Uses Vitest's fixture system. Pipeline methods wrap runAgent/judge with ergonomic helpers.

**Pros:**
- Fluent, readable API
- Built-in validation
- Reusable across tests
- Type-safe

**Cons:**
- Additional abstraction layer
- May hide underlying primitives
- Learning curve for new users

**DX Impact:** 8/10 - Significantly improves pipeline ergonomics
**Complexity:** Medium - Requires fixture expertise
**Novelty:** Significant - Pattern not common in test frameworks
**Risk:** Low - Just sugar over existing primitives
**Priority:** P1 - Could be a DX differentiator

**Alternative Approaches:**
1. Helper functions instead of fixture
2. Class-based pipeline builder
3. Generator-based pipeline DSL
```

---

## Final Notes

This research will **shape the future of vibe-check**. Your findings will:
- Guide the next 6-12 months of development
- Determine competitive positioning
- Define the developer experience
- Identify innovation opportunities

### What Makes This Research Excellent

**Depth over Breadth:**
- Better to deeply understand 5 Vitest APIs than superficially list 50

**Concrete over Abstract:**
- Code examples beat conceptual descriptions
- TypeScript signatures beat prose explanations

**Critical over Promotional:**
- Honest trade-offs beat selling ideas
- "This won't work because..." is as valuable as "This could work if..."

**Actionable over Inspirational:**
- Clear next steps beat big visions
- Effort estimates beat feature dreams

**Researched over Assumed:**
- Cite sources and experiments
- "I tested this and found..." beats "I think this would..."

---

**Take your time. Go deep. Experiment. Synthesize. Recommend.**

Your research will define what vibe-check becomes. Make it count.
