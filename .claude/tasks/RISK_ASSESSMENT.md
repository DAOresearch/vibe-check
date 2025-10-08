# Vibe-Check Risk Assessment

**Date**: 2025-10-07
**Conducted By**: [Team]
**Status**: Initial Assessment

---

## Risk Scoring Methodology

**Risk Score = Complexity × Uncertainty × (Impact / 10)**

- **Complexity**: How hard is it to implement correctly? (1-3 scale)
  - 1 = Low (straightforward, well-understood patterns)
  - 2 = Medium (some complexity, requires careful design)
  - 3 = High (very complex, many edge cases)

- **Uncertainty**: Do we understand the requirements/approach? (1-3 scale)
  - 1 = Low (clear requirements, proven approach)
  - 2 = Medium (some unknowns, need validation)
  - 3 = High (many unknowns, needs research)

- **Impact**: How many other components depend on this? (1-10 scale)
  - 1-3 = Low (few dependencies)
  - 4-7 = Medium (moderate dependencies)
  - 8-10 = High (critical foundation, many dependencies)

---

## Risk Matrix

| Component | Complexity | Uncertainty | Impact | Risk Score | Priority | Mitigation Strategy |
|-----------|------------|-------------|--------|------------|----------|---------------------|
| **Hook Capture System** | 3 (High) | 2 (Medium) | 9 (High) | **5.4** | 🟡 1 | Spike completed – capture prototype + perf data |
| **SDK Integration** | 3 (High) | 2 (Medium) | 8 (High) | **4.8** | 🟡 2 | Spike completed – recorder/replayer validated |
| **Tool Call Correlation** | 3 (High) | 2 (Medium) | 6 (Medium) | **3.6** | 🟢 3 | Spike completed – algorithm + benchmarks |
| **Content-Addressed Storage** | 2 (Medium) | 2 (Medium) | 8 (High) | **4.8** | 🟡 4 | Spike: Benchmark performance with large files |
| **LLM Judge Parsing** | 2 (Medium) | 3 (High) | 6 (Medium) | **4.8** | 🟡 5 | Spike: Test prompt formats, parsing reliability |
| **Reactive Watchers** | 3 (High) | 2 (Medium) | 6 (Medium) | **4.8** | 🟡 6 | Spike: Build thenable prototype, test abort |
| **HTML Report Generation** | 2 (Medium) | 1 (Low) | 7 (Medium) | **2.1** | 🟢 7 | Standard web dev, no spike needed |
| **Lazy Loading** | 2 (Medium) | 1 (Low) | 6 (Medium) | **1.8** | 🟢 8 | Standard pattern, no spike needed |
| **Git Utilities** | 2 (Medium) | 1 (Low) | 6 (Medium) | **1.8** | 🟢 9 | Use simple-git or CLI wrapper |
| **vibeTest Fixtures** | 2 (Medium) | 1 (Low) | 7 (Medium) | **2.1** | 🟢 10 | Standard Vitest pattern |
| **Matrix Testing** | 1 (Low) | 1 (Low) | 3 (Low) | **0.3** | 🟢 11 | Simple cartesian product |
| **Configuration** | 1 (Low) | 1 (Low) | 5 (Low) | **0.5** | 🟢 12 | Standard Vitest config pattern |

**Legend**: 🔴 High Risk (≥7) | 🟡 Medium Risk (4-6.9) | 🟢 Low Risk (<4)

---

## High-Risk Components (Require Spikes)

### 1. Hook Capture System (Updated Risk Score: 5.4)

**Spike Outcome**
- Non-blocking NDJSON capture implemented with in-memory queue + stream back-pressure.
- Benchmark: 5 000 events captured in 82 ms (≈1.6 % overhead vs 5 s run).
- Failure path exercised via simulated disk error (`onWriteError`), confirming graceful shutdown/degradation.

**Residual Risk**
- Requires production hardening around multi-process cleanup and telemetry.
- Still depends on upstream hooks providing consistent timestamps.

**Next Steps**
- Promote capture session into the kernel with metrics (queue depth, bytes written).
- Add manifest-driven cleanup to avoid temp file leaks in crash scenarios.

---

### 2. SDK Integration (Updated Risk Score: 4.8)

**Spike Outcome**
- Bridge dynamically selects real SDK or local stub (default stub without API keys).
- Recorder persists complete message streams (JSON + NDJSON) including semver + timing metadata.
- Replayer yields deterministic sequences; fixtures generated for regression tests.

**Residual Risk**
- Real SDK parity still needs validation (networked integration test).
- Version mismatch detection is advisory in the prototype—must become a hard guardrail.

**Next Steps**
- Flesh out production API (`recordQueryTo`, `replayFixture`) backed by these prototypes.
- Add integrity hash + SDK version check before replaying fixtures in CI.

---

### 3. Tool Call Correlation (Updated Risk Score: 3.6)

**Spike Outcome**
- FIFO queue correlator matches pre/post events using `toolInvocationId` (with session/tool fallback).
- Handles out-of-order delivery and missing counterparts by surfacing `missing-post` and `orphan-post`.
- Benchmark on 2 000 tool calls completes in 8.53 ms (≈4.26 µs per call).

**Residual Risk**
- Relies on upstream instrumentation to emit stable invocation IDs; fallback keys can collide in pathological scenarios.
- Needs guardrails around memory usage if thousands of concurrent invocations queue up.

**Next Steps**
- Enforce ID generation at hook emission time to avoid fallback collisions.
- Add the benchmark to CI to monitor regression in complexity or runtime.

---

## Medium-Risk Components (Monitor, No Spike Required)

### 4. Content-Addressed Storage (Risk Score: 4.8)

**Mitigation**:
- Use proven SHA-256 hashing
- Standard deduplication pattern
- Benchmark early to catch performance issues

### 5. LLM Judge Parsing (Risk Score: 4.8)

**Mitigation**:
- Design robust prompt format
- Use structured output (JSON)
- Graceful fallback for parsing failures
- Test with multiple rubric formats early

### 6. Reactive Watchers (Risk Score: 4.8)

**Mitigation**:
- Use standard thenable pattern
- Sequential execution (simpler than parallel)
- Clear abort semantics

---

## Low-Risk Components (Standard Patterns)

### 7-12. HTML Reporting, Lazy Loading, Git, vibeTest, Matrix, Config

**Mitigation**:
- Follow standard patterns
- Use existing libraries where possible
- Comprehensive tests to catch issues early

---

## Spike Schedule (Week 1)

### Day 1: Risk Assessment Workshop
- **Duration**: 4 hours
- **Participants**: All team members
- **Output**: This document, prioritized risks, spike plans

### Day 2-3: Spike 1 - Hook Capture System
- **Assigned To**: [Name/Pair]
- **Time Box**: 6-8 hours
- **Output**: Prototype + LEARNINGS.md

### Day 2-3: Spike 2 - SDK Integration (Parallel)
- **Assigned To**: [Name/Pair]
- **Time Box**: 6-8 hours
- **Output**: Prototype + LEARNINGS.md

### Day 3-4: Spike 3 - Tool Call Correlation (Parallel)
- **Assigned To**: [Name/Pair]
- **Time Box**: 4-6 hours
- **Output**: Prototype + LEARNINGS.md

### Day 5: Spike Learnings Summary
- **Duration**: 2-3 hours
- **Participants**: All team members
- **Output**: LEARNINGS_SUMMARY.md, updated Phase 1 plan

---

## Risk Review Cadence

- **Weekly**: Review risk matrix, update scores based on learnings
- **After Each Spike**: Document findings, update risk assessment
- **After Each Phase**: Identify new risks, update priorities

---

## Success Criteria for Phase 0

- ✅ All high-risk components (Risk Score ≥7) have completed spikes
- ✅ Learnings documented with clear recommendations
- ✅ No critical blockers discovered
- ✅ Team has confidence to proceed to Phase 1 (Kernel)

---

## Notes

_Add notes during risk assessment workshop_

---

**Status**: Phase 0 spikes complete – risks updated
**Next Action**: Kick off Phase 1 (Shared Kernel) incorporating spike learnings
