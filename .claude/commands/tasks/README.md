# Implementation Task Commands

**Slash commands for navigating and managing Vibe-Check implementation**

---

## 🎯 Available Commands

### `/tasks/start-phase`
**Purpose**: Start a new implementation phase
**Use When**: Beginning Phase 0, 1, 2, 3, 4, or 5
**What it does**:
- Reads current progress and dependencies
- Identifies next phase to start
- Creates session plan with goals
- Sets up session log
- Lists tasks and parallel work opportunities

**Example**:
```
/tasks/start-phase
```

---

### `/tasks/check-progress`
**Purpose**: Check current implementation status
**Use When**: Daily standups, or anytime you want to see status
**What it does**:
- Analyzes PROGRESS.md and TEST_MATRIX.md
- Calculates completion percentage
- Lists recent completions
- Identifies next tasks
- Highlights blockers

**Example**:
```
/tasks/check-progress
```

---

### `/tasks/create-session`
**Purpose**: Begin a new work session
**Use When**: Starting work on a component
**What it does**:
- Determines what to work on next
- Creates session log from template
- Sets up TDD plan (tests first)
- Lists files to create/modify
- References relevant docs

**Example**:
```
/tasks/create-session
```

---

### `/tasks/end-session`
**Purpose**: Wrap up current work session
**Use When**: Finishing work for the day/session
**What it does**:
- Updates session log with completion notes
- Updates PROGRESS.md (checks off tasks)
- Updates TEST_MATRIX.md (adds coverage)
- Updates phase OVERVIEW.md
- Suggests git commit message

**Example**:
```
/tasks/end-session
```

---

### `/tasks/generate-github-issues`
**Purpose**: Convert tasks to GitHub issues
**Use When**: Setting up GitHub project, or per-phase
**What it does**:
- Reads tasks from PROGRESS.md
- Generates formatted GitHub issues
- Includes dependencies and acceptance criteria
- Adds labels and estimates
- Offers to create via gh CLI

**Example**:
```
/tasks/generate-github-issues
```

---

## 📋 Quick Reference

| Want to... | Use this command |
|-----------|-----------------|
| See what's next | `/tasks/check-progress` |
| Start a new phase | `/tasks/start-phase` |
| Begin working | `/tasks/create-session` |
| Finish working | `/tasks/end-session` |
| Create GitHub issues | `/tasks/generate-github-issues` |

---

## 🔄 Typical Workflow

### Daily Solo Work
```bash
/tasks/check-progress          # What's the status?
/tasks/create-session          # Start work
# ... do the work ...
/tasks/end-session             # Update progress
```

### Team Phase Start
```bash
/tasks/start-phase             # Plan the phase together
# Assign tasks to team members
/tasks/create-session          # Each dev starts their work
```

### GitHub Integration
```bash
/tasks/generate-github-issues  # One-time per phase
# Pick issue from GitHub
/tasks/create-session          # Link to issue in session
/tasks/end-session             # Update issue status
```

---

## 📁 What Gets Read/Updated

### Commands Read From:
- `.claude/tasks/PROGRESS.md` - Master checklist
- `.claude/tasks/TEST_MATRIX.md` - Test coverage
- `.claude/tasks/RADIAL_MAP.md` - Dependencies
- `.claude/tasks/RISK_ASSESSMENT.md` - Risks
- `.claude/tasks/{phase}/OVERVIEW.md` - Phase status
- `.claude/tasks/SESSION_TEMPLATE.md` - Template
- `.claude/tasks/spikes/*/LEARNINGS.md` - Spike findings
- `.claude/docs/vibecheck/technical-specification.md` - Tech specs

### Commands Update:
- `.claude/tasks/SESSION_LOG/{date}-{component}.md` - Session notes
- `.claude/tasks/PROGRESS.md` - Task completion
- `.claude/tasks/TEST_MATRIX.md` - Test counts
- `.claude/tasks/{phase}/OVERVIEW.md` - Phase status

---

## 💡 Pro Tips

1. **Start every session** with `/tasks/check-progress`
   - Gives you immediate context
   - Shows what's next
   - Identifies blockers

2. **Use session logs** for continuity
   - Essential for multi-day work
   - Documents blockers and learnings
   - Helps other team members understand progress

3. **Let commands navigate** - don't manually hunt for files
   - Commands know what to read
   - Commands update the right files
   - You focus on coding

4. **GitHub issues are optional**
   - Solo/small team: Use PROGRESS.md directly
   - Larger teams: Generate issues for formal PM

---

## 🆘 Help

### Command Not Working?
- Make sure you're in the project root
- Check that `.claude/tasks/` exists
- Verify PROGRESS.md has tasks

### Don't Know What to Work On?
```bash
/tasks/check-progress
# Shows next task

/tasks/create-session
# Claude will suggest what's next
```

### Lost in the Files?
Read: `.claude/tasks/WORKFLOW_GUIDE.md`
- Complete practical workflow guide
- Examples for every scenario
- Team size recommendations

---

**For complete workflow instructions**: See `.claude/tasks/WORKFLOW_GUIDE.md`
