# Vibe-Check Radial Dependency Map

**Visual representation of the Hybrid (Core-First Radial) implementation strategy**

---

## Overview

This map shows how Vibe-Check is built in concentric rings, starting from a stable kernel and expanding outward.

```
                            [USER]
                              ↑
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
   [vibeTest]          [vibeWorkflow]          [Reporters]
        │                     │                     │
        └─────────────────────┼─────────────────────┘
                              ↑
                         [Ring 4]
                    Matrix | Config | Docs
                              ↑
                         [Ring 3]
                Judge | Terminal Reporter | HTML Reporter
                              ↑
                         [Ring 2]
        vibeTest | vibeWorkflow | Matchers | Watchers
                              ↑
                         [Ring 1]
                Storage | Agent Execution | Git
                              ↑
                         [KERNEL]
                Types | Schemas | Utils | SDK Bridge
```

---

## Kernel (Phase 1 - Week 2)

**Purpose**: Stable foundation, immutable after completion

```
┌─────────────────────────────────────────────┐
│              KERNEL (Immutable)             │
├─────────────────────────────────────────────┤
│                                             │
│  Types         Schemas       Utils          │
│  ─────         ───────       ─────          │
│  • Core        • RunBundle   • correlation  │
│  • Agent       • Summary     • hash         │
│  • Judge       • Hooks       • ndjson       │
│  • Workflow    • Rubric      • git          │
│                                             │
│  SDK Bridge                                 │
│  ──────────                                 │
│  • bridge.ts                                │
│  • recorder/replayer                        │
│                                             │
└─────────────────────────────────────────────┘
```

**Dependencies**: None (zero internal dependencies by design)

**Delivered**: All types, schemas, core utilities, SDK bridge

---

## Ring 1: Core Systems (Phase 2 - Week 3-4)

**Purpose**: Foundation systems (storage, execution, git)

```
┌─────────────────────────────────────────────┐
│                  RING 1                     │
├─────────────────────────────────────────────┤
│                                             │
│  Storage           Agent Execution          │
│  ───────           ─────────────────        │
│  • RunBundleStore  • AgentRunner            │
│  • contentStore    • ContextManager         │
│  • lazyFile        • hooks/capture          │
│  • cleanup         • hooks/processor        │
│                    • AgentExecution         │
│                                             │
│  Git Integration                            │
│  ───────────────                            │
│  • captureGitState                          │
│  • generateDiff                             │
│  • detectChanges                            │
│                                             │
└─────────────────────────────────────────────┘
                       ↑
                   [KERNEL]
```

**Dependencies**: Kernel only

**3 Parallel Tracks**:
- Track A: Storage (2 devs)
- Track B: Agent Execution (2 devs)
- Track C: Git Integration (1 dev)

**Delivered**: Working storage, agent execution, git integration

---

## Ring 2: Test Infrastructure (Phase 3 - Week 5-6)

**Purpose**: User-facing test APIs

```
┌─────────────────────────────────────────────┐
│                  RING 2                     │
├─────────────────────────────────────────────┤
│                                             │
│  vibeTest          vibeWorkflow             │
│  ────────          ────────────             │
│  • vibeTest.ts     • vibeWorkflow.ts        │
│  • context.ts      • workflowContext.ts     │
│  • stateAccumul.   • stageManager.ts        │
│                    • until.ts               │
│                                             │
│  Matchers          Watchers                 │
│  ────────          ────────                 │
│  • 8+ matchers     • watch() method         │
│  • expect.extend   • sequential execution   │
│                    • abort support          │
│                                             │
└─────────────────────────────────────────────┘
                       ↑
            [RING 1: Agent + Storage]
```

**Dependencies**: Kernel + Ring 1 (Agent, Storage)

**4 Parallel Tracks**:
- Track A: vibeTest (2 devs)
- Track B: vibeWorkflow (2 devs)
- Track C: Matchers (1 dev)
- Track D: Watchers (1 dev)

**Delivered**: vibeTest, vibeWorkflow, custom matchers, reactive watchers

---

## Ring 3: Evaluation & Reporting (Phase 4 - Week 7)

**Purpose**: Judge system and visualization

```
┌─────────────────────────────────────────────┐
│                  RING 3                     │
├─────────────────────────────────────────────┤
│                                             │
│  Judge             Reporters                │
│  ─────             ─────────                │
│  • judge.ts        • TerminalCostReporter   │
│  • rubric.ts       • HtmlReporter           │
│  • prompts.ts      • templates/             │
│  • parser.ts       • assets/                │
│                                             │
└─────────────────────────────────────────────┘
                       ↑
         [RING 1: Storage] + [RING 2: vibeTest]
```

**Dependencies**: Kernel + Ring 1 (Storage) + Ring 2 (vibeTest)

**3 Parallel Tracks**:
- Track A: Judge (2 devs)
- Track B: Terminal Reporter (1 dev)
- Track C: HTML Reporter (2 devs)

**Delivered**: Judge system, terminal reporter, HTML reporter

---

## Ring 4: Advanced Features (Phase 5 - Week 8)

**Purpose**: Polish and advanced features

```
┌─────────────────────────────────────────────┐
│                  RING 4                     │
├─────────────────────────────────────────────┤
│                                             │
│  Matrix            Config          Docs     │
│  ──────            ──────          ────     │
│  • defineTestSuite • defineVibe    • Guide  │
│  • product.ts      Config.ts       • API    │
│                    • validation    • Tutor. │
│                                    • Cook.  │
│                                             │
└─────────────────────────────────────────────┘
                       ↑
              [RING 2: vibeTest]
```

**Dependencies**: Kernel + Ring 2 (vibeTest)

**3 Parallel Tracks**:
- Track A: Matrix testing (1 dev)
- Track B: Configuration (1 dev)
- Track C: Documentation (2 devs)

**Delivered**: Matrix testing, configuration, complete documentation

---

## Dependency Graph (Bottom-Up)

```
Level 0: Kernel (Types, Schemas, Utils, SDK)
         └─→ Level 1: Storage, Agent, Git (Ring 1)
                  └─→ Level 2: vibeTest, vibeWorkflow, Matchers, Watchers (Ring 2)
                           ├─→ Level 3: Judge, Reporters (Ring 3)
                           └─→ Level 4: Matrix, Config, Docs (Ring 4)
                                    └─→ Level 5: User-facing APIs
```

---

## Critical Path

**Must be sequential**:

1. **Kernel** (Week 2) - Must complete before any ring
2. **Ring 1** (Week 3-4) - Must complete before Ring 2
3. **Ring 2** (Week 5-6) - Must complete before Ring 3/4
4. **Ring 3 & 4** (Week 7-8) - Can partially overlap

**Can be parallel**:
- Within each ring: Multiple tracks work simultaneously
- Ring 3 & Ring 4: Some overlap possible (judge doesn't need config)

---

## Parallelization Summary

| Phase | Week | Parallel Tracks | Total Devs |
|-------|------|----------------|------------|
| Phase 0: Spikes | 1 | 3 spikes | 3-6 |
| Phase 1: Kernel | 2 | 3 tracks | 5 |
| Phase 2: Ring 1 | 3-4 | 3 tracks | 5 |
| Phase 3: Ring 2 | 5-6 | 4 tracks | 6 |
| Phase 4: Ring 3 | 7 | 3 tracks | 5 |
| Phase 5: Ring 4 | 8 | 3 tracks | 4 |

**Peak Parallelization**: Week 5-6 (Ring 2) with 6 developers

---

## Integration Points

### Kernel → Ring 1
- Storage uses kernel types (RunResult, FileChange)
- Agent uses kernel SDK bridge
- Git uses kernel git utilities

### Ring 1 → Ring 2
- vibeTest uses Agent (runAgent) + Storage (bundles)
- vibeWorkflow uses Agent (multi-stage execution)
- Matchers use Storage (RunResult inspection)

### Ring 2 → Ring 3
- Judge uses vibeTest (fixture method)
- Reporters use Storage (read bundles)

### Ring 2 → Ring 4
- Matrix uses vibeTest (test generation)
- Config uses vibeTest (default propagation)

---

## Testing Strategy by Ring

### Kernel Testing
- **Unit tests**: 100% (all utilities, schemas)
- **Integration tests**: Minimal (SDK bridge only)
- **E2E tests**: None

### Ring 1 Testing
- **Unit tests**: All modules (mocked dependencies)
- **Integration tests**: Cross-module (Storage + Agent + Git)
- **E2E tests**: Basic agent execution with recorder

### Ring 2 Testing
- **Unit tests**: All modules
- **Integration tests**: vibeTest + vibeWorkflow + matchers
- **E2E tests**: Complete workflows with all features

### Ring 3 Testing
- **Unit tests**: All modules
- **Integration tests**: Judge + reporters with real RunBundles
- **E2E tests**: Full evaluation + report generation

### Ring 4 Testing
- **Unit tests**: All modules
- **Integration tests**: Matrix + config with real tests
- **E2E tests**: Advanced features end-to-end

---

## Usage Example (Radial Build-Up)

### After Kernel (Week 2)
```typescript
// Can use types, schemas, utilities
import { RunResult, correlateToolCalls } from '@dao/vibe-check';
const result: RunResult = { /* ... */ };
```

### After Ring 1 (Week 4)
```typescript
// Can run agents, store bundles
import { runAgent } from '@dao/vibe-check';
const result = await runAgent({ agent, prompt: 'Hello' });
```

### After Ring 2 (Week 6)
```typescript
// Can write tests
import { vibeTest } from '@dao/vibe-check';
vibeTest('example', async ({ runAgent, expect }) => {
  const result = await runAgent({ agent, prompt: 'Test' });
  expect(result).toHaveSucceeded();
});
```

### After Ring 3 (Week 7)
```typescript
// Can evaluate and report
vibeTest('example', async ({ runAgent, judge }) => {
  const result = await runAgent({ agent, prompt: 'Test' });
  const judgment = await judge(result, rubric);
  expect(judgment.passed).toBe(true);
});
```

### After Ring 4 (Week 8)
```typescript
// Can use all advanced features
defineTestSuite({
  matrix: { agent: [a1, a2], turns: [8, 16] },
  test: ({ agent, turns }) => {
    vibeTest(`${agent} with ${turns} turns`, async ({ runAgent }) => {
      // Test runs 4 times
    });
  }
});
```

---

## Context Files by Ring

**Kernel**:
- `kernel/README.md` - Overview
- `kernel/API.md` - API contracts
- `kernel/STABILITY.md` - Stability guarantees

**Ring 1**:
- `ring1/OVERVIEW.md` - Status tracker
- `ring1/INTEGRATION.md` - Cross-spoke integration
- `ring1/CONTRACTS.md` - APIs between Storage/Agent/Git

**Ring 2**:
- `ring2/OVERVIEW.md` - Status tracker
- `ring2/USER_GUIDE.md` - Early user documentation
- `ring2/EXAMPLES.md` - Code examples

**Ring 3**:
- `ring3/OVERVIEW.md` - Status tracker
- `ring3/RUBRICS.md` - Example rubrics
- `ring3/REPORTER_SAMPLES.md` - Sample outputs

**Ring 4**:
- `ring4/OVERVIEW.md` - Status tracker
- `docs/USER_GUIDE.md` - Complete user guide
- `docs/API_REFERENCE.md` - Complete API reference

---

**This radial structure enables maximum parallelization while maintaining architectural integrity.**
