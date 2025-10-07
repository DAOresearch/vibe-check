# Practical Workflow Guide

**How to actually use this implementation planning system**

---

## 🎯 Quick Answer

Use the **slash commands** to navigate the system:

```
/tasks/start-phase              → Start a new phase
/tasks/check-progress           → Check current status
/tasks/create-session           → Begin a work session
/tasks/end-session              → Wrap up and update progress
/tasks/generate-github-issues   → Create GitHub issues
```

All task commands are in: `.claude/commands/tasks/`

---

## 📋 Three Ways to Use This System

### Option 1: Solo Developer (Recommended for Start)
**Best for**: 1-2 developers, moving fast

**Workflow**:
1. Read `.claude/tasks/QUICK_START.md`
2. Use slash commands to navigate
3. Track progress in PROGRESS.md
4. Create session logs for continuity
5. No GitHub issues needed

**Example Day**:
```bash
# Morning
/tasks/check-progress              # See what's next
/tasks/create-session              # Start work session
# ... do the work ...
/tasks/end-session                 # Update progress

# Afternoon
/tasks/create-session              # New session
# ... do the work ...
/tasks/end-session
```

---

### Option 2: Small Team (2-4 devs)
**Best for**: Team collaboration, shared workspace

**Workflow**:
1. Weekly planning: Use PROGRESS.md to assign tasks
2. Daily standups: Use `/tasks/check-progress`
3. Each dev: Uses `/tasks/create-session` for their work
4. End of day: Everyone runs `/tasks/end-session`
5. Sync via session logs in `.claude/tasks/SESSION_LOG/`

**Setup**:
```bash
# Monday planning
/tasks/start-phase                 # Start new phase together
# Assign tasks from phase OVERVIEW

# Daily
/tasks/check-progress              # Stand-up status check
/tasks/create-session              # Individual work
/tasks/end-session                 # Share progress
```

---

### Option 3: Larger Team with GitHub Issues
**Best for**: 5+ developers, formal project management

**Workflow**:
1. **Week 1**: Generate GitHub issues from PROGRESS.md
2. **Daily**: Developers pick issues, create sessions
3. **Track**: Link session logs to GitHub issues
4. **Update**: Close issues when tasks complete

**Setup**:
```bash
# One-time: Generate all issues
/tasks/generate-github-issues      # Create issues for all phases

# Daily workflow
1. Pick GitHub issue
2. /tasks/create-session          # Reference issue number
3. Do the work
4. /tasks/end-session             # Update issue
5. Close GitHub issue when done
```

**GitHub Integration**:
- Use issue numbers in session logs
- Link commits to issues: `git commit -m "[Phase X] Task (#123)"`
- Automate with GitHub Actions (optional)

---

## 🔄 Detailed Workflow: Phase by Phase

### Phase 0: Risk Assessment & Spikes (Week 1)

**Step 1: Start Phase**
```bash
/tasks/start-phase
# Claude will:
# - Read spikes/OVERVIEW.md
# - List 3 spikes to execute
# - Create session plan
```

**Step 2: Execute Spikes** (3 parallel tracks)
```bash
# Dev 1
/tasks/create-session
Component: Spike 1 - Hook Capture
# Do spike work (4-8 hours, time-boxed)
/tasks/end-session
# Fill in spikes/01-hook-capture/LEARNINGS.md

# Dev 2
/tasks/create-session
Component: Spike 2 - SDK Integration
# ...

# Dev 3
/tasks/create-session
Component: Spike 3 - Tool Correlation
# ...
```

**Step 3: Review Learnings**
```bash
# After all spikes done
/tasks/check-progress
# Claude will:
# - Check all spikes complete
# - Review learnings
# - Suggest go/no-go for Phase 1
```

**Step 4: Aggregate** (manual)
- Team reviews all spike learnings
- Fill in `spikes/LEARNINGS_SUMMARY.md`
- Make go/no-go decision

---

### Phase 1: Shared Kernel (Week 2)

**Step 1: Start Phase**
```bash
/tasks/start-phase
# Claude will:
# - Read kernel/README.md
# - Break down into 3 parallel tracks
# - Assign to team
```

**Step 2: Parallel Work** (3 tracks)
```bash
# Track 1: Types (2 devs)
/tasks/create-session
Component: Types System
# Create src/types/core.ts, agent.ts, judge.ts, workflow.ts
# Write tests first (TDD)
/tasks/end-session

# Track 2: Schemas (2 devs)
/tasks/create-session
Component: Schema System
# Create src/schemas/ with Zod validation
/tasks/end-session

# Track 3: Utils (1 dev)
/tasks/create-session
Component: Core Utilities
# Create src/utils/correlation.ts (from Spike 3)
/tasks/end-session
```

**Step 3: Integration**
```bash
# End of week integration session
/tasks/check-progress
# All kernel components complete?
# Coverage ≥95%?
# Mark Phase 1 complete in PROGRESS.md
```

---

### Phase 2-5: Rings (Weeks 3-8)

Same pattern:
1. `/tasks/start-phase` → Read ring OVERVIEW
2. Break into parallel tracks
3. Each track: `/tasks/create-session` → work → `/tasks/end-session`
4. Integration session at end
5. `/tasks/check-progress` → Move to next phase

---

## 🎨 Command Cheat Sheet

### Starting Work
```bash
/tasks/check-progress          # What's the status?
/tasks/start-phase            # Begin new phase
/tasks/create-session         # Start work session
```

### During Work
```bash
# Just work! Claude will:
# - Read technical specs when you ask
# - Reference spike learnings
# - Help implement following TDD
# - Answer questions using context
```

### Ending Work
```bash
/tasks/end-session            # Update all tracking files
git commit -m "[Phase X] ..."  # Commit with suggested message
```

### Project Management
```bash
/tasks/generate-github-issues  # Create issues (one-time or per-phase)
```

---

## 📂 What Gets Updated When

### Every Session End:
- `.claude/tasks/PROGRESS.md` - Check off tasks
- `.claude/tasks/TEST_MATRIX.md` - Add test counts
- `.claude/tasks/SESSION_LOG/DATE-component.md` - Session notes
- Phase OVERVIEW.md - Component status

### Every Phase End:
- Phase OVERVIEW.md - Mark complete
- `.claude/tasks/PROGRESS.md` - Phase checkbox
- `.claude/tasks/RADIAL_MAP.md` - (reference only)

### One-Time Setup:
- `.claude/tasks/RISK_ASSESSMENT.md` - Phase 0 only
- `.claude/tasks/spikes/LEARNINGS_SUMMARY.md` - Phase 0 only

---

## 🎯 Example: Complete Day

**Morning** (Solo dev, working on Phase 1)

```bash
# 1. Check status
/tasks/check-progress
# Output: "Phase 1, 40% complete. Next: correlation.ts"

# 2. Start session
/tasks/create-session
# Claude asks: "What component?"
# You: "correlation utilities"
# Claude creates: SESSION_LOG/2025-10-07-correlation.md

# 3. Work (Claude helps)
# You: "Help me implement correlation.ts using Spike 3 learnings"
# Claude: Reads .claude/tasks/spikes/03-correlation/LEARNINGS.md
# Claude: Helps implement with TDD

# 4. End session
/tasks/end-session
# Claude: "What did you complete?"
# You: "Finished correlation.ts with tests"
# Claude: Updates PROGRESS.md, TEST_MATRIX.md, session log
```

**Afternoon** (Same dev, new component)

```bash
# Start new session
/tasks/create-session
# Work on next component
/tasks/end-session
```

**End of Week** (Team review)

```bash
# Check overall progress
/tasks/check-progress
# Output: "Phase 1: 100% complete! Ready for Phase 2"

# Start next phase Monday
/tasks/start-phase
```

---

## 💡 Pro Tips

### 1. Session Logs = Memory
Your session logs in `SESSION_LOG/` are your memory across sessions:
- Document blockers
- Note learnings
- Link to relevant specs
- Future you will thank you!

### 2. Commands Navigate for You
Don't manually read files - let commands do it:
- `/tasks/check-progress` reads everything and summarizes
- `/tasks/create-session` pulls in relevant context
- `/tasks/end-session` updates everything

### 3. GitHub Issues = Optional
- Solo/small team: Skip GitHub, use PROGRESS.md directly
- Larger team: Generate issues once, sync manually
- Don't over-engineer - use what fits your team size

### 4. Phase-First Thinking
Always think in phases:
- Each phase has clear deliverables
- Each phase has an OVERVIEW.md
- Complete one phase before starting next
- Integration sessions at phase boundaries

### 5. Test-Driven Documentation
- Session logs document what was done
- PROGRESS.md shows what's left
- TEST_MATRIX.md proves it works
- This IS your documentation

---

## 🆘 Troubleshooting

**Q: Too many files, I'm lost!**
A: Use `/tasks/check-progress` - it reads everything and tells you what's next

**Q: How do I know what to work on?**
A: Use `/tasks/create-session` - it suggests next task from PROGRESS.md

**Q: Session logs seem redundant?**
A: They're for continuity across days/weeks. Skip if solo and working continuously.

**Q: Do I need GitHub issues?**
A: No! Only if you have 5+ devs or need formal PM. PROGRESS.md is sufficient otherwise.

**Q: Which files should I read manually?**
A: Only these when starting:
- `.claude/tasks/QUICK_START.md` (once)
- `.claude/tasks/IMPLEMENTATION_STRATEGY.md` (once)
- Technical specs (as needed during implementation)

Everything else: Use slash commands!

---

## ✅ Recommended Workflow by Team Size

### Solo (1 dev)
```bash
1. /tasks/check-progress          # Daily status
2. /tasks/create-session          # When switching components
3. Work with Claude's help
4. /tasks/end-session             # Update progress
```

### Small Team (2-4 devs)
```bash
Monday:
- /tasks/start-phase              # Team planning
- Assign tracks from phase OVERVIEW

Daily:
- /tasks/check-progress           # Standup
- /tasks/create-session           # Individual work
- /tasks/end-session              # Share progress

Friday:
- Review session logs
- Check phase completion
```

### Larger Team (5+ devs)
```bash
Setup (once per phase):
- /tasks/generate-github-issues   # Create issues

Daily:
- Pick issue from GitHub
- /tasks/create-session           # Link to issue
- Work
- /tasks/end-session              # Update issue
- Close issue when done
```

---

**Next**: Try `/tasks/check-progress` to see where you are!
