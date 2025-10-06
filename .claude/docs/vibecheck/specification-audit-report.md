# Technical Specification Deep Audit: @dao/vibe-check v1.3

## 📊 Specification Audit Results

**Implementation Ready?** ❌ NO

**Issue Counts:**
- 🚨 Critical Blockers: 13
- ⚠️ Consistency Issues: 11
- 📄 Documentation Gaps: 7
- ❓ Questions for Clarification: 5

**Overall Assessment:**
The specification contains several critical type inconsistencies, missing dependencies, and implementation gaps that must be resolved before implementation can begin. While the overall architecture is sound, key areas like the judge() function signature, AgentExecution return types, and prompt() function need significant clarification.

**Recommendation:**
FIX BLOCKERS FIRST

---

## 🚨 Critical Blockers (Implementation Impossible Without Fixes)

### 1. SDKUserMessage Type Not Defined
**Problem:** The `prompt()` function returns `AsyncIterable<SDKUserMessage>` but this type is never imported or defined
**Location:** Section 2.4:936 (prompt function signature)
**Impact:** Cannot implement prompt() without knowing the structure of SDKUserMessage
**Fix:**
```typescript
// Add to type imports at the top of implementation
import type { SDKUserMessage } from '@anthropic-ai/claude-code';

// Or define if not exported from SDK:
interface SDKUserMessage {
  role: 'user';
  content: string | Array<{ type: 'text' | 'image'; text?: string; image?: string }>;
}
```
**Priority:** HIGH

### 2. AgentExecution vs Promise<RunResult> Mismatch
**Problem:** Fixture runAgent returns `AgentExecution` (1.2:126-145) but standalone returns `Promise<RunResult>` (2.4:893)
**Location:** 1.1:33 vs 2.4:893
**Impact:** Unclear whether AgentExecution is a Promise subclass or separate type
**Fix:**
```typescript
// Clarify that AgentExecution extends Promise<RunResult>:
export class AgentExecution extends Promise<RunResult> {
  watch(fn: (ctx: PartialRunResult) => void | Promise<void>): void;
}

// Update standalone signature:
export function runAgent(opts: RunAgentOptions): AgentExecution;
```
**Priority:** HIGH

### 3. DefaultJudgmentResult Type Referenced But Not Imported
**Problem:** `DefaultJudgmentResult` used in judge generic (1.1:43) but never defined or imported
**Location:** 1.1:43, 2.4:903
**Impact:** Type errors when implementing judge function
**Fix:**
```typescript
// Move DefaultJudgmentResult definition (1.10:654-669) before its first use
// Or import it where needed
export { DefaultJudgmentResult } from './types';
```
**Priority:** HIGH

### 4. Missing zod-to-json-schema Dependency
**Problem:** `zodToJsonSchema()` used in judge implementation (6.4:1969) but package not in dependencies
**Location:** Section 6.4:1969, Section 5.1 (package.json)
**Impact:** Judge implementation will fail at runtime
**Fix:**
```json
{
  "dependencies": {
    "zod-to-json-schema": "^3.23.0"
  }
}
```
**Priority:** HIGH

### 5. Rubric Type is `unknown` - Too Permissive
**Problem:** Rubric defined as `unknown` (1.10:634) but used with specific structure expectations in examples
**Location:** 1.10:634 vs usage examples throughout
**Impact:** No type safety for rubric structures, runtime errors likely
**Fix:**
```typescript
// Define a base rubric interface with examples
export interface BaseRubric {
  [key: string]: unknown; // Allow flexibility
}

// Document example structures in comments
export type Rubric = BaseRubric;
```
**Priority:** MEDIUM

### 6. JUDGE_SYSTEM_PROMPT Not Defined
**Problem:** Referenced in judge implementation (6.4:1934) but never defined
**Location:** Section 6.4:1934
**Impact:** Judge function cannot be implemented without this constant
**Fix:**
```typescript
const JUDGE_SYSTEM_PROMPT = `You are an expert code evaluator.
Evaluate the provided execution result against the given rubric.
Be objective and thorough in your assessment.`;
```
**Priority:** HIGH

### 7. JudgmentFailedError Class Not Defined
**Problem:** Thrown in judge implementation (6.4:1943) but class never defined
**Location:** Section 6.4:1943
**Impact:** Runtime error when judgment fails
**Fix:**
```typescript
export class JudgmentFailedError extends Error {
  constructor(public judgment: unknown) {
    super('Judgment failed');
    this.name = 'JudgmentFailedError';
  }
}
```
**Priority:** HIGH

### 8. formatJudgePrompt Function Not Defined
**Problem:** Used in judge implementation (6.4:1922) but never defined
**Location:** Section 6.4:1922
**Impact:** Judge cannot format rubrics into prompts
**Fix:**
```typescript
function formatJudgePrompt(config: {
  rubric: Rubric;
  instructions?: string;
  result: RunResult;
  outputSchema?: z.ZodType<any>;
}): AsyncIterable<SDKUserMessage> {
  // Implementation provided in spec at 6.4:1949-1973
}
```
**Priority:** HIGH

### 9. parseJudgmentResponse Function Not Defined
**Problem:** Used in judge implementation (6.4:1939) but never defined
**Location:** Section 6.4:1939
**Impact:** Cannot parse LLM responses into structured judgments
**Fix:**
```typescript
function parseJudgmentResponse(response: unknown, schema?: z.ZodType<any>): unknown {
  if (schema) {
    return schema.parse(response);
  }
  return response as DefaultJudgmentResult;
}
```
**Priority:** HIGH

### 10. query() Function Not Imported/Defined
**Problem:** Used in judge implementation (6.4:1930) but never imported from SDK
**Location:** Section 6.4:1930
**Impact:** Cannot execute judge as an agent
**Fix:**
```typescript
import { query } from '@anthropic-ai/claude-code';
```
**Priority:** HIGH

### 11. Missing Core Dependencies in package.json
**Problem:** Several required packages missing from dependencies
**Location:** Section 5.1 vs actual package.json
**Impact:** Runtime failures when importing modules
**Fix:**
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
**Priority:** HIGH

### 12. AgentConfig Type Not Exported
**Problem:** defineAgent returns AgentConfig (2.3:873) but it's defined as interface without export
**Location:** 2.3:875-883
**Impact:** Users cannot type agent configurations
**Fix:**
```typescript
export interface AgentConfig { // Add export
  name: string;
  // ... rest of interface
}
```
**Priority:** MEDIUM

### 13. TestAttachment Import Missing
**Problem:** TestAttachment used in annotate() but not imported from vitest
**Location:** 1.1:70
**Impact:** Type errors in fixture implementation
**Fix:**
```typescript
import type { TestAttachment } from 'vitest';
```
**Priority:** MEDIUM

---

## ⚠️ Consistency Issues (May Cause Confusion/Bugs)

### 1. judge() Fixture vs Standalone Signatures Differ
**Problem:** Fixture version has different parameter names and structure than standalone
**Location:** 1.1:43-55 vs 2.4:903-915
**Impact:** Confusing API, different behavior in different contexts
**Fix:** Align both signatures to match exactly
**Priority:** HIGH

### 2. RunAgentOptions Has Inconsistent Fields
**Problem:** Spec shows `prompt: string` (1.9:574) but examples show `prompt: string | AsyncIterablePrompt` (runAgent.mdx:36)
**Location:** 1.9:574 vs docs
**Impact:** Type errors when using prompt() helper
**Fix:** Update RunAgentOptions to accept both types
**Priority:** HIGH

### 3. VibeTestContext Missing Cumulative State Properties
**Problem:** Spec v1.2 adds cumulative state (files, tools, timeline) to context (1.1:79-122) but vibeTest.mdx doesn't show these
**Location:** 1.1:79-122 vs vibeTest.mdx:46-69
**Impact:** Users won't know about cumulative state feature
**Fix:** Update documentation to include cumulative accessors
**Priority:** MEDIUM

### 4. Workspace Configuration Pattern Inconsistent
**Problem:** Spec shows defaults at workflow level (4.4:1440) but also allows override at runAgent
**Location:** Various examples throughout spec
**Impact:** Unclear precedence and best practices
**Fix:** Document clear precedence rules
**Priority:** LOW

### 5. Hook Capture Error Handling Inconsistent
**Problem:** Section 7.1 shows graceful degradation but 4.2 suggests throwing
**Location:** 7.1:2026-2041 vs 4.2
**Impact:** Unclear whether hook failures should fail tests
**Fix:** Establish clear policy: log warnings, don't fail tests
**Priority:** MEDIUM

### 6. Timeline Events Type Union Inconsistent
**Problem:** TimelineEvent in 1.8 doesn't match usage in 6.x
**Location:** 1.8:536-562
**Impact:** Type errors when implementing timeline
**Fix:** Ensure all event types are in the union
**Priority:** MEDIUM

### 7. MCPServerConfig Referenced But Not Used
**Problem:** Type defined in 1.9:612-624 but no examples show MCP usage
**Location:** Throughout spec
**Impact:** Unclear how to use MCP servers
**Fix:** Add MCP server examples or mark as future feature
**Priority:** LOW

### 8. File Lazy Loading API Inconsistent
**Problem:** FileChange shows text() and stream() methods but examples only use text()
**Location:** 1.6:453-456
**Impact:** Unclear when to use stream() vs text()
**Fix:** Document that stream() is for files >10MB
**Priority:** LOW

### 9. Cost Reporter Name Mismatch
**Problem:** Referenced as VibeCostReporter (2.6:1009) and VibeReporter (4.3:1271)
**Location:** 2.6:1009 vs 4.3:1271
**Impact:** Import errors
**Fix:** Use consistent name: VibeCostReporter
**Priority:** MEDIUM

### 10. Git State Detection Not Specified
**Problem:** How to detect if workspace is git-managed not specified
**Location:** Throughout file operations
**Impact:** Git state might be null when expected
**Fix:** Add git detection logic to ContextManager
**Priority:** MEDIUM

### 11. TestContextManager Not in Type Definitions
**Problem:** Implementation detail (4.4:1314) exposed but not in public types
**Location:** 4.4:1314
**Impact:** Users might try to import internal class
**Fix:** Mark as internal with underscore prefix
**Priority:** LOW

---

## 📄 Documentation Gaps

| API/Concept | Spec Section | Doc File | Status | Action Required |
|-------------|--------------|----------|--------|-----------------|
| judge<T>() | 1.1, 2.4, 6.4 | judge.mdx | ❌ Stub only | Complete rewrite: add generic signature, Zod schema examples, custom result types |
| prompt() | 2.4:917-936 | prompt.mdx | ❌ Stub only | Document multi-modal support (text/images/files/command) |
| AgentExecution | 1.2:129-157 | runAgent.mdx | ⚠️ Missing | Add section on watch() method and Promise subclass |
| Cumulative State | 1.1:79-122 | vibeTest.mdx | ❌ Missing | Add section showing files/tools/timeline context properties |
| Reactive Watchers | 1.2:138-157 | vibeTest.mdx | ❌ Missing | Add examples of watch() for early failure |
| defineJudge | N/A | defineJudge.mdx | ❓ Exists | Should be removed - judge is a function, not defineX pattern |
| until() helper | 1.4:275-279 | vibeWorkflow.mdx | ❌ Missing | Add loop/iteration examples |

---

## 🔧 Implementation Recommendations

### Build Order

1. **Phase 1:** Core Types & Schemas - Foundation for everything
   - Dependencies: None
   - Estimated Time: 2 days
   - Risk: LOW
   - Components: All Section 1 types, Zod schemas (5.4)

2. **Phase 2:** ContextManager & Fixtures - Core execution engine
   - Dependencies: Phase 1 types
   - Estimated Time: 3 days
   - Risk: MEDIUM
   - Components: ContextManager (4.2), TestContextManager (4.4)

3. **Phase 3:** vibeTest & vibeWorkflow APIs - User-facing APIs
   - Dependencies: Phase 2
   - Estimated Time: 2 days
   - Risk: LOW
   - Components: test/vibeTest.ts, test/vibeWorkflow.ts

4. **Phase 4:** Agent Runner & SDK Integration - Execution logic
   - Dependencies: Phase 2
   - Estimated Time: 3 days
   - Risk: HIGH (external SDK dependency)
   - Components: runAgent, prompt, defineAgent

5. **Phase 5:** Judge System - LLM evaluation
   - Dependencies: Phase 4 (needs prompt function)
   - Estimated Time: 2 days
   - Risk: MEDIUM
   - Components: judge function, rubric types

6. **Phase 6:** Matchers & Reporters - Testing utilities
   - Dependencies: Phase 3
   - Estimated Time: 2 days
   - Risk: LOW
   - Components: Custom matchers, cost/HTML reporters

### Risk Areas
| Component | Risk Level | Issue | Mitigation |
|-----------|------------|-------|------------|
| SDK Integration | HIGH | @anthropic-ai/claude-code may not exist yet | Create mock/stub for development |
| Hook Capture | MEDIUM | Timing issues with async writes | Implement robust correlation with timeouts |
| Reactive Watchers | MEDIUM | Error propagation through streams | Careful AbortController integration |
| File Storage | LOW | Large files could fill disk | Implement cleanup/rotation policy |

### Missing Dependencies
- [x] Add `@anthropic-ai/claude-code` - Primary SDK (verify it exists)
- [x] Add `zod` - Already in devDeps, move to deps
- [x] Add `zod-to-json-schema` - Used in judge implementation
- [x] Add `vitest` to dependencies (not just peerDeps)
- [x] Add missing utility packages (minimatch, fs-extra, etc.)

---

## ❓ Questions for Clarification

### Q1: AgentExecution Design Pattern
**Context:** Section 1.2 and various usages
**Question:** Is AgentExecution a Promise subclass or a separate thenable?
**Options:**
- Option A: Class extending Promise<RunResult> - Pros: Natural async/await; Cons: Complex inheritance
- Option B: Separate object with then() method - Pros: Simpler; Cons: Not a true Promise
**Recommendation:** Option A - Extend Promise for better ergonomics

### Q2: SDK Package Name and Exports
**Context:** Import from '@anthropic-ai/claude-code' assumed throughout
**Question:** Does this package exist? What are the actual exports?
**Options:**
- Option A: Package exists as specified - Pros: Direct implementation; Cons: May not exist
- Option B: Different package name - Pros: Use real SDK; Cons: Need to update all imports
**Recommendation:** Verify package existence first, create types file if needed

### Q3: Rubric Type Structure
**Context:** Currently `unknown` (1.10:634)
**Question:** Should framework enforce any rubric structure?
**Options:**
- Option A: Keep as unknown - Pros: Maximum flexibility; Cons: No type safety
- Option B: Base interface with examples - Pros: Some guidance; Cons: May limit use cases
**Recommendation:** Option B - Provide optional base interfaces users can extend

### Q4: Hook Capture Failure Handling
**Context:** Inconsistent approaches in spec
**Question:** Should hook failures fail the test or just warn?
**Options:**
- Option A: Fail test - Pros: Ensures data integrity; Cons: Flaky tests
- Option B: Warn only - Pros: Resilient; Cons: Might miss data
**Recommendation:** Option B - Log warnings but continue execution

### Q5: Default Model Selection
**Context:** Various examples show different models
**Question:** What should be the default model if not specified?
**Options:**
- Option A: claude-3-5-sonnet-latest - Pros: Most capable; Cons: Higher cost
- Option B: Environment variable - Pros: Flexible; Cons: Setup required
**Recommendation:** Option B - Use VIBE_DEFAULT_MODEL env var with sonnet fallback
