# Claude Code Integration

> Complete Claude Code scaffold with templates, workflows, and specialized agents

[Home](../) > Claude Code Integration

Vibe Check includes a production-ready Claude Code scaffold that transforms your repository into an AI-assisted development environment.

---

## What's Included

### [Scaffold System](./scaffold.md)
Templates, slash commands, and task management for structured development.

**Components:**
- **Templates** - Reusable task templates (simple/standard/complex)
- **Commands** - Slash commands (`/prd`, `/review-pr`, `/tdd-component`)
- **Tasks** - Structured task files that guide implementation
- **Agents** - Specialized reviewers for different quality aspects

---

### [GitHub Workflows](./workflows.md)
Automated workflows that integrate Claude Code into your development process.

**Available workflows:**
- **PRD Implementation** - `@claude implement` triggers PRD execution
- **PR Review** - Comprehensive code review with progress tracking
- **Claude Code Review** - Quick quality checks on PRs
- **General Claude** - `@claude` mentions for questions/requests
- **CI Auto-Fix** - Automatic fix branches on CI failures

**All workflows are production-ready and tested.**

---

### [Task Templates](./templates.md)
Structured templates for different task complexities.

**Templates:**
- **Simple** - Straightforward tasks (1-3 files, clear requirements)
- **Standard** - Typical feature work (multiple files, moderate complexity)
- **Complex** - Architecture changes, cross-cutting concerns

**Each template includes:**
- Context and requirements
- Acceptance criteria
- Implementation checklist
- Success verification steps

---

### [Specialized Agents](./agents.md)
Code review agents for different quality aspects.

**Available agents:**
- **Test Coverage Reviewer** - Verify test completeness and coverage
- **Code Quality Reviewer** - Check maintainability and best practices
- **Performance Reviewer** - Analyze bottlenecks and resource efficiency
- **Documentation Reviewer** - Ensure docs are accurate and complete
- **Security Reviewer** - Find vulnerabilities and security issues

**Each agent:**
- Runs automatically or on-demand
- Provides detailed, actionable feedback
- Integrates with PR review workflows

---

## Quick Start

### 1. Copy the Scaffold

The scaffold is already included in this repository:

```
.claude/
├── commands/          # Slash commands
├── templates/         # Task templates
├── scripts/           # Helper scripts
└── docs/             # Documentation
```

### 2. Configure GitHub Workflows

Set up secrets and enable workflows:

```bash
# Add Claude Code OAuth token
gh secret set CLAUDE_CODE_OAUTH_TOKEN

# Enable workflows (they're in .github/workflows/)
git push
```

See [Workflows Guide](./workflows.md) for detailed setup.

### 3. Use the Commands

```bash
# Create a PRD
/prd "Implement OAuth authentication"

# Review a PR
/review-pr

# Build a component with TDD
/tdd-component AuthButton
```

---

## Setup Guide

### Prerequisites

1. **Claude Code OAuth Token** - Required for GitHub workflows
2. **GitHub CLI** (`gh`) - For secret management
3. **Repository labels** - For PRD workflow (auto-created)

### Step-by-Step Setup

1. **Configure Secrets**
   ```bash
   gh secret set CLAUDE_CODE_OAUTH_TOKEN
   ```

2. **Enable Workflows**
   - Workflows are in `.github/workflows/`
   - Push to trigger (or enable manually in GitHub Actions)

3. **Test a Command**
   ```bash
   # In Claude Code CLI
   /prd "Add user authentication"
   ```

4. **Review the Output**
   - Check `.claude/tasks/` for generated tasks
   - Review HTML reports in workflow artifacts

---

## Usage Examples

### Example 1: PRD-Driven Development

```markdown
1. Create issue: "Implement OAuth authentication"
2. Add labels: "feature", "backend"
3. Comment: "@claude implement"
4. Wait for workflow to complete
5. Review PR created by workflow
```

### Example 2: Automated PR Review

```markdown
1. Open PR with code changes
2. Workflow automatically runs
3. Comprehensive review posted as comment
4. Specialized agents check quality, tests, security, docs
5. Review results in PR comments + workflow artifacts
```

### Example 3: TDD Component Development

```bash
# In Claude Code
/tdd-component LoginForm

# Generates:
# - Component skeleton
# - Test file with failing tests
# - Iterative implementation until tests pass
```

---

## Customization

### Add Custom Commands

1. Create command file in `.claude/commands/`
2. Define command in YAML/Markdown format
3. Use in Claude Code with `/your-command`

See [Scaffold Guide](./scaffold.md#custom-commands) for details.

### Configure Specialized Agents

Agents are configured in `.claude/agent-config.yaml`:

```yaml
test-coverage:
  enabled: true
  triggers: [pr_opened, pr_synchronized]
  threshold: 80  # minimum coverage %

security:
  enabled: true
  triggers: [pr_opened]
  severity: [high, critical]
```

See [Agents Guide](./agents.md#configuration) for full options.

---

## Best Practices

### For PRD Workflow
- ✅ Use descriptive issue titles
- ✅ Add relevant labels (feature, bug, etc.)
- ✅ Include acceptance criteria in issue body
- ✅ Review generated PRD before implementation

### For PR Reviews
- ✅ Keep PRs focused (< 400 lines)
- ✅ Wait for all reviewers to complete
- ✅ Address feedback in separate commits
- ✅ Check HTML report for detailed analysis

### For TDD Components
- ✅ Start with clear component requirements
- ✅ Let tests fail first (red phase)
- ✅ Implement minimal code to pass (green phase)
- ✅ Refactor with confidence (tests still pass)

---

## Troubleshooting

### Workflows Not Running

**Problem:** GitHub workflow doesn't trigger

**Solutions:**
1. Check CLAUDE_CODE_OAUTH_TOKEN is set
2. Verify workflow file is in `.github/workflows/`
3. Check branch protection rules
4. Review workflow logs in GitHub Actions

### Commands Not Found

**Problem:** `/command` not recognized in Claude Code

**Solutions:**
1. Check command file exists in `.claude/commands/`
2. Verify YAML/Markdown syntax
3. Restart Claude Code session
4. Check command has `description` field

### Agent Feedback Missing

**Problem:** Specialized agents don't post reviews

**Solutions:**
1. Check agent is enabled in config
2. Verify trigger conditions match (PR opened, etc.)
3. Review workflow logs for errors
4. Check agent has required tools access

---

## Related Documentation

- **[Scaffold System](./scaffold.md)** - Complete scaffold reference
- **[Workflows Guide](./workflows.md)** - GitHub workflow setup and usage
- **[Templates](./templates.md)** - Task template system
- **[Agents](./agents.md)** - Specialized agent configuration

---

[← Back to Documentation Home](../)
