# Vitest Deep Research - Maximizing API Surface for Automation & DX Excellence

## Mission

You are tasked with **comprehensive research into Vitest** to discover innovative ways to leverage its **full API surface** for building the best possible developer experience in `@dao/vibe-check`. This is not just about testing—it's about **automation, orchestration, and developer ergonomics**.

Your mission is to go **deep** into Vitest's capabilities and return with:
1. **Novel API surface opportunities** we're not currently using
2. **Alternative approaches** to our current reporter-based automation
3. **Composable primitive patterns** for building pipelines beyond tests
4. **DX innovations** that could differentiate vibe-check from other frameworks
5. **Context management strategies** for auto-capturing execution state

This is **research-driven innovation**: explore, analyze, synthesize, and recommend concrete implementations.

---

## What is vibe-check?

`@dao/vibe-check` is a **dual-purpose framework** built on Vitest v3:

### Dual Identity
1. **Automation Suite** - Run agent pipelines, orchestrate multi-agent workflows, production-grade reporting
2. **Evaluation Framework** - Benchmark models/configs/prompts, matrix testing, quality gates

### Current Vitest Usage
- **Fixtures**: `runAgent`, `judge`, `metrics` exposed via `vibeTest`
- **Reporters**: Custom reporters for terminal cost tracking + HTML reports with transcripts
- **Matrix Testing**: `defineTestSuite` generates Cartesian product of test configurations
- **Matchers**: Custom matchers for cost gates, todo completion, tool safety, rubric evaluation

### The Primitives

- **`prompt()`** - Atomic, reusable, streamable prompts (command + text + attachments)
- **`defineAgent()`** - Agent config (model, tools, source, timeouts, system prompts, commands)
- **`runAgent()`** - Execute agent, return `RunResult` with **auto-populated RunContext**
- **`judge()`** - LLM-based evaluation with rubrics, reuses base LLM
- **Reporters** - Cost reporter (terminal), HTML reporter (transcripts, timelines, artifacts)

### 🔑 CRITICAL CONCEPT: RunContext (Auto-Populated Execution Context)

**THIS IS THE MOST IMPORTANT CONCEPT TO UNDERSTAND:**

When you run an agent, vibe-check **automatically captures everything** into a `RunContext` object. Users **NEVER manually manage this** - it's all framework-provided.

#### The Capture Mechanism: Claude Code Hooks

We use **Claude Code hooks** to capture execution data. During an agent run:

1. **Hooks fire as events happen** (tool use, notifications, stops, etc.)
2. **We write hook data to small temp files** (non-blocking)
3. **After run completes, we process the hook files**:
   - Correlate PreToolUse + PostToolUse → structured ToolCall records
   - Extract git state, file changes, messages
   - Format everything for easy matcher access
4. **We inject processed context into Vitest's flow** (task.meta? fixture? TBD)

**Research Resources:**
- **Claude Code Hooks Documentation**: https://docs.claude.com/en/docs/claude-code/hooks
- Study all hook types: PreToolUse, PostToolUse, Notification, Stop, SubagentStop, SessionStart, SessionEnd
- Understand hook input/output schemas

#### What Data is Available from Claude Code

**From Claude Code SDK** (when running agent):
- Messages (conversation history)
- TODO tracking
- Agent metrics

**From Claude Code Hooks** (captured during execution):
- `PreToolUse`: tool name, tool inputs, session/transcript path
- `PostToolUse`: tool name, tool inputs, **tool response/output**
- `Notification`: notification messages
- `Stop`/`SubagentStop`: completion events
- `SessionStart`/`SessionEnd`: session lifecycle
- Current working directory, git state (available in hook input)

**What We Can Derive:**
- Git hash before/after (run git commands in hooks or tests)
- File contents before/after (read files during capture)
- Diffs (generate from before/after comparison)
- Correlated tool calls (match PreToolUse + PostToolUse by timestamp/sequence)

#### YOUR TASK: Design the RunContext Architecture

**We DO NOT prescribe the RunResult interface.** That's for YOU to design based on:

1. **What makes custom matchers ergonomic:**
   ```typescript
   // Users should be able to write:
   expect(result).toHaveUsedTool('Bash');
   expect(result).toHaveChangedFiles(["src/index.ts", "src/styles.css"]);

   // Access BEFORE/AFTER content (not raw diffs)
   const indexFile = result.getFileChange("src/index.ts");
   expect(indexFile.before).toContain("old code");
   expect(indexFile.after).toContain("new code");

   // Raw diffs are for REPORTERS, not test assertions
   // (HTML report shows diffs, but tests use before/after)

   // What structure enables this?
   ```

2. **What makes pipeline context passing natural:**
   ```typescript
   const stage1 = await runAgent({ ... });
   const stage2 = await runAgent({
     agent: fixer,
     context: stage1  // How should stage1 be structured?
   });
   ```

3. **What makes reporter access efficient:**
   ```typescript
   class HtmlReporter {
     onTestFinish(test) {
       const context = test.meta.???;  // How do we access it?
       this.renderDiffs(context.???);  // What's the shape?
     }
   }
   ```

#### Key Questions for Your Research

1. **What should `RunResult` contain?** (Design the complete interface)
2. **Where should RunContext live in Vitest?** (task.meta? fixture? other?)
3. **How to correlate hook events?** (PreTool + PostTool → ToolCall object pattern?)
4. **How to structure for matcher DX?** (What makes `expect(result).toHaveX()` easy to implement?)
5. **How to handle large data?** (100 files changed = memory concerns? Lazy loading?)
6. **How to inject into Vitest flow?** (When to capture? Where to store? How to access?)

#### Example Access Pattern (You Define the Actual Structure)

**❌ Users DO NOT do this:**
```typescript
// WRONG - No manual management
const result = await runAgent({ ... });
await artifacts.saveText('diff.txt', someDiff); // NO!
```

**✅ Users DO this:**
```typescript
// CORRECT - Access auto-captured data
const result = await runAgent({ ... });

// What properties/methods should exist? YOU DECIDE
console.log(result.???);  // Git state?
console.log(result.???);  // File changes?
console.log(result.???);  // Tool calls?
```

**Research Question**: Given Vitest's context system and Claude Code's hook data, design the optimal capture → process → inject → access flow.

### The Vision

**Can we compose these primitives in novel ways while maintaining auto-populated RunContext?**

Example automation pattern:
```typescript
// Pipeline: agent → inspect auto-captured context → judge → next stage
const stage1 = await runAgent({ agent: analyzer, prompt: '/analyze' });

// Inspect auto-captured data (structure TBD by researcher)
if (stage1.??? > 10) {  // Many files changed?
  console.log('Many files changed, running deep analysis...');
}

// Judge uses the auto-captured data
const validation = await judge(stage1, { rubric });

// Pass context to next stage
if (validation.passed) {
  const stage2 = await runAgent({
    agent: fixer,
    prompt: prompt({
      text: 'Fix issues found',
      context: stage1  // How should this work? Researcher designs
    })
  });

  // Compare contexts between stages
  const newChanges = /* Researcher: design comparison pattern */;
}
```

**Question**: Given Vitest's context system and Claude Code hooks, design the optimal architecture for RunContext capture, storage, and access.

---

## 🔬 NEW RESEARCH AREA: Context Management in Testing Frameworks

### Research Mandate: How Do Frameworks Manage Custom Context?

**Critical Question**: How do testing frameworks handle **custom execution context** that needs to be:
1. **Auto-populated** during test execution
2. **Accessible** to the test code
3. **Passed to reporters** for aggregation
4. **Cleaned up** after test completion

**Research these patterns:**

#### 1. Playwright's Context Management
- How does Playwright manage browser context, page context, etc.?
- How do they auto-capture screenshots, videos, traces?
- How does their fixture system handle context lifecycle?
- Can we adopt similar patterns for RunContext?

#### 2. Vitest's Test Context Internals
- How does Vitest's `task.meta` work internally?
- Can we use `task.meta` to store RunContext?
- How do Vitest fixtures handle setup/teardown with context?
- What's the lifecycle of a test context from creation to reporter access?

#### 3. Jest's Context Patterns
- How does Jest handle test context with custom testEnvironment?
- How do they manage state across beforeEach/afterEach?
- Any patterns for auto-capturing execution data?

#### 4. Test Double Frameworks (Sinon, Jest mocks)
- How do they auto-capture call history, arguments, return values?
- Pattern: Proxy-based capture vs manual instrumentation
- Applicability to capturing tool calls and file changes

### Research Questions

**For RunContext Auto-Capture:**

1. **Where should RunContext live?**
   - In Vitest's `task.meta`?
   - In a custom fixture that persists across tool calls?
   - In a global context manager (singleton pattern)?
   - Pros/cons of each approach?

2. **How do we capture state at the right time?**
   - Git snapshots: When? (before test starts, after runAgent completes)
   - File content: Read files on every tool call? Or snapshot entire workspace?
   - Hook events: Buffer them during execution, then attach to RunContext?

3. **How do we make RunContext available everywhere it's needed?**
   - In test code (users access via `result`)
   - In reporters (for HTML reports showing diffs)
   - In judge function (for evaluating code changes)
   - Between pipeline stages (passing context forward)

4. **Memory management for large contexts:**
   - If agent changes 100 files, storing full before/after content = huge memory
   - Should we lazy-load file contents?
   - Should we stream diffs to disk and store paths?
   - What's the right balance?

### Deliverable for This Section

**Provide:**

1. **Context Manager Architecture Proposal**
   - How to implement auto-capture using Vitest fixtures
   - Code sketch of the context manager class/module
   - Lifecycle diagram (when capture happens)

2. **Comparison of Storage Strategies**
   - Option A: Store in `task.meta` (Vitest native)
   - Option B: Custom fixture with private state
   - Option C: Global singleton pattern
   - Pros/cons table with recommendation

3. **Auto-Capture Implementation Patterns**
   - How to hook into tool executions to capture data
   - How to snapshot git state efficiently
   - How to buffer hook emissions during run
   - Code examples for each

4. **Access Patterns**
   - How user accesses: `result.fileChanges[0].beforeContent`
   - How reporter accesses: `testCase.meta.runContext.gitState`
   - How to pass between stages: via variables or shared context?

---

## Core Design Question: Designing the Pipeline/Workflow API

### Our Decision

We **DO NOT** want `vibeTest` for everything. We want:

1. **`vibeTest`** - For testing/evaluation use cases (benchmarks, quality gates)
2. **Separate API** - For pipelines/workflows/automation (name TBD: `vibeWorkflow`? `vibePipeline`?)

**Your task:** Design BOTH APIs and explain how they differ while sharing primitives.

### The Scenarios

**Scenario A: Testing use case (feels right)**
```typescript
vibeTest('benchmark models', async ({ runAgent, judge, expect }) => {
  const result = await runAgent({ agent: sonnet, prompt: '/refactor' });

  // Auto-captured context available (researcher: design the structure)
  expect(result.???).toBeGreaterThan(0);  // File changes?
  expect(result.???).not.toBe(result.???);  // Git hash comparison?

  const evaluation = await judge(result, { rubric });
  expect(evaluation.score).toBeGreaterThan(0.8);
});
```

**Scenario B: Production automation (does this feel right?)**
```typescript
vibeTest('deploy pipeline', async ({ runAgent }) => {
  const build = await runAgent({ agent: builder, prompt: '/build' });

  // Access auto-captured data (researcher: design access patterns)
  const buildFiles = build.???;  // How to filter for /dist files?

  const test = await runAgent({ agent: tester, prompt: '/test' });

  // Access tool results (researcher: how are tool calls structured?)
  const testOutput = test.???;  // How to get test output?

  const deploy = await runAgent({ agent: deployer, prompt: '/deploy' });
});
```

### Critical Questions to Research

1. **Naming**: `vibeWorkflow` vs `vibePipeline` vs other?
   - Which name better conveys the mental model?
   - Which is more discoverable?
   - Study: Playwright `test.step()`, task runners, workflow engines

2. **API Differences**: How should vibeTest and vibeWorkflow differ?
   - Same context? Different fixtures?
   - Different matchers? Different reporters?
   - Different error handling semantics?

3. **Loop Support**: Pipelines need loops/iteration
   - How to run agent multiple times until condition met?
   - How to iterate over multiple inputs?
   - Pattern: `while (!result.passed) { ... }` or helper?

4. **Workspace/Project Context** (NEW - CRITICAL):
   - Where should git workspace/project be specified?
   - **Currently**: Set on agent definition (`source: { type: 'git', repo: '...' }`)
   - **Question**: Should it be on test/pipeline level instead?
   - **Consider**: All agents in pipeline usually share same workspace?
   - **Or**: Different agents might operate on different repos?
   - **YOUR TASK**: Research and prescribe where workspace context should live

### What We Need from Research

**Design BOTH APIs:**

1. **vibeTest API**
   - TypeScript signatures
   - Usage examples (simple + complex)
   - What fixtures/context available?
   - What matchers make sense?

2. **vibeWorkflow/vibePipeline API** (choose best name)
   - TypeScript signatures
   - Usage examples (simple + complex pipelines)
   - How to support loops/iteration?
   - How does it differ from vibeTest?

3. **Shared Primitives**
   - What's shared? (defineAgent, prompt, judge, etc.)
   - How do they integrate with both APIs?

4. **Workspace Context Design**
   - Where should workspace be specified?
   - On test/pipeline level? On agent? Both?
   - How to handle multi-repo scenarios?

5. **DX Analysis**
   - Mental model for each API
   - Discoverability and clarity (1-10)
   - Migration path from vibeTest-only

**This is critical.** The dual API design will shape how users perceive and use vibe-check.

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
6. **How can we use Vitest's context system to manage RunContext efficiently?**

### 2. Context Management Deep Dive (NEW - CRITICAL)

**Study how frameworks manage execution context:**

#### Context Lifecycle Patterns
- **Setup**: When is context created? (Before test? On demand?)
- **Population**: How is data added to context during execution?
- **Access**: How does test code access context? Fixtures? Globals? Closures?
- **Persistence**: How long does context live? Per-test? Per-suite? Per-run?
- **Cleanup**: When is context destroyed? Memory management?

#### Automatic Capture Patterns
- **Proxy-based capture**: Intercept operations transparently
- **Hook-based capture**: Register hooks for specific events
- **Decorator-based capture**: Wrap functions to capture calls
- **Middleware-based capture**: Chain interceptors

**Research Questions:**

1. **Best pattern for auto-capturing git state?**
   - Run `git diff` before/after in fixture setup/teardown?
   - Use file system watchers to track changes?
   - Read files on-demand when accessed?

2. **Best pattern for capturing tool calls?**
   - Wrap `runAgent` to intercept all tool executions?
   - Use Claude Code hooks to capture tool call data?
   - Maintain a global registry of tool calls?

3. **Best pattern for capturing hook emissions?**
   - Buffer hook events during execution?
   - Stream to reporter in real-time?
   - Store in task.meta or custom context?

4. **Integration with Vitest's fixture system:**
   - Can we create a `runContext` fixture that auto-populates?
   - How to ensure cleanup happens after test completes?
   - How to make context available to reporters?

### 3. Testing Frameworks - DX Patterns Research

**Study how other frameworks handle automation:**

#### Playwright Test
- **Fixtures**: How do they compose fixtures? Dependency injection patterns?
- **Projects**: Multiple browser contexts - parallel to our agents?
- **test.step()**: Nested steps within tests - useful for pipeline stages?
- **Traces**: Rich debugging artifacts - inspiration for our reporting?
- **How does Playwright auto-capture screenshots/videos?** (Key for RunContext)

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
5. **How do they manage and present execution context/state?**

### 4. Novel Composition Patterns

**Explore creative ways to compose our primitives with RunContext:**

#### Pattern: Pipeline Stages with Context Handoff
```typescript
// How do we best pass RunContext between stages?

// Option A: Explicit variable passing
vibeTest('pipeline', async ({ runAgent }) => {
  const stage1 = await runAgent({ agent: a1, prompt: p1 });
  // stage1.fileChanges, stage1.gitState available

  const stage2 = await runAgent({
    agent: a2,
    prompt: p2,
    context: stage1  // Pass full context
  });

  // Compare contexts
  const newFiles = stage2.fileChanges.filter(
    fc => !stage1.fileChanges.some(fc1 => fc1.path === fc.path)
  );
});

// Option B: Context accumulator pattern
vibeTest('pipeline', async ({ runPipeline }) => {
  const pipeline = runPipeline();

  const stage1 = await pipeline.stage({ agent: a1, prompt: p1 });
  const stage2 = await pipeline.stage({ agent: a2, prompt: p2 });

  // Pipeline automatically tracks cumulative context
  const allChanges = pipeline.getAllFileChanges();
  const gitLog = pipeline.getGitLog();
});
```

**Which pattern feels better? Are there other approaches?**

#### Pattern: Judge with RunContext
```typescript
// How should judge use auto-captured context?

const result = await runAgent({ agent: refactor, prompt: '/refactor code' });

// Option A: Judge gets full RunContext
const evaluation = await judge(result, {
  rubric: {
    criteria: [
      {
        name: 'Meaningful changes',
        check: (ctx) => ctx.fileChanges.length > 0 && ctx.fileChanges.every(fc => fc.metadata.linesChanged > 3)
      },
      {
        name: 'Git safety',
        check: (ctx) => !ctx.fileChanges.some(fc => fc.metadata.changeType === 'deleted')
      }
    ]
  }
});

// Option B: Judge extracts relevant context automatically
const evaluation = await judge(result, {
  rubric: codeQualityRubric,
  // Judge internally accesses result.fileChanges to evaluate quality
});
```

**What's the right level of context exposure in judge?**

#### Pattern: RunContext in Matchers
```typescript
// How should matchers access RunContext?

expect(result).toHaveChangedFiles({ minCount: 1, maxCount: 10 });
expect(result).toHaveGitDiff({ matching: /function/i });
expect(result).toHaveNoDeletedFiles();
expect(result).toHaveToolCalls({ ofType: 'Bash', minCount: 3 });

// Implementation needs access to result.fileChanges, result.toolCalls, etc.
```

**What matchers would be most useful for RunContext?**

### 5. Reporting & Observability with RunContext

**How do we present auto-captured context in reports?**

#### HTML Reporter Enhancements
```typescript
// Reporter receives full RunContext from task.meta
class VibeHtmlReporter {
  onTestFinish(test) {
    const runContext = test.meta.runContext;

    // Generate diff view
    this.renderGitDiff(runContext.gitState, runContext.fileChanges);

    // Generate file change timeline
    this.renderFileTimeline(runContext.fileChanges);

    // Generate tool call timeline
    this.renderToolCallTimeline(runContext.toolCalls);

    // Generate hook event log
    this.renderHookEvents(runContext.hookData);
  }
}
```

**Research Questions:**
1. How to present file diffs in HTML? (Inline diff viewer? Link to files?)
2. How to visualize git state changes? (Timeline? Graph?)
3. How to show tool call sequence? (Timeline? Tree? Table?)
4. Best UX for large contexts (100+ file changes)?

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
   - **Specifically**: How task.meta, fixtures, reporters could manage RunContext
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

### Part 2: RunContext Architecture & Context Management (NEW - CRITICAL - 1500-2000 words)

**YOUR TASK: Design the complete auto-capture architecture. Be prescriptive.**

#### 2.1 Context Flow Architecture (MUST PROVIDE)

**Diagram and explain:**
1. **Capture Phase**: When/how hooks write to temp files during agent run
2. **Processing Phase**: How we correlate/process hook data after run
3. **Injection Phase**: Where we inject into Vitest's flow (task.meta? fixture? other?)
4. **Access Phase**: How different consumers access context

**Answer definitively:**
- WHERE does RunContext live? (Choose one: task.meta, fixture state, global registry, other?)
- WHEN is context captured? (Before test? During runAgent? After?)
- HOW is it made available? (Via fixture? Via result object? Both?)

#### 2.2 Context Manager Implementation (PROVIDE CODE SKETCH)

**Design the ContextManager class/module:**

```typescript
// Provide complete architecture sketch
class ContextManager {
  // How does it capture hooks?
  // How does it store temp data?
  // How does it process after run?
  // How does it inject into Vitest?
}
```

**Include:**
- Hook capture mechanism (write to temp files pattern)
- Hook processing logic (correlate Pre+Post, extract data)
- Storage strategy (where does processed context go?)
- Lifecycle management (setup/teardown)

#### 2.3 Auto-Capture Implementation Patterns (BE SPECIFIC)

**For each data type, prescribe the pattern:**

1. **Git State Capture**
   - WHEN: Before test starts? In runAgent fixture setup? Other?
   - HOW: Run `git rev-parse HEAD`? Other approach?
   - WHERE STORED: In fixture state? In task.meta? Other?
   - YOUR RECOMMENDATION: [Prescribe exact approach]

2. **File Content Capture**
   - WHEN: On every tool call? Post-run snapshot? Other?
   - HOW: Read all changed files? Lazy load? Stream to disk?
   - WHERE STORED: In memory? On disk with paths? Lazy getters?
   - YOUR RECOMMENDATION: [Prescribe exact approach]

3. **Tool Call Correlation**
   - HOW: Match PreToolUse + PostToolUse by what? (timestamp? sequence ID?)
   - STRUCTURE: `{ name, input, output, duration, ... }` or other?
   - ERROR HANDLING: What if PostToolUse never fires?
   - YOUR RECOMMENDATION: [Prescribe exact approach]

4. **Hook Data Processing**
   - WHEN: Real-time during run? Batch after run completes?
   - HOW: Parse JSON from temp files? Other?
   - FILTERING: Store all hooks? Only certain types?
   - YOUR RECOMMENDATION: [Prescribe exact approach]

#### 2.4 Storage & Serialization Strategy (CHOOSE ONE)

**Compare options and RECOMMEND:**

| Strategy | Pros | Cons | Recommendation |
|----------|------|------|----------------|
| **Option A: task.meta** | Vitest native, reporter access | Serialization limits, size limits? | ⭐ Recommended / ❌ Not recommended |
| **Option B: Fixture state** | Full control, no size limits | How do reporters access? | ⭐ Recommended / ❌ Not recommended |
| **Option C: Global singleton** | Shared across fixtures/reporters | Race conditions? Memory leaks? | ⭐ Recommended / ❌ Not recommended |
| **Option D: Hybrid** | Best of both? | Complexity? | ⭐ Recommended / ❌ Not recommended |

**YOUR CHOICE**: [Pick one and justify]

#### 2.5 Access Patterns (DESIGN EACH)

**Prescribe how each consumer accesses RunContext:**

1. **Test code access:**
   ```typescript
   vibeTest('example', async ({ runAgent }) => {
     const result = await runAgent({ ... });
     // How does result contain context?
     // YOUR DESIGN: result.??? or result.context.??? or other?
   });
   ```

2. **Reporter access:**
   ```typescript
   class HtmlReporter {
     onTestFinish(test) {
       // How does reporter get context?
       // YOUR DESIGN: test.meta.??? or other?
     }
   }
   ```

3. **Matcher access:**
   ```typescript
   // Custom matcher implementation
   expect.extend({
     toHaveUsedTool(received, toolName) {
       // How does matcher access tool calls?
       // YOUR DESIGN: received.??? or other?
     }
   });
   ```

4. **Judge access:**
   ```typescript
   const evaluation = await judge(result, { rubric });
   // How does judge access context internally?
   // YOUR DESIGN: [Describe]
   ```

#### 2.6 Memory Management Strategy (CRITICAL)

**Address large data scenarios:**

**Problem**: Agent changes 100 files (10MB each) = 1GB in memory?

**YOUR SOLUTION**:
- Lazy loading? (Only read file content when accessed?)
- Streaming to disk? (Store paths, read on demand?)
- Size limits? (Truncate large files?)
- Compression? (gzip file contents?)
- Other approach?

**BE PRESCRIPTIVE**: Choose one approach and explain implementation.

#### 2.7 Integration with Vitest Lifecycle (DIAGRAM)

**Provide sequence diagram or detailed steps:**

```
1. vitest starts
   ↓
2. Our fixture setup runs
   ↓
3. Capture git state (HOW?)
   ↓
4. runAgent called
   ↓
5. Hooks fire during execution (WHERE captured?)
   ↓
6. runAgent completes
   ↓
7. Process hook data (WHEN? HOW?)
   ↓
8. Populate RunResult (WHERE does data come from?)
   ↓
9. Return to test code
   ↓
10. Test completes
   ↓
11. Reporter accesses context (HOW?)
   ↓
12. Cleanup (WHAT needs cleanup?)
```

**YOUR DESIGN**: Fill in the HOW/WHEN/WHERE for each step.

#### 2.8 Comparison to Other Frameworks (RESEARCH)

**Study and synthesize:**

1. **Playwright trace capture**
   - How do they auto-capture screenshots/videos during test?
   - How do they store/access trace data?
   - What can we adopt?

2. **Jest mock call history**
   - How do they track all mock calls automatically?
   - How do they structure call history data?
   - Pattern applicable to our tool calls?

3. **Cypress network activity**
   - How do they intercept/capture all network requests?
   - How do they present in reporter?
   - Lessons for our hook capture?

**YOUR SYNTHESIS**: What patterns should we adopt?

### Part 3: Novel Composition Patterns (1000-1500 words)

**Explore creative ways to use primitives with RunContext:**

1. **Pipeline Patterns with Context**
   - 3-5 different approaches to context handoff
   - Code examples for each
   - Pros/cons analysis
   - DX score (1-10)

2. **Judge Integration with RunContext**
   - How judge uses auto-captured data
   - Rubric criteria that check git state, file changes, tools
   - Validation vs gating vs routing patterns

3. **Matcher Patterns for RunContext**
   - Custom matchers for file changes, git state, tool calls
   - Examples: `toHaveChangedFiles()`, `toHaveUsedTool()`
   - Implementation patterns

4. **Error Handling with Context**
   - Retry logic with context preservation
   - Fallback strategies with context inspection
   - Partial failure handling

### Part 4: Automation Strategy Alternatives (1000-1500 words)

**Alternatives to current approach:**

For each alternative, provide:

1. **Core Concept**
2. **API Design** - TypeScript signatures with RunContext
3. **Implementation Strategy**
4. **Pros & Cons**
5. **DX Analysis** - Score (1-10)

**Alternatives to consider:**
- vibeTest for everything
- vibeTest + vibeWorkflow (separate APIs)
- Hybrid model with shared RunContext
- Other creative approaches

### Part 5: Reporting & Observability with RunContext (500-1000 words)

**How to present auto-captured context:**

1. **Real-Time Reporting**
   - Stream context updates during execution
   - Live diff view
   - Live tool call timeline

2. **HTML Report Enhancements**
   - Git diff viewer
   - File change timeline
   - Tool call visualization
   - Hook event log

3. **Interactive Reports**
   - Click file to see full diff
   - Filter by change type
   - Search across contexts

### Part 6: Recommendations & Roadmap (500-1000 words)

**Your top recommendations:**

#### Immediate Wins (Next Sprint)
3-5 quick improvements for RunContext:
- Specific implementation approaches
- Estimated effort (S/M/L)

#### Medium-Term Enhancements (Next Quarter)
2-3 larger initiatives for context management

#### Long-Term Vision (6-12 months)
1-2 bold ideas for context-aware automation

### Part 7: User-Facing API Design ⭐ CRITICAL (1000-1500 words)

**Recommend the exact APIs users should see:**

#### 1. RunContext API (NEW - YOU MUST DESIGN THIS)

**YOUR TASK: Design the complete RunResult interface**

Based on your research of:
- Vitest's context system
- Claude Code hook data
- Matcher ergonomics
- Pipeline patterns
- Reporter access needs

**Provide:**

```typescript
/**
 * Complete RunResult interface with JSDoc
 *
 * Consider:
 * - What makes matchers easy to write?
 * - What makes context passing natural?
 * - What makes reporter access efficient?
 * - How to handle large data (lazy loading)?
 */
interface RunResult {
  // YOU DESIGN THIS COMPLETELY
  // Include:
  // - Messages/conversation?
  // - Tool calls (how structured? correlated Pre+Post?)
  // - Git state (what fields?)
  // - File changes (full content? diffs? lazy?)
  // - Hook data (how processed?)
  // - Metrics (what?)
  // - Methods? Getters? Plain objects?
}
```

**Access patterns you recommend:**
```typescript
// Show recommended access patterns
const result = await runAgent({ ... });

// How to access git state?
result.???;

// How to access file changes?
result.???;

// How to access tool calls?
result.???;

// How to filter/query the context?
result.???;
```

#### 2. vibeTest API - For Testing/Evaluation

**Complete API design:**
```typescript
// TypeScript signature
function vibeTest(
  name: string,
  fn: (context: VibeTestContext) => Promise<void>,
  options?: TestOptions
): void;

// What's in VibeTestContext?
interface VibeTestContext {
  runAgent: (opts: RunAgentOptions) => Promise<RunResult>;
  judge: (result: RunResult, rubric: Rubric) => Promise<JudgeResult>;
  expect: Expect;  // Vitest expect with our matchers
  // ... what else?
}
```

**Usage examples:**
```typescript
// Simple benchmark
vibeTest('benchmark sonnet', async ({ runAgent, expect }) => {
  const result = await runAgent({ agent: sonnet, prompt: '/refactor' });
  expect(result).toHaveChangedFiles(["src/index.ts"]);
});

// Complex with judge
vibeTest('quality gate', async ({ runAgent, judge, expect }) => {
  const result = await runAgent({ ... });
  const evaluation = await judge(result, qualityRubric);
  expect(evaluation.score).toBeGreaterThan(0.8);
});
```

#### 3. vibeWorkflow/vibePipeline API - For Automation

**YOUR CHOICE: Pick the best name and justify**

**Complete API design:**
```typescript
// TypeScript signature
function vibeWorkflow(  // or vibePipeline?
  name: string,
  fn: (context: WorkflowContext) => Promise<void>,
  options?: WorkflowOptions
): void;

// How does WorkflowContext differ from VibeTestContext?
interface WorkflowContext {
  runAgent: (opts: RunAgentOptions) => Promise<RunResult>;
  // Same runAgent? Or different?
  // Does it have judge? expect?
  // Does it have loop helpers?
  // ... YOUR DESIGN
}
```

**Usage examples with loops:**
```typescript
// Simple pipeline
vibeWorkflow('deploy', async ({ runAgent }) => {
  const build = await runAgent({ agent: builder, prompt: '/build' });
  const test = await runAgent({ agent: tester, prompt: '/test' });
  const deploy = await runAgent({ agent: deployer, prompt: '/deploy' });
});

// Pipeline with loops
vibeWorkflow('iterative fix', async ({ runAgent, ??? }) => {
  let result = await runAgent({ agent: analyzer, prompt: '/analyze' });

  // How to implement "until condition met" loop?
  while (!result.???) {
    result = await runAgent({ agent: fixer, prompt: '/fix' });
  }
});
```

**Key differences from vibeTest:**
- YOUR ANALYSIS: How do they differ?
- Different fixtures? Different semantics?

#### 4. Workspace Context Design

**YOUR DECISION: Where should workspace/project be specified?**

**Option A: On test/pipeline level**
```typescript
vibeWorkflow('deploy', { workspace: '/path/to/repo' }, async ({ runAgent }) => {
  // All agents inherit workspace
  const result = await runAgent({ agent: builder, prompt: '/build' });
});
```

**Option B: On agent definition**
```typescript
const builder = defineAgent({
  source: { type: 'git', repo: '/path/to/repo' }
});
```

**Option C: Both (with override)**
```typescript
vibeWorkflow('deploy', { workspace: '/default/repo' }, async ({ runAgent }) => {
  // Uses default workspace
  const result1 = await runAgent({ agent: builder, prompt: '/build' });

  // Override for specific agent
  const result2 = await runAgent({
    agent: deployer,
    workspace: '/other/repo',  // Override
    prompt: '/deploy'
  });
});
```

**YOUR RECOMMENDATION**: Choose one and justify

#### 5. Shared Primitives

**All primitives with RunContext support:**
- `defineAgent` - Used by both vibeTest and vibeWorkflow
- `prompt` - Used by both
- `judge` - Used by both? Or only vibeTest?
- Custom matchers - Available in both? Or only vibeTest?
- YOUR DESIGN: What's shared vs specific?

#### 5. API Simplicity Validation

**Confirm that users NEVER need to:**
- Manually capture git state
- Manually save artifacts
- Manually track tool calls
- Know about Vitest reporters/metadata/hooks

**Users ONLY:**
- Run agents
- Access auto-populated RunContext
- Use simple primitives

---

## Success Criteria

Your research report should:

✅ **BE PRESCRIPTIVE** - Tell us exactly how to build this, not just options
✅ **Design complete RunResult interface** - TypeScript + JSDoc, before/after content access
✅ **Design BOTH APIs** - vibeTest AND vibeWorkflow/vibePipeline (choose name)
✅ **Design ContextManager architecture** - Code sketch with lifecycle
✅ **Choose storage strategy** - Pick one: task.meta, fixture, or other (justify)
✅ **Prescribe capture patterns** - Exactly how to capture git, files (before/after), tools, hooks
✅ **Prescribe access patterns** - How test/reporter/matcher/judge access context
✅ **Solve memory management** - Choose approach for large data (lazy loading? streaming?)
✅ **Solve workspace context** - Where should workspace/project be specified? (test level? agent? both?)
✅ **Support loops/iteration** - How to implement "until condition met" patterns in workflows
✅ **Diagram Vitest integration** - Sequence diagram of context flow through Vitest
✅ **Study Claude Code hooks** - Deep dive into hooks documentation, prescribe usage
✅ **Study other frameworks** - Synthesize patterns from Playwright/Jest/Cypress
✅ **Be comprehensive** - Cover Vitest deeply, not superficially
✅ **Be concrete** - Code examples, not just concepts
✅ **Be actionable** - Clear recommendations we can implement immediately
✅ **Be critical** - Honest trade-offs, not just advocacy
✅ **Be DX-focused** - Optimize for before/after access, matcher ergonomics, user simplicity

---

## Constraints & Context

### Must Preserve
1. **Vitest-native** - No custom test runners
2. **Dual identity** - Testing and automation equally well
3. **TypeScript-first** - Excellent type inference
4. **Minimal surface** - Simple things should be simple
5. **Rich reporting** - Show RunContext beautifully
6. **Auto-capture** - Zero manual context management

### API Simplicity Principle ⭐ CRITICAL

**Users should NEVER manually manage:**
- ❌ Git state (we auto-capture)
- ❌ File contents (we auto-capture)
- ❌ Tool calls (we auto-capture)
- ❌ Hook emissions (we auto-capture)

**Users ONLY interact with:**
- ✅ `vibeTest` or `vibeWorkflow`
- ✅ `runAgent` - Returns RunResult with auto-populated context
- ✅ `result.fileChanges`, `result.gitState`, etc. - Simple access
- ✅ `judge`, matchers - They use RunContext internally

---

**Take your time. Go deep. Experiment. Synthesize. Recommend.**

**Focus especially on RunContext architecture - this is the foundation of the framework.**

Your research will define what vibe-check becomes. Make it count.
