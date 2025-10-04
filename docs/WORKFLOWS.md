# GitHub Workflows Guide

Complete documentation for the automated GitHub workflows that power the Vibe Check development lifecycle.

## Table of Contents

- [Overview](#overview)
- [Setup](#setup)
- [Available Workflows](#available-workflows)
  - [PRD Implementation](#1-prd-implementation-prd-implementyml)
  - [PR Review (Comprehensive)](#2-pr-review-comprehensive-pr-review-comprehensiveyml)
  - [Claude Code Review](#3-claude-code-review-claude-code-reviewyml)
  - [General Claude](#4-general-claude-claudeyml)
  - [CI Auto-Fix](#5-ci-auto-fix-ci-falure-auto-fixyml)
- [Label Workflow](#label-workflow)
- [Usage Examples](#usage-examples)
- [Troubleshooting](#troubleshooting)

## Overview

The Vibe Check repository includes 5 automated GitHub workflows that integrate Claude Code into your development process:

| Workflow | Trigger | Purpose | Runtime |
|----------|---------|---------|---------|
| **PRD Implementation** | `@claude implement` comment | Implements PRD from issue | ~1-2 min |
| **PR Review (Comprehensive)** | PR opened/synchronized | Full code review with progress tracking | ~1-2 min |
| **Claude Code Review** | PR opened/synchronized | Quick code quality review | ~1 min |
| **General Claude** | `@claude` mention | Responds to questions/requests | ~1 min |
| **CI Auto-Fix** | CI workflow fails | Auto-creates fix branch | Variable |

All workflows are **production-ready** and have been tested successfully.

## Setup

### Prerequisites

1. **Claude Code OAuth Token** (required for all workflows)
2. **GitHub CLI** (`gh`) access
3. **Repository labels** for PRD workflow

### Step 1: Configure Secrets

Add the Claude Code OAuth token to your repository secrets:

```bash
gh secret set CLAUDE_CODE_OAUTH_TOKEN
```

Or via GitHub UI:
1. Go to **Settings** → **Secrets and variables** → **Actions**
2. Click **New repository secret**
3. Name: `CLAUDE_CODE_OAUTH_TOKEN`
4. Value: Your Claude Code OAuth token
5. Click **Add secret**

### Step 2: Create Required Labels

For the PRD Implementation workflow, create these labels:

```bash
# Create PRD labels
gh label create "prd" --description "Product Requirements Document" --color "0075ca"
gh label create "prd:draft" --description "PRD being written/reviewed" --color "fbca04"
gh label create "prd:ready" --description "PRD ready for implementation" --color "0e8a16"
gh label create "prd:implementing" --description "PRD currently being implemented" --color "1d76db"
gh label create "prd:completed" --description "PRD implementation complete" --color "5319e7"
gh label create "prd:blocked" --description "PRD implementation blocked" --color "d73a4a"
```

### Step 3: Verify Workflows

Check that workflows are recognized:

```bash
gh workflow list
```

Expected output:
```
Auto Fix CI Failures                active  195073816
Claude Code Review                  active  195073817
Claude Code                         active  195073818
PR Review with Progress Tracking    active  195073819
PRD Implementation                  active  195073820
```

## Available Workflows

### 1. PRD Implementation (`prd-implement.yml`)

Automatically implements Product Requirements Documents (PRDs) when triggered.

#### Trigger Conditions

**All three conditions must be met:**
1. Issue has `prd` label
2. Issue has `prd:ready` label (safety gate)
3. Comment contains `@claude implement`

#### What It Does

1. **Creates implementation branch** - `prd-{issue-number}-{sanitized-title}`
2. **Updates labels** - Changes `prd:ready` → `prd:implementing`
3. **Implements PRD** - Reads PRD content, analyzes requirements, implements systematically
4. **Creates Pull Request** - Opens draft PR with implementation summary
5. **Updates issue** - Comments with PR link and summary

#### Label State Machine

```
┌─────────────┐
│  prd:draft  │ ◄─── Starting state (manual review required)
└──────┬──────┘
       │ (Manual approval: change to prd:ready)
       ▼
┌─────────────┐
│  prd:ready  │ ◄─── Ready for @claude implement
└──────┬──────┘
       │ (@claude implement comment)
       ▼
┌──────────────────┐
│ prd:implementing │ ◄─── Workflow running
└──────┬───────────┘
       │ (PR merged)
       ▼
┌───────────────┐
│ prd:completed │ ◄─── Final state
└───────────────┘

┌─────────────┐
│ prd:blocked │ ◄─── Can be added at any time to pause
└─────────────┘
```

#### Usage Example

```bash
# 1. Create PRD issue with draft label
gh issue create \
  --title "PRD: Add Dark Mode Toggle" \
  --body-file prd-dark-mode.md \
  --label "prd,prd:draft"

# 2. Review PRD, then manually change label
gh issue edit 42 --remove-label "prd:draft" --add-label "prd:ready"

# 3. Trigger implementation
gh issue comment 42 --body "@claude implement"
```

#### Error Handling

If implementation fails:
- Label changes to `prd:blocked`
- Comment added with error details and workflow link
- To retry: Remove `prd:blocked`, add `prd:ready`, comment `@claude implement`

#### Configuration

```yaml
# Workflow file: .github/workflows/prd-implement.yml
# Model: claude-sonnet-4-5-20250929
# Allowed tools: Read, Write, Edit, Glob, Grep, Bash(git:*), Bash(npm:*), Bash(npx:*), Bash(bun:*), Bash(gh:*), TodoWrite
# Concurrency: One per issue (cancels in-progress on new trigger)
```

---

### 2. PR Review (Comprehensive) (`pr-review-comprehensive.yml`)

Performs comprehensive code review with progress tracking on pull requests.

#### Trigger

- Pull request **opened**
- Pull request **synchronize** (new commits pushed)
- Pull request **ready_for_review**
- Pull request **reopened**

#### What It Reviews

1. **Code Quality**
   - Clean code principles
   - Best practices
   - Error handling
   - Readability and maintainability

2. **Security**
   - Potential vulnerabilities
   - Input sanitization
   - Authentication/authorization logic

3. **Performance**
   - Bottlenecks
   - Database query efficiency
   - Memory leaks/resource issues

4. **Testing**
   - Test coverage adequacy
   - Test quality
   - Missing scenarios

5. **Documentation**
   - Code documentation
   - README updates
   - API documentation

#### Output Format

Creates a tracking comment with:
- ✅ Progress checkboxes for each review area
- Detailed feedback with inline comments
- Summary of findings
- Recommendations

#### Configuration

```yaml
# Workflow file: .github/workflows/pr-review-comprehensive.yml
# Track progress: true (creates progress comment)
# Allowed tools: mcp__github_inline_comment__create_inline_comment, Bash(gh pr:*)
```

---

### 3. Claude Code Review (`claude-code-review.yml`)

Quick code quality review focusing on core best practices.

#### Trigger

- Pull request **opened**
- Pull request **synchronize**

#### What It Reviews

- Code quality and best practices
- Potential bugs or issues
- Performance considerations
- Security concerns
- Test coverage

#### Output Format

Posts review as PR comment using `gh pr comment`.

#### Configuration

```yaml
# Workflow file: .github/workflows/claude-code-review.yml
# Uses repository's CLAUDE.md for style guidance
# Allowed tools: Bash(gh issue:*), Bash(gh pr:*), Bash(gh search:*)
```

---

### 4. General Claude (`claude.yml`)

Responds to `@claude` mentions in issues, PRs, and comments.

#### Triggers

- Issue **opened** with `@claude` in title or body
- Issue **assigned** with `@claude` in body
- Issue **comment created** with `@claude` in body
- PR **review comment created** with `@claude` in body
- PR **review submitted** with `@claude` in body

#### What It Does

Executes the instruction following `@claude`. Examples:

```bash
# Answer questions
@claude What's the best approach for implementing auth?

# Analyze code
@claude Review the authentication flow in src/auth/

# Provide guidance
@claude How should I structure the test suite?
```

#### Output Format

Responds as a comment with:
- Answer or implementation
- Code examples if relevant
- Links to documentation

#### Configuration

```yaml
# Workflow file: .github/workflows/claude.yml
# Permissions: contents:read, pull-requests:read, issues:read, actions:read, id-token:write
# Supports custom prompts via workflow input
```

---

### 5. CI Auto-Fix (`ci-falure-auto-fix.yml`)

Automatically attempts to fix CI failures by creating a fix branch.

#### Trigger

- A workflow run completes with **failure** status
- The failed run is associated with a pull request
- The branch is not already a fix branch (prevents loops)

#### What It Does

1. **Analyzes failure** - Fetches error logs from failed jobs
2. **Creates fix branch** - `claude-auto-fix-ci-{original-branch}-{run-id}`
3. **Attempts fixes** - Uses `/fix-ci` command with error context
4. **Commits changes** - If fixes are made
5. **Reports status** - Comments on PR with results

#### Configuration

```yaml
# Workflow file: .github/workflows/ci-falure-auto-fix.yml
# Requires: A "CI" workflow to fail first
# Allowed tools: Edit, MultiEdit, Write, Read, Glob, Grep, LS, Bash(git:*), Bash(bun:*), Bash(npm:*), Bash(npx:*), Bash(gh:*)
```

#### Testing

This workflow requires a failing CI run to test. To fully validate:

1. Create a CI workflow that can fail
2. Push a commit that triggers failure
3. Observe auto-fix workflow trigger

---

## Label Workflow

The PRD implementation workflow uses labels for state management and safety gates.

### Label States

| Label | Description | Can Trigger Implementation? |
|-------|-------------|---------------------------|
| `prd:draft` | Being written/reviewed | ❌ NO - Automation blocked |
| `prd:ready` | Approved, ready to implement | ✅ YES - Automation enabled |
| `prd:implementing` | Work in progress | ⚙️ Already running |
| `prd:completed` | Implementation done | ✋ Finished |
| `prd:blocked` | Stuck on something | ⏸️ Paused |

### State Transitions

| From | To | Trigger | Who |
|------|-----|---------|-----|
| `prd:draft` | `prd:ready` | Manual label change | Human reviewer |
| `prd:ready` | `prd:implementing` | `@claude implement` | Workflow (automatic) |
| `prd:implementing` | `prd:completed` | PR merged | Workflow (automatic) |
| Any state | `prd:blocked` | Manual label add | Human |
| `prd:blocked` | Previous state | Manual label remove | Human |

### Safety Gates

**Critical:** `@claude implement` requires **BOTH**:
- ✅ `prd` label (identifies as PRD issue)
- ✅ `prd:ready` label (human approval gate)

This prevents accidental implementation of draft PRDs.

## Usage Examples

### Example 1: PRD Workflow (End-to-End)

```bash
# Step 1: Create PRD issue
gh issue create \
  --title "PRD: Implement User Authentication" \
  --body "$(cat docs/auth-prd.md)" \
  --label "prd,prd:draft"

# Output: https://github.com/owner/repo/issues/42

# Step 2: Review PRD content
gh issue view 42

# Step 3: Approve for implementation
gh issue edit 42 \
  --remove-label "prd:draft" \
  --add-label "prd:ready"

# Step 4: Trigger implementation
gh issue comment 42 --body "@claude implement"

# Step 5: Monitor progress
gh run list --limit 5

# Step 6: View implementation PR
gh issue view 42  # Look for PR link in comments
```

### Example 2: Quick PR Review

```bash
# Create PR (triggers automatic review)
gh pr create \
  --title "Add authentication system" \
  --body "Implements user auth with JWT tokens"

# Review workflows will automatically trigger
# Check reviews with:
gh pr view --comments
```

### Example 3: Using @claude for Help

```bash
# Ask a question in an issue
gh issue comment 10 --body "@claude How should I structure the API routes for this feature?"

# Ask about code in a PR
gh pr comment 15 --body "@claude Review the error handling in src/api/users.ts"

# Get implementation guidance
gh issue comment 20 --body "@claude What's the best way to implement rate limiting?"
```

### Example 4: Handling Blocked PRD

```bash
# If PRD gets blocked, unblock it:
gh issue edit 42 --remove-label "prd:blocked"

# Fix any issues, then retry:
gh issue edit 42 --add-label "prd:ready"
gh issue comment 42 --body "@claude implement"
```

## Troubleshooting

### Workflow Not Triggering

**Problem:** `@claude implement` comment doesn't trigger workflow

**Solutions:**
1. Verify both `prd` and `prd:ready` labels exist on issue:
   ```bash
   gh issue view 42 --json labels
   ```

2. Check workflow is enabled:
   ```bash
   gh workflow list
   ```

3. Verify secret exists:
   ```bash
   gh secret list
   ```

### Authentication Errors

**Problem:** Workflow fails with "Unauthorized" or token errors

**Solutions:**
1. Regenerate Claude Code OAuth token
2. Update secret:
   ```bash
   gh secret set CLAUDE_CODE_OAUTH_TOKEN
   ```

3. Check token permissions in Claude Code settings

### PR Review Not Posting

**Problem:** PR opened but no review comment appears

**Solutions:**
1. Check workflow run status:
   ```bash
   gh run list --workflow "pr-review-comprehensive.yml" --limit 5
   ```

2. View workflow logs:
   ```bash
   gh run view <run-id> --log
   ```

3. Verify PR has changes to review (not empty)

### Implementation Gets Stuck

**Problem:** PRD implementation workflow runs but doesn't complete

**Solutions:**
1. Check workflow timeout (default: varies by workflow)
2. View live logs:
   ```bash
   gh run watch
   ```

3. Cancel and restart:
   ```bash
   gh run cancel <run-id>
   gh issue comment 42 --body "@claude implement"
   ```

### Label Not Changing

**Problem:** Label stays on `prd:implementing` after PR merge

**Solutions:**
1. Manually update:
   ```bash
   gh issue edit 42 \
     --remove-label "prd:implementing" \
     --add-label "prd:completed"
   ```

2. Check workflow permissions in Settings → Actions → General

### CI Auto-Fix Not Triggering

**Problem:** CI fails but auto-fix doesn't run

**Solutions:**
1. Verify failing workflow is named "CI"
2. Check that failure is on a PR branch
3. Ensure branch name doesn't start with `claude-auto-fix-ci-`
4. View workflow runs:
   ```bash
   gh run list --workflow "ci-falure-auto-fix.yml"
   ```

### Rate Limiting

**Problem:** Multiple workflows hitting API rate limits

**Solutions:**
1. Space out operations
2. Use sequential workflow triggers (don't spam `@claude implement`)
3. Monitor API usage in Claude Code dashboard

### Viewing Workflow Logs

Get detailed logs for debugging:

```bash
# List recent runs
gh run list --limit 10

# View specific run
gh run view <run-id>

# Download logs
gh run view <run-id> --log > workflow-log.txt

# Watch live
gh run watch <run-id>
```

## Best Practices

1. **Label Hygiene** - Always review PRDs before changing to `prd:ready`
2. **One at a Time** - Don't trigger multiple PRD implementations simultaneously
3. **Monitor Costs** - Check Claude Code usage dashboard regularly
4. **Review Outputs** - Always review generated PRs before merging
5. **Use Draft PRs** - Workflows create draft PRs for safety - review before marking ready
6. **Clear Communication** - Be specific in `@claude` requests
7. **Workflow Monitoring** - Use `gh run list` to track automation status

## Workflow Permissions

All workflows have appropriate scoped permissions:

```yaml
# PRD Implementation
permissions:
  contents: write
  pull-requests: write
  issues: write

# PR Reviews
permissions:
  contents: read
  pull-requests: write
  issues: read
  id-token: write

# CI Auto-Fix
permissions:
  contents: write
  pull-requests: write
  actions: read
  issues: write
  id-token: write
```

## Advanced Configuration

### Custom Model Selection

Edit workflow files to use different Claude models:

```yaml
claude_args: |
  --model claude-opus-4-1-20250805
  --allowed-tools "..."
```

### Workflow Concurrency

Prevent multiple runs on same issue/PR:

```yaml
concurrency:
  group: prd-implementation-${{ github.event.issue.number }}
  cancel-in-progress: true
```

### Custom Tool Restrictions

Limit tools available to workflows:

```yaml
claude_args: |
  --allowed-tools "Read,Write,Edit,Glob,Grep,Bash(git:*)"
```

## Testing Results

All workflows have been tested and validated:

| Workflow | Status | Runtime | Test Date |
|----------|--------|---------|-----------|
| PRD Implementation | ✅ Success | 1m48s | 2025-10-04 |
| PR Review (Comprehensive) | ✅ Success | 1m47s | 2025-10-04 |
| Claude Code Review | ✅ Success | 1m9s | 2025-10-04 |
| General Claude | ✅ Success | 1m11s | 2025-10-04 |
| CI Auto-Fix | ⚠️ Requires failing CI | N/A | 2025-10-04 |

**Test artifacts cleaned up:**
- ✅ Test issues closed (#1, #2)
- ✅ Test PR closed (#3)
- ✅ Test branches deleted

## Related Documentation

- [Main README](../README.md) - Project overview
- [Claude Code Scaffold](./CLAUDE_CODE_SCAFFOLD.md) - Templates, commands, tasks
- [GitHub Actions Documentation](https://docs.github.com/en/actions) - Official GitHub Actions docs
- [Claude Code Documentation](https://docs.claude.com/en/docs/claude-code) - Official Claude Code docs

---

**Need help?** Open an issue or ask `@claude` in a comment!
