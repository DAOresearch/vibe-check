# Quick Navigation Guide

**All implementation documents are now in `.claude/tasks/`**

---

## 🚀 Quick Access

### Start Here
```bash
# Main index
cat .claude/tasks/README.md

# Getting started
cat .claude/tasks/QUICK_START.md

# Complete strategy
cat .claude/tasks/IMPLEMENTATION_STRATEGY.md
```

### Check Status
```bash
# Overall progress
cat .claude/tasks/PROGRESS.md

# Risk status
cat .claude/tasks/RISK_ASSESSMENT.md

# Test coverage
cat .claude/tasks/TEST_MATRIX.md

# Current phase
cat .claude/tasks/spikes/OVERVIEW.md       # Phase 0
cat .claude/tasks/kernel/README.md         # Phase 1
cat .claude/tasks/ring1/OVERVIEW.md        # Phase 2
cat .claude/tasks/ring2/OVERVIEW.md        # Phase 3
cat .claude/tasks/ring3/OVERVIEW.md        # Phase 4
cat .claude/tasks/ring4/OVERVIEW.md        # Phase 5
```

### Session Management
```bash
# View session template
cat .claude/tasks/SESSION_TEMPLATE.md

# Create new session log
cp .claude/tasks/SESSION_TEMPLATE.md \
   .claude/tasks/SESSION_LOG/$(date +%Y-%m-%d)-component.md

# Edit session log
vim .claude/tasks/SESSION_LOG/$(date +%Y-%m-%d)-component.md
```

---

## 📁 Directory Quick Reference

```
.claude/tasks/
├── README.md                   # Start here
├── QUICK_START.md             # For new team members
├── IMPLEMENTATION_STRATEGY.md # 8-week plan
├── PROGRESS.md                # Master checklist
├── RISK_ASSESSMENT.md         # Risk matrix
├── TEST_MATRIX.md             # Coverage tracker
├── RADIAL_MAP.md              # Visual architecture
├── SESSION_TEMPLATE.md        # Session structure
├── SESSION_LOG/               # Daily notes
├── spikes/                    # Phase 0
├── kernel/                    # Phase 1
├── ring1/                     # Phase 2
├── ring2/                     # Phase 3
├── ring3/                     # Phase 4
└── ring4/                     # Phase 5
```

---

## 🎯 Common Tasks

### Starting a New Phase
```bash
# 1. Read phase overview
cat .claude/tasks/{phase}/OVERVIEW.md

# 2. Check dependencies in radial map
cat .claude/tasks/RADIAL_MAP.md

# 3. Create session log
cp .claude/tasks/SESSION_TEMPLATE.md \
   .claude/tasks/SESSION_LOG/$(date +%Y-%m-%d)-{phase}.md
```

### During a Session
```bash
# 1. Check current progress
cat .claude/tasks/PROGRESS.md | grep "Phase X"

# 2. Work on implementation
# ... (write tests, code, etc.)

# 3. Update progress
vim .claude/tasks/PROGRESS.md

# 4. Update session log
vim .claude/tasks/SESSION_LOG/$(date +%Y-%m-%d)-component.md
```

### End of Session
```bash
# 1. Update PROGRESS.md (check off tasks)
vim .claude/tasks/PROGRESS.md

# 2. Update phase OVERVIEW.md
vim .claude/tasks/{phase}/OVERVIEW.md

# 3. Update TEST_MATRIX.md (if tests added)
vim .claude/tasks/TEST_MATRIX.md

# 4. Commit changes
git add .claude/tasks/
git commit -m "[Phase X] Complete Component Y"
```

---

## 🔍 Finding Information

### "Where do I start?"
→ `.claude/tasks/QUICK_START.md`

### "What's the overall plan?"
→ `.claude/tasks/IMPLEMENTATION_STRATEGY.md`

### "What's done and what's left?"
→ `.claude/tasks/PROGRESS.md`

### "What are the risks?"
→ `.claude/tasks/RISK_ASSESSMENT.md`

### "How do I run a session?"
→ `.claude/tasks/SESSION_TEMPLATE.md`

### "Where's the architecture diagram?"
→ `.claude/tasks/RADIAL_MAP.md`

### "What's the current phase status?"
→ `.claude/tasks/{spikes|kernel|ring1|ring2|ring3|ring4}/OVERVIEW.md`

### "Where are the technical specs?"
→ `.claude/docs/vibecheck/technical-specification.md`

---

## 📝 Path Conventions

### Absolute Paths (from project root)
```bash
.claude/tasks/PROGRESS.md
.claude/tasks/spikes/OVERVIEW.md
.claude/tasks/kernel/README.md
```

### Relative Paths (from `.claude/tasks/`)
```bash
./PROGRESS.md
./spikes/OVERVIEW.md
./kernel/README.md
```

---

## 🎓 Learning Path

**For New Team Members:**

1. Read `.claude/tasks/QUICK_START.md` (30 min)
2. Skim `.claude/tasks/IMPLEMENTATION_STRATEGY.md` (1 hour)
3. Review `.claude/docs/vibecheck/technical-specification.md` (2-3 hours)
4. Read current phase `.claude/tasks/{phase}/OVERVIEW.md` (15 min)
5. Follow `.claude/tasks/SESSION_TEMPLATE.md` for work

---

**Last Updated**: 2025-10-07
**Status**: All paths updated to `.claude/tasks/`
