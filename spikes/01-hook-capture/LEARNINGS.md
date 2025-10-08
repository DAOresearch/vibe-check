# Spike 01 – Hook Capture System

**Time box**: 6 hours  
**Prototype**: `prototype.ts` + `benchmark.ts`

## Questions & Answers

1. **Can we capture hooks to temp files without blocking?**  
   Yes. The prototype queues events in memory and streams them to an NDJSON file using `fs.createWriteStream`. Producers never block on synchronous I/O; they optionally await the returned promise if they want explicit back-pressure.

2. **What’s the performance overhead (<5% target)?**  
   The benchmark (`5000` events) reports `82 ms` end-to-end capture time, or `0.016 ms` per event. Against a conservative `5 s` Claude run this is a `~1.6 %` overhead (see `PERFORMANCE.md`), comfortably below the `5 %` target.

3. **How do we handle write failures gracefully?**  
   The session exposes an `onWriteError` hook. In the demo (`bun run prototype.ts failure`) a simulated disk failure triggers the callback, allowing us to either degrade to in-memory capture or abort the session cleanly. Pending promises are rejected so callers can surface the failure.

4. **What file format works best for hooks?**  
   NDJSON is the best fit: it streams, appends cheaply, works with `tail -f`, and can be replayed incrementally. JSON batches could support pretty-printing but require buffering everything in memory. Recommendation: write NDJSON during runs, export summarized JSON only when bundling artifacts.

5. **When should we clean up temp files?**  
   The prototype supports `cleanupOnClose`. Default recommendation: keep temp files until post-run processing completes (correlation + bundling), then delete them. For long-running sessions (>10 min) we should also add a background cleanup that unlinks files once the bundle is written.

## Notable Findings

- Back-pressure: Node’s `drain` event is sufficient—no dedicated worker thread needed.
- Hooks should include a monotonic timestamp (we fill one when missing); clock skew between processes would complicate correlation.
- Error handling needs telemetry. Logging the first write failure to stderr provided good operator feedback during the spike.

## Recommendations for Phase 1

1. Wrap the prototype in a small service that emits events to both the capture file and an in-memory ring buffer (useful for live debugging).  
2. Persist hook directory metadata (path, run ID, cleanup policy) alongside the NDJSON file so post-processing can auto-discover artifacts.  
3. Add periodic health reporting (bytes written, queue depth) to surface slow disks or quota issues in CI.

