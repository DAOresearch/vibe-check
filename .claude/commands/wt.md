---
description: Manage git worktrees with integrated tmux sessions
argument-hint: [subcommand] [options]
model: claude-3-5-haiku-latest
allowed-tools: Bash(*)
---

# Git Worktree & Tmux Manager

Ultra-efficient wrapper for `scripts/wt.ts` - loads state once, executes fast.

## Your Task

**Step 1: Load current state (single call)**

Run this command to get all worktree/tmux state:
```bash
cd "$(git rev-parse --show-toplevel)" && bun scripts/wt.ts debug
```

Store the output in `<current-state>` for reference.

**Step 2: Execute the requested command**

Based on the user's subcommand (`$1`), execute the appropriate action:

### For read-only commands (status, list, debug):
- **Display the output from Step 1 directly** (already have all data)
- Format appropriately if needed

### For mutating commands (create, delete, cleanup, open):
- Run: `cd "$(git rev-parse --show-toplevel)" && bun scripts/wt.ts $@`
- Display output directly

**Why this approach?**
- ✅ Single upfront call gathers all state
- ✅ No sequential bash calls for read operations
- ✅ Reuses cached data when possible
- ✅ Only executes script when actually needed

<execution-rules>
## Command Routing

| User Input | Action |
|------------|--------|
| `/wt` or `/wt status` | Parse `<current-state>`, format status view |
| `/wt list` | Parse `<current-state>`, format list view |
| `/wt debug` | Show raw `<current-state>` output |
| `/wt create <branch>` | Execute: `bun scripts/wt.ts create <branch> [path]` |
| `/wt open <target>` | Execute: `bun scripts/wt.ts open <target>` |
| `/wt cleanup` | Execute: `bun scripts/wt.ts cleanup [-y]` |
| `/wt delete <id>` | Execute: `bun scripts/wt.ts delete <id> [-y]` |

## Formatting Rules

When displaying status/list from cached data:
- Use the same visual format as the script's native output
- Keep emojis, colors, and structure consistent
- Extract and display relevant fields from `<current-state>`
</execution-rules>

<examples>
## Example 1: Status Command (Uses Cached Data)

<input>/wt status</input>

<process>
1. Load state once:
   ```bash
   cd "$(git rev-parse --show-toplevel)" && bun scripts/wt.ts debug
   ```

2. Parse output to extract:
   - Repository name
   - Current branch
   - Current path
   - Session exists?
   - Current window
   - Worktree count
   - Window count
   - Sync status

3. Format and display (no additional bash calls needed)
</process>

<expected_output>
📊 Worktree Manager Status

Repository: vibe-check
Current Branch: main
Current Path: /Users/abuusama/repos/worktrees/vibe-check/main

Tmux Session: vibe-check (exists)
Current Window: 2:spike/hook-capture

Worktrees: 6 total
Tmux Windows: 6 total
Status: ✓ Synchronized

Quick Actions:
  create <branch>     Create new worktree
  list                List all worktrees
  open <target>       Switch to window
  cleanup             Clean up orphaned items
  delete <id>         Delete worktree and window
</expected_output>
</example>

## Example 2: List Command (Uses Cached Data)

<input>/wt list</input>

<process>
1. Already have state from initial load
2. Parse worktrees and windows from `<current-state>`
3. Match them by path
4. Format list view
</process>

<expected_output>
📋 Worktree List

Repository: vibe-check
Tmux Session: vibe-check (exists)

WORKTREES (6 total):

1. main
   Path: /Users/abuusama/repos/worktrees/vibe-check/main
   Tmux: 1:zsh ✓ synced

2. spike/hook-capture
   Path: /Users/abuusama/repos/worktrees/vibe-check/hook-capture
   Tmux: 2:spike/hook-capture ✓ synced

[... etc ...]

Summary: 6 worktrees, 6 tmux windows
</expected_output>
</example>

## Example 3: Create Command (Executes Script)

<input>/wt create feature/auth</input>

<process>
Execute directly:
```bash
cd "$(git rev-parse --show-toplevel)" && bun scripts/wt.ts create feature/auth
```
</process>

<expected_output>
✓ Created worktree: /Users/abuusama/repos/worktrees/vibe-check/auth
✓ Created tmux window: vibe-check:7 (feature/auth)
✓ Switched to new window
</expected_output>
</example>

## Example 4: Open Command (Executes Script)

<input>/wt open hook</input>

<process>
Execute directly:
```bash
cd "$(git rev-parse --show-toplevel)" && bun scripts/wt.ts open hook
```
</process>

<expected_output>
✓ Switched to window: vibe-check:2 (spike/hook-capture)
</expected_output>
</example>

## Example 5: Cleanup Command (Executes Script)

<input>/wt cleanup -y</input>

<process>
Execute directly:
```bash
cd "$(git rev-parse --show-toplevel)" && bun scripts/wt.ts cleanup -y
```
</process>

<expected_output>
🧹 Cleanup Report:
Stale Worktrees: 0 removed
Orphaned Windows: 0 closed
Missing Windows: 2 created
Path Issues: 0 detected
✓ Cleanup complete
</expected_output>
</example>
</examples>

<error-handling>
**If script fails:**
- Display error output directly
- Show exit code
- Suggest common fixes

**Common errors:**
- Not in git repo → Script handles this
- Tmux not installed → Script handles this
- Permission denied → Script handles this

All error messages come from the TypeScript script - don't duplicate error handling.
</error-handling>

## Implementation Notes

**For the AI executing this command:**
1. Make ONE bash call at start to get state
2. Reuse that data for status/list commands
3. Only call script again for mutating operations
4. Display script output verbatim (don't interpret or summarize)
5. Preserve all formatting, emojis, and colors from script output
