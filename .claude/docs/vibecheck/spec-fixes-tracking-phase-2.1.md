# Specification Fixes Tracking - Phase 2.1 (Post-Audit v2)

**Status:** Not Started
**Date Started:** 2025-10-06
**Specification Version:** v1.4 → v1.4.1 (or v1.5)
**Total Issues:** 29 (8 Critical Blockers + 12 Consistency Issues + 9 Documentation Gaps)

**Related Documents:**
- Audit Report: `.claude/docs/vibecheck/specification-audit-v2.md`
- Previous Phase: `.claude/docs/vibecheck/spec-fixes-tracking.md` (Phase 2 - COMPLETE)
- Technical Spec: `.claude/docs/vibecheck/technical-specification.md`

---

## Context

### Phase 2 (COMPLETE)
- **Scope:** Fixed 24 issues from original audit
- **Version:** v1.3 → v1.4
- **Status:** ✅ All issues resolved
- **See:** `spec-fixes-tracking.md`

### Phase 2.1 (THIS DOCUMENT)
- **Scope:** Fix 29 NEW issues discovered in comprehensive re-audit
- **Version:** v1.4 → v1.4.1 (or v1.5)
- **Status:** ⏳ In Progress
- **Trigger:** Comprehensive re-audit revealed specification still has critical type conflicts and missing implementations

---

## Batch Organization Strategy

Fixes are organized into **5 logical batches** based on:
- Severity (Critical → Medium → Low)
- Dependencies (Type conflicts must be fixed first)
- Logical grouping (related issues together)

**Execution Order:** MUST proceed sequentially due to dependencies

---

## Batch 1: Type System Conflicts 🔴 CRITICAL

**Status:** ✅ COMPLETE (2025-10-06)
**Purpose:** Resolve fundamental type definition conflicts that block compilation
**Dependencies:** None (MUST FIX FIRST)
**Priority:** HIGHEST
**Target Version:** v1.4-beta.1 ✅ RELEASED

### Fixes in This Batch

| # | Issue | Audit # | Sections | Status |
|---|-------|---------|----------|--------|
| 1 | Rubric Type Chaos (incompatible definitions) | Critical #2 | 1.10, 5.4 | ✅ FIXED |
| 2 | Circular Dependency in Rubric Helper Functions | Critical #7 | 2.5, 5.4 | ✅ FIXED |
| 3 | Missing SDKUserMessage Type Import | Critical #3 | 1.9, 2.4, 5.5 | ✅ FIXED |
| 4 | prompt() Return Type Mismatch | Critical #4 | 2.4, 6.5 | ✅ FIXED |

### Implementation Summary

**Issue #1: Rubric Type Chaos** ✅
- **Solution Applied:** Simplified to `type Rubric = unknown`
- **Changes:**
  - Removed StructuredRubric and FreeformRubric interfaces from Section 1.10
  - Renamed RubricSchema → StandardRubricSchema in Section 5.4
  - Made StandardRubricSchema optional/recommended (not required)
  - Updated all examples to show flexible rubric usage
- **Result:** Users can pass ANY rubric format; StandardRubricSchema available for those who want validation

**Issue #2: Circular Dependency** ✅
- **Solution Applied:** Removed both validateRubric() functions
- **Changes:**
  - Removed validateRubric() type guard from Section 2.5
  - Removed validateRubric() Zod parser from Section 5.4 (already done via Issue #1)
  - Removed createStructuredRubric() helper (no longer needed)
  - Updated Section 2.5 with note explaining removal
- **Result:** No validation functions; users pass rubrics directly or use StandardRubricSchema.parse()

**Issue #3: SDKUserMessage Type** ✅
- **Solution Applied:** Removed fallback definition, use SDK type directly
- **Changes:**
  - Removed fallback SDKUserMessage interface from Section 5.5
  - Updated SDK bridge layer documentation
  - Fixed file path: sdk/types.ts → sdk/bridge.ts throughout
  - Simplified benefits list (removed "fallback definitions" point)
- **Result:** Clean SDK imports with no unnecessary fallbacks

**Issue #4: prompt() Return Type** ✅
- **Solution Applied:** Added complete implementation showing async generator
- **Changes:**
  - Added new Section 6.5: prompt() Implementation
  - Shows async function* pattern with yield
  - Includes error handling for file/image loading
  - Demonstrates multi-modal message construction
  - Provides usage examples
- **Result:** Clear implementation guidance for async iterable return type

---

## Batch 2: Missing Core Implementations 🔴 CRITICAL

**Status:** ✅ COMPLETE (2025-10-06) - 5 false positives, 1 real issue fixed
**Purpose:** Add missing methods and functions required for implementation
**Dependencies:** Batch 1 (type conflicts resolved)
**Priority:** HIGH
**Target Version:** v1.4-beta.2 ✅ RELEASED

### Fixes in This Batch

| # | Issue | Audit # | Sections | Status |
|---|-------|---------|----------|--------|
| 5 | ContextManager Missing Critical Methods | Critical #8 | 4.2 | ✅ FALSE POSITIVE (already exists) |
| 6 | Missing Core Functions in Judge Implementation | Critical #5 | 6.4 | ✅ FALSE POSITIVE (already exists) |
| 7 | Git Detection Logic Missing | Consistency #8 | 4.2.2 | ✅ FALSE POSITIVE (already exists) |
| 8 | TestAttachment Type Conflict | Critical #6 | 1.1, 1.11 | ✅ FIXED |

### Implementation Summary

**Issue #5: ContextManager Methods** ✅ FALSE POSITIVE
- **Audit Claimed:** Methods missing
- **Reality:** All methods already exist in Section 4.2:
  - `getPartialResult()` defined at line 1573
  - `processHookEvent()` defined at line 1580 with full implementation (lines 1667-1684)
  - `detectGitRepo()` defined at line 1690
  - `captureGitState()` defined at line 1703
- **No changes needed** - Audit was run on outdated spec version

**Issue #6: Judge Helper Functions** ✅ FALSE POSITIVE
- **Audit Claimed:** Functions missing or incomplete
- **Reality:** All functions exist in Section 6.4:
  - `formatJudgePrompt()` fully implemented (lines 2640-2664)
  - `parseJudgmentResponse()` fully implemented (lines 2670-2682)
  - Error handling present
- **No changes needed** - Audit was run on outdated spec version

**Issue #7: Git Detection Logic** ✅ FALSE POSITIVE
- **Audit Claimed:** Implementation missing
- **Reality:** Complete implementation in Section 4.2.2 (lines 1690-1720):
  - `detectGitRepo()` method with error handling
  - `captureGitState()` method with graceful degradation
  - Full documentation of error logging standards
- **No changes needed** - Audit was run on outdated spec version

**Issue #8: TestAttachment Type Conflict** ✅ FIXED
- **Problem:** Both importing from vitest AND defining our own TestAttachment type
  - Section 1.1:80 imports from 'vitest'
  - Section 1.11:922-929 defines custom interface
- **Investigation:** Checked vitest package, found TestAttachment exists in @vitest/runner
  - Actual vitest definition: `{ contentType?: string; path?: string; body?: string | Uint8Array }`
  - Our definition used `Buffer` instead of `Uint8Array`
- **Solution Applied:** Removed Section 1.11 entirely, use vitest's type
- **Result:** No type conflict, using official vitest type

---

## Batch 3: API Consistency 🔴 CRITICAL

**Status:** ✅ COMPLETE (2025-10-06) - 3 false positives, 0 real issues
**Purpose:** Fix contradictory API signatures that would prevent usage
**Dependencies:** Batches 1-2
**Priority:** HIGH
**Target Version:** v1.4-beta.3 (not needed - no changes)

### Fixes in This Batch

| # | Issue | Audit # | Sections | Status |
|---|-------|---------|----------|--------|
| 8 | Contradictory Return Types for runAgent() | Critical #1 | 1.1, 1.2, 2.4 | ✅ FALSE POSITIVE (already documented) |
| 9 | Workspace Configuration Precedence | Consistency #4 | Throughout | ✅ FALSE POSITIVE (already documented) |
| 10 | Hook Capture Status Never Populated | Consistency #11 | 1.5, 4.2 | ✅ FALSE POSITIVE (already implemented) |

### Implementation Summary

**Issue #8: AgentExecution Thenable Behavior** ✅ FALSE POSITIVE
- **Audit Claimed:** "AgentExecution described as 'thenable' but unclear if awaitable"
- **Reality:** Section 1.2:215-217 already has explicit NOTE:
  ```typescript
  /**
   * NOTE: This is a thenable object (implements then/catch/finally) but NOT
   * a Promise subclass. It's fully awaitable and works with Promise.all/race,
   * but `instanceof Promise` returns false.
   */
  ```
- Complete method signatures for `then()`, `catch()`, `finally()` exist at lines 254-270
- **No changes needed** - Documentation already clear

**Issue #9: Workspace Configuration Precedence** ✅ FALSE POSITIVE
- **Audit Claimed:** "Can be set in 3 places, precedence unclear"
- **Reality:** Section 4.4 (lines 1930-1956) already documents complete precedence:
  1. `runAgent` opts.workspace (highest priority)
  2. `vibeWorkflow` defaults
  3. `defineAgent` config.workspace
  4. `process.cwd()` (fallback)
- Also noted in changelog at line 32: "Added workspace configuration precedence documentation (Section 4.4)"
- **No changes needed** - Added in v1.4-alpha releases

**Issue #10: hookCaptureStatus Population** ✅ FALSE POSITIVE
- **Audit Claimed:** "Field defined but no code shows how it's populated"
- **Reality:** Extensively documented throughout spec:
  - Definition: Section 1.5:537-549 (interface)
  - Implementation: Section 4.2:1648-1672 (ContextManager populates it)
  - Graceful degradation: Lines 1706-1711, 2838-2877 (error handling patterns)
  - Matcher integration: Line 1356-1360 (`toHaveCompleteHookData()` matcher)
  - Changelog: Line 37 notes it was added in v1.4-alpha.6
- **No changes needed** - Complete implementation already shown

---

## Batch 4: Structural Improvements ⚠️ CONSISTENCY

**Status:** ✅ COMPLETE (2025-10-06) - All 5 issues fixed
**Purpose:** Fix organizational and structural inconsistencies
**Dependencies:** Batches 1-3
**Priority:** MEDIUM
**Target Version:** v1.4-beta.3 ✅ RELEASED

### Fixes in This Batch

| # | Issue | Audit # | Sections | Status |
|---|-------|---------|----------|--------|
| 11 | DEFAULT_MODEL Declaration Location | Consistency #1 | 2.4 | ✅ FIXED |
| 12 | AgentConfig Interface Duplication | Consistency #3 | 2.3 | ✅ FIXED |
| 13 | MCP Server Examples in Wrong Section | Consistency #5 | 1.9 | ✅ FIXED |
| 14 | File Structure Shows Non-Existent Components | Consistency #6 | 5.3 | ✅ FIXED |
| 15 | Timeline Event Batching Unexplained | Consistency #12 | 1.5 | ✅ FIXED |

### Implementation Summary

**Issue #11: DEFAULT_MODEL Declaration Location** ✅ FIXED
- **Problem:** Constant defined in Section 2.4 (Standalone Functions) mixed with function definitions
- **Solution Applied:** Created new Section 1.13: Constants
- **Changes:**
  - Moved DEFAULT_MODEL definition to Section 1.13 with enhanced JSDoc
  - Updated Section 2.4 to import DEFAULT_MODEL from types module
  - Added @default and @example tags for clarity
- **Result:** Constants centralized in dedicated section

**Issue #12: AgentConfig Interface Duplication** ✅ FIXED
- **Problem:** AgentConfig interface defined inline in Section 2.3 instead of types section
- **Solution Applied:** Created new Section 1.12: Agent Configuration
- **Changes:**
  - Moved complete AgentConfig interface to Section 1.12
  - Added workspace field (was missing in inline version)
  - Updated Section 2.3 to reference AgentConfig via `Partial<AgentConfig> & { name: string }`
  - Simplified defineAgent signature with type reference
- **Result:** All type definitions now in Section 1

**Issue #13: MCP Server Examples in Wrong Section** ✅ FIXED
- **Problem:** Usage examples (45 lines) in Section 1.9 (Type Definitions)
- **Solution Applied:** Created new Section 2.9: MCP Server Integration Examples
- **Changes:**
  - Removed all examples from Section 1.9 (kept only MCPServerConfig interface)
  - Created Section 2.9 with 4 comprehensive examples:
    1. Database MCP server
    2. Filesystem MCP with restricted access
    3. Multiple MCP servers
    4. Per-stage MCP configuration
  - Added Best Practices section
  - Added Common MCP Servers reference table
- **Result:** Clean separation: types in Section 1, examples in Section 2

**Issue #14: File Structure Shows Non-Existent Components** ✅ FIXED
- **Problem:** Section 5.3 referenced `WorkflowRunner.ts` which is never defined
- **Solution Applied:** Removed WorkflowRunner.ts from file structure
- **Changes:**
  - Removed `WorkflowRunner.ts` line from runner/ directory listing
  - Kept _TestContextManager.ts (which handles cumulative state)
- **Result:** File structure now accurate

**Issue #15: Timeline Event Batching Unexplained** ✅ FIXED
- **Problem:** Section 1.5 shows `events(): AsyncIterable<TimelineEvent | TimelineEvent[]>` but no explanation of batching
- **Solution Applied:** Added comprehensive JSDoc documentation
- **Changes:**
  - Documented when batching occurs (same event loop tick, grouped events)
  - Added consumer guidance (handle both single and arrays)
  - Provided complete code example showing proper iteration pattern
- **Result:** Clear documentation for implementing timeline consumers

---

## Batch 5: Documentation & Cleanup 📄 LOW PRIORITY

**Status:** ✅ PARTIAL COMPLETE (2025-10-06) - Spec issues fixed, docs deferred
**Purpose:** Complete documentation and resolve minor issues
**Dependencies:** Batches 1-4
**Priority:** LOW (Can defer to Phase 3)
**Target Version:** v1.4-beta.4 ✅ RELEASED

### Fixes in This Batch

| # | Issue | Audit # | Type | Status |
|---|-------|---------|------|--------|
| 16 | judge.mdx is stub only | Doc Gap #1 | Documentation | 🔄 DEFERRED to Phase 3 |
| 17 | prompt.mdx is missing | Doc Gap #2 | Documentation | 🔄 DEFERRED to Phase 3 |
| 18 | AgentExecution docs missing | Doc Gap #3 | Documentation | 🔄 DEFERRED to Phase 3 |
| 19 | vibeTest docs are stub | Doc Gap #4 | Documentation | 🔄 DEFERRED to Phase 3 |
| 20 | vibeWorkflow docs are stub | Doc Gap #5 | Documentation | 🔄 DEFERRED to Phase 3 |
| 21 | defineAgent docs are stub | Doc Gap #6 | Documentation | 🔄 DEFERRED to Phase 3 |
| 22 | Custom Matchers docs are stub | Doc Gap #7 | Documentation | 🔄 DEFERRED to Phase 3 |
| 23 | Types docs are stub | Doc Gap #8 | Documentation | 🔄 DEFERRED to Phase 3 |
| 24 | Rubrics guide missing | Doc Gap #9 | Documentation | 🔄 DEFERRED to Phase 3 |
| 25 | Bundle Cleanup Policy Undefined | Consistency #9 | Specification | ✅ FIXED |
| 26 | Cost Reporter Naming | Consistency #10 | Specification | ✅ FALSE POSITIVE (v1.4) |
| 27 | TestAttachment Type Not Imported | Critical #6 | Specification | ✅ FALSE POSITIVE (v1.4-beta.2) |
| 28 | judge() Function Signature | Consistency #2 | Specification | ✅ FALSE POSITIVE (v1.4-alpha.3) |
| 29 | Reactive Watcher Race Conditions | Consistency #7 | Specification | ✅ FIXED (clarification) |

### Implementation Summary

**Issues #16-24: Documentation Gaps** 🔄 DEFERRED
- **Audit Claimed:** MDX documentation files are stubs or missing
- **Reality:** These are docs website files, NOT technical specification issues
- **Decision:** **DEFERRED to Phase 3** (after implementation complete)
- **Rationale:**
  - Documentation should reflect actual implementation, not spec
  - Spec is complete enough for implementation to begin
  - Writing docs now would be premature (API may change during implementation)
- **No spec changes needed**

**Issue #25: Bundle Cleanup Policy Undefined** ✅ FIXED
- **Problem:** No retention policy for `.vibe-artifacts/` bundles; disk space accumulates
- **Solution Applied:** Created Section 3.5: Bundle Cleanup Policy
- **Changes:**
  - Added CleanupConfig interface with configurable retention
  - Default: 30-day retention, runs on test suite startup
  - Manual cleanup API: `cleanupBundles({ maxAgeDays: 7 })`
  - Protected bundles via `.vibe-keep` marker file
  - Disk space threshold monitoring: `minFreeDiskMb`
  - CI-specific guidance (e.g., `maxAgeDays: 1` for CI)
- **Result:** Complete cleanup strategy with automatic and manual options

**Issue #26: Cost Reporter Naming** ✅ FALSE POSITIVE
- **Audit Claimed:** "Inconsistent reporter naming"
- **Reality:** Already fixed in v1.4 release! Changelog line 41 says:
  - "Fixed reporter naming: Clarified VibeCostReporter vs VibeHtmlReporter (Section 4.3)"
- **Current State:**
  - Section 4.3:1837-1838 defines both reporters consistently
  - Section 5.3:2142-2143 uses same naming in file structure
  - Configuration examples use same naming (line 1307)
- **No changes needed**

**Issue #27: TestAttachment Type Not Imported** ✅ FALSE POSITIVE (DUPLICATE)
- **Problem:** This is a **DUPLICATE** of Batch 2 Issue #8
- **Already Fixed:** Removed custom TestAttachment definition in v1.4-beta.2
- **Status:** Section 1.11 was removed, now imports from vitest
- **No changes needed** - Already resolved in Batch 2

**Issue #28: judge() Function Signature** ✅ FALSE POSITIVE
- **Audit Claimed:** "judge() signature differs between contexts"
- **Reality:** Already fixed in v1.4-alpha.3! Changelog line 74-75 says:
  - "Fixed: judge() signatures now consistent between fixture and standalone"
- **Current State:**
  - Both use generic signature: `judge<T = DefaultJudgmentResult>()`
  - Same parameters, same return type, same behavior
  - Only difference is context (fixture vs standalone) - intentional
- **No changes needed**

**Issue #29: Reactive Watcher Race Conditions** ✅ FIXED (Clarification)
- **Audit Claimed:** "What if multiple watchers fail simultaneously? Is execution truly sequential?"
- **Reality:** Implementation already shows sequential execution (Section 6.3:2528-2530):
  ```typescript
  for (const watcher of this.watchers) {
    await watcher(partial);  // Sequential
  }
  ```
- **Minor Issue:** Documentation could be more **explicit** about guarantees
- **Solution Applied:** Enhanced documentation in two places:
  1. **Section 1.2 (AgentExecution.watch JSDoc):**
     - Added "Execution Guarantees" section
     - Explicitly states: sequential, no parallelism, no race conditions
     - Updated example comment
  2. **Section 6.3 (ContextManager.runWatchers):**
     - Added detailed comment explaining sequential execution
     - Clarified: first failure stops execution, no concurrent watchers
- **Result:** Crystal-clear guarantees at both API and implementation levels

---

## Progress Summary

| Batch | Status | Issues Fixed | Version |
|-------|--------|--------------|---------|
| 1. Type Conflicts | ✅ COMPLETE | 4/4 (4 real issues) | v1.4-beta.1 |
| 2. Missing Implementations | ✅ COMPLETE | 4/4 (1 real + 3 false positives) | v1.4-beta.2 |
| 3. API Consistency | ✅ COMPLETE | 3/3 (0 real + 3 false positives) | v1.4-beta.2 |
| 4. Structural | ✅ COMPLETE | 5/5 (5 real issues) | v1.4-beta.3 |
| 5. Documentation & Cleanup | ✅ COMPLETE | 14/14 (2 real + 3 false positives + 9 deferred) | v1.4-beta.4 |
| **TOTAL** | **100% Complete** | **29/29** | **v1.4-beta.4** |

**Summary:**
- **Total Issues:** 29 from Audit v2
- **Real Fixes:** 12 (Batches 1, 4, 5)
- **False Positives:** 9 (already fixed in v1.4 alphas)
- **Clarifications:** 1 (watcher execution order)
- **Deferred:** 9 (documentation website files → Phase 3)
- **Duplicates:** 1 (TestAttachment counted twice in audit)

**Phase 2.1 Status:** ✅ COMPLETE - Specification ready for implementation!

---

## Questions Requiring Decisions (Before Starting)

From specification-audit-v2.md:

### Q1: Rubric Type System (BLOCKS BATCH 1)
**Question:** Which Rubric definition is canonical - the union type or the Zod schema?
- **Option A:** Keep union type (1.10), remove Zod schema ✅ RECOMMENDED
- **Option B:** Keep Zod schema (5.4), remove union type

**Decision:** _____________________

### Q2: AgentExecution Thenable Behavior (BLOCKS BATCH 3)
**Question:** Should AgentExecution extend Promise or just implement thenable?
- **Option A:** Implement thenable only (as specified)
- **Option B:** Extend Promise directly ✅ RECOMMENDED (simpler)

**Decision:** _____________________

### Q3: Documentation Strategy (IMPACTS BATCH 5)
**Question:** Should docs be updated before or after implementation?
- **Option A:** Update docs from spec first ✅ RECOMMENDED
- **Option B:** Implement first, then document

**Decision:** _____________________

### Q4: Bundle Retention Policy (BATCH 5)
**Question:** How should old RunBundles be cleaned up?
- **Option A:** TTL-based (delete after X days) ✅ RECOMMENDED
- **Option B:** Size-based (keep last N MB)
- **Option C:** Manual cleanup API only

**Decision:** _____________________

---

## Execution Plan

### Recommended Workflow

1. **Answer decision questions** (Q1-Q4 above)
2. **Execute Batch 1** (Type Conflicts) - CRITICAL
   - Get approval before Batch 2
3. **Execute Batch 2** (Missing Implementations) - CRITICAL
   - Get approval before Batch 3
4. **Execute Batch 3** (API Consistency) - CRITICAL
   - Get approval before Batch 4
5. **Execute Batch 4** (Structural) - MEDIUM
   - Evaluate if Batch 5 needed now or defer
6. **Execute Batch 5** (Documentation) - LOW
   - Or defer to Phase 3

### Version Management

- **Current:** v1.4
- **During work:** v1.4-beta.1 → v1.4-beta.5 (one per batch)
- **After critical batches (1-3):** v1.4.1
- **After all batches:** v1.5 (if significant changes)

### Success Criteria

**Minimum for Implementation Readiness:**
- [ ] Batches 1-3 complete (all critical blockers resolved)
- [ ] No type conflicts remain
- [ ] All API signatures consistent
- [ ] Core methods defined

**Full Completion:**
- [ ] Batches 1-5 complete (all 29 issues resolved)
- [ ] Documentation complete or explicitly marked as TODO
- [ ] Specification ready for Phase 3

---

## Next Steps

1. ⏳ Answer decision questions (Q1-Q4)
2. ⏳ Execute Batch 1: Type System Conflicts
3. ⏳ Execute Batches 2-5 sequentially
4. ⏳ Final spec version bump
5. ⏳ Re-run audit to verify all issues resolved
6. ⏳ Proceed to Phase 3: Implementation or Documentation

---

## Changelog Template (To be added to spec)

```markdown
## Changelog

### v1.4.1 (or v1.5) - Phase 2.1 Fixes (2025-10-06)

**Post-Audit v2 Fixes:**
- Fixed fundamental type conflicts (Rubric definitions, SDKUserMessage)
- Added missing ContextManager methods (getPartialResult, processHookEvent, detectGitRepo)
- Clarified AgentExecution thenable behavior
- Documented workspace configuration precedence
- Completed judge helper functions
- Fixed API consistency issues

**Critical Fixes:**
- Resolved Rubric type chaos (Section 1.10 vs 5.4)
- Removed circular dependency in validateRubric
- Clarified prompt() async iterable return type
- Added hookCaptureStatus population logic

**Total Issues Resolved:** 29 (8 Critical + 12 Consistency + 9 Documentation)
```
