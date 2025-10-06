# Technical Specification Deep Audit v2: @dao/vibe-check

**Date:** 2025-10-06
**Specification Version:** v1.4
**Audit Scope:** Complete fresh audit of all sections
**Auditor:** Claude Code with ULTRATHINK mode

---

## 📊 Specification Audit Results

**Implementation Ready?** ❌ NO

**Issue Counts:**
- 🚨 Critical Blockers: 8 (NEW)
- ⚠️  Consistency Issues: 12 (BEYOND the 24 known)
- 📄 Documentation Gaps: 9 (ALL docs are stubs)
- ❓ Questions for Clarification: 5

**Overall Assessment:**
The specification has fundamental type system inconsistencies, missing critical implementation details, and contradictory API signatures that would block implementation. Additionally, ALL documentation files are placeholder stubs despite v1.4 claiming completion.

**Recommendation:**
FIX BLOCKERS FIRST - Do not proceed with implementation until critical issues are resolved.

---

## 🚨 Critical Blockers (Implementation Impossible Without Fixes)

### 1. Contradictory Return Types for runAgent()
**Problem:** The spec defines two different return types for `runAgent()`:
- In VibeTestContext (1.1:83): Returns `AgentExecution`
- In Standalone Functions (2.4:1154): Returns `AgentExecution`
- But AgentExecution is described as "thenable class (not Promise subclass)" yet the implementation sketches treat it like a Promise

**Location:** 1.1:83, 1.2:198, 2.4:1154
**Impact:** Developers won't know whether to use `await` or `.then()` or if `instanceof Promise` checks will work
**Fix:**
```typescript
// Clarify in 1.2 that AgentExecution is awaitable:
export class AgentExecution {
  // Add explicit note:
  /**
   * This class implements the thenable protocol, making it fully awaitable.
   * Works with: await, Promise.all(), Promise.race()
   * But: instanceof Promise === false (by design)
   */
}
```
**Priority:** HIGH

---

### 2. Rubric Type Chaos
**Problem:** The Rubric type is defined in THREE incompatible ways:
- Section 1.10:874 defines `type Rubric = StructuredRubric | FreeformRubric`
- Section 5.4:2087-2108 defines a completely different Zod-based Rubric schema with different properties
- The two definitions are incompatible and would cause type errors

**Location:** 1.10:812-874 vs 5.4:2090-2108
**Impact:** Cannot implement judge() function - which Rubric type to use?
**Fix:**
```typescript
// Remove the Zod schema in 5.4 OR rename it to LegacyRubricSchema
// Keep the union type from 1.10 as the canonical definition
```
**Priority:** HIGH

---

### 3. Missing SDKUserMessage Type Import
**Problem:** `SDKUserMessage` is used throughout but never properly imported or defined
- Used in 1.9:710, 2.4:1139, 2.4:1184
- Section 5.5 shows a bridge pattern but provides a fallback definition that may not match the real SDK

**Location:** 1.9:710, 2.4:1139, 5.5:2170
**Impact:** TypeScript compilation will fail immediately
**Fix:**
```typescript
// In 5.5, verify the actual SDK exports this type:
// If not, use the fallback definition consistently everywhere
```
**Priority:** HIGH

---

### 4. prompt() Return Type Mismatch
**Problem:** `prompt()` is supposed to return `AsyncIterable<SDKUserMessage>` but:
- RunAgentOptions accepts `string | AsyncIterable<SDKUserMessage>` for prompt
- The implementation sketch in 6.4:2656 shows prompt() being used but doesn't show it returning an AsyncIterable

**Location:** 2.4:1185-1197, 6.4:2656
**Impact:** Type errors when passing prompt() result to runAgent()
**Fix:**
```typescript
// Clarify that prompt() returns an AsyncIterable
// Show implementation that actually returns async iterable:
export async function* prompt(config: PromptConfig): AsyncIterable<SDKUserMessage> {
  yield { role: 'user', content: ... };
}
```
**Priority:** HIGH

---

### 5. Missing Core Functions in Judge Implementation
**Problem:** Section 6.4 references functions that don't exist:
- `formatJudgePrompt()` (line 2623) - shown inline but not as separate function
- `parseJudgmentResponse()` (line 2640) - defined at 2680 but incomplete
- `zodToJsonSchema` import shown but error handling missing

**Location:** 6.4:2623, 2640, 2680
**Impact:** Judge implementation cannot be completed
**Fix:** Define these functions properly or inline them with complete implementation
**Priority:** HIGH

---

### 6. TestAttachment Type Not Imported
**Problem:** `TestAttachment` is imported from 'vitest' (1.1:68) but never verified to exist
- Used in annotate() method
- No verification that Vitest actually exports this type

**Location:** 1.1:68, 1.1:120
**Impact:** Import errors if Vitest doesn't export this type
**Fix:** Verify Vitest exports or define local type
**Priority:** MEDIUM

---

### 7. Circular Dependency in Rubric Helper Functions
**Problem:** Section 2.5 defines `validateRubric()` as a type guard but:
- It references the Rubric type which is a union
- Section 5.4 has a different validateRubric that uses Zod
- These conflict and would cause build errors

**Location:** 2.5:1264 vs 5.4:2110
**Impact:** Cannot have two functions with same name and different implementations
**Fix:** Rename one or remove the Zod version
**Priority:** HIGH

---

### 8. ContextManager Missing Critical Methods
**Problem:** Section 4.2 describes ContextManager but implementation sketches reference methods not defined:
- `getPartialResult()` mentioned in v1.4-alpha.2 changelog but not in API
- `processHookEvent()` mentioned but not defined
- `detectGitRepo()` mentioned in v1.4-alpha.6 but not shown

**Location:** 4.2 (Section missing line numbers), changelog lines 48-49
**Impact:** Cannot implement reactive watchers without these methods
**Fix:** Add complete ContextManager interface definition
**Priority:** HIGH

---

## ⚠️ Consistency Issues (May Cause Confusion/Bugs)

### 1. DEFAULT_MODEL Declaration Location
**Problem:** DEFAULT_MODEL constant defined in wrong section
**Location:** 2.4:1146 (in Standalone Functions)
**Impact:** Should be in constants/config section, not mixed with functions
**Fix:** Move to new section 5.7 Constants or top of 2.4
**Priority:** MEDIUM

---

### 2. judge() Function Signature Inconsistency
**Problem:** judge() signature differs between contexts:
- VibeTestContext version (1.1:93-105): Returns `Promise<T>`
- Standalone version (2.4:1164-1176): Returns `Promise<T>`
- But DefaultJudgmentResult structure differs between sections

**Location:** 1.1:93-105 vs 2.4:1164-1176
**Impact:** Confusion about which signature is canonical
**Fix:** Document that both are identical, just shown in different contexts
**Priority:** MEDIUM

---

### 3. AgentConfig Interface Duplication
**Problem:** AgentConfig interface defined inline in defineAgent (2.3:1106-1114) instead of in types section
**Location:** 2.3:1106-1114
**Impact:** Types should be in Section 1, not inline in API section
**Fix:** Move to Section 1.12 and reference from defineAgent
**Priority:** LOW

---

### 4. Workspace Configuration Precedence
**Problem:** Workspace can be set in 3 places but precedence not clear:
- vibeTest/vibeWorkflow defaults
- defineAgent config
- runAgent options

**Location:** Throughout spec
**Impact:** Developers won't know which takes precedence
**Fix:** Add explicit precedence rules: runAgent > workflow defaults > agent defaults
**Priority:** MEDIUM

---

### 5. MCP Server Examples in Wrong Section
**Problem:** MCP usage examples (1.9:766-810) in type definition section
**Location:** 1.9:766-810
**Impact:** Examples should be in Section 2 with API usage
**Fix:** Move examples to 2.4 or create examples section
**Priority:** LOW

---

### 6. File Structure Shows Non-Existent Components
**Problem:** Section 5.3 file structure references `WorkflowRunner.ts` but no such class is defined anywhere
**Location:** 5.3:2067
**Impact:** Confusion about what components actually exist
**Fix:** Either define WorkflowRunner or remove from structure
**Priority:** MEDIUM

---

### 7. Reactive Watcher Race Conditions
**Problem:** Section 6.3 mentions race conditions but doesn't address:
- What happens if multiple watchers fail simultaneously?
- Is watcher execution truly sequential as claimed?
- What if agent completes while watcher is running?

**Location:** 6.3:2390-2565
**Impact:** Unpredictable behavior in production
**Fix:** Add complete race condition handling logic
**Priority:** HIGH

---

### 8. Git Detection Logic Missing
**Problem:** v1.4-alpha.6 changelog mentions git detection but no implementation shown
**Location:** Changelog line 20, Section 4.2.2 referenced but incomplete
**Impact:** Cannot implement git state capture
**Fix:** Add detectGitRepo and captureGitState implementations
**Priority:** HIGH

---

### 9. Bundle Cleanup Policy Undefined
**Problem:** RunBundles stored on disk but no cleanup/retention policy defined
**Location:** Section 3 (Storage contracts)
**Impact:** Disk space will fill up over time
**Fix:** Define TTL, max size, or cleanup API
**Priority:** MEDIUM

---

### 10. Cost Reporter vs HTML Reporter Naming
**Problem:** Inconsistent reporter naming:
- "VibeCostReporter" vs "VibeHtmlReporter"
- Both should follow same pattern

**Location:** 4.3 (claims fixed in v1.4 but still inconsistent)
**Impact:** Confusion about naming convention
**Fix:** Use consistent prefix: VibeTerminalReporter, VibeHtmlReporter
**Priority:** LOW

---

### 11. Hook Capture Status Never Populated
**Problem:** RunResult.hookCaptureStatus defined (1.5:521-528) but no code shows how it's populated
**Location:** 1.5:521-528
**Impact:** Feature won't work without implementation
**Fix:** Show where/how this gets set in ContextManager
**Priority:** MEDIUM

---

### 12. Timeline Event Batching Unexplained
**Problem:** Timeline.events() returns `AsyncIterable<TimelineEvent | TimelineEvent[]>` (array for batching) but:
- When are events batched?
- How does consumer handle single vs batch?

**Location:** 1.5:513
**Impact:** Consumers won't know how to iterate properly
**Fix:** Document batching behavior or remove array option
**Priority:** MEDIUM

---

## 📄 Documentation Gaps

| API/Concept | Spec Section | Doc File | Status | Action Required |
|-------------|--------------|----------|--------|-----------------|
| judge<T>() | 1.1, 2.4, 6.4 | judge.mdx | ❌ Stub | Complete rewrite with generic examples, rubric types |
| prompt() | 2.4 | prompt.mdx | ❌ Missing | Create full docs for multi-modal prompt() |
| AgentExecution | 1.2, 2.1 | runAgent.mdx | ❌ Missing | Document thenable behavior, watch() method |
| vibeTest | 2.1 | vibeTest.mdx | ❌ Stub | Add cumulative state examples |
| vibeWorkflow | 2.2 | vibeWorkflow.mdx | ❌ Stub | Document stage(), until() helper |
| defineAgent | 2.3 | defineAgent.mdx | ❌ Stub | Show model defaults, MCP config |
| Custom Matchers | 2.8 | matchers.mdx | ❌ Stub | Document all matchers with examples |
| Types | 1.* | types.mdx | ❌ Stub | Complete type reference |
| Rubrics | 1.10 | None | ❌ Missing | Create rubric guide with examples |

**Critical:** ALL documentation files checked are stubs saying "Coming Soon" despite spec being v1.4 "Complete"

---

## 🔧 Implementation Recommendations

### Build Order
1. **Phase 1:** Fix type conflicts in Sections 1 & 5.4
   - Dependencies: None
   - Estimated Time: 1 day
   - Risk: HIGH (blocking everything)

2. **Phase 2:** SDK Bridge Layer (Section 5.5)
   - Dependencies: Phase 1
   - Estimated Time: 0.5 days
   - Risk: MEDIUM (SDK might not export expected types)

3. **Phase 3:** Core Types & Schemas (Section 1, minus conflicts)
   - Dependencies: Phase 1, 2
   - Estimated Time: 2 days
   - Risk: LOW

4. **Phase 4:** ContextManager with all methods
   - Dependencies: Phase 3
   - Estimated Time: 3 days
   - Risk: HIGH (complex, missing methods)

5. **Phase 5:** Fixtures (vibeTest, vibeWorkflow)
   - Dependencies: Phase 4
   - Estimated Time: 2 days
   - Risk: MEDIUM

6. **Phase 6:** Judge & prompt implementation
   - Dependencies: Phase 2, 3
   - Estimated Time: 2 days
   - Risk: MEDIUM (missing helper functions)

### Risk Areas
| Component | Risk Level | Issue | Mitigation |
|-----------|------------|-------|------------|
| Rubric Types | HIGH | Two conflicting definitions | Choose one, delete other |
| SDK Types | HIGH | May not exist in SDK | Use fallback types consistently |
| ContextManager | HIGH | Missing critical methods | Define complete interface first |
| Git Detection | MEDIUM | Logic not specified | Copy from similar tools |
| Async Watchers | HIGH | Race conditions | Add mutex/locking |

### Missing Dependencies
- [x] Add `zod-to-json-schema` - Already added in v1.4-alpha.4
- [ ] Verify `@anthropic-ai/claude-code` exports needed types
- [ ] Verify `vitest` exports `TestAttachment` type

---

## ❓ Questions for Clarification

### Q1: Rubric Type System
**Context:** Section 1.10 vs Section 5.4
**Question:** Which Rubric definition is canonical - the union type or the Zod schema?
**Options:**
- Option A: Keep union type (1.10), remove Zod schema - [Recommended: More flexible]
- Option B: Keep Zod schema (5.4), remove union type - [Less flexible]

**Recommendation:** Option A - allows both structured and freeform rubrics

---

### Q2: AgentExecution Thenable Behavior
**Context:** Section 1.2
**Question:** Should AgentExecution extend Promise or just implement thenable?
**Options:**
- Option A: Implement thenable only (as specified) - [More complex]
- Option B: Extend Promise directly - [Simpler, standard]

**Recommendation:** Option A if there's a specific reason, otherwise B for simplicity

---

### Q3: Documentation Strategy
**Context:** All docs are stubs
**Question:** Should docs be updated before or after implementation?
**Options:**
- Option A: Update docs from spec first - [Helps validate spec]
- Option B: Implement first, then document - [Docs match reality]

**Recommendation:** Option A - will reveal more spec issues

---

### Q4: Default Model Environment Variable
**Context:** Section 2.4:1146
**Question:** Should VIBE_DEFAULT_MODEL be documented in user-facing docs?
**Options:**
- Option A: Yes, document in Getting Started - [Better DX]
- Option B: Keep internal only - [Simpler]

**Recommendation:** Option A - users need cost optimization strategies

---

### Q5: Bundle Retention Policy
**Context:** Section 3, no cleanup mentioned
**Question:** How should old RunBundles be cleaned up?
**Options:**
- Option A: TTL-based (delete after X days) - [Automatic]
- Option B: Size-based (keep last N MB) - [Predictable disk usage]
- Option C: Manual cleanup API - [User control]

**Recommendation:** Option A + C - automatic cleanup with manual override

---

## 📋 Summary

This comprehensive audit reveals **8 new critical blockers** and **12 additional consistency issues** beyond the 24 previously identified problems. The specification is **NOT ready for implementation** due to:

1. **Fundamental type conflicts** (Rubric defined differently in multiple places)
2. **Missing critical components** (ContextManager methods, SDK types)
3. **ALL documentation is placeholder stubs** despite v1.4 claiming completion
4. **Contradictory API signatures** that would prevent compilation

The most severe issues involve the type system having multiple incompatible definitions for the same types, which would make it impossible to even begin implementation without resolving these conflicts first.

---

## Next Steps

1. **Immediate:** Fix all 8 critical blockers (estimated 2-3 days)
2. **Short-term:** Resolve high-priority consistency issues (1-2 days)
3. **Medium-term:** Address medium-priority issues and documentation gaps
4. **Long-term:** Answer clarification questions and establish policies

**Do not begin implementation until at least the critical blockers are resolved.**
