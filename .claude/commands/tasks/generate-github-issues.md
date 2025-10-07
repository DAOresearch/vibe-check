# Generate GitHub Issues from Tasks

You are helping the user convert implementation tasks into GitHub issues.

## Context

Read:
1. `.claude/tasks/PROGRESS.md` - All tasks
2. `.claude/tasks/RADIAL_MAP.md` - Dependencies
3. Phase OVERVIEW files

## Your Task

1. **Identify Tasks to Convert**:
   - Ask user: Which phase to generate issues for? (or all?)
   - Or generate for uncompleted tasks only

2. **Generate Issue for Each Task**:
   - Extract task description from PROGRESS.md
   - Add context from phase OVERVIEW
   - Include dependencies from RADIAL_MAP
   - Add labels (phase, priority, type)
   - Include test coverage requirements

3. **Format as GitHub Issue**:
   ```markdown
   ## Title
   [Phase X] Task Description

   ## Description
   Task details and context

   ## Acceptance Criteria
   - [ ] Criterion 1
   - [ ] Criterion 2

   ## Dependencies
   - Depends on: #issue-number

   ## Labels
   phase-X, priority-high, type-implementation

   ## Estimated Effort
   X hours
   ```

4. **Output**:
   - List of issues to create
   - Option to create via `gh` CLI
   - Or provide markdown for manual creation

## Example Output

```
📋 GitHub Issues Generated from Phase 1 Tasks

Issue 1: [Phase 1] Implement Types System
---
## Description
Implement all core type definitions for Vibe-Check kernel.

## Tasks
- [ ] Create src/types/core.ts (11 core interfaces)
- [ ] Create src/types/agent.ts (Agent types)
- [ ] Create src/types/judge.ts (Judge types)
- [ ] Create src/types/workflow.ts (Workflow types)
- [ ] Export from src/types/index.ts

## Acceptance Criteria
- [ ] All 11 core types defined
- [ ] Types match technical specification Section 1.1
- [ ] Unit tests validate type exports
- [ ] Coverage: 95%+

## Dependencies
None (foundation layer)

## References
- Technical Spec: .claude/docs/vibecheck/technical-specification.md Section 1
- Implementation: .claude/tasks/kernel/README.md

## Labels
`phase-1`, `kernel`, `types`, `priority-high`

## Estimated Effort
4 hours (2 devs, 2 hours each)

---

Issue 2: [Phase 1] Implement Schema System
...

---

To create these issues:

Option 1 - Using gh CLI:
```bash
gh issue create --title "[Phase 1] Implement Types System" \
  --body-file /path/to/issue-1.md \
  --label "phase-1,kernel,types,priority-high"
```

Option 2 - Batch create:
```bash
# I can create a script to batch create all issues
```

Option 3 - Manual:
Copy each issue markdown above to GitHub UI

Would you like me to:
1. Create all issues now via gh CLI?
2. Generate a bash script for batch creation?
3. Save issues as markdown files for manual creation?
```
