# Hook Capture Prototype – Performance Findings

| Scenario | Events | Baseline (ms)\* | Capture (ms) | Per Event (ms) | Est. Overhead vs 5s Run |
|----------|--------|-----------------|--------------|----------------|-------------------------|
| NDJSON temp file write (default buffer, 64 KiB) | 5,000 | 1.94 | 82.16 | 0.0164 | 1.64% |

\*Baseline measures JSON serialization only (no I/O). The estimated overhead compares end-to-end capture time with a 5,000 ms agent run, representing the average latency of real Claude Code sessions observed in prior projects.

Reproduce with `bun run spikes/01-hook-capture/benchmark.ts` (override `HOOK_BENCH_ITERATIONS` or `AGENT_RUNTIME_MS` to explore other workloads).
