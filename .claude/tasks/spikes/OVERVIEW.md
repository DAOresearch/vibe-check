# Spikes Overview

**Purpose**: De-risk high-risk components through time-boxed prototyping

---

## What is a Spike?

A **spike** is a time-boxed research or prototyping effort designed to:
- Prove technical feasibility
- Answer specific questions
- Identify unknowns
- Reduce risk before full implementation

**Spike ≠ Production Code**: Spike code is throwaway. The goal is learning, not shipping.

---

## Spike Status

| Spike | Risk Score | Status | Time Box | Assigned To | Completion Date |
|-------|------------|--------|----------|-------------|-----------------|
| **01: Hook Capture** | 9.0 | 🔜 Not Started | 6-8 hours | - | - |
| **02: SDK Integration** | 8.0 | 🔜 Not Started | 6-8 hours | - | - |
| **03: Tool Correlation** | 7.2 | 🔜 Not Started | 4-6 hours | - | - |

**Legend**: 🔜 Not Started | 🚧 In Progress | ✅ Complete | ❌ Failed

---

## Spike 1: Hook Capture System

**Risk Score**: 9.0 (Complexity: 3 × Uncertainty: 3 × Impact: 10)

**Questions to Answer**:
- Can we capture hooks to temp files without blocking?
- What's the performance overhead? (Target: <5%)
- How do we handle write failures gracefully?
- What file format works best?
- When should we clean up temp files?

**Approach**:
1. Build minimal hook listener
2. Write hooks to temp files (various formats)
3. Test with real Claude SDK execution
4. Measure performance overhead
5. Test failure scenarios

**Success Criteria**:
- ✅ All hook events captured correctly
- ✅ No dropped hooks under load (100 tool calls)
- ✅ Performance overhead <5%
- ✅ Graceful degradation on failures

**Deliverables**:
- `01-hook-capture/prototype.ts` - Working prototype
- `01-hook-capture/LEARNINGS.md` - Findings and recommendations
- `01-hook-capture/PERFORMANCE.md` - Benchmark results

---

## Spike 2: SDK Integration

**Risk Score**: 8.0 (Complexity: 2 × Uncertainty: 3 × Impact: 10)

**Questions to Answer**:
- What SDK methods do we need to wrap?
- What recording format works best?
- Can we replay deterministically?
- How do we handle timing/randomness?
- Can we version recordings by SDK semver?

**Approach**:
1. Build minimal SDK bridge layer
2. Prototype recorder (capture all SDK calls)
3. Prototype replayer (replay from fixtures)
4. Test deterministic replay
5. Test version detection

**Success Criteria**:
- ✅ Recorder captures all relevant SDK calls
- ✅ Replayer replays deterministically
- ✅ Handles timing correctly
- ✅ Can detect version mismatches

**Deliverables**:
- `02-sdk-integration/bridge.ts` - SDK bridge prototype
- `02-sdk-integration/recorder.ts` - Recorder prototype
- `02-sdk-integration/replayer.ts` - Replayer prototype
- `02-sdk-integration/LEARNINGS.md` - Findings and recommendations

---

## Spike 3: Tool Call Correlation

**Risk Score**: 7.2 (Complexity: 3 × Uncertainty: 2 × Impact: 8)

**Questions to Answer**:
- What correlation strategy works best?
- How do we handle missing PostToolUse?
- Can we handle concurrent tool calls?
- What's the performance characteristic?

**Approach**:
1. Build minimal correlation algorithm
2. Create test cases (normal, missing, concurrent, reordered)
3. Test with sample hook data
4. Benchmark performance (1000+ tool calls)

**Success Criteria**:
- ✅ 100% correlation accuracy on test cases
- ✅ Handles missing PostToolUse gracefully
- ✅ Handles concurrent calls correctly
- ✅ Performance is O(n) or better

**Deliverables**:
- `03-correlation/algorithm.ts` - Correlation algorithm
- `03-correlation/test-cases.json` - Test scenarios
- `03-correlation/LEARNINGS.md` - Findings and recommendations

---

## Spike Execution Guidelines

### Before Starting a Spike

1. **Read Risk Assessment**: Understand why this component is high-risk
2. **Define Questions**: List specific questions to answer
3. **Set Time Box**: Stick to the time limit (4-8 hours)
4. **Prepare Environment**: Set up minimal test environment

### During the Spike

1. **Focus on Learning**: Don't worry about code quality
2. **Document as You Go**: Take notes in real-time
3. **Test Edge Cases**: Try to break your prototype
4. **Measure Performance**: Benchmark if applicable
5. **Watch the Clock**: Respect the time box

### After Completing a Spike

1. **Document Findings**: Write comprehensive LEARNINGS.md
2. **Answer Questions**: Address each question explicitly
3. **Recommend Approach**: Suggest production implementation strategy
4. **Identify Risks**: Document any new risks discovered
5. **Update Risk Assessment**: Adjust risk scores based on findings

---

## Learnings Summary

After all spikes are complete, aggregate findings here.

### Key Insights

_To be filled after spikes complete_

### Recommended Production Approaches

_To be filled after spikes complete_

### New Risks Discovered

_To be filled after spikes complete_

### Changes to Phase 1 Plan

_To be filled after spikes complete_

---

## Spike Template Files

Each spike directory should contain:

```
spikes/XX-spike-name/
├── README.md              # Spike overview and plan
├── prototype.ts           # Working prototype code (throwaway)
├── test-cases.json        # Test scenarios (if applicable)
├── benchmark.ts           # Performance benchmarks (if applicable)
├── LEARNINGS.md          # Findings and recommendations
├── PERFORMANCE.md        # Benchmark results (if applicable)
└── examples/             # Example usage (if helpful)
```

---

## Next Steps

1. **Assign Spikes**: Assign each spike to a developer or pair
2. **Schedule Time**: Block calendar for spike work (no interruptions)
3. **Execute Spikes**: Run spikes in parallel where possible
4. **Review Learnings**: Team review of all spike findings
5. **Update Plans**: Adjust Phase 1 plan based on learnings

---

**Status**: Ready to begin spikes
**Next Action**: Assign Spike 1, 2, 3 to team members
