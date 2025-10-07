# Session Logs

Session logs are created here during implementation to track daily progress.

## Purpose

- Document what was accomplished each session
- Track decisions made and context for future sessions
- Provide continuity when switching between developers/agents
- Create project archaeology trail for retrospectives

## Usage

Use the `/tasks/end-session` command to automatically generate session logs.

## Naming Convention

**Format**: `YYYY-MM-DD-component-name.md`

**Examples**:
- `2025-10-08-hook-capture-spike.md`
- `2025-10-15-types-system.md`
- `2025-10-22-agent-runner.md`
- `2025-11-05-html-reporter.md`

## Session Template

Each session log follows the template in `../SESSION_TEMPLATE.md`.

**Key sections**:
- Session metadata (date, phase, duration)
- Tasks completed (with checkboxes)
- Files changed (list of paths)
- Decisions made (architectural choices)
- Blockers encountered (and resolutions)
- Next session prep (what to start with)

## Retention

Session logs are kept indefinitely in git history for project archaeology.

## Automation

The `/tasks/end-session` command:
1. Detects today's date
2. Identifies component from current work
3. Reads git status and diff
4. Generates session log from template
5. Updates PROGRESS.md checkboxes
6. Commits changes

## Tips

- Write session logs at the **end** of each work session (not the beginning)
- Be honest about what worked and what didn't
- Include context that will help you resume work tomorrow
- Link to relevant files, commits, or issues
- Note any TODOs for next session
