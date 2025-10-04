---
title: Installation
description: Install and configure Vibe Check in your project
---

# Installation

This guide will help you install Vibe Check and configure it for your project.

## Prerequisites

- **Node.js 18+** (or Bun)
- **TypeScript** knowledge
- **Claude Code** CLI installed (for agent automation)

## Install Vibe Check

### Using npm

```bash
npm install --save-dev @dao/vibe-check vitest
```

### Using bun

```bash
bun add -D @dao/vibe-check vitest
```

### Using yarn

```bash
yarn add -D @dao/vibe-check vitest
```

## Configure Vitest

Create a `vitest.config.ts` file in your project root:

```typescript
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Vibe Check works best with sequential test execution
    sequence: {
      concurrent: false
    },
    // Optional: Configure reporters
    reporters: ['default', 'html'],
  },
});
```

## Create Your First Test File

Create a test file `tests/example.test.ts`:

```typescript
import { vibeTest, defineAgent } from '@dao/vibe-check';

vibeTest('my first test', async ({ runAgent, expect }) => {
  const result = await runAgent({
    agent: defineAgent({ model: 'claude-sonnet-4' }),
    prompt: 'Say hello'
  });

  expect(result).toHaveNoErrorsInLogs();
});
```

## Run Your Tests

```bash
# Using npm
npm test

# Using bun
bun test

# Using yarn
yarn test
```

## Next Steps

- [First Automation Tutorial](/getting-started/first-automation/) - Build your first pipeline
- [First Evaluation Tutorial](/getting-started/first-evaluation/) - Benchmark your first agent
- [API Reference](/api/) - Explore the full API
