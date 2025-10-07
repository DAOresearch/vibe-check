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
| **Hook Capture System** | 3 (High) | 3 (High) | 10 (Critical) | **9.0** | 🔴 1 | Spike: Build prototype, test with real SDK |
| **SDK Integration** | 2 (Medium) | 3 (High) | 10 (Critical) | **8.0** | 🔴 2 | Spike: Build recorder/replayer prototype |
| **Tool Call Correlation** | 3 (High) | 2 (Medium) | 8 (High) | **7.2** | 🟡 3 | Spike: Test correlation algorithm with edge cases |
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

### 1. Hook Capture System (Risk Score: 9.0)

**Why High Risk?**
- **Complexity**: Non-blocking I/O, concurrent writes, graceful degradation
- **Uncertainty**: Unknown whether hooks can be captured reliably without blocking
- **Impact**: Critical foundation - entire test framework depends on hook data

**Key Questions**:
- Can we write hooks to temp files without blocking agent execution?
- What's the performance overhead? (Must be <5%)
- How do we handle write failures gracefully?
- When should we clean up temp files?
- What file format works best? (One file per hook? One file total? NDJSON?)

**Spike Plan**:
```
Duration: 6-8 hours
Approach:
1. Build minimal hook listener that writes to temp files
2. Test with real Claude SDK execution (multiple scenarios)
3. Measure performance overhead with benchmarks
4. Test failure scenarios (disk full, permissions, etc.)
5. Document findings in spikes/01-hook-capture/LEARNINGS.md

Success Criteria:
- All hook events captured correctly
- No dropped hooks under load (100 tool calls)
- Performance overhead <5%
- Graceful degradation on failures
```

**Mitigation If Spike Fails**:
- Fallback to in-memory hook capture (with memory limits)
- Reduce hook data captured (only essential fields)
- Make hook capture optional (graceful degradation)

---

### 2. SDK Integration (Risk Score: 8.0)

**Why High Risk?**
- **Complexity**: Bridge layer, recorder/replayer, versioning
- **Uncertainty**: Unknown SDK behavior, recording format, replay determinism
- **Impact**: Critical for testing - all tests use SDK

**Key Questions**:
- What SDK methods do we need to wrap?
- What recording format works best? (JSON? NDJSON? Binary?)
- How do we handle timing/randomness in replay?
- Can we version recordings by SDK semver?
- How do we detect SDK version mismatches?

**Spike Plan**:
```
Duration: 6-8 hours
Approach:
1. Build minimal SDK bridge layer
2. Prototype recorder (capture all SDK calls)
3. Prototype replayer (replay from fixtures)
4. Test deterministic replay with same inputs
5. Document findings in spikes/02-sdk-integration/LEARNINGS.md

Success Criteria:
- Recorder captures all relevant SDK calls
- Replayer replays deterministically
- Handles timing correctly
- Can detect version mismatches
```

**Mitigation If Spike Fails**:
- Use simple mocks instead of full recorder/replayer
- Accept non-deterministic tests (less ideal)
- Require real SDK for all tests (slower, but reliable)

---

### 3. Tool Call Correlation (Risk Score: 7.2)

**Why High Risk?**
- **Complexity**: Correlation algorithm, edge cases, concurrent calls
- **Uncertainty**: Unknown if PreToolUse + PostToolUse can be reliably matched
- **Impact**: High - tool call data is central to RunResult

**Key Questions**:
- What correlation strategy works best? (timestamp? sequence ID? UUID?)
- How do we handle missing PostToolUse events?
- Can we handle concurrent tool calls correctly?
- What's the performance characteristic? (O(n) vs O(n²)?)

**Spike Plan**:
```
Duration: 4-6 hours
Approach:
1. Build minimal correlation algorithm
2. Create test cases:
   - Normal: PreToolUse + PostToolUse pairs
   - Missing PostToolUse (agent crashes mid-tool)
   - Concurrent tool calls (multiple tools in flight)
   - Reordered events (out-of-order arrival)
3. Test with sample hook data
4. Benchmark performance (1000+ tool calls)
5. Document findings in spikes/03-correlation/LEARNINGS.md

Success Criteria:
- 100% correlation accuracy on test cases
- Handles missing PostToolUse gracefully
- Handles concurrent calls correctly
- Performance is O(n) or better
```

**Mitigation If Spike Fails**:
- Use simpler correlation (timestamp-based, less reliable)
- Accept some unmatched tool calls
- Add tool call IDs to Claude SDK hooks (upstream fix)

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

**Status**: Ready for Risk Assessment Workshop
**Next Action**: Schedule workshop with team
