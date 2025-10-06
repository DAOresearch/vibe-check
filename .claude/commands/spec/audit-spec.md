---
description: Deep audit of technical specification for consistency and implementation readiness
model: claude-opus-4-20250514
allowed-tools: Read, Glob, Grep, WebFetch, WebSearch, TodoWrite, Bash
thinking:
  enabled: true
  budget: tokens
---

# Technical Specification Deep Audit: @dao/vibe-check v1.3

## Context

You are auditing the technical specification for `@dao/vibe-check`, a Vitest-based automation and evaluation framework for Claude Code agents.

**Specification Location**: `.claude/docs/vibecheck/technical-specification.md` (v1.3, ~2300 lines)

This spec serves as the **SOURCE OF TRUTH** for:
1. **Implementation** - Building `src/` code
2. **Documentation** - Updating `docs/content/docs/` files

## Your Mission

Find EVERY inconsistency, gap, or issue that would:
- ❌ Block implementation
- ❌ Cause developer confusion
- ❌ Lead to bugs or incorrect behavior
- ❌ Create documentation that contradicts implementation

**Success Criteria**: Specification is implementation-ready with zero critical blockers

---

## Analysis Tasks

### 1. Type System Audit

Cross-reference ALL type definitions across these sections:
- **Section 1.1-1.11**: Core type definitions
- **Section 2.x**: API signatures
- **Section 4.x**: Integration contracts
- **Section 6.x**: Implementation sketches
- **Examples throughout**: Usage patterns

**Validation Checks**:
- [ ] Are all referenced types defined somewhere in the spec?
- [ ] Do types match between fixture/standalone/examples?
- [ ] Are generics used consistently (especially `judge<T>`)?
- [ ] Are there any circular dependencies in types?
- [ ] Do import statements reference correct modules?

**Specific Type Issues to Check**:
1. **`judge<T>()` signature**:
   - Does `resultFormat?: z.ZodType<T>` correctly infer `T`?
   - Is the return type `Promise<T>` consistent across fixture (1.1:43-55) and standalone (2.4:871-883)?
   - Does `DefaultJudgmentResult` exist and is it used correctly?

2. **`prompt()` function**:
   - Does `AsyncIterable<SDKUserMessage>` type exist in SDK?
   - Is `SDKUserMessage` defined or imported?
   - Are the config parameters (`text`, `images`, `files`, `command`) correctly typed?

3. **`AgentExecution` type**:
   - Fixture returns `AgentExecution` (1.2:126-145)
   - Standalone returns `Promise<RunResult>` (2.4:861)
   - Is this intentional? Should be documented if so.

4. **Rubric type**:
   - Changed to `unknown` in 1.10:623
   - Is this correct? Does it work with `judge()` implementation in 6.4?

**Output Format**:
```
✅ Consistent: [TypeName] - Defined in [Section], Used in [Sections]
❌ Inconsistent: [TypeName] - [Issue] (Lines: [numbers]) - FIX: [suggestion]
⚠️  Ambiguous: [TypeName] - [Clarification needed]
```

---

### 2. API Signature Validation

For EACH API, verify consistency:

#### APIs to Validate:
1. `vibeTest` (2.1)
2. `vibeWorkflow` (2.2)
3. `defineAgent` (2.3)
4. `runAgent` (2.4)
5. `judge` (1.1, 2.4, 6.4)
6. `prompt` (2.4)
7. Custom matchers (2.7)

#### Validation Checklist (per API):
- [ ] Fixture signature matches standalone (or document why different)
- [ ] All parameters documented with correct types
- [ ] Return types align with examples
- [ ] Generic constraints are valid TypeScript
- [ ] Optional vs required parameters are consistent

**Critical Checks**:

1. **`judge()` function** (compare these):
   - Section 1.1:43-55 (fixture signature)
   - Section 2.4:871-883 (standalone signature)
   - Section 6.4:1912-1947 (implementation sketch)
   - Are all three consistent?

2. **`runAgent()` function**:
   - Why does fixture return `AgentExecution` but standalone returns `Promise<RunResult>`?
   - Is `AgentExecution` a thenable/awaitable Promise subclass?
   - This should be explained in the spec.

3. **`prompt()` function**:
   - Does the config object signature match examples (2.4:919-929)?
   - Is the return type compatible with SDK's `query()` function?

**Output Format**:
```
API: [name]
├─ Fixture (Section X:Y): [signature]
├─ Standalone (Section X:Y): [signature]
├─ Examples (Section X:Y): [usage]
├─ Status: ✅ Consistent | ❌ Mismatch | ⚠️ Unclear
└─ Issue: [description if mismatch] - FIX: [suggestion]
```

---

### 3. Implementation Feasibility

Review code sketches and algorithms in Section 6:

#### 6.1: Tool Call Correlation
- [ ] Does the algorithm handle missing `PostToolUse` hooks?
- [ ] What happens if `PreToolUse` and `PostToolUse` arrive out of order?
- [ ] Is the correlation key `session_id:tool_name` unique enough?
- [ ] Edge case: Multiple tools with same name called concurrently?

#### 6.2: File Change Detection
- [ ] Are git commands syntactically correct?
- [ ] `git diff --name-status ${before} ${after}` - valid syntax?
- [ ] `git show ${commit}:${path}` - handles spaces in paths?
- [ ] Will this scale with 100+ file changes?

#### 6.3: Reactive Watchers
- [ ] Can `expect()` throws be caught reliably in async context?
- [ ] How does error propagate: watcher → `onHookPayload()` → SDK stream?
- [ ] Is `AbortController` correctly integrated to stop execution?
- [ ] Race condition: Watcher runs while tool is completing?

#### 6.4: Judge Implementation
- [ ] Does `formatJudgePrompt()` exist or need to be implemented?
- [ ] Does `parseJudgmentResponse()` exist or need to be implemented?
- [ ] Does `zodToJsonSchema()` exist? (Need `zod-to-json-schema` package?)
- [ ] Is `JUDGE_SYSTEM_PROMPT` defined?
- [ ] Does `JudgmentFailedError` class exist?

**For Each Algorithm**:
```
Section: [6.X]
Algorithm: [Name]
├─ Correctness: ✅ Valid | ❌ Flawed | ⚠️ Needs clarification
├─ Completeness: ✅ All cases | ❌ Missing cases
├─ Scalability: ✅ Scales | ❌ Performance issues
└─ Issues: [list] - FIX: [suggestions]
```

---

### 4. Documentation Alignment

Compare specification against existing documentation:

**Doc Locations to Check**:
- `docs/content/docs/api/*.mdx` (API reference)
- `docs/content/docs/guides/**/*.mdx` (How-to guides)
- `docs/content/docs/getting-started/*.mdx` (Tutorials)
- `docs/content/docs/explanation/*.mdx` (Explanations)

**For Each API in Spec**:
1. Check if doc file exists
2. Compare API signature in doc vs spec
3. Check if examples use correct syntax
4. Identify missing content (parameters, return types, examples)
5. Flag contradictions

**Critical Doc Files to Validate**:
- `docs/content/docs/api/judge.mdx` - Does it match new `judge<T>()` signature?
- `docs/content/docs/api/prompt.mdx` - Does it match new multi-modal `prompt()`?
- `docs/content/docs/api/defineJudge.mdx` - Is this file needed? (judge is a function, not a define*)
- `docs/content/docs/api/runAgent.mdx` - Does it explain `AgentExecution` return type?
- `docs/content/docs/api/vibeTest.mdx` - Does it show cumulative state example?
- `docs/content/docs/api/vibeWorkflow.mdx` - Does it show `until()` helper?

**Output Format**:
```markdown
| API/Concept | Spec Section | Doc File | Status | Action Required |
|-------------|--------------|----------|--------|-----------------|
| judge<T>()  | 1.1, 2.4, 6.4| judge.mdx | ❌ Outdated | Update signature, add generic examples, show Zod schema usage |
| prompt()    | 2.4          | prompt.mdx | ❌ Outdated | Complete rewrite for multi-modal (text/images/files/command) |
| AgentExecution | 1.2, 2.1 | runAgent.mdx | ⚠️ Partial | Add watch() method docs, explain Promise subclass |
```

---

### 5. Dependency & Build Order Validation

Review Section 5 (Implementation Requirements):

#### Dependency Checks:
- [ ] Are all dependencies in `package.json` (5.1) sufficient?
- [ ] Missing: `zod-to-json-schema` (used in 6.4:1969)?
- [ ] Does `@anthropic-ai/claude-code` export `SDKUserMessage` type?
- [ ] Are version constraints correct (e.g., `vitest: ^3.2.0`)?

#### Build Order:
Based on the spec, suggest implementation sequence:

**What depends on what?**
1. Core types (Section 1) → Everything depends on this
2. ContextManager (4.2) → Required by fixtures
3. Fixtures (4.4) → Required by vibeTest/vibeWorkflow
4. Matchers (2.7) → Depend on RunResult type
5. Reporters (4.3) → Depend on task.meta schema
6. Judge (6.4) → Depends on prompt() and SDK integration

**Suggested Order**:
1. Phase 1: Core types + schemas (Section 1, 5.4)
2. Phase 2: ContextManager + RunBundle (Section 4.2, 3.1)
3. Phase 3: Fixtures (vibeTest, vibeWorkflow) (Section 4.4)
4. Phase 4: prompt() and judge() (Section 2.4, 6.4)
5. Phase 5: Matchers (Section 2.7)
6. Phase 6: Reporters (Section 4.3)

**Validate Build Order**:
- [ ] Can each phase be built independently?
- [ ] Are there circular dependencies?
- [ ] Can we test each phase before moving to next?

**Output Format**:
```
Dependencies:
├─ Missing: [package] - Used in [section:line] - ADD: npm install [package]
├─ Uncertain: [type/export] - Check if [package] exports this
└─ Correct: [list of validated deps]

Build Order:
1. [Phase] - [Components] (Depends on: [previous phases])
2. [Phase] - [Components] (Depends on: [previous phases])

Risk Areas:
- [Component] - [Risk] - Mitigation: [strategy]
```

---

## Execution Instructions

### Step 1: Load Specification
Read the technical specification file:
```bash
.claude/docs/vibecheck/technical-specification.md
```

### Step 2: Load Documentation Files
Use Glob to find all doc files:
```bash
docs/content/docs/api/*.mdx
docs/content/docs/guides/**/*.mdx
docs/content/docs/getting-started/*.mdx
```

### Step 3: Perform Analysis
Run all 5 analysis tasks systematically:
1. Type System Audit
2. API Signature Validation
3. Implementation Feasibility
4. Documentation Alignment
5. Dependency & Build Order

### Step 4: Generate Report
Output findings in the required format (see Output Requirements below)

---

## Output Requirements

Your final report MUST follow this structure:

### Executive Summary
```
## 📊 Specification Audit Results

**Implementation Ready?** ✅ YES | ❌ NO

**Issue Counts:**
- 🚨 Critical Blockers: [X]
- ⚠️  Consistency Issues: [X]
- 📄 Documentation Gaps: [X]
- ❓ Questions for Clarification: [X]

**Overall Assessment:**
[2-3 sentence summary of findings]

**Recommendation:**
[PROCEED | FIX BLOCKERS FIRST | NEEDS CLARIFICATION]
```

### Critical Blockers
```
## 🚨 Critical Blockers (Implementation Impossible Without Fixes)

### 1. [Issue Title]
**Problem:** [Clear description of what's broken]
**Location:** [Section:Lines] (e.g., 2.4:871-883)
**Impact:** [Why this blocks implementation]
**Fix:**
\`\`\`typescript
[Suggested code fix or explanation]
\`\`\`
**Priority:** HIGH | MEDIUM | LOW
```

### Consistency Issues
```
## ⚠️ Consistency Issues (May Cause Confusion/Bugs)

### 1. [Issue Title]
**Problem:** [Description]
**Location:** [Sections] (e.g., 1.1:43 vs 2.4:871)
**Impact:** [What could go wrong]
**Fix:** [Specific suggestion]
**Priority:** HIGH | MEDIUM | LOW
```

### Documentation Gaps
```
## 📄 Documentation Gaps

| API/Concept | Spec Section | Doc File | Status | Action Required |
|-------------|--------------|----------|--------|-----------------|
| [API] | [Section] | [file.mdx] | [Status] | [Specific updates needed] |
```

### Implementation Recommendations
```
## 🔧 Implementation Recommendations

### Build Order
1. **Phase 1:** [Components] - [Why start here]
   - Dependencies: [None | Previous phase]
   - Estimated Time: [Time]
   - Risk: [LOW | MEDIUM | HIGH]

2. **Phase 2:** [Components] - [Why next]
   ...

### Risk Areas
| Component | Risk Level | Issue | Mitigation |
|-----------|------------|-------|------------|
| [Name] | [HIGH/MED/LOW] | [Description] | [Strategy] |

### Missing Dependencies
- [ ] Add `[package]` - Used in [section:line]
- [ ] Verify `[type]` exists in `[package]`
```

### Questions for Clarification
```
## ❓ Questions for Clarification

### Q1: [Ambiguous Area]
**Context:** [Where in spec]
**Question:** [What needs clarification]
**Options:**
- Option A: [Description] - [Pros/Cons]
- Option B: [Description] - [Pros/Cons]
**Recommendation:** [Your suggestion]
```

---

## Important Guidelines

1. **Be Specific**:
   - ❌ "Types don't match"
   - ✅ "judge() return type Promise<T> in 2.4:871 conflicts with Promise<JudgeResult> in 1.1:43"

2. **Provide Line Numbers**:
   - Always reference exact locations (Section:Lines)

3. **Suggest Concrete Fixes**:
   - Not just problems, but actionable solutions

4. **Prioritize**:
   - Critical blockers first (implementation impossible)
   - Then consistency issues (bugs likely)
   - Then doc gaps (user confusion)

5. **Think Like an Implementer**:
   - Would YOU be able to build this from the spec?
   - What questions would YOU have?
   - What would confuse YOU?

6. **Validate External References**:
   - Use WebFetch to check if SDK types exist
   - Use WebSearch to verify npm package versions
   - Don't assume - verify

---

## Use TodoWrite Tool

As you work through the analysis, use TodoWrite to track progress:

```typescript
await TodoWrite({
  todos: [
    { content: "Type System Audit", status: "in_progress", activeForm: "Auditing type system" },
    { content: "API Signature Validation", status: "pending", activeForm: "Validating API signatures" },
    { content: "Implementation Feasibility", status: "pending", activeForm: "Checking implementation feasibility" },
    { content: "Documentation Alignment", status: "pending", activeForm: "Aligning documentation" },
    { content: "Dependency & Build Order", status: "pending", activeForm: "Validating dependencies" },
    { content: "Generate Report", status: "pending", activeForm: "Generating report" }
  ]
});
```

Mark tasks as completed as you finish each section.

---

## Start Now

Begin by:
1. Reading `.claude/docs/vibecheck/technical-specification.md`
2. Creating a TodoWrite list for the 6 analysis tasks
3. Systematically working through each task
4. Generating the final structured report

**Remember**: The goal is to ensure this spec can be used as the single source of truth for implementation. Find everything that would block or confuse an implementer.

Good luck! 🔍
