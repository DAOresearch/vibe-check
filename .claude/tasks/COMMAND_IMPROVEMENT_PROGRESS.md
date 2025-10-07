# Command Improvement Progress

**Date Started:** 2025-10-07
**Commands to Improve:** 5 commands in `.claude/commands/Tasks/`
**Goal:** Apply Claude Code prompt engineering best practices to all task commands

---

## Overview

Improving 5 task management commands to follow optimal slash command structure:
- Add YAML frontmatter (description, argument-hint, allowed-tools)
- Restructure with context-first pattern (30% quality boost)
- Add multishot examples (3-5 per command)
- Inline reference files in XML tags
- Add success criteria checklists

---

## Progress Summary

| Command | Frontmatter | Context-First | Examples | Success Criteria | Status |
|---------|-------------|---------------|----------|------------------|--------|
| start-phase | ⬜ | ⬜ | ⬜ | ⬜ | Not Started |
| create-session | ⬜ | ⬜ | ⬜ | ⬜ | Not Started |
| check-progress | ⬜ | ⬜ | ⬜ | ⬜ | Not Started |
| end-session | ⬜ | ⬜ | ⬜ | ⬜ | Not Started |
| generate-github-issues | ⬜ | ⬜ | ⬜ | ⬜ | Not Started |

**Legend:** ⬜ Not Started | 🚧 In Progress | ✅ Complete

---

## Detailed Progress

### 1. `/tasks/start-phase`

**Status:** Not Started

**Critical Changes:**
- [ ] Add frontmatter with `allowed-tools: Read, Write, Glob`
- [ ] Add description: "Start a new implementation phase with session planning"
- [ ] Add argument-hint (none - detects from PROGRESS.md)

**High Priority Changes:**
- [ ] Restructure with context-first pattern
- [ ] Inline PROGRESS.md, RADIAL_MAP.md in `<context>` tags
- [ ] Add quote extraction pattern (identify phase → quote goals → execute)
- [ ] Add 3-5 multishot examples (different phases 0-5)
- [ ] Make output format explicit with structured template

**Medium Priority Changes:**
- [ ] Add parallel tool execution guidance
- [ ] Add phase detection algorithm
- [ ] Enhance session log creation template

---

### 2. `/tasks/create-session`

**Status:** Not Started

**Critical Changes:**
- [ ] Add frontmatter with `allowed-tools: Read, Write, Glob`
- [ ] Add description: "Create new work session with TDD plan"
- [ ] Add argument-hint: `[component-name]` (optional)

**High Priority Changes:**
- [ ] Inline SESSION_TEMPLATE.md in `<templates>` section at top
- [ ] Add quote extraction for template structure
- [ ] Add 5 multishot examples (kernel, ring1, with/without dependencies)
- [ ] Make TDD planning more explicit ("tests BEFORE implementation")
- [ ] Restructure with context-first pattern

**Medium Priority Changes:**
- [ ] Add date/timestamp handling guidance
- [ ] Add component detection from PROGRESS.md
- [ ] Add estimated duration calculation

---

### 3. `/tasks/check-progress`

**Status:** Not Started

**Critical Changes:**
- [ ] Add frontmatter with `allowed-tools: Read, Glob`
- [ ] Add description: "Check current implementation status and next steps"
- [ ] Add argument-hint (none)

**High Priority Changes:**
- [ ] Add completion % calculation algorithm (explicit formula)
- [ ] Add 3-5 multishot examples (different phases, completion %, blockers)
- [ ] Inline PROGRESS.md, TEST_MATRIX.md, RISK_ASSESSMENT.md in `<context>`
- [ ] Add quote extraction pattern
- [ ] Restructure with context-first pattern

**Medium Priority Changes:**
- [ ] Add parallel tool execution (read all files simultaneously)
- [ ] Add blocker detection algorithm
- [ ] Add next task prioritization logic

---

### 4. `/tasks/end-session`

**Status:** Not Started

**Critical Changes:**
- [ ] Add frontmatter with `allowed-tools: Read, Edit, Glob, Grep`
- [ ] Add description: "Wrap up work session and update progress trackers"
- [ ] Add argument-hint (none - auto-detects today's session)

**High Priority Changes:**
- [ ] Replace interactive questions with auto-detection
- [ ] Add update algorithms (how to check off PROGRESS.md tasks)
- [ ] Add 5 multishot examples (partial/full completion, blockers, test failures)
- [ ] Inline update patterns in `<rules>` section
- [ ] Restructure with context-first pattern

**Medium Priority Changes:**
- [ ] Add session log detection logic (find today's log)
- [ ] Emphasize test coverage validation
- [ ] Add git commit message generation rules

---

### 5. `/tasks/generate-github-issues`

**Status:** Not Started

**Critical Changes:**
- [ ] Add frontmatter with `allowed-tools: Read, Bash, Glob`
- [ ] Add description: "Convert implementation tasks to GitHub issues"
- [ ] Add argument-hint: `[phase-number]` (optional)

**High Priority Changes:**
- [ ] Add issue template structure in `<templates>` section
- [ ] Add 5 multishot examples (single phase, all phases, dependencies, priorities)
- [ ] Inline PROGRESS.md, RADIAL_MAP.md in `<context>` at top
- [ ] Add quote extraction pattern
- [ ] Restructure with context-first pattern

**Medium Priority Changes:**
- [ ] Add gh CLI error handling patterns
- [ ] Add batch creation script template
- [ ] Add label generation logic

---

## Implementation Plan

### Phase 1: Critical Fixes (Frontmatter)
**Estimated Time:** 1-2 hours
**Goal:** All commands have valid YAML frontmatter and can be invoked as slash commands

1. ✅ `start-phase.md`
2. ⬜ `create-session.md`
3. ⬜ `check-progress.md`
4. ⬜ `end-session.md`
5. ⬜ `generate-github-issues.md`

### Phase 2: High Priority (Quality Boost)
**Estimated Time:** 4-6 hours
**Goal:** Context-first pattern, multishot examples, inlined templates

1. ⬜ Restructure all 5 commands with context-first pattern
2. ⬜ Inline all referenced files (PROGRESS.md, templates, etc.)
3. ⬜ Add 3-5 multishot examples per command
4. ⬜ Add explicit algorithms (calculations, updates, detection)

### Phase 3: Medium Priority (Optimization)
**Estimated Time:** 2-3 hours
**Goal:** Parallel execution, auto-detection, refinements

1. ⬜ Add parallel tool execution guidance
2. ⬜ Replace interactive questions with auto-detection
3. ⬜ Add error handling patterns
4. ⬜ Final testing and validation

---

## Key Principles Being Applied

✅ **Long Context Optimization** - Put longform data at TOP (30% quality improvement)
✅ **XML Structure** - Wrap content in semantic tags (`<context>`, `<rules>`, `<templates>`)
✅ **Multishot Prompting** - 3-5 diverse examples per command
✅ **Explicit Instructions** - Clear, specific, positive instructions
✅ **Simple Arguments** - Use $1 for single arg, avoid complex flag parsing
✅ **Tool Permissions** - Explicitly list allowed tools in frontmatter

---

## Notes

- All commands currently lack frontmatter (critical blocker)
- Context files referenced but not inlined (loses quality)
- Examples exist but not in multishot XML format
- Instructions come before context (violates best practices)
- No success criteria checklists

**Expected Impact After Improvements:**
- 30% quality boost from context-first restructuring
- More consistent outputs from multishot examples
- Reduced errors from explicit tool permissions
- Better auto-detection vs. interactive questions

---

## Reference

- **Original Analysis:** See previous conversation analysis
- **Best Practices Doc:** `.claude/commands/meta/improve.md` prompt engineering guide
- **Commands Location:** `.claude/commands/Tasks/`
