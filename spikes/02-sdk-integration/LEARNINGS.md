# Spike 02 – SDK Integration

**Time box**: 6 hours  
**Prototype artefacts**: `bridge.ts`, `recorder.ts`, `replayer.ts`, example scripts + fixtures

## Questions & Answers

1. **What do we need to record from `query()`?**  
   All `SDKMessage` shapes (`system`, `user`, `assistant`, `result`, `stream_event`) plus timing metadata. The recorder wraps each message with an index and `offsetMs` so we can reconstruct ordering and relative delays. We also persist the original request payload and the SDK semver.

2. **What recording format works best (JSON vs NDJSON)?**  
   - JSON snapshot (`sample-recording.json`): 2 487 bytes, human readable, great for debugging.  
   - NDJSON stream (`sample-recording.ndjson`): 1 900 bytes (≈ 24 % smaller), append-only, ready for tailing and incremental parsing.  
   Recommendation: default to NDJSON for runs, optionally emit a JSON bundle for inspection tooling.

3. **Can we replay the message stream deterministically?**  
   Yes. `replayRecording()` re-yields the captured sequence with optional timing preservation. `examples/test-replay.ts` confirms JSON and NDJSON replays deliver the same message types and counts across runs.

4. **How do we handle timing/randomness in replay?**  
   `offsetMs` is stored per message. The replayer can either ignore timing (fast mode) or respect it with a `speedMultiplier` (e.g., `0.5` to slow down for demos). Random UUIDs in live runs are kept so downstream tools receive the same identifiers.

5. **Can we version recordings by SDK semver?**  
   The bridge exposes `getSdkVersion()`; recordings embed this value in metadata. With the real SDK present we read `sdk.version`; otherwise we fall back to the stub version.

6. **How do we detect SDK version mismatches?**  
   `loadRecording()` returns the recorded semver. Phase 1 should compare it against `getSdkVersion()` at replay time and surface a warning/error if they diverge. (Prototype logs metadata for manual inspection.)

## Additional Insights

- The bridge auto-falls back to a local stub unless `VIBE_AGENT_MODE=live` is set. Credential discovery is left to Claude Code (OAuth token env var, persisted settings, etc.), matching real deployment behavior.
- We should emit both formats from a single stream capture (e.g., derive JSON from the NDJSON artefact) to avoid double-running `query()` and diverging timestamps.
- The stubbed query stream exposed enough variety (tool invocation, streaming delta, terminal result) to validate serialization without touching the network.

## Recommendations for Phase 1

1. Promote the recorder/replayer into `src/sdk/` with a small API: `recordQueryTo(path, options)` and `createReplayer(fixturePath, opts)`.  
2. Add a hash of the recording payload to detect tampering and enable caching in CI.  
3. Gate real SDK usage behind `VIBE_AGENT_MODE=live` (default `testing`) to prevent accidental live calls during tests.
