# Specification Audit Resolution Commands

Slash commands for systematically resolving the 36 issues identified in the specification audit.

## Workflow Overview

```
Phase 1: Design Decisions (FIRST)
    ↓
Phase 2: Spec Fixes (CORE WORK)
    ├── Batch 1 (Type System)
    ├── Batch 2 (Judge System)
    ├── Batch 3-7 (Other fixes)
    ↓
Phase 3: Documentation Updates
    ├── judge.mdx
    ├── prompt.mdx
    ├── Other docs
    ↓
Phase 4: Validation (FINAL)
```

## Commands

### Phase Commands

Execute entire phases:

- `/phase1-design-decisions` - Make architectural decisions (5 questions)
- `/phase2-spec-fixes` - Fix all specification issues (24 fixes)
- `/phase3-docs-updates` - Update all documentation (7 files)
- `/phase4-validation` - Validate all fixes and sign off

### Granular Commands

Work on specific parts:

- `/batch-execute <N>` - Execute one batch of spec fixes (provide batch number as argument)
- `/doc-update <file>` - Update one documentation file (provide file name as argument)

## Tracking Documents

Each phase creates a tracking document:

1. `.claude/docs/vibecheck/design-decisions.md` - Design question decisions
2. `.claude/docs/vibecheck/spec-fixes-tracking.md` - Spec fix batches
3. `.claude/docs/vibecheck/docs-updates-checklist.md` - Doc file checklist
4. `.claude/docs/vibecheck/audit-resolution-summary.md` - Final validation

## Usage Example

```bash
# Step 1: Make design decisions
/phase1-design-decisions
# [Discuss 5 questions with Claude, make decisions]

# Step 2: Fix specification (all batches)
/phase2-spec-fixes
# [Claude works through batches, updates spec to v1.4]

# Or work batch by batch:
/batch-execute 1  # Type System Foundations
/batch-execute 2  # Judge System Complete
# etc.

# Step 3: Update documentation
/phase3-docs-updates
# [Claude updates all 7 doc files]

# Or work file by file:
/doc-update judge
/doc-update prompt
# etc.

# Step 4: Validate everything
/phase4-validation
# [Claude re-audits, confirms implementation-ready]
```

## Command Details

### Phase 1: Design Decisions
- **Model:** claude-sonnet-4-5-20250929 (with extended thinking)
- **Tools:** Read, Write, Edit
- **Duration:** 1-2 hours (includes discussion)
- **Output:** design-decisions.md with all 5 questions answered

### Phase 2: Spec Fixes
- **Model:** claude-sonnet-4-5-20250929 (with extended thinking)
- **Tools:** Read, Write, Edit, TodoWrite
- **Duration:** 4-6 hours
- **Output:** Updated technical-specification.md (v1.4) + tracking doc

### Phase 3: Documentation Updates
- **Model:** claude-sonnet-4-5-20250929 (with extended thinking)
- **Tools:** Read, Write, Edit, Glob, TodoWrite
- **Duration:** 4-6 hours
- **Output:** 7 updated doc files + checklist

### Phase 4: Validation
- **Model:** claude-sonnet-4-5-20250929 (with extended thinking)
- **Tools:** Read, Write, Glob, Grep, TodoWrite
- **Duration:** 1 hour
- **Output:** audit-resolution-summary.md + sign-off

## Success Criteria

After all phases:
- ✅ All 36 issues resolved
- ✅ Specification v1.4 finalized
- ✅ Documentation aligned with spec
- ✅ No new critical issues
- ✅ Implementation-ready status confirmed

## Time Estimates

- Phase 1: 1-2 hours (discussion)
- Phase 2: 4-6 hours (spec fixes)
- Phase 3: 4-6 hours (doc updates)
- Phase 4: 1 hour (validation)

**Total: 10-15 hours** for complete audit resolution

## Notes

- Always complete Phase 1 before Phase 2
- Batches in Phase 2 have dependencies (do in order)
- Phase 3 can parallelize doc files
- Phase 4 is the quality gate
- All commands use **Claude Sonnet 4.5** (claude-sonnet-4-5-20250929) with extended thinking enabled
- Extended thinking provides maximum reasoning budget for complex analysis
- Each command has appropriate tool access

## Source

Generated from specification audit: `.claude/docs/vibecheck/specification-audit-report.md`

## Moving to Production

Once validated, move commands from `tmp/` to parent directory:

```bash
mv .claude/commands/tmp/*.md .claude/commands/
```

Or keep in `tmp/` folder and use:
```bash
/tmp/phase1-design-decisions
```
