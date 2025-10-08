# Spike 03 – Tool Call Correlation

**Time box**: 4 hours  
**Prototype**: `algorithm.ts` with `run-tests.ts` + `benchmark.ts`

## Questions & Answers

1. **What correlation strategy works best?**  
   Queue-by-key works: we key primarily on `toolInvocationId`, falling back to `sessionId + toolName`. Each key maintains FIFO queues for `PreToolUse` and `PostToolUse`, covering concurrent invocations without global searches.

2. **How do we handle missing `PostToolUse` events?**  
   Unmatched `PreToolUse` entries surface as `status: 'missing-post'` with the original input preserved. Downstream code can treat those as failed tool calls.

3. **Can we handle concurrent tool calls correctly?**  
   Yes. The keyed queues ensure `A1` matches the first `PostToolUse` to arrive for the same key, independent of interleaving. The `concurrent` test case exercises this with back-to-back writes.

4. **What’s the performance characteristic (target O(n))?**  
   The benchmark with 2 000 invocations (4 000 events) completes in `8.53 ms` → `4.26 µs` per tool call. The algorithm is strictly O(n); memory is bounded by the maximum number of concurrent tools.

## Additional Findings

- Reordered delivery (post-before-pre) is handled by storing orphan posts temporarily; once the pre arrives we emit a completed call.
- Without `toolInvocationId` the fallback key can be ambiguous if the same tool is invoked concurrently by different sessions. We should encourage upstream instrumentation to supply stable IDs.
- Sorting by `(sequence || timestamp)` before processing protects us from clock drift and partial ordering in multi-process environments.

## Recommendations for Phase 1

1. Normalize hook payloads so `toolInvocationId` is always present; if the SDK lacks one, generate UUIDs at hook emission time.  
2. Emit metrics (`pendingPre`, `pendingPost`, drop counts) to spot regressions quickly.  
3. Integrate the benchmark into CI (e.g., `pnpm test -- filter correlation`) to guard the O(n) behaviour as the dataset evolves.

