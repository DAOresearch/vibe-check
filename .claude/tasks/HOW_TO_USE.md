# How to Use This Implementation System

**Quick reference for using the implementation planning system**

---

## 🎯 TL;DR

**Use slash commands to navigate everything:**

```bash
/tasks/check-progress         # Start here - see current status
/tasks/create-session         # Begin working
/tasks/end-session           # Wrap up and update
```

**Read this for details**: [WORKFLOW_GUIDE.md](./WORKFLOW_GUIDE.md)

---

## 📂 File Structure

All implementation planning is in `.claude/tasks/`:

```
.claude/
├── commands/tasks/              # 🎯 Slash commands
│   ├── start-phase.md
│   ├── check-progress.md
│   ├── create-session.md
│   ├── end-session.md
│   ├── generate-github-issues.md
│   └── README.md              # Command reference
│
└── tasks/                       # 📋 Implementation planning
    ├── QUICK_START.md          ⭐ Start here (first time)
    ├── WORKFLOW_GUIDE.md       ⭐ How to use (practical)
    ├── HOW_TO_USE.md           ⭐ This file (quick ref)
    ├── IMPLEMENTATION_STRATEGY.md  # 8-week strategy
    ├── PROGRESS.md             # Master checklist
    ├── RISK_ASSESSMENT.md      # Risk analysis
    ├── TEST_MATRIX.md          # Test coverage
    ├── RADIAL_MAP.md           # Visual architecture
    ├── SESSION_TEMPLATE.md     # Session structure
    ├── SESSION_LOG/            # Daily notes
    ├── spikes/                 # Phase 0
    ├── kernel/                 # Phase 1
    ├── ring1/                  # Phase 2
    ├── ring2/                  # Phase 3
    ├── ring3/                  # Phase 4
    └── ring4/                  # Phase 5
```

---

## 🚀 Three Ways to Use This

### Option 1: Solo Developer (Recommended)

**Workflow**:
```bash
# Daily
/tasks/check-progress          # What's next?
/tasks/create-session          # Start work
# ... code with Claude's help ...
/tasks/end-session             # Update progress
```

**What gets updated**:
- `PROGRESS.md` - Tasks checked off
- `TEST_MATRIX.md` - Coverage updated
- `SESSION_LOG/` - Session notes

**No GitHub needed** - track everything in PROGRESS.md

---

### Option 2: Small Team (2-4 devs)

**Weekly Planning**:
```bash
/tasks/start-phase             # Plan phase together
# Assign tasks from phase OVERVIEW.md
```

**Daily**:
```bash
/tasks/check-progress          # Team standup
/tasks/create-session          # Individual work
/tasks/end-session             # Share progress
```

**Coordination**:
- Share via `SESSION_LOG/` files
- Review session logs Friday
- Sync on blockers

---

### Option 3: Larger Team (5+ devs) with GitHub

**Setup** (one-time per phase):
```bash
/tasks/generate-github-issues  # Create issues from PROGRESS.md
```

**Daily Workflow**:
1. Pick GitHub issue
2. `/tasks/create-session` (mention issue #)
3. Work on implementation
4. `/tasks/end-session` (update issue)
5. Close issue when complete

---

## 📋 Available Commands

| Command | Purpose | When to Use |
|---------|---------|-------------|
| `/tasks/check-progress` | See current status | Start of day, standups |
| `/tasks/start-phase` | Begin new phase | Week starts, phase complete |
| `/tasks/create-session` | Start work session | Begin coding |
| `/tasks/end-session` | Wrap up session | End of work |
| `/tasks/generate-github-issues` | Create GH issues | Team setup (optional) |

**Full reference**: `.claude/commands/tasks/README.md`

---

## 🔄 Typical Day

**Morning**:
```bash
# Check status
/tasks/check-progress
# Output: "Phase 1, 40% done. Next: correlation.ts"

# Start session
/tasks/create-session
# Claude: Creates session log, suggests TDD plan

# Work
# Claude: Helps implement using spike learnings & tech specs
```

**Afternoon**:
```bash
# End session
/tasks/end-session
# Claude: Updates PROGRESS.md, TEST_MATRIX.md, session log
# Claude: Suggests git commit message

# Start new session (if continuing)
/tasks/create-session
```

---

## 📚 What to Read

### First Time Setup:
1. **[QUICK_START.md](./QUICK_START.md)** - Complete getting started guide
2. **[IMPLEMENTATION_STRATEGY.md](./IMPLEMENTATION_STRATEGY.md)** - 8-week plan
3. **[WORKFLOW_GUIDE.md](./WORKFLOW_GUIDE.md)** - Detailed workflows

### Daily Reference:
- Use `/tasks/check-progress` - don't read files manually!
- Commands navigate everything for you

### When Stuck:
- **[WORKFLOW_GUIDE.md](./WORKFLOW_GUIDE.md)** - Examples for every scenario
- `.claude/commands/tasks/README.md` - Command reference

---

## 💡 Key Concepts

### Session Logs = Memory
Files in `SESSION_LOG/` preserve context across:
- Days/weeks
- Different developers
- Paused work

Always create session logs when:
- Switching components
- Multi-day work
- Team collaboration

### Commands Do the Navigation
Don't manually hunt for files:
- `/tasks/check-progress` reads everything
- `/tasks/create-session` finds next task
- `/tasks/end-session` updates tracking files

### Phases Drive Progress
Think in phases, not tasks:
- Each phase has clear deliverables
- Complete phase before moving to next
- Integration sessions at boundaries

### GitHub Issues = Optional
- **Solo/Small team**: Use PROGRESS.md directly
- **Larger team**: Generate issues for PM
- Don't over-engineer!

---

## 🆘 Common Questions

**Q: Where do I start?**
A: Run `/tasks/check-progress` - it tells you what's next

**Q: Too many files!**
A: Use commands - they navigate for you. Only read:
- QUICK_START.md (once)
- WORKFLOW_GUIDE.md (when stuck)

**Q: Do I need GitHub issues?**
A: No! Only if 5+ devs or formal PM. PROGRESS.md is enough.

**Q: What gets updated when?**
A: `/tasks/end-session` updates everything automatically

**Q: Session logs seem extra?**
A: They preserve context across days/devs. Skip if solo + continuous work.

---

## ✅ Next Steps

1. **Try**: `/tasks/check-progress`
2. **Read**: [WORKFLOW_GUIDE.md](./WORKFLOW_GUIDE.md) for complete workflows
3. **Begin**: Phase 0 - Risk Assessment & Spikes

---

**Everything is ready!** Use the slash commands to navigate the system. 🚀
