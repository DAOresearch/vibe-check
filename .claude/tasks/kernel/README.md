# Vibe-Check Kernel

**Status**: 🔜 Not Started
**Phase**: Phase 1 (Week 2)
**Stability**: 🔒 IMMUTABLE after Phase 1 completion

---

## What is the Kernel?

The **kernel** is the stable foundation of Vibe-Check. It contains:
- Core type definitions (interfaces, types)
- Runtime validation schemas (Zod)
- Fundamental utilities (correlation, hashing, NDJSON)
- SDK bridge layer

**Stability Guarantee**: The kernel API is immutable after Phase 1. No breaking changes allowed.

---

## Kernel Components

### 1. Type System (`src/types/`)

**Purpose**: Define all core interfaces and types

**Files**:
- `core.ts` - Core interfaces (RunResult, ToolCall, FileChange, TimelineEvent, etc.)
- `agent.ts` - Agent types (AgentConfig, RunAgentOptions, AgentExecution)
- `judge.ts` - Judge types (Rubric, JudgmentResult)
- `workflow.ts` - Workflow types (WorkflowContext, StageResult)
- `index.ts` - Main export

**Key Types**:

```typescript
// Core types (11 total)
export interface VibeTestContext { /* ... */ }
export interface WorkflowContext { /* ... */ }
export interface RunResult { /* ... */ }
export interface PartialRunResult { /* ... */ }
export interface AgentExecution { /* ... */ }
export interface ToolCall { /* ... */ }
export interface FileChange { /* ... */ }
export interface TimelineEvent { /* ... */ }
export interface Rubric { /* ... */ }
export interface JudgmentResult { /* ... */ }
export interface RunBundle { /* ... */ }
```

### 2. Schema System (`src/schemas/`)

**Purpose**: Runtime validation with Zod

**Files**:
- `runBundle.ts` - RunBundle validation
- `summary.ts` - summary.json schema
- `hooks.ts` - Hook NDJSON schema
- `rubric.ts` - Rubric validation
- `index.ts` - Main export

**Key Schemas**:

```typescript
import { z } from 'zod';

export const RunBundleSchema = z.object({
  runId: z.string().uuid(),
  summary: SummarySchema,
  events: z.string(), // NDJSON path
  hooks: z.string(),  // NDJSON path
  files: z.object({
    before: z.record(z.string()),
    after: z.record(z.string())
  })
});
```

### 3. Core Utilities (`src/utils/`)

**Purpose**: Fundamental helper functions

**Files**:
- `correlation.ts` - Tool call correlation algorithm
- `hash.ts` - SHA-256 content addressing
- `ndjson.ts` - NDJSON serialization/deserialization
- `git.ts` - Git helpers

**Key Functions**:

```typescript
// Tool call correlation (from Spike 3)
export function correlateToolCalls(
  hooks: HookEvent[]
): ToolCall[];

// SHA-256 hashing (content-addressed storage)
export function hashContent(content: string): string;

// NDJSON utilities
export function serializeNDJSON(objects: any[]): string;
export function parseNDJSON(ndjson: string): any[];
```

### 4. SDK Bridge (`src/sdk/`)

**Purpose**: Single point of Claude SDK coupling

**Files**:
- `bridge.ts` - Claude SDK integration (from Spike 2)
- `types.ts` - SDK type wrappers
- `recorder.ts` - SDK recorder (optional Phase 1)
- `replayer.ts` - SDK replayer (optional Phase 1)

**Key Functions**:

```typescript
// SDK bridge (isolates SDK dependency)
export async function query(
  messages: SDKUserMessage[],
  options: QueryOptions
): Promise<SDKResponse>;

// Type wrappers
export type SDKUserMessage = /* ... */;
export type SDKResponse = /* ... */;
```

---

## Kernel API Contracts

### Stability Promise

> **After Phase 1 completes, the kernel API is IMMUTABLE.**
>
> - No breaking changes to interfaces
> - No changes to function signatures
> - No changes to schema formats
> - Only additive changes allowed (new optional fields)

### Versioning

- **Kernel Version**: Semantic versioning (e.g., `1.0.0`)
- **Breaking Changes**: Require major version bump
- **Phase 1 Completes**: Lock kernel at `1.0.0`

---

## Usage Examples

### Types

```typescript
import { RunResult, ToolCall, FileChange } from '@dao/vibe-check/types';

const result: RunResult = {
  runId: '123',
  metrics: { totalCostUsd: 0.50 },
  tools: {
    all: () => [/* tool calls */],
    used: (name) => [/* filtered */]
  },
  files: {
    changed: () => [/* file changes */]
  },
  // ...
};
```

### Schemas

```typescript
import { RunBundleSchema } from '@dao/vibe-check/schemas';

// Validate RunBundle at runtime
const bundle = RunBundleSchema.parse(data);
```

### Utilities

```typescript
import { correlateToolCalls, hashContent } from '@dao/vibe-check/utils';

// Correlate PreToolUse + PostToolUse
const toolCalls = correlateToolCalls(hooks);

// Hash file content
const hash = hashContent(fileContent); // SHA-256
```

### SDK Bridge

```typescript
import { query } from '@dao/vibe-check/sdk';

// Query Claude SDK
const response = await query(messages, {
  model: 'claude-3-5-sonnet-latest',
  maxTokens: 4096
});
```

---

## Testing the Kernel

### Unit Tests

**Location**: `tests/unit/{types,schemas,utils,sdk}/`

**Coverage Target**: ≥95%

**Example**:
```typescript
// tests/unit/utils/correlation.test.ts
describe('correlateToolCalls', () => {
  it('correlates PreToolUse + PostToolUse correctly');
  it('handles missing PostToolUse gracefully');
  it('handles concurrent tool calls');
});
```

### Test Strategy

- **Types**: Validate all types export correctly
- **Schemas**: Test validation with valid/invalid data
- **Utilities**: Comprehensive unit tests (all edge cases)
- **SDK Bridge**: Unit tests with mocked SDK

---

## Dependencies

### External Dependencies

- `zod` ^3.23.0 - Runtime validation
- `@anthropic-ai/claude-code` ^0.1.0 - Claude SDK (peer dependency)

### Internal Dependencies

- **None** - Kernel has zero internal dependencies (by design)

---

## Building the Kernel (Phase 1)

### Week 2 Plan

**Track 1: Types + Schemas** (2 devs)
- Day 1-2: Define all interfaces in `src/types/`
- Day 3-4: Create Zod schemas in `src/schemas/`
- Day 5: Tests + docs

**Track 2: Core Utilities** (2 devs)
- Day 1-2: Implement correlation algorithm (from Spike 3)
- Day 3: Implement hashing + NDJSON utilities
- Day 4: Git helpers
- Day 5: Tests + docs

**Track 3: SDK Bridge** (1 dev)
- Day 1-3: Implement SDK bridge (from Spike 2)
- Day 4: Recorder/replayer (if ready from spike)
- Day 5: Tests + docs

### Success Criteria

- ✅ All types defined and exported
- ✅ All schemas validate correctly
- ✅ All utilities tested (≥95% coverage)
- ✅ SDK bridge functional with real SDK
- ✅ Documentation complete (this file + API.md)
- ✅ Zero breaking changes after this phase

---

## Documentation

- `kernel/README.md` (this file) - Kernel overview
- `kernel/API.md` - Complete API reference
- `kernel/STABILITY.md` - Stability guarantees and versioning

---

## Status Tracking

### Types System
- [ ] `src/types/core.ts` - Core interfaces
- [ ] `src/types/agent.ts` - Agent types
- [ ] `src/types/judge.ts` - Judge types
- [ ] `src/types/workflow.ts` - Workflow types
- [ ] `src/types/index.ts` - Main export
- [ ] Tests: `tests/unit/types/`

### Schema System
- [ ] `src/schemas/runBundle.ts` - RunBundle schema
- [ ] `src/schemas/summary.ts` - Summary schema
- [ ] `src/schemas/hooks.ts` - Hooks schema
- [ ] `src/schemas/rubric.ts` - Rubric schema
- [ ] `src/schemas/index.ts` - Main export
- [ ] Tests: `tests/unit/schemas/`

### Core Utilities
- [ ] `src/utils/correlation.ts` - Correlation algorithm
- [ ] `src/utils/hash.ts` - SHA-256 hashing
- [ ] `src/utils/ndjson.ts` - NDJSON utilities
- [ ] `src/utils/git.ts` - Git helpers
- [ ] Tests: `tests/unit/utils/`

### SDK Bridge
- [ ] `src/sdk/bridge.ts` - SDK integration
- [ ] `src/sdk/types.ts` - SDK type wrappers
- [ ] `src/sdk/recorder.ts` - Recorder (optional)
- [ ] `src/sdk/replayer.ts` - Replayer (optional)
- [ ] Tests: `tests/unit/sdk/`

---

**Next Action**: Complete Phase 0 (Spikes), then begin kernel implementation
