# Ring 2: Test Infrastructure

**Phase**: Phase 3 (Week 5-6)
**Status**: 🔜 Not Started
**Dependencies**: Kernel (Phase 1) + Ring 1 (Phase 2)

---

## Purpose

Build user-facing test APIs:
1. **vibeTest Infrastructure** - Main test function with fixtures
2. **vibeWorkflow Infrastructure** - Workflow orchestration
3. **Custom Matchers** - 8+ custom Vitest matchers
4. **AgentExecution Enhancements** - Reactive watchers

---

## Tracks

### Track 2A: vibeTest Infrastructure (2 devs)

**Components**:
- `src/testing/vibeTest.ts` - Main test function
- `src/testing/context.ts` - VibeTestContext implementation
- `src/testing/stateAccumulator.ts` - Cumulative state tracking

**Status**: 🔜 Not Started

**Checklist**:
- [ ] vibeTest.ts (0%)
- [ ] context.ts (0%)
- [ ] stateAccumulator.ts (0%)
- [ ] Unit tests (0/37)
- [ ] Integration tests (0/12)

### Track 2B: vibeWorkflow Infrastructure (2 devs)

**Components**:
- `src/testing/vibeWorkflow.ts` - Workflow orchestration
- `src/testing/workflowContext.ts` - WorkflowContext implementation
- `src/testing/stageManager.ts` - Stage lifecycle
- `src/testing/until.ts` - Iterative loop helper

**Status**: 🔜 Not Started

**Checklist**:
- [ ] vibeWorkflow.ts (0%)
- [ ] workflowContext.ts (0%)
- [ ] stageManager.ts (0%)
- [ ] until.ts (0%)
- [ ] Unit tests (0/44)
- [ ] Integration tests (0/10)

### Track 2C: Custom Matchers (1 dev)

**Components**:
- `src/testing/matchers/toHaveChangedFiles.ts`
- `src/testing/matchers/toHaveUsedTool.ts`
- `src/testing/matchers/toHaveCostLessThan.ts`
- `src/testing/matchers/toHaveSucceeded.ts`
- `src/testing/matchers/toHaveErrored.ts`
- `src/testing/matchers/toHaveTimedOut.ts`
- `src/testing/matchers/toMatchSnapshot.ts`
- `src/testing/matchers/toHaveToolCallMatching.ts`

**Status**: 🔜 Not Started

**Checklist**:
- [ ] 8+ matchers (0/8)
- [ ] Unit tests (0/40)

### Track 2D: AgentExecution Enhancements (1 dev)

**Components**:
- `src/agent/AgentExecution.ts` - Enhanced with watchers
- `src/agent/watchers.ts` - Watcher execution logic

**Status**: 🔜 Not Started

**Checklist**:
- [ ] AgentExecution.ts enhancements (0%)
- [ ] watchers.ts (0%)
- [ ] Unit tests (0/15)
- [ ] Integration tests (0/6)

---

## Integration

**Cross-Track Dependencies**:
- vibeTest uses Agent (Ring 1)
- vibeWorkflow uses Agent (Ring 1)
- Matchers use Storage (Ring 1) for RunResult inspection
- Watchers enhance Agent (Ring 1)

**Integration Session**:
- Scheduled: End of Week 6
- Goal: All four systems working together
- Tests: E2E tests with vibeTest + vibeWorkflow + matchers + watchers

---

## Status Tracking

| Component | Status | Coverage | Tests Passing |
|-----------|--------|----------|---------------|
| vibeTest | 🔜 | 0% | 0/49 |
| vibeWorkflow | 🔜 | 0% | 0/54 |
| Matchers | 🔜 | 0% | 0/40 |
| Watchers | 🔜 | 0% | 0/21 |
| **Total** | **🔜** | **0%** | **0/164** |

---

**Next Action**: Complete Ring 1, then begin Ring 2 tracks
