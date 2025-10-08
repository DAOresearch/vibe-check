# Phase 0 – Spike Learnings Summary

**Date**: 2025-10-08  
**Agents**: Codex (GPT-5)  
**Scope**: Hook capture, SDK integration, tool call correlation

## Executive Summary

- ✅ All three spikes produced working prototypes and benchmarks.
- 📉 Risks reduced: Hook capture + SDK integration drop from “high” to “medium”; correlation drops to “low”.
- 🚫 No critical blockers discovered. Proceed to Phase 1 (Shared Kernel) recommended.

## Spike Highlights

### 01 – Hook Capture
- Non-blocking NDJSON capture with write queue + back-pressure.
- Simulated disk failure routes through `onWriteError`, enabling graceful degradation.
- Measured cost ≈ 1.6 % of a 5 s run (0.016 ms per event).

### 02 – SDK Integration
- Bridge auto-selects stub vs real SDK; recordings embed semver + request metadata.
- Recorder writes NDJSON (stream-friendly) and JSON (debug) formats; replayer yields deterministic streams with optional timing playback.
- Fixtures generated for tooling integration tests.

### 03 – Tool Call Correlation
- FIFO queues keyed by `toolInvocationId` (or fallback) correlate events in O(n).
- Handles missing posts (`missing-post`) and orphan posts (`orphan-post`) explicitly.
- Benchmark: 2 000 calls correlate in 8.53 ms (~4.26 µs/call).

## Updated Risks

| Component | Previous Score | New Score | Notes |
|-----------|----------------|-----------|-------|
| Hook Capture System | 9.0 | **5.4** | Complexity remains high, uncertainty drops with working prototype + perf data. |
| SDK Integration | 8.0 | **4.8** | Deterministic replay validated; remaining risk is real-SDK parity and version enforcement. |
| Tool Call Correlation | 7.2 | **3.6** | Algorithm + tests confirm feasibility; only dependency is hook ID quality. |

## Recommendations for Phase 1

1. **Productize prototypes**  
   - Lift capture session, recorder, replayer, and correlation logic into `src/` with unit tests.  
   - Add telemetry + metrics hooks (queue depth, write failures, version mismatch warnings).

2. **Enforce SDK semantics**  
   - `VIBE_AGENT_MODE=live` now opt-in to the real SDK; credential sourcing stays with Claude Code so runs don't depend on specific env vars.  
   - Fail fast when replaying fixtures recorded with a different SDK semver.

3. **Operational hygiene**  
   - Centralize temp-file lifecycle (directory manifest, cleanup worker).  
   - Persist spike benchmarks to CI so future regressions surface quickly.

## Go / No-Go

**GO** – All success criteria for Phase 0 met:
- Working prototypes for each high-risk area.
- Complete learnings documented.
- Benchmarks demonstrate headroom against targets.
- Clear implementation plan adjustments identified.
