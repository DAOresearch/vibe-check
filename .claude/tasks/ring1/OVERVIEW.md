# Ring 1: Core Systems

**Phase**: Phase 2 (Week 3-4)
**Status**: 🔜 Not Started
**Dependencies**: Kernel (Phase 1)

---

## Purpose

Build the three foundational systems:
1. **Storage System** - RunBundle persistence, content-addressed files, lazy loading
2. **Agent Execution System** - Agent orchestration, hook capture, context management
3. **Git Integration System** - Git state capture, diff generation, change detection

---

## Tracks

### Track 1A: Storage System (2 devs)

**Components**:
- `src/storage/RunBundleStore.ts` - Bundle CRUD + cleanup
- `src/storage/contentStore.ts` - Content-addressed storage (SHA-256)
- `src/storage/lazyFile.ts` - Lazy text()/stream() accessors
- `src/storage/cleanup.ts` - 30-day retention policy

**Status**: 🔜 Not Started

**Checklist**:
- [ ] RunBundleStore.ts (0%)
- [ ] contentStore.ts (0%)
- [ ] lazyFile.ts (0%)
- [ ] cleanup.ts (0%)
- [ ] Unit tests (0/50)
- [ ] Integration tests (0/15)

### Track 1B: Agent Execution System (2 devs)

**Components**:
- `src/agent/AgentRunner.ts` - Execution orchestrator
- `src/agent/ContextManager.ts` - Hook capture → process → inject
- `src/agent/hooks/capture.ts` - Non-blocking hook writes
- `src/agent/hooks/processor.ts` - Hook correlation
- `src/agent/AgentExecution.ts` - Thenable execution handle

**Status**: 🔜 Not Started

**Checklist**:
- [ ] AgentRunner.ts (0%)
- [ ] ContextManager.ts (0%)
- [ ] hooks/capture.ts (0%)
- [ ] hooks/processor.ts (0%)
- [ ] AgentExecution.ts (0%)
- [ ] Unit tests (0/65)
- [ ] Integration tests (0/20)

### Track 1C: Git Integration System (1 dev)

**Components**:
- `src/git/captureGitState.ts` - Before/after git state
- `src/git/generateDiff.ts` - Unified diff generation
- `src/git/detectChanges.ts` - Change detection

**Status**: 🔜 Not Started

**Checklist**:
- [ ] captureGitState.ts (0%)
- [ ] generateDiff.ts (0%)
- [ ] detectChanges.ts (0%)
- [ ] Unit tests (0/21)

---

## Integration

**Cross-Track Dependencies**:
- Agent uses Storage (save RunBundles)
- Agent uses Git (capture state before/after)
- Storage is independent (can be built first)

**Integration Session**:
- Scheduled: End of Week 4
- Goal: All three systems working together
- Tests: Cross-system integration tests

---

## Status Tracking

| Component | Status | Coverage | Tests Passing |
|-----------|--------|----------|---------------|
| Storage | 🔜 | 0% | 0/65 |
| Agent | 🔜 | 0% | 0/85 |
| Git | 🔜 | 0% | 0/21 |
| **Total** | **🔜** | **0%** | **0/171** |

---

**Next Action**: Complete Phase 1 (Kernel), then begin Ring 1 tracks
