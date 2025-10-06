# Design Decisions for @dao/vibe-check v1.3

**Status:** In Progress
**Date:** 2025-10-06
**Related:** specification-audit-report.md (Questions for Clarification section)

This document tracks architectural design decisions for 5 critical questions that must be resolved before implementing the specification.

---

## Decision 1: AgentExecution Design Pattern

### Question
Is AgentExecution a Promise subclass or a separate thenable object?

### Context
- **Spec Location:** Section 1.2:129-157, various usages throughout
- **Current State:** Spec shows AgentExecution with watch() method but unclear inheritance model
- **Related Issues:**
  - Critical Blocker #2: AgentExecution vs Promise<RunResult> mismatch
  - Consistency Issue #3: VibeTestContext missing cumulative state properties

### Options

#### Option A: Class Extending Promise<RunResult>
```typescript
export class AgentExecution extends Promise<RunResult> {
  watch(fn: (ctx: PartialRunResult) => void | Promise<void>): void;
}
```
**Pros:**
- Natural async/await support
- Works seamlessly with Promise.all(), Promise.race()
- Standard JavaScript semantics
- Better TypeScript inference

**Cons:**
- Complex inheritance (Promise subclassing requires careful constructor handling)
- Potential compatibility issues with some tools
- More difficult to implement correctly

#### Option B: Separate Thenable Object
```typescript
export class AgentExecution {
  then<T, U>(
    onFulfilled?: (value: RunResult) => T | Promise<T>,
    onRejected?: (reason: unknown) => U | Promise<U>
  ): Promise<T | U>;
  watch(fn: (ctx: PartialRunResult) => void | Promise<void>): void;
}
```
**Pros:**
- Simpler implementation
- Full control over thenable behavior
- Easier to test

**Cons:**
- Not a true Promise (instanceof Promise === false)
- May confuse users expecting Promise behavior
- Doesn't work with Promise.all() directly

### Recommendation
**Option A: Extend Promise<RunResult>**

**Rationale:**
- Better developer experience (natural async/await)
- Matches user expectations from fixture signature
- Standard pattern used by libraries like Bluebird
- Worth the implementation complexity for API ergonomics

### Final Decision
**STATUS:** ✅ APPROVED (2025-10-06)

**Decision:** **Option B - Thenable AgentExecution Class**

**Rationale:**
- Matches desired ergonomics exactly (await-able, chainable watch())
- Simpler to implement than Promise subclass (no fighting with Promise internals)
- Still fully Promise-compatible (works with Promise.all/race/allSettled)
- Enables fail-fast via watchers + AbortController
- Easier to test and maintain
- User prioritized simplicity over `instanceof Promise === true`

**Implementation Signature:**
```typescript
export class AgentExecution {
  private promise: Promise<RunResult>;
  private abortController = new AbortController();
  private watchers: WatcherFn[] = [];

  watch(fn: (ctx: PartialRunResult) => void | Promise<void>): this;
  then<T, U>(onFulfilled?, onRejected?): Promise<T | U>;
  catch<U>(onRejected?): Promise<RunResult | U>;
  finally(onFinally?): Promise<RunResult>;
  abort(reason?: string): void;
}
```

**Watcher Behavior (Approved):**
- **Trigger frequency:** Every significant hook event (PostToolUse, TodoUpdate, Notification)
- **Multiple watchers:** All run on each update, execution aborts on first failure
- **Execution order:** Registration order (predictable, sequential)
- **Async support:** Yes - watchers can be sync or async

### Impact on Specification
**Sections to Update:**
- 1.2:129-157 (AgentExecution definition - update to thenable class)
- 2.4:893 (runAgent standalone signature - returns AgentExecution)
- Add Section 1.2.1: PartialRunResult interface definition
- Add Section 1.2.2: WatcherFn type definition
- Add Section 4.2.3: Hook event processing for real-time watcher triggers
- All example code showing runAgent usage and watch() patterns

---

## Decision 2: SDK Package Name and Exports

### Question
Does the '@anthropic-ai/claude-code' package exist? What are its actual exports?

### Context
- **Spec Location:** Imports throughout specification
- **Current State:** Spec assumes @anthropic-ai/claude-code exists with specific exports (query, SDKUserMessage, etc.)
- **Related Issues:**
  - Critical Blocker #1: SDKUserMessage type not defined
  - Critical Blocker #10: query() function not imported/defined
  - Critical Blocker #11: Missing core dependencies

### Options

#### Option A: Package Exists as '@anthropic-ai/claude-code'
**Pros:**
- Direct implementation with no import changes
- Spec matches reality
- Clean public API

**Cons:**
- Package may not exist yet
- Exports may differ from spec assumptions
- External dependency risk

#### Option B: Different Package Name (e.g., '@anthropic-ai/sdk')
**Pros:**
- Use real, published SDK
- Known exports and stability
- Community support

**Cons:**
- Need to update all import statements in spec
- May lack vibe-check-specific primitives
- Could require wrapper layer

#### Option C: Create Internal Types File (Hybrid Approach)
```typescript
// src/sdk/types.ts - Bridge to actual SDK
export type { SDKUserMessage } from '@anthropic-ai/actual-package';
export { query } from '@anthropic-ai/actual-package';

// Or define if not exported:
export interface SDKUserMessage {
  role: 'user';
  content: string | Array<{ type: 'text' | 'image'; text?: string; image?: string }>;
}
```
**Pros:**
- Isolates SDK coupling to one file
- Can adapt to SDK changes easily
- Provides our own type definitions if needed

**Cons:**
- Extra maintenance layer
- Potential version drift

### Recommendation
**Option C: Create Internal Types/Bridge File**

**Rationale:**
- Most resilient to SDK changes
- Allows implementation to start without waiting for SDK confirmation
- Can easily swap SDK packages without changing vibe-check code
- Provides clear boundary for SDK coupling

**Implementation Strategy:**
1. Create `src/sdk/types.ts` with all SDK type definitions
2. Create `src/sdk/bridge.ts` with runtime imports
3. Update spec to reference our types file instead of direct SDK imports
4. Document actual SDK package name in package.json when confirmed

### Final Decision
**STATUS:** ✅ APPROVED (2025-10-06)

**Decision:** **Option C - Create Internal Types/Bridge File**

**Rationale:**
- Most resilient to SDK changes
- Allows implementation to start without waiting for SDK confirmation
- Can easily swap SDK packages without changing vibe-check code
- Provides clear boundary for SDK coupling
- Isolates external dependency risk

**Implementation:**
```typescript
// src/sdk/types.ts
export type { SDKUserMessage } from '@anthropic-ai/claude-code';
export { query } from '@anthropic-ai/claude-code';

```

### Impact on Specification
**Sections to Update:**
- 5.1 (package.json dependencies - add @anthropic-ai/claude-code)
- All import statements referencing @anthropic-ai/claude-code → import from src/sdk/types
- 2.4 (prompt function signature - update imports)
- 6.4 (judge implementation - update imports)
- Add new section 5.5 "SDK Integration Layer" documenting bridge pattern

---

## Decision 3: Rubric Type Structure

### Question
Should the framework enforce any structure on the Rubric type?

### Context
- **Spec Location:** 1.10:634 (currently `export type Rubric = unknown`)
- **Current State:** Type is completely open, no validation or guidance
- **Related Issues:**
  - Critical Blocker #5: Rubric type is unknown - too permissive
  - Documentation Gap: judge.mdx needs complete rewrite

### Options

#### Option A: Keep as `unknown`
```typescript
export type Rubric = unknown;
```
**Pros:**
- Maximum flexibility for users
- No constraints on rubric format
- Can use any LLM-friendly format (JSON, YAML, markdown)

**Cons:**
- Zero type safety
- No IDE autocomplete
- Runtime errors likely
- Users have no guidance

#### Option B: Enforce Base Interface
```typescript
export interface BaseRubric {
  criteria: Record<string, {
    description: string;
    weight?: number;
  }>;
  scoring?: 'binary' | 'scale' | 'percentage';
}
export type Rubric = BaseRubric;
```
**Pros:**
- Type safety
- IDE support
- Clear structure

**Cons:**
- May be too restrictive
- Doesn't support freeform rubrics
- Limits advanced use cases

#### Option C: Provide Optional Base Interfaces (Recommended)
```typescript
// Base - for users who want structure
export interface StructuredRubric {
  criteria: Record<string, {
    description: string;
    weight?: number;
    required?: boolean;
  }>;
  scoring?: 'binary' | 'scale' | 'percentage';
  passThreshold?: number;
}

// Freeform - for users who want flexibility
export type FreeformRubric = string | Record<string, unknown>;

// Union - accept both
export type Rubric = StructuredRubric | FreeformRubric;
```
**Pros:**
- Type safety for structured rubrics
- Still allows freeform strings/objects
- Best of both worlds
- Can provide helper functions for structured rubrics

**Cons:**
- More complex types
- Need good documentation

### Recommendation
**Option C: Provide Optional Base Interfaces**

**Rationale:**
- Serves both advanced users (freeform) and beginners (structured)
- Type narrowing gives good IDE support when using StructuredRubric
- Can ship helper utilities like `createStructuredRubric()` for DX
- Aligns with "DX-first" philosophy from CLAUDE.md

**Additional Helpers:**
```typescript
// Helper for creating structured rubrics with validation
export function createStructuredRubric(config: StructuredRubric): StructuredRubric;

// Helper for validating rubrics
export function validateRubric(rubric: Rubric): rubric is StructuredRubric;
```

### Final Decision
**STATUS:** ✅ APPROVED (2025-10-06)

**Decision:** **Option C - Provide Optional Base Interfaces**

**Rationale:**
- Serves both advanced users (freeform) and beginners (structured)
- Type narrowing gives IDE support when using StructuredRubric
- Can ship helper utilities for DX
- Aligns with "DX-first" philosophy
- Maximum flexibility without sacrificing type safety for those who want it

**Implementation:**
```typescript
export interface StructuredRubric {
  criteria: Record<string, {
    description: string;
    weight?: number;
    required?: boolean;
  }>;
  scoring?: 'binary' | 'scale' | 'percentage';
  passThreshold?: number;
}

export type FreeformRubric = string | Record<string, unknown>;
export type Rubric = StructuredRubric | FreeformRubric;

// Helpers
export function createStructuredRubric(config: StructuredRubric): StructuredRubric;
export function validateRubric(rubric: Rubric): rubric is StructuredRubric;
```

### Impact on Specification
**Sections to Update:**
- 1.10:634 (Rubric type definition - replace unknown with union type)
- 2.4:903-915 (judge function signature - update type imports)
- 6.4 (judge implementation - formatJudgePrompt needs rubric handling for both types)
- judge.mdx - Add examples of both structured and freeform rubrics
- Add new section 2.5: Helper Functions (createStructuredRubric, validateRubric)
- Add rubric selection guide to documentation

---

## Decision 4: Hook Capture Failure Handling

### Question
Should hook capture failures fail the test or just emit warnings?

### Context
- **Spec Location:** Inconsistency between 7.1:2026-2041 (graceful degradation) and 4.2 (strict capture)
- **Current State:** Spec is ambiguous about error handling policy
- **Related Issues:**
  - Consistency Issue #5: Hook capture error handling inconsistent
  - Implementation Recommendation: Risk area - timing issues with async writes

### Options

#### Option A: Fail Test on Hook Capture Errors
```typescript
// In ContextManager
if (!hookFile.exists()) {
  throw new HookCaptureError(`Failed to capture ${hookType} event`);
}
```
**Pros:**
- Ensures data integrity
- Users know when data is missing
- Easier to debug issues
- Clear failure modes

**Cons:**
- Flaky tests (timing issues with file writes)
- External factors (disk full, permissions) fail tests
- Poor developer experience
- Breaks "automation first" goal

#### Option B: Warn and Continue (Graceful Degradation)
```typescript
// In ContextManager
if (!hookFile.exists()) {
  console.warn(`[vibe-check] Failed to capture ${hookType} event`);
  // Continue with partial data
  return { tools: [], timeline: [], files: new Map() };
}
```
**Pros:**
- Resilient to transient failures
- Better for automation/CI pipelines
- Doesn't break user workflows
- Partial data still useful

**Cons:**
- Silent data loss
- Users may not notice missing data
- Harder to debug hook issues
- Could mask real problems

#### Option C: Configurable with Strict Mode (Hybrid)
```typescript
// In vibeTest options
vibeTest('example', async ({ runAgent }) => {
  // ...
}, {
  strict: true // Fail on hook errors (default: false)
});

// Or global config
export default defineVibeConfig({
  strictHookCapture: true
});
```
**Pros:**
- Flexibility for different use cases
- Default is resilient, opt-in to strict
- Clear control for users
- Best of both worlds

**Cons:**
- More complexity
- Yet another config option
- Need to document when to use strict mode

### Recommendation
**Option B: Warn and Continue (Graceful Degradation)**

**Rationale:**
- Aligns with "automation first" design philosophy
- Hook capture is an enhancement, not a requirement
- Tests should pass/fail based on assertions, not infrastructure
- Users can still detect issues via warnings in logs
- Matches behavior of other test frameworks (Jest, Playwright)

**Mitigation for Data Loss Concerns:**
- Log warnings prominently (stderr, not stdout)
- Include hook capture status in RunResult metadata
- Add matcher: `expect(result).toHaveCompleteHookData()` for users who need strict mode
- Document best practices for hook capture in CI

### Final Decision
**STATUS:** ✅ APPROVED (2025-10-06)

**Decision:** **Option B - Warn and Continue (Graceful Degradation)**

**Rationale:**
- Aligns with "automation first" design philosophy
- Hook capture is enhancement, not requirement
- Tests should pass/fail based on assertions, not infrastructure
- Users can still detect issues via warnings in logs
- Better for CI/automation pipelines
- Matches behavior of other test frameworks (Jest, Playwright)

**Implementation:**
```typescript
// In ContextManager
if (!hookFile.exists()) {
  console.warn(`[vibe-check] Failed to capture ${hookType} event - continuing with partial data`);
  // Continue with partial data
}

// Add to RunResult
interface RunResult {
  // ... existing fields
  hookCaptureStatus: {
    complete: boolean;
    missingEvents: string[];
    warnings: string[];
  };
}

// Optional strict matcher
expect(result).toHaveCompleteHookData(); // Throws if hookCaptureStatus.complete === false
```

### Impact on Specification
**Sections to Update:**
- 4.2 (ContextManager implementation - add graceful degradation error handling)
- 7.1:2026-2041 (Hook capture section - formalize graceful degradation policy)
- 1.5 (RunResult interface - add hookCaptureStatus field)
- Add new matcher: toHaveCompleteHookData() in Section 3.x
- Documentation: Add troubleshooting section for hook capture
- Add logging standards section (stderr for warnings, structured format)

---

## Decision 5: Default Model Selection

### Question
What should be the default model when users don't specify one?

### Context
- **Spec Location:** Various examples show different models (sonnet, opus, haiku)
- **Current State:** No clear default specified
- **Related Issues:**
  - Documentation examples use different models
  - No guidance for users on model selection

### Options

#### Option A: Hardcode claude-3-5-sonnet-latest
```typescript
export const DEFAULT_MODEL = 'claude-3-5-sonnet-latest';
```
**Pros:**
- Simple, predictable
- Most capable model
- Good default for evaluation use cases

**Cons:**
- Higher cost for automation
- Couples framework to specific model version
- May not be best for all tasks

#### Option B: Environment Variable with Fallback
```typescript
export const DEFAULT_MODEL =
  process.env.VIBE_DEFAULT_MODEL || 'claude-3-5-sonnet-latest';
```
**Pros:**
- Flexible per-environment
- Can use cheaper models in CI
- Users control costs
- Follows 12-factor app principles

**Cons:**
- Requires setup/documentation
- Different behavior in different environments
- Could be confusing

#### Option C: Task-Specific Defaults
```typescript
export const DEFAULT_MODELS = {
  automation: 'claude-3-5-sonnet-latest',
  evaluation: 'claude-3-5-sonnet-latest',
  judge: 'claude-3-5-haiku-latest' // Cheaper for judgments
};
```
**Pros:**
- Optimized for use case
- Cost-effective
- Intelligent defaults

**Cons:**
- Complex to implement
- How to detect "task type"?
- May surprise users

#### Option D: No Default (Require Explicit)
```typescript
// Force users to specify
export function runAgent(opts: RunAgentOptions): AgentExecution {
  if (!opts.agent?.model && !opts.model) {
    throw new Error('Must specify model in agent config or runAgent options');
  }
}
```
**Pros:**
- No surprises
- Users make conscious choice
- Clear cost control

**Cons:**
- Verbose
- Bad DX for quick testing
- Friction for new users

### Recommendation
**Option B: Environment Variable with Sonnet Fallback**

**Rationale:**
- Best balance of flexibility and DX
- Allows cost control in CI (set VIBE_DEFAULT_MODEL=claude-3-5-haiku-latest)
- Good default for local development (latest sonnet)
- Standard pattern (DATABASE_URL, API_KEY, etc.)
- Can document in setup guide

**Implementation:**
```typescript
// src/config/defaults.ts
export const DEFAULT_MODEL =
  process.env.VIBE_DEFAULT_MODEL || 'claude-3-5-sonnet-latest';

// Also support in defineAgent
export function defineAgent(config: Partial<AgentConfig>): AgentConfig {
  return {
    name: config.name || 'agent',
    model: config.model || DEFAULT_MODEL, // Use default here
    systemPrompt: config.systemPrompt,
    // ...
  };
}
```

**Documentation Additions:**
- Add VIBE_DEFAULT_MODEL to .env.example
- Document cost optimization strategies
- Add model selection guide to docs

### Final Decision
**STATUS:** ✅ APPROVED (2025-10-06)

**Decision:** **Option B - Environment Variable with Sonnet Fallback**

**Rationale:**
- Best balance of flexibility and DX
- Allows cost control in CI (set VIBE_DEFAULT_MODEL=claude-3-5-haiku-latest)
- Good default for local development (latest sonnet)
- Standard pattern (DATABASE_URL, API_KEY, etc.)
- Can document in setup guide
- No surprises - clear and predictable

**Implementation:**
```typescript
// src/config/defaults.ts
export const DEFAULT_MODEL =
  process.env.VIBE_DEFAULT_MODEL || 'claude-3-5-sonnet-latest';

// In defineAgent
export function defineAgent(config: Partial<AgentConfig>): AgentConfig {
  return {
    name: config.name || 'agent',
    model: config.model || DEFAULT_MODEL,
    systemPrompt: config.systemPrompt,
    // ...
  };
}
```

### Impact on Specification
**Sections to Update:**
- 2.3:873-883 (defineAgent - add model default using DEFAULT_MODEL)
- 1.9:574-595 (RunAgentOptions - document default behavior)
- 5.2 (.env.example - add VIBE_DEFAULT_MODEL with comment)
- Add new section 5.6 "Model Selection and Cost Optimization"
- Update all examples to show when model is optional
- Add config section documenting environment variables

---

## Decision Summary

| Decision | Status | Final Decision | Priority | Date Approved |
|----------|--------|----------------|----------|---------------|
| 1. AgentExecution Pattern | ✅ APPROVED | Thenable class (not Promise subclass) | HIGH | 2025-10-06 |
| 2. SDK Package | ✅ APPROVED | Create bridge layer (src/sdk) | HIGH | 2025-10-06 |
| 3. Rubric Type | ✅ APPROVED | Optional base interfaces + freeform | MEDIUM | 2025-10-06 |
| 4. Hook Failure Handling | ✅ APPROVED | Warn and continue (graceful) | HIGH | 2025-10-06 |
| 5. Default Model | ✅ APPROVED | Env var + sonnet fallback | LOW | 2025-10-06 |

**ALL DECISIONS FINALIZED** - Ready to proceed to Phase 2 (Specification Fixes)

---

## Dependencies for Phase 2 (Spec Fixes)

Once these decisions are finalized, the following specification sections can be fixed:

### Dependent on Decision 1 (AgentExecution):
- Critical Blocker #2: AgentExecution vs Promise<RunResult> mismatch
- Sections: 1.2, 2.4, all runAgent examples

### Dependent on Decision 2 (SDK Package):
- Critical Blocker #1: SDKUserMessage type
- Critical Blocker #10: query() function
- Critical Blocker #11: Missing dependencies
- Sections: 5.1, all imports, 2.4, 6.4

### Dependent on Decision 3 (Rubric Type):
- Critical Blocker #5: Rubric type too permissive
- Documentation Gap: judge.mdx
- Sections: 1.10, 2.4, 6.4

### Dependent on Decision 4 (Hook Failures):
- Consistency Issue #5: Hook error handling
- Sections: 4.2, 7.1, new matcher

### Dependent on Decision 5 (Default Model):
- Documentation consistency
- Sections: 2.3, 1.9, 5.2, examples

---

## Next Steps

1. ✅ Document created with all 5 decisions
2. ✅ Review decisions with user
3. ✅ Finalize all decisions
4. ⏳ Create dependency map for Phase 2 batch execution
5. ⏳ Proceed to Phase 2: Specification Fixes

**Status:** All design decisions approved on 2025-10-06. Ready to proceed to Phase 2.
