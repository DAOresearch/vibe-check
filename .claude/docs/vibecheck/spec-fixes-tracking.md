# Specification Fixes Tracking - Phase 2

**Status:** In Progress
**Date Started:** 2025-10-06
**Specification Version:** v1.3 → v1.4
**Total Issues:** 24 (13 Critical Blockers + 11 Consistency Issues)

**Related Documents:**
- Audit Report: `.claude/docs/vibecheck/specification-audit-report.md`
- Design Decisions: `.claude/docs/vibecheck/design-decisions.md`

---

## Batch Organization Strategy

Fixes are organized into **7 logical batches** based on:
- Related functionality
- Dependencies between fixes
- Specification sections affected
- Design decision dependencies

---

## Batch 1: SDK Integration & Type Foundations 🔴 CRITICAL

**Purpose:** Establish SDK bridge layer and core missing types
**Dependencies:** Design Decision #2 (SDK Bridge Layer)
**Target Version:** v1.4-alpha.1

### Fixes in This Batch

| # | Issue | Type | Sections | Status |
|---|-------|------|----------|--------|
| 1 | SDKUserMessage type not defined | Critical Blocker #1 | 2.4, 6.4 | ✅ Complete |
| 2 | query() function not imported | Critical Blocker #10 | 6.4 | ✅ Complete |
| 3 | TestAttachment import missing | Critical Blocker #13 | 1.1 | ✅ Complete |

### Implementation Approach

**Create new Section 5.5: SDK Integration Layer**

```typescript
// src/sdk/types.ts - Bridge to SDK
export type { SDKUserMessage } from '@anthropic-ai/claude-code';
export { query } from '@anthropic-ai/claude-code';

// Type imports in spec
import type { TestAttachment } from 'vitest';
```

**Sections to Update:**
- Add Section 5.5 (new): SDK Integration Layer documentation
- Update 2.4: Import SDKUserMessage from src/sdk/types
- Update 6.4: Import query from src/sdk/types
- Update 1.1: Import TestAttachment from vitest

---

## Batch 2: AgentExecution & Reactive Watchers 🔴 CRITICAL

**Purpose:** Implement thenable AgentExecution class with fail-fast watchers
**Dependencies:** Design Decision #1 (Thenable AgentExecution)
**Target Version:** v1.4-alpha.2

### Fixes in This Batch

| # | Issue | Type | Sections | Status |
|---|-------|------|----------|--------|
| 4 | AgentExecution vs Promise mismatch | Critical Blocker #2 | 1.2, 2.4 | ✅ Complete |

### Implementation Approach

**Update Section 1.2: AgentExecution Class**

```typescript
export class AgentExecution {
  private promise: Promise<RunResult>;
  private abortController: AbortController;
  private watchers: WatcherFn[];

  watch(fn: WatcherFn): this;
  then<T, U>(onFulfilled?, onRejected?): Promise<T | U>;
  catch<U>(onRejected?): Promise<RunResult | U>;
  finally(onFinally?): Promise<RunResult>;
  abort(reason?: string): void;
}
```

**Add Section 1.2.1: PartialRunResult Interface**

```typescript
export interface PartialRunResult {
  files: FileChangeMap;
  tools: ToolCall[];
  timeline: TimelineEvent[];
  todos?: TodoState;
}
```

**Add Section 1.2.2: WatcherFn Type**

```typescript
export type WatcherFn = (ctx: PartialRunResult) => void | Promise<void>;
```

**Sections to Update:**
- Update 1.2: Replace Promise subclass with thenable implementation
- Add 1.2.1: PartialRunResult interface definition
- Add 1.2.2: WatcherFn type definition
- Update 2.4: runAgent returns AgentExecution (not Promise<RunResult>)
- Add Section 4.2.3: Hook event processing for real-time watcher triggers

---

## Batch 3: Judge System Complete 🔴 CRITICAL

**Purpose:** Fix all judge-related missing types and functions
**Dependencies:** Design Decision #3 (Rubric Type Structure)
**Target Version:** v1.4-alpha.3

### Fixes in This Batch

| # | Issue | Type | Sections | Status |
|---|-------|------|----------|--------|
| 5 | DefaultJudgmentResult not imported | Critical Blocker #3 | 1.1, 1.10, 2.4 | ✅ Complete |
| 6 | Rubric type too permissive | Critical Blocker #5 | 1.10, 2.4, 6.4 | ✅ Complete |
| 7 | JUDGE_SYSTEM_PROMPT not defined | Critical Blocker #6 | 6.4 | ✅ Complete |
| 8 | JudgmentFailedError not defined | Critical Blocker #7 | 6.4 | ✅ Complete |
| 9 | formatJudgePrompt not defined | Critical Blocker #8 | 6.4 | ✅ Complete |
| 10 | parseJudgmentResponse not defined | Critical Blocker #9 | 6.4 | ✅ Complete |
| 11 | judge() fixture vs standalone differ | Consistency Issue #1 | 1.1, 2.4 | ✅ Complete |

### Implementation Approach

**Update Section 1.10: Rubric Types**

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

export interface DefaultJudgmentResult {
  passed: boolean;
  score?: number;
  criteria: Record<string, { passed: boolean; reason: string }>;
  feedback?: string;
}
```

**Add Section 2.5: Helper Functions**

```typescript
export function createStructuredRubric(config: StructuredRubric): StructuredRubric;
export function validateRubric(rubric: Rubric): rubric is StructuredRubric;
```

**Update Section 6.4: Judge Implementation**

```typescript
const JUDGE_SYSTEM_PROMPT = `You are an expert code evaluator...`;

export class JudgmentFailedError extends Error {
  constructor(public judgment: unknown) {
    super('Judgment failed');
    this.name = 'JudgmentFailedError';
  }
}

function formatJudgePrompt(config: {...}): AsyncIterable<SDKUserMessage> { ... }
function parseJudgmentResponse(response: unknown, schema?: z.ZodType): unknown { ... }
```

**Align judge() signatures:**
- Fixture (1.1): Match standalone signature
- Standalone (2.4): Use unified signature with generic support

**Sections to Update:**
- Update 1.10: Replace `Rubric = unknown` with union type
- Move DefaultJudgmentResult before first use (1.10, before 1.1 reference)
- Add 2.5: Helper functions for rubrics
- Update 6.4: Add all missing constants and helper functions
- Align 1.1 and 2.4: judge() signatures must match

---

## Batch 4: Dependencies & Package Setup 🔴 CRITICAL

**Purpose:** Add all missing dependencies to package.json
**Dependencies:** Design Decision #2 (SDK Package)
**Target Version:** v1.4-alpha.4

### Fixes in This Batch

| # | Issue | Type | Sections | Status |
|---|-------|------|----------|--------|
| 12 | zod-to-json-schema missing | Critical Blocker #4 | 5.1 | ✅ Complete |
| 13 | Missing core dependencies | Critical Blocker #11 | 5.1 | ✅ Complete |

### Implementation Approach

**Update Section 5.1: package.json**

```json
{
  "dependencies": {
    "@anthropic-ai/claude-code": "^0.1.0",
    "zod": "^3.23.0",
    "zod-to-json-schema": "^3.23.0",
    "p-limit": "^5.0.0",
    "pathe": "^1.1.2",
    "fs-extra": "^11.2.0",
    "minimatch": "^10.0.0",
    "vitest": "^3.2.0"
  }
}
```

**Sections to Update:**
- Update 5.1: Add all missing dependencies

---

## Batch 5: API Signature Alignments & Type Exports ⚠️ CONSISTENCY

**Purpose:** Fix inconsistent API signatures and missing exports
**Dependencies:** Design Decision #5 (Default Model)
**Target Version:** v1.4-alpha.5

### Fixes in This Batch

| # | Issue | Type | Sections | Status |
|---|-------|------|----------|--------|
| 14 | AgentConfig not exported | Critical Blocker #12 | 2.3 | ✅ Complete |
| 15 | RunAgentOptions inconsistent fields | Consistency Issue #2 | 1.9, 2.4 | ✅ Complete |
| 16 | Default model selection | Consistency Issue (from Decision #5) | 2.3, 1.9, 5.6 | ✅ Complete |

### Implementation Approach

**Update Section 2.3: defineAgent**

```typescript
export interface AgentConfig {  // Add export
  name: string;
  model?: string;  // Optional - uses DEFAULT_MODEL if not provided
  systemPrompt?: string;
  // ...
}

export const DEFAULT_MODEL = process.env.VIBE_DEFAULT_MODEL || 'claude-3-5-sonnet-latest';

export function defineAgent(config: Partial<AgentConfig>): AgentConfig {
  return {
    name: config.name || 'agent',
    model: config.model || DEFAULT_MODEL,
    // ...
  };
}
```

**Update Section 1.9: RunAgentOptions**

```typescript
export interface RunAgentOptions {
  agent: AgentConfig;
  prompt: string | AsyncIterable<SDKUserMessage>;  // Accept both!
  workspace?: string;
  // ...
}
```

**Add Section 5.2: .env.example**

```bash
# Default model for agent execution (optional)
# Defaults to claude-3-5-sonnet-latest if not set
VIBE_DEFAULT_MODEL=claude-3-5-sonnet-latest
```

**Add Section 5.6: Model Selection Guide**

**Sections to Update:**
- Update 2.3: Export AgentConfig, add DEFAULT_MODEL constant
- Update 1.9: prompt accepts string | AsyncIterable<SDKUserMessage>
- Update 5.2: Add .env.example with VIBE_DEFAULT_MODEL
- Add 5.6: Model selection and cost optimization guide

---

## Batch 6: Hook Capture & RunResult Enhancements ⚠️ CONSISTENCY

**Purpose:** Formalize hook error handling and add hookCaptureStatus
**Dependencies:** Design Decision #4 (Hook Failure Handling)
**Target Version:** v1.4-alpha.6

### Fixes in This Batch

| # | Issue | Type | Sections | Status |
|---|-------|------|----------|--------|
| 17 | Hook error handling inconsistent | Consistency Issue #5 | 4.2, 7.1 | ✅ Complete |
| 18 | Git state detection not specified | Consistency Issue #10 | 4.2 | ✅ Complete |
| 19 | Timeline events type inconsistent | Consistency Issue #6 | 1.8 | ✅ Complete |

### Implementation Approach

**Update Section 1.5: RunResult Interface**

```typescript
export interface RunResult {
  // ... existing fields
  hookCaptureStatus: {
    complete: boolean;
    missingEvents: string[];
    warnings: string[];
  };
}
```

**Update Section 4.2: ContextManager - Error Handling**

```typescript
async processHookEvent(event: HookEvent): Promise<void> {
  try {
    // Process hook event
  } catch (error) {
    // Graceful degradation - log warning, continue
    console.warn(`[vibe-check] Failed to process hook: ${error.message}`);
    this.hookCaptureStatus.warnings.push(error.message);
    // Don't throw - continue execution
  }
}
```

**Update Section 7.1: Hook Capture Policy**

Formalize graceful degradation:
- Log warnings to stderr
- Continue execution with partial data
- Populate hookCaptureStatus in RunResult

**Add Matcher: toHaveCompleteHookData()**

```typescript
expect(result).toHaveCompleteHookData();
```

**Update Section 1.8: TimelineEvent Union**

Ensure all event types are included in union.

**Sections to Update:**
- Update 1.5: Add hookCaptureStatus field
- Update 4.2: Add graceful degradation error handling + git detection
- Update 7.1: Formalize graceful degradation policy
- Update 1.8: Ensure TimelineEvent union is complete
- Add matcher in Section 3.x: toHaveCompleteHookData()

---

## Batch 7: Naming, Documentation & Minor Fixes ⚠️ LOW PRIORITY

**Purpose:** Fix naming inconsistencies and documentation gaps
**Dependencies:** None
**Target Version:** v1.4 (Final)

### Fixes in This Batch

| # | Issue | Type | Sections | Status |
|---|-------|------|----------|--------|
| 20 | Cost reporter name mismatch | Consistency Issue #9 | 2.6, 4.3 | ✅ Complete |
| 21 | TestContextManager not internal | Consistency Issue #11 | 4.4 | ✅ Complete |
| 22 | Workspace config pattern unclear | Consistency Issue #4 | 4.4, examples | ✅ Complete |
| 23 | File lazy loading API unclear | Consistency Issue #8 | 1.6 | ✅ Complete |
| 24 | MCP config not used | Consistency Issue #7 | 1.9, examples | ✅ Complete |

### Implementation Approach

**Naming Fixes:**
- Consistently use `VibeCostReporter` (not VibeReporter)
- Rename `TestContextManager` → `_TestContextManager` (mark internal)

**Documentation Additions:**
- Document workspace precedence rules (workflow default, runAgent override)
- Document FileChange.stream() is for files >10MB
- Mark MCPServerConfig as "future feature" or add usage example

**Sections to Update:**
- Update 2.6, 4.3: Use consistent name VibeCostReporter
- Update 4.4: Rename to _TestContextManager
- Update 4.4: Document workspace precedence
- Update 1.6: Document when to use stream() vs text()
- Update 1.9: Add MCP example or mark as future

---

## Progress Summary

| Batch | Status | Issues Fixed | Version |
|-------|--------|--------------|---------|
| 1. SDK Integration | ✅ Complete | 3/3 | v1.4-alpha.1 |
| 2. AgentExecution | ✅ Complete | 1/1 | v1.4-alpha.2 |
| 3. Judge System | ✅ Complete | 7/7 | v1.4-alpha.3 |
| 4. Dependencies | ✅ Complete | 2/2 | v1.4-alpha.4 |
| 5. API Alignments | ✅ Complete | 3/3 | v1.4-alpha.5 |
| 6. Hook Capture | ✅ Complete | 3/3 | v1.4-alpha.6 |
| 7. Minor Fixes | ✅ Complete | 5/5 | v1.4 |
| **TOTAL** | **✅ 100% Complete** | **24/24** | **v1.4 FINAL** |

---

## Execution Plan

### Incremental Approach

1. **Execute one batch at a time**
2. **Update spec to alpha version** after each batch (1.4-alpha.1, alpha.2, etc.)
3. **Check off completed items** in this tracking doc
4. **Show user changes** and get approval before next batch
5. **Final bump to v1.4** after all batches complete

### Version Management

- **Current:** v1.3
- **During work:** v1.4-alpha.1 → v1.4-alpha.7 (one per batch)
- **Final:** v1.4 (after all batches complete)

---

## Next Steps

1. ✅ Tracking document created
2. ✅ Present batch structure to user for approval
3. ✅ Execute Batch 1: SDK Integration
4. ✅ Execute Batches 2-7 sequentially
5. ✅ Final spec version bump to v1.4
6. ✅ Update changelog
7. ⏳ Proceed to Phase 3: Documentation Updates

**Phase 2 Status:** ✅ **COMPLETE** - All 24 issues resolved, specification updated to v1.4

---

## Changelog Template (To be added to spec header)

```markdown
## Changelog

### v1.4 (2025-10-06)

**Design Decisions Implemented:**
- AgentExecution as thenable class with fail-fast watchers
- SDK bridge layer for isolated dependency management
- Structured + freeform rubric types for flexibility
- Graceful hook capture degradation
- Environment variable model defaults

**Critical Blockers Fixed (13):**
- [List all 13 blockers]

**Consistency Issues Fixed (11):**
- [List all 11 consistency issues]

**New Sections Added:**
- 1.2.1: PartialRunResult interface
- 1.2.2: WatcherFn type
- 2.5: Helper functions
- 4.2.3: Real-time hook processing
- 5.5: SDK integration layer
- 5.6: Model selection guide

**Breaking Changes:**
- AgentExecution is thenable (not Promise subclass)
- Rubric type changed from unknown to union
- RunResult adds hookCaptureStatus field
```

---

## Post-Phase 2 Re-Audit

After completing Phase 2, a comprehensive re-audit was conducted on v1.4 and revealed **29 additional issues** (8 critical blockers + 12 consistency issues + 9 documentation gaps).

**Next Phase:** Phase 2.1 - Specification Fixes (Post-Audit v2)

**See:**
- **Tracking:** `.claude/docs/vibecheck/spec-fixes-tracking-phase-2.1.md`
- **Audit Report:** `.claude/docs/vibecheck/specification-audit-v2.md`
- **Command:** `/tmp:phase2.1-spec-fixes`

**Status:** Phase 2.1 work required before implementation can begin.
