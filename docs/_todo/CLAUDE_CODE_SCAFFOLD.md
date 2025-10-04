# Claude Code Scaffold

Complete documentation for the Claude Code scaffolding system including templates, commands, tasks, and specialized agents.

## Table of Contents

- [Overview](#overview)
- [Templates System](#templates-system)
- [Slash Commands](#slash-commands)
- [Task Management](#task-management)
- [Specialized Agents](#specialized-agents)
- [Extending the Scaffold](#extending-the-scaffold)

## Overview

The Claude Code Scaffold is a comprehensive automation system that transforms your repository into an AI-assisted development environment. It consists of four main components:

1. **Templates** - Reusable task templates for different complexity levels
2. **Commands** - Slash commands for common development workflows
3. **Tasks** - Structured task files that guide implementation
4. **Agents** - Specialized reviewers for different aspects of code quality

All components are stored in `~/.claude/` (global) or `.claude/` (project-specific) directories.

## Templates System

Templates provide consistent structure for different types of tasks. Located in `~/.claude/templates/`.

### Available Templates

#### 1. Task Template (Simple)

**File:** `task-template-simple.md`

**Use for:**
- Straightforward tasks (1-3 files)
- No complex architecture changes
- Clear, single-purpose implementation
- Minimal testing requirements

**Sections:**
- Task title and context
- Current state
- Requirements
- Acceptance criteria
- Implementation checklist
- Success verification
- Final notes

**Example tasks:**
- "Add loading spinner to button"
- "Fix typo in error message"
- "Update dependency version"

#### 2. Task Template (Standard)

**File:** `task-template-standard.md`

**Use for:**
- Multiple components (3-8 files)
- Requires testing (unit + integration)
- Has clear acceptance criteria
- Moderate complexity

**Sections:**
- All simple template sections, plus:
- Files structure
- Implementation requirements
- Testing requirements
- Code quality standards
- Common pitfalls
- Resources and references

**Example tasks:**
- "Implement user authentication flow"
- "Add search functionality to dashboard"
- "Refactor API client with error handling"

#### 3. Task Template (Complex)

**File:** `task-template-complex.md`

**Use for:**
- Multi-system/module changes
- Architectural planning required
- Extensive testing needed
- Phased implementation
- Multiple technical approaches

**Sections:**
- All standard template sections, plus:
- Current architecture (detailed)
- Critical requirements
- Technical approach
- Detailed implementation phases
- Unit/Integration/Manual tests
- TypeScript guidelines
- Questions and clarifications
- Implementation plan with phases

**Example tasks:**
- "Migrate from REST to GraphQL"
- "Implement cross-platform screenshot adapter"
- "Build component testing framework"

### Template Variables

All templates support variable substitution:

| Variable | Description | Example |
|----------|-------------|---------|
| `{{TASK_TITLE}}` | Task name | "Add Dark Mode Toggle" |
| `{{CONTEXT}}` | Background/purpose | "Users need theme switching..." |
| `{{CURRENT_STATE}}` | Existing architecture | "No theming system exists" |
| `{{REQUIREMENTS}}` | What needs to be done | "1. Create context, 2. Add toggle..." |
| `{{ACCEPTANCE_CRITERIA}}` | Success criteria | "- [ ] Theme persists across reloads" |
| `{{IMPLEMENTATION_CHECKLIST}}` | Step-by-step tasks | "- [ ] Create ThemeContext" |
| `{{SUCCESS_VERIFICATION}}` | How to verify completion | "Run tests, check localStorage" |

**Complex template adds:**
- `{{ARCHITECTURE_COMPONENT_*}}` - Architecture sections
- `{{TECHNICAL_SECTION_*}}` - Technical details
- `{{PHASE_*_NAME}}`, `{{PHASE_*_TASKS}}` - Implementation phases
- `{{ESTIMATED_TIME}}` - Time estimate

## Slash Commands

Powerful automation commands for common development tasks. Located in `~/.claude/commands/`.

### `/prd` - Smart PRD Generation

**Location:** `~/.claude/commands/prd.md`

Generate Product Requirements Documents adapted to task complexity.

#### Usage

```bash
# Basic usage
/prd Add dark mode toggle

# From GitHub issue
/prd --issue 42

# Auto mode (non-interactive)
/prd Implement authentication --auto

# With issue creation
/prd Add real-time notifications --issue
```

#### Complexity Tiers

The `/prd` command automatically assesses complexity and generates appropriate documentation:

**Tier 1 (Simple)** - 200-400 lines
- Single component/utility
- No external dependencies
- Isolated change
- Sections: Executive Summary, Implementation, Success Criteria

**Tier 2 (Moderate)** - 400-800 lines
- Multiple files (2-5)
- Some dependencies affected
- Minor refactor/feature
- Sections: Core + conditional (architecture, migration, risks)

**Tier 3 (Complex)** - 800-1500+ lines
- Architecture change
- System-wide migration
- Breaking changes
- Sections: ALL 21 sections with full details

#### Interactive vs Non-Interactive Mode

**Interactive Mode** (default):
1. Presents complexity assessment
2. Waits for user approval
3. Shows generated PRD summary
4. Asks for confirmation before saving

**Non-Interactive Mode** (`--auto` flag):
1. Auto-proceeds with assessment
2. Generates immediately
3. Saves without confirmation
4. Perfect for CI/CD

#### Configuration

```yaml
---
description: Generate smart PRD adapted to task complexity
argument-hint: <topic-description> [--issue] [--auto]
allowed-tools: Read, Write, Glob, Grep, Bash, Task, WebFetch, WebSearch
model: claude-sonnet-4-5-20250929
thinking:
  enabled: true
  budget: tokens
---
```

### `/create-task` - Task Creation

**Location:** `~/.claude/commands/create-task.md`

Create structured task files from various input sources.

#### Usage

```bash
# From GitHub issue
/create-task --issue 42
/create-task --issue https://github.com/owner/repo/issues/42

# From specification file
/create-task --file docs/feature-spec.md

# From text input
/create-task --text "Implement dark mode toggle with persistence"

# Interactive mode
/create-task
```

#### Input Methods

**1. GitHub Issue**
- Fetches issue data via `gh` CLI
- Parses body for requirements, context, acceptance criteria
- Maps labels to complexity level
- Example: `bug` + simple → simple template

**2. File Input**
- Reads markdown/text file
- Parses sections and frontmatter
- Maps to template structure intelligently
- Auto-detects complexity from content

**3. Text Input**
- Creates minimal task with provided text as title
- Prompts for additional details
- Uses simple template

**4. Interactive Mode**
- Prompts for: title, complexity, context, requirements
- Generates task file with provided information

#### Auto-Complexity Detection

Heuristics used:

1. **File length:**
   - < 50 lines → simple
   - 50-200 lines → standard
   - \> 200 lines → complex

2. **Section count:**
   - < 5 sections → simple
   - 5-10 sections → standard
   - \> 10 sections → complex

3. **Keywords:**
   - "architecture", "migration", "framework" → complex
   - "refactor", "testing", "integration" → standard
   - "fix", "add", "update" → simple

#### Output

```bash
✅ Task created: .claude/tasks/implement-dark-mode-toggle.md
   Complexity: standard
   Template: task-template-standard.md

Summary:
- Title: Implement Dark Mode Toggle
- Sections: 8
- Estimated time: TBD
```

### `/review-pr` - Pull Request Review

**Location:** `~/.claude/commands/review-pr.md`

Comprehensive PR review with specialized focus areas.

#### Usage

```bash
# Review specific PR
/review-pr 42

# Review with focus
/review-pr 42 --focus security
```

#### Review Areas

- Code quality and best practices
- Security vulnerabilities
- Performance optimization
- Test coverage
- Documentation accuracy

### `/tdd-component` - TDD Component Generation

**Location:** `~/.claude/commands/tdd-component.md`

Generate React components using Test-Driven Development.

#### Usage

```bash
# Generate with TDD
/tdd-component Button

# Continue iteration
/tdd-component Button continue
```

#### Process

1. Generates test file first
2. Implements component to pass tests
3. Iterates until all tests pass
4. Refactors for quality

### `/commit-and-pr` - Git Workflow

**Location:** `~/.claude/commands/commit-and-pr.md`

Automated commit and PR creation.

#### Usage

```bash
# Create commit and PR
/commit-and-pr "Add authentication system"
```

## Task Management

Tasks guide implementation with structured, detailed specifications.

### Task Location

**Project-specific:** `.claude/tasks/`
**Global:** `~/.claude/tasks/`

### Task File Structure

```markdown
# Task: {Title}

## Context
{Background and purpose}

## Current State
{What exists now}

## Requirements
{What needs to be built}

## Acceptance Criteria
### Must Have ✅
- [ ] Criterion 1
- [ ] Criterion 2

## Implementation Checklist
- [ ] Step 1
- [ ] Step 2

## Success Verification
After implementation, verify:
1. Verification step 1
2. Verification step 2
```

### Creating Tasks

**Method 1: Using `/create-task` command**

```bash
/create-task --file docs/spec.md
```

**Method 2: From PRD**

PRD implementation workflow automatically creates tasks.

**Method 3: Manual Creation**

1. Copy appropriate template
2. Replace variables
3. Save to `.claude/tasks/{kebab-case-name}.md`

### Task Examples

**Simple Task:**
```markdown
# Task: Add Loading State to Submit Button

## Context
Submit button needs visual feedback during form submission.

## Requirements
1. Add loading spinner
2. Disable button during submission
3. Re-enable after completion

## Acceptance Criteria
- [ ] Button shows loading state
- [ ] Button is disabled during loading
- [ ] Works on success and error
```

**Standard Task:**
```markdown
# Task: Implement Dark Mode Toggle

## Context
Users need ability to switch between light and dark themes.

## Files Structure
src/contexts/ThemeContext.tsx
src/components/DarkModeToggle.tsx
src/hooks/useTheme.ts

## Requirements
1. Create ThemeContext
2. Implement toggle component
3. Persist to localStorage
...
```

## Specialized Agents

Automated code reviewers that focus on specific quality aspects. Located in `.claude/agents/`.

### Available Agents

#### 1. Security Code Reviewer

**File:** `.claude/agents/security-code-reviewer.md`

**Reviews:**
- Security vulnerabilities
- Input validation issues
- Authentication/authorization flaws
- SQL injection risks
- XSS vulnerabilities
- Insecure dependencies

**When to use:**
- After implementing authentication
- When handling user input
- After API endpoint creation
- When integrating third-party libraries

#### 2. Test Coverage Reviewer

**File:** `.claude/agents/test-coverage-reviewer.md`

**Reviews:**
- Test coverage adequacy
- Missing test cases
- Edge condition coverage
- Test quality
- Integration test completeness

**When to use:**
- After writing new features
- When refactoring code
- After completing a module
- Before releasing

#### 3. Code Quality Reviewer

**File:** `.claude/agents/code-quality-reviewer.md`

**Reviews:**
- Code maintainability
- Best practices adherence
- Error handling
- Code smells
- Complexity metrics
- SOLID principles

**When to use:**
- After implementing features
- When refactoring
- Before committing changes
- During code reviews

#### 4. Performance Reviewer

**File:** `.claude/agents/performance-reviewer.md`

**Reviews:**
- Performance bottlenecks
- Resource efficiency
- Database query optimization
- Memory leaks
- Render performance
- Bundle size

**When to use:**
- After database queries
- When optimizing features
- After data processing logic
- When investigating slowness

#### 5. Documentation Accuracy Reviewer

**File:** `.claude/agents/documentation-accuracy-reviewer.md`

**Reviews:**
- Documentation completeness
- API documentation accuracy
- README updates
- Code comment quality
- Examples validity

**When to use:**
- After implementing features
- When modifying APIs
- After code completion
- Before release

### Using Agents

Agents are automatically invoked by Claude Code workflows or can be called manually:

```bash
# Via workflow (automatic)
# Triggers on PR creation

# Manual invocation
/review --agent security
/review --agent test-coverage
/review --agent code-quality
```

### Agent Configuration

Agents use frontmatter configuration:

```yaml
---
name: Security Code Reviewer
trigger: proactive  # Auto-runs after security-sensitive code
tools: Glob, Grep, Read, WebFetch, WebSearch
---
```

## Extending the Scaffold

### Adding Custom Templates

1. Create template file in `~/.claude/templates/`:

```markdown
# Task: {{TASK_TITLE}}

## Your Custom Section
{{CUSTOM_VARIABLE}}

## Another Section
{{ANOTHER_VARIABLE}}
```

2. Reference in commands:

```typescript
const template = await readTemplate('~/.claude/templates/custom-template.md');
const filled = fillTemplate(template, {
  TASK_TITLE: 'My Task',
  CUSTOM_VARIABLE: 'Custom content',
});
```

### Creating Custom Commands

1. Create command file in `~/.claude/commands/{name}.md`:

```markdown
---
description: Your command description
argument-hint: <required-arg> [optional-arg]
allowed-tools: Read, Write, Bash
model: claude-sonnet-4-5-20250929
---

# Command Implementation

Your command logic here using Claude Code syntax.

## Process

1. Parse arguments from $1
2. Execute logic
3. Return results
```

2. Use the command:

```bash
/your-command arg1 arg2
```

### Creating Custom Agents

1. Create agent file in `.claude/agents/{name}.md`:

```markdown
---
name: My Custom Reviewer
description: Reviews XYZ aspects
trigger: manual  # or 'proactive'
tools: Read, Grep, WebFetch
---

# Review Focus

Your agent should review:
- Aspect 1
- Aspect 2
- Aspect 3

## Process

1. Search for patterns
2. Analyze code
3. Provide feedback

## Output Format

Provide findings as:
- ✅ Passed checks
- ⚠️ Warnings
- ❌ Issues found
```

2. Invoke manually:

```bash
/review --agent my-custom-reviewer
```

### Best Practices

1. **Templates**
   - Keep variable names descriptive
   - Use consistent formatting
   - Provide examples in comments
   - Test with different inputs

2. **Commands**
   - Document all arguments
   - Provide usage examples
   - Handle errors gracefully
   - Return structured output

3. **Agents**
   - Be specific about focus area
   - Provide actionable feedback
   - Use consistent output format
   - Include fix suggestions

4. **Tasks**
   - Start simple, add complexity as needed
   - Include clear acceptance criteria
   - Break down into manageable steps
   - Link to relevant documentation

## Directory Structure

Complete scaffold organization:

```
~/.claude/                          # Global Claude Code settings
├── templates/
│   ├── task-template-simple.md
│   ├── task-template-standard.md
│   └── task-template-complex.md
├── commands/
│   ├── prd.md
│   ├── create-task.md
│   ├── review-pr.md
│   ├── tdd-component.md
│   └── commit-and-pr.md
└── memory/
    └── {context-files}

.claude/                            # Project-specific settings
├── tasks/
│   ├── implement-feature-x.md
│   └── fix-bug-y.md
├── agents/
│   ├── security-code-reviewer.md
│   ├── test-coverage-reviewer.md
│   ├── code-quality-reviewer.md
│   ├── performance-reviewer.md
│   └── documentation-accuracy-reviewer.md
└── CLAUDE.md                       # Project instructions
```

## Integration with GitHub Workflows

The scaffold integrates seamlessly with GitHub workflows:

### PRD → Task Flow

1. Create PRD using `/prd` command
2. PRD saved with `prd:draft` label
3. Review and change to `prd:ready`
4. Comment `@claude implement`
5. Workflow creates task and implements

### Task → Implementation Flow

1. Task created in `.claude/tasks/`
2. Claude Code reads task file
3. Follows implementation checklist
4. Validates against acceptance criteria
5. Creates PR when complete

### Review Flow

1. PR created
2. Agents automatically review
3. Findings posted as comments
4. Developer addresses issues
5. Re-review on update

## Configuration Files

### CLAUDE.md

Project-level instructions for Claude Code. Located at `.claude/CLAUDE.md`.

**Purpose:**
- Define code style and conventions
- Specify architecture patterns
- List dependencies and constraints
- Provide project-specific guidance

**Example sections:**
```markdown
# Project Context
{Project overview}

## Key Principles
- Principle 1
- Principle 2

## Rules
{Code quality rules}

## Common Tasks
{Frequently performed tasks}
```

### Command Frontmatter

Commands use YAML frontmatter for configuration:

```yaml
---
description: Command description shown in help
argument-hint: <required> [optional]
allowed-tools: Read, Write, Bash(git:*)
model: claude-sonnet-4-5-20250929
thinking:
  enabled: true
  budget: tokens
---
```

## Tips and Tricks

### Template Tips

1. **Use Conditional Sections**
   ```markdown
   {{#if SECTION_ENABLED}}
   ## Optional Section
   {{/if}}
   ```

2. **Nested Variables**
   ```markdown
   {{SECTION_{{LEVEL}}_CONTENT}}
   ```

3. **Default Values**
   ```markdown
   {{VARIABLE:default value}}
   ```

### Command Tips

1. **Argument Parsing**
   ```bash
   # Access arguments
   $1  # First argument
   $2  # Second argument
   $@  # All arguments
   ```

2. **Tool Usage**
   ```markdown
   Use Read tool to access files
   Use Bash(gh:*) for GitHub operations
   Use WebFetch for external data
   ```

3. **Error Handling**
   ```markdown
   If condition fails:
   - Report error clearly
   - Suggest fix
   - Exit gracefully
   ```

### Agent Tips

1. **Focus Narrow**
   - Review one aspect thoroughly
   - Don't overlap with other agents
   - Provide specific, actionable feedback

2. **Use Examples**
   - Show good vs bad patterns
   - Include code snippets
   - Reference documentation

3. **Severity Levels**
   ```markdown
   🔴 Critical: Security vulnerability
   🟡 Warning: Performance issue
   🔵 Info: Suggestion for improvement
   ```

## Troubleshooting

### Template Not Found

```bash
# Check template exists
ls ~/.claude/templates/

# Verify path in command
cat ~/.claude/commands/create-task.md | grep template
```

### Command Not Recognized

```bash
# List available commands
ls ~/.claude/commands/

# Verify command name
/help  # Shows all available commands
```

### Agent Not Running

```bash
# Check agent file exists
ls .claude/agents/

# Verify trigger condition
cat .claude/agents/{agent-name}.md | grep trigger
```

### Variables Not Replaced

1. Check variable name spelling
2. Verify template syntax
3. Ensure variable provided in command

## Related Documentation

- [Main README](../README.md) - Project overview
- [GitHub Workflows](./WORKFLOWS.md) - Workflow automation
- [PRD Command Details](./.claude/commands/prd.md) - Full PRD documentation
- [Task Examples](./.claude/tasks/) - Example task files

---

**Ready to automate?** Start with `/create-task` or `/prd` and let the scaffold guide your development!
