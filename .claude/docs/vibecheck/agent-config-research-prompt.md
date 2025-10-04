# Agent Configuration & Project Source DX Research

## Context

You are designing the developer experience (DX) for `@dao/vibe-check`, a Vitest-based testing framework for Claude Code agents. We're following **documentation-driven development** with a **DX-first philosophy**: design the API developers want, then implement it.

## Current State

We've identified two related problems that need solving together:

### Problem #2: Agent Builder/Extension Pattern
- Developers need to extend agents with custom slash commands and custom agent definitions
- No documented builder pattern exists
- Extensibility story is unclear

### Problem #3: Project/Source Workflow & Worktree Management
- Unclear how agents interact with different project sources (git repos, local files, or no source)
- Automatic worktree management needs design
- Need standardized execution model regardless of source type

## Critical Design Constraints

1. **Decouple prompt from agent config**: The prompt (what to do) should be separate from agent config (how/where to do it)
2. **Vitest-native**: User should NOT need to extend fixtures or tests
3. **Pass agent as config**: User sets up an agent and passes it to `runAgent({ prompt, agent })`
4. **Reusable configs**: Agent configs should be easily reusable across tests
5. **Simple by default**: Common cases must be trivial (temp workspace, default tools)
6. **Advanced when needed**: Full control available for complex scenarios

## Key Files to Review

### Current README (source of truth)
`/Users/abuusama/repos/vibe-check/README.md`
- Shows current `runAgent()` API
- Has `prompt()` builder (newly designed)
- NO agent configuration currently documented

### Implementation Plan
`/Users/abuusama/repos/vibe-check/.claude/docs/vibecheck/implementation-plan.mdx`
- Section 6: Agent runner with `AgentRunner` class
- `RunAgentInput` interface (lines 217-226)
- Currently has `repoPath` param but workflow is vague
- Git worktree utils stubbed in `src/utils/git.ts`

### Code Skeleton
`/Users/abuusama/repos/vibe-check/.claude/docs/vibecheck/code_skel.mdx`
- `AgentRunner` class (lines 421-537)
- `RunAgentInput` type (lines 217-226)
- Fixture-based `runAgent` in vibeTest (lines 312-320)

### Problems Document
`/Users/abuusama/repos/vibe-check/.claude/docs/vibecheck/readme-problems.mdx`
- Problems #2 and #3 (lines 36-72)

## Existing Patterns in README

### Prompt Builder (reference pattern)
```typescript
// Simple text-only
prompt('Refactor this component')

// With options (text goes in options)
prompt({
  text: 'Refactor this file @src/index.ts',
  command: '/refactor',
  attachments: ['design.png']
})
```

**Key insight**: Simple string OR object config. Reusable as const.

### Current runAgent Usage (to be enhanced)
```typescript
const result = await runAgent({
  prompt: prompt('Refactor this file @src/index.ts'),
  allowedTools: ['Edit', 'Read', 'Bash(git *)'],
  maxTurns: 8,
})
```

## Research Tasks


### 1. Research DX Patterns
Investigate how other testing/agent frameworks handle configuration:
- Playwright Test (test.use, fixtures, test.extend)
- Vitest (defineConfig, fixture patterns, test context)
- LangChain (agent configuration, tools, memory)
- Look for: reusability, simplicity, progressive complexity

### 2. Design Agent Configuration API

Create DX-first proposals for:

#### A. Agent Definition Pattern
How should developers define reusable agent configs?

Consider:
- `defineAgent({ ... })` - returns config object?
- Named exports from `agents/` directory?
- Inline objects vs helper functions?
- Type safety and autocomplete

#### B. Project Source Specification
How should developers specify WHERE the agent runs?

Requirements:
- Git repos (with branch, optional commit)
- Local directories
- Temp workspaces (default)
- Auto worktree isolation (default ON)
- Override capabilities

Consider:
- String shorthands: `'https://github.com/user/repo#branch'` or `'./path'`
- Object syntax: `{ git, branch, commit, worktree: { isolate, cleanup } }`
- Auto-detection logic
- Error messages when paths don't exist

#### C. Custom Commands/Tools Integration
How should developers add custom slash commands and tools to agents?

Consider:
- Registration pattern
- Per-agent vs global
- TypeScript typing
- Command discovery

#### D. System Prompt Customization
How should developers customize agent behavior?

Consider:
- Preset personas (`'react-expert'`, `'security-auditor'`)
- Append custom instructions
- Combine presets + custom
- Validation

### 3. Example-Driven Design

Create realistic usage examples showing:

**Simple Case (90% usage):**
```typescript
vibeTest('basic refactor', async ({ runAgent }) => {
  const result = await runAgent({
    prompt: prompt('Refactor @src/index.ts'),
    // What minimal config is needed? Maybe none?
  })
})
```

**Medium Case:**
```typescript
vibeTest('refactor in specific repo', async ({ runAgent }) => {
  const result = await runAgent({
    prompt: prompt('Refactor @src/auth.ts'),
    // How do they specify git repo + branch?
  })
})
```

**Advanced Case:**
```typescript
// Define reusable agent
const securityAgent = ??? // What goes here?

vibeTest('security scan', async ({ runAgent }) => {
  const result = await runAgent({
    prompt: prompt('/scan-secrets'),
    agent: securityAgent  // Pass reusable config
  })
})
```

**Custom Commands:**
```typescript
// How do they define this?
const customAgent = defineAgent({
  commands: {
    '/custom-refactor': async (ctx) => {
      // Custom implementation
    }
  }
})
```

## Deliverable

Provide **3-4 well-researched DX options** with:

1. **API Design**: Complete TypeScript signatures
2. **Usage Examples**: Simple → Advanced progression
3. **Pros/Cons**: Trade-offs for each approach
4. **Recommendation**: Your top choice with rationale
5. **Documentation Strategy**: How to explain it to users

### Format

For each option:

```markdown
## Option X: [Name]

### API Design
[TypeScript interfaces/signatures]

### Simple Example
[Code showing 90% case]

### Advanced Example
[Code showing complex scenario]

### Project Source Handling
[How git/local/temp works]

### Custom Commands
[How to register custom commands]

### Pros
- [Advantage 1]
- [Advantage 2]

### Cons
- [Limitation 1]
- [Limitation 2]

### DX Score: X/10
[Brief rationale]
```

## Success Criteria

Your proposals should:
- ✅ Keep prompt and agent config separate
- ✅ Require zero fixture extension by users
- ✅ Make simple cases trivial (1-2 lines)
- ✅ Support reusable agent definitions
- ✅ Handle all project source types cleanly
- ✅ Be Vitest-idiomatic (match their patterns)
- ✅ Provide excellent TypeScript DX
- ✅ Be immediately understandable from examples
- ✅ Follow Anthropic's prompt engineering best practices

## Research Methodology

1. Read all linked files thoroughly
2. Study Anthropic docs for prompt patterns
3. Research competitor DX patterns
4. Draft 3-4 distinct approaches
5. Create realistic examples for each
6. Evaluate against success criteria
7. Recommend best option with detailed rationale

Take your time. This is a critical design decision that will shape the entire framework's DX.
