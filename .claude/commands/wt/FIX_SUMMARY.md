# /wt Command Fix Summary

## Problem Identified

The `/wt list` command was showing "⚠ incorrect path" or "⚠ no window" for worktrees because:

1. **Nested Path Issue**: Worktrees were created at incorrect nested paths:
   - **Expected**: `/Users/abuusama/repos/worktrees/vibe-check/hook-capture`
   - **Actual**: `/Users/abuusama/repos/worktrees/vibe-check/worktrees/vibe-check/main/spike/hook-capture`

2. **Root Cause**: Manual bash commands used relative paths (`../worktrees/vibe-check/main/$branch`) from within the main worktree, causing path nesting

3. **Tmux Window Mismatch**: Windows were created but pointed to the incorrect nested paths

## Fixes Implemented

### 1. Enhanced LIST Workflow
- Added canonical path resolution and matching
- Added detection of nested `/worktrees/` patterns (indicates incorrect paths)
- Improved status indicators: `✓ synced`, `⚠ no window`, `⚠ incorrect path`, `⚠ orphaned`
- Added suggestion to run `/wt cleanup` when issues detected

### 2. Enhanced CLEANUP Workflow
- Now detects and warns about incorrectly nested worktree paths
- Identifies orphaned/incorrect tmux windows (including nested path detection)
- Auto-offers to create missing tmux windows
- Provides clear guidance on fixing path issues

### 3. Enhanced CREATE Workflow
- Path calculation now based on repo root, not current directory
- Validates paths don't contain nested `/worktrees/` pattern before creation
- Handles branches with slashes (e.g., `spike/hook-capture`) correctly
- Shows clear error if nested path would be created

## Worktrees Fixed

Cleaned up and recreated the following worktrees at correct paths:

| Branch | Correct Path | Status |
|--------|-------------|--------|
| `spike/hook-capture` | `/Users/abuusama/repos/worktrees/vibe-check/hook-capture` | ✓ synced |
| `spike/sdk-integration` | `/Users/abuusama/repos/worktrees/vibe-check/sdk-integration` | ✓ synced |
| `spike/tool-call-correlation` | `/Users/abuusama/repos/worktrees/vibe-check/tool-call-correlation` | ✓ synced |
| `issue/24` | `/Users/abuusama/repos/worktrees/vibe-check/24` | ✓ synced |

## Current State

```
📋 Worktree List

Repository: vibe-check (main)
Tmux Session: main (exists)

WORKTREES (6 total):

1. main
   Path: /Users/abuusama/repos/worktrees/vibe-check/main
   Tmux: 1:main ✓ synced

2. feat/vibetest-implementation-plan
   Path: /Users/abuusama/repos/worktrees/vibe-check/vibetest-implementation
   Tmux: 2:feat/vibetest-implementation-plan ✓ synced

3. spike/hook-capture
   Path: /Users/abuusama/repos/worktrees/vibe-check/hook-capture
   Tmux: 3:spike/hook-capture ✓ synced

4. spike/sdk-integration
   Path: /Users/abuusama/repos/worktrees/vibe-check/sdk-integration
   Tmux: 4:spike/sdk-integration ✓ synced

5. spike/tool-call-correlation
   Path: /Users/abuusama/repos/worktrees/vibe-check/tool-call-correlation
   Tmux: 5:spike/tool-call-correlation ✓ synced

6. issue/24
   Path: /Users/abuusama/repos/worktrees/vibe-check/24
   Tmux: 6:issue/24 ✓ synced

Summary: 6 worktrees, 6 tmux windows - All synced ✓
```

## Prevention

To prevent this issue in the future:

1. **Always use `/wt create <branch>` instead of manual `git worktree add`**
2. The CREATE workflow now validates paths and prevents nested worktrees
3. The CLEANUP workflow now detects and warns about path issues
4. The LIST workflow now clearly shows path problems

## Testing

You can now test the fix by running:

```bash
# List all worktrees and their status
/wt list

# Check for any issues and auto-fix
/wt cleanup

# Create new worktrees safely
/wt create my-feature-branch
```

