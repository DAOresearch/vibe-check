# Contributing to Vibe Check

> Architecture, implementation plans, and development guides

[Home](../) > Contributing

Thank you for your interest in contributing to Vibe Check! This section provides everything you need to understand the system and contribute effectively.

---

## Quick Links

- **[Architecture Overview](./architecture.md)** - System design and components
- **[Implementation Plan](./implementation-plan.md)** - Roadmap and milestones
- **[Development Setup](./development.md)** - Local dev environment and workflows

---

## Getting Started

### 1. Read the Architecture

Start with [Architecture Overview](./architecture.md) to understand:
- How Vibe Check integrates with Vitest
- Agent runner and Claude SDK integration
- Fixture system and custom context
- Matrix test generation
- Reporter architecture

### 2. Check the Implementation Plan

Review [Implementation Plan](./implementation-plan.md) for:
- Project milestones and phases
- Current status of components
- API skeletons and interfaces
- Test strategy
- Acceptance criteria

### 3. Set Up Development Environment

Follow [Development Setup](./development.md) to:
- Install dependencies
- Run tests
- Build the project
- Run examples
- Use development scripts

---

## Project Structure

```
vibe-check/
├── src/
│   ├── test/
│   │   ├── vibeTest.ts          # Extended test with fixtures
│   │   ├── context.ts           # TestContext augmentation
│   │   └── matchers.ts          # Custom expect matchers
│   ├── runner/
│   │   └── agentRunner.ts       # Claude SDK integration
│   ├── judge/
│   │   ├── rubric.ts            # Rubric schema (Zod)
│   │   └── llmJudge.ts          # Hybrid evaluation
│   ├── reporters/
│   │   ├── cost.ts              # CLI cost reporter
│   │   └── html.ts              # Rich HTML report
│   ├── matrix/
│   │   └── defineTestSuite.ts   # Matrix test generation
│   └── artifacts/
│       └── ArtifactManager.ts   # Output tracking
├── tests/                       # Test suite
├── docs/                        # Documentation
├── .claude/                     # Claude Code scaffold
└── examples/                    # Example code
```

---

## Contribution Workflow

### 1. Find an Issue

- Browse [open issues](https://github.com/dao/vibe-check/issues)
- Look for `good-first-issue` or `help-wanted` labels
- Or propose a new feature in [discussions](https://github.com/dao/vibe-check/discussions)

### 2. Create a Branch

```bash
git checkout -b feature/your-feature-name
```

**Branch naming:**
- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation changes
- `refactor/` - Code refactoring
- `test/` - Test additions/changes

### 3. Make Changes

- Follow existing code style (enforced by Biome)
- Write tests for new functionality
- Update documentation if needed
- Run checks before committing

```bash
# Type check
bun run typecheck

# Lint and format
bun run lint

# Run all checks
bun run check
```

### 4. Commit Changes

Use conventional commits:

```bash
git commit -m "feat: add custom matcher toMatchRubric"
git commit -m "fix: handle undefined cost in reporter"
git commit -m "docs: add matrix testing guide"
```

**Commit types:**
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation only
- `style:` - Code style changes (formatting, etc.)
- `refactor:` - Code refactoring
- `test:` - Test additions/changes
- `chore:` - Maintenance tasks

### 5. Push and Create PR

```bash
git push -u origin feature/your-feature-name
```

Open a pull request with:
- Clear description of changes
- Link to related issue(s)
- Screenshots/examples if applicable
- Updated tests and docs

---

## Development Guidelines

### Code Style

- **TypeScript-first** - All code in TypeScript
- **Strict typing** - No `any` types
- **Functional style** - Prefer pure functions
- **Descriptive names** - Clear variable and function names
- **Comments** - Explain why, not what

### Testing

- **Unit tests** for pure functions
- **Integration tests** for agent interactions
- **Example tests** in `examples/` directory
- **Test names** should be descriptive
- **Coverage** - Aim for > 80% coverage

### Documentation

- **JSDoc comments** for public APIs
- **README updates** for new features
- **Guide additions** for complex features
- **Examples** for common use cases

---

## Areas for Contribution

### High Priority

- [ ] Core framework implementation (fixtures, runners, matchers)
- [ ] Reporter improvements (HTML report enhancements)
- [ ] Judge system (programmatic + LLM evaluation)
- [ ] Documentation (guides, recipes, examples)

### Medium Priority

- [ ] Additional matchers (e.g., `toMatchSnapshot`, `toUseLessThan`)
- [ ] MCP server integration examples
- [ ] Performance optimizations
- [ ] Error messages and DX improvements

### Good First Issues

- [ ] Add examples for common patterns
- [ ] Improve error messages
- [ ] Add JSDoc comments to existing code
- [ ] Write guides for specific use cases
- [ ] Fix typos in documentation

---

## Code of Conduct

- Be respectful and inclusive
- Provide constructive feedback
- Focus on the code, not the person
- Assume good intentions
- Follow the [Contributor Covenant](https://www.contributor-covenant.org/)

---

## Questions?

- **Technical questions:** Open a [discussion](https://github.com/dao/vibe-check/discussions)
- **Bug reports:** Open an [issue](https://github.com/dao/vibe-check/issues)
- **Feature requests:** Start a [discussion](https://github.com/dao/vibe-check/discussions)

---

## Related Documentation

- **[Architecture](./architecture.md)** - System design deep dive
- **[Implementation Plan](./implementation-plan.md)** - Roadmap and status
- **[Development Setup](./development.md)** - Local dev environment

---

[← Back to Documentation Home](../)
