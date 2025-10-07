---
description: Wrap up work session and update progress trackers
allowed-tools: Read, Edit, Glob, Grep
---

# End Work Session

<context>
<session_detection>
# How to Find Today's Session

**Auto-Detection Algorithm**:
1. Get today's date (YYYY-MM-DD format)
2. Search `.claude/tasks/SESSION_LOG/` for files starting with today's date
3. If multiple sessions today, use the most recently modified
4. If no session today, search for most recent session (last 3 days)
5. Parse session file to extract component name and goals

**Session Log Naming**: `YYYY-MM-DD-{component-name}.md`

Example: `2025-10-07-correlation.md`
</session_detection>

<update_algorithms>
# How to Update Progress Trackers

**Algorithm 1: Update PROGRESS.md**
1. Read PROGRESS.md
2. Find the checkbox for the completed component
   - Search for component name (e.g., "correlation.ts")
   - Match task description
3. Replace `[ ]` with `[x]` for completed task
4. If partial completion: Add 🚧 emoji inline
5. Update "Last Updated" date at top
6. Update "Current Phase" if phase just completed

**Algorithm 2: Update TEST_MATRIX.md**
1. Read TEST_MATRIX.md
2. Find section for component or create new row
3. Add test counts:
   - Unit tests: count `it()` blocks in tests/unit/
   - Integration tests: count `it()` blocks in tests/integration/
   - E2E tests: count `it()` blocks in tests/e2e/
4. Add coverage percentage (from test runner output)
5. Update totals at bottom

**Algorithm 3: Update Phase OVERVIEW.md**
1. Identify current phase from PROGRESS.md
2. Read appropriate OVERVIEW.md (e.g., ring1/OVERVIEW.md)
3. Update component status in track listing
4. Mark track complete if all components in track done
5. Update phase completion percentage

**Algorithm 4: Generate Git Commit Message**
1. List files changed (from session log "What We Did")
2. Summarize work done (1-line summary + bullet points)
3. Include test counts and coverage
4. Add reference to issue/spike if applicable
5. End with Claude Code attribution:
   ```
   🤖 Generated with [Vibe Kit](https://vibez.abuusama.dev)

   Co-Authored-By: VibeChecker <vibez@abuusama.dev>
   ```
</update_algorithms>

<file_update_patterns>
# Patterns for Updating Files

**PROGRESS.md Pattern**:
```markdown
### Track 3A: Core Utilities
- [x] src/utils/correlation.ts - Tool call correlation ✅
- [ ] src/utils/hash.ts - SHA-256
```

**TEST_MATRIX.md Pattern**:
```markdown
| Component | Unit | Integration | E2E | Coverage | Status |
|-----------|------|-------------|-----|----------|--------|
| correlation.ts | 10 | 0 | 0 | 98% | ✅ |
```

**Phase OVERVIEW.md Pattern**:
```markdown
**Track 3A: Core Utilities** (1 dev)
- [x] src/utils/correlation.ts ✅ (98% coverage)
- [ ] src/utils/hash.ts (pending)
```
</file_update_patterns>

<test_coverage_validation>
# Coverage Targets

**Kernel (Phase 1)**: ≥95% coverage
**Ring 1-4**: ≥90% coverage
**Utilities**: ≥85% coverage

**Validation**:
- If coverage below target: Flag as warning ⚠️
- If tests failing: Do NOT mark task complete
- If implementation incomplete: Mark as 🚧 not ✅
</test_coverage_validation>
</context>

## Your Task

You are helping the user wrap up their current work session. This involves auto-detecting the active session, updating all progress trackers (PROGRESS.md, TEST_MATRIX.md, phase OVERVIEW.md), documenting what was accomplished, and suggesting a git commit message.

**Why this matters**: Proper session closure ensures progress is documented, team continuity is maintained, and git history accurately reflects work done.

**Expected output**:
- Session summary (what was completed)
- All progress trackers updated automatically
- Test coverage validated against targets
- Blockers documented if any
- Git commit message suggested
- Next steps identified
- Session log finalized

## Process

Auto-detect and finalize the current session:

1. **Find today's session log**:
   - Get today's date (2025-10-07)
   - Glob `.claude/tasks/SESSION_LOG/2025-10-07-*.md`
   - If multiple, use most recently modified
   - If none today, search last 3 days and inform user
   - Read session log to extract goals and component name

2. **Assess what was completed**:
   - Review session goals from session log
   - Check which goals are complete (ask user if unclear from context)
   - Determine completion percentage (0%, partial, 100%)
   - Identify any blockers encountered

3. **Update PROGRESS.md**:
   - Find task checkbox for this component
   - If fully complete: Mark [x] and add ✅
   - If partial: Keep [ ] but add 🚧 inline
   - If blocked: Add ❌ with blocker note
   - Update "Last Updated" date

4. **Update TEST_MATRIX.md**:
   - Add/update row for component
   - Count tests: Grep for `it(` in test files
   - Add coverage % (from test output or estimate)
   - Update totals

5. **Update Phase OVERVIEW.md**:
   - Update component status in appropriate track
   - Recalculate phase completion %
   - Mark track complete if all components in track done

6. **Validate test coverage**:
   - Check coverage against target (95% kernel, 90% rings, 85% utils)
   - If below target: Add warning ⚠️
   - If tests failing: Recommend NOT committing yet

7. **Fill session log "What We Did"**:
   - Document completed work
   - List files changed
   - Note challenges and solutions
   - Document any blockers
   - Add learnings

8. **Generate git commit message**:
   - Format: `[Phase N] Brief summary\n\nBullets\n\nClaude attribution`
   - Include test counts and coverage
   - Reference issues/spikes if applicable

9. **Identify next steps**:
   - Based on completion, what should happen next session?
   - List 1-3 immediate next tasks
   - Note any dependencies

Use parallel tool execution: Read PROGRESS.md, TEST_MATRIX.md, phase OVERVIEW.md, and session log simultaneously.

<examples>
<example index="1">
<scenario>Fully complete session - all goals met, high coverage</scenario>

<input>
User invokes: `/tasks/end-session`

Auto-detected: `.claude/tasks/SESSION_LOG/2025-10-07-correlation.md`

Session goals:
1. Implement correlation algorithm ✅
2. Handle edge cases ✅
3. Achieve O(n) performance ✅
4. Write comprehensive tests ✅

Test results: 10 unit tests, all passing, 98% coverage
</input>

<expected_output>
✅ Session Complete

**Session**: 2025-10-07 - Tool Call Correlation
**Duration**: 3.5 hours
**Component**: src/utils/correlation.ts

**Completed** ✅:
- ✅ Implemented correlation algorithm (O(n) performance)
- ✅ Handled edge cases (missing PostToolUse, concurrent calls)
- ✅ Wrote 10 unit tests (all passing)
- ✅ Achieved 98% coverage (target: 95% ✅)

**Files Changed**:
- src/utils/correlation.ts (+180 lines)
- tests/unit/utils/correlation.test.ts (+150 lines)

**Test Results**:
- Unit tests: 10/10 passing ✅
- Coverage: 98% (exceeds target of 95% ✅✅)

**Progress Trackers Updated**:
- ✅ PROGRESS.md: Checked off correlation task
- ✅ TEST_MATRIX.md: Added 10 unit tests, 98% coverage
- ✅ kernel/README.md: Documented correlation API
- ✅ SESSION_LOG/2025-10-07-correlation.md: Filled "What We Did"

**Blockers**: None ✅

**Learnings**:
- Hash map approach from Spike 3 worked perfectly
- Concurrent calls required sequence number tracking
- Performance is O(n) as designed

**Next Steps**:
1. Start SDK bridge (src/sdk/bridge.ts)
2. Use learnings from Spike 2
3. Target: Complete by tomorrow

**Suggested Git Commit**:
```bash
git add src/utils/correlation.ts tests/unit/utils/correlation.test.ts .claude/tasks/

git commit -m "$(cat <<'EOF'
[Phase 1] Implement tool call correlation algorithm

- Add correlation algorithm with O(n) performance
- Handle missing PostToolUse gracefully
- Support concurrent tool calls with sequence tracking
- Add 10 unit tests (98% coverage, target: 95%)

Ref: Spike 3 learnings

🤖 Generated with [Vibe Kit](https://vibez.abuusama.dev)

Co-Authored-By: VibeChecker <vibez@abuusama.dev>
EOF
)"
```

**Status**: Ready to commit ✅
</expected_output>

<reasoning>
Fully successful session with all goals met and coverage exceeding target. The output celebrates the completion, updates all trackers automatically, and provides a polished git commit message. Next steps are clear.
</reasoning>
</example>

<example index="2">
<scenario>Partial completion - implementation done but tests failing</scenario>

<input>
User invokes: `/tasks/end-session`

Auto-detected: `.claude/tasks/SESSION_LOG/2025-10-07-runbundlestore.md`

Session goals:
1. Implement bundle creation ✅
2. Implement bundle reading ✅
3. Write tests 🚧 (written but 3/10 failing)
4. Achieve 95% coverage ❌ (only 70% due to failing tests)
</input>

<expected_output>
⚠️ Session Incomplete (Tests Failing)

**Session**: 2025-10-07 - Implement RunBundleStore
**Duration**: 4 hours
**Component**: src/storage/RunBundleStore.ts

**Completed** 🚧:
- ✅ Implemented bundle creation (createBundle method)
- ✅ Implemented bundle reading (readBundle method)
- 🚧 Wrote 10 unit tests (7/10 passing, 3 failing)
- ❌ Coverage: 70% (target: 95%, gap: 25%)

**Test Failures**:
1. **Test**: "handles concurrent writes to same bundle"
   - **Error**: Race condition in NDJSON append
   - **Fix needed**: Add file locking

2. **Test**: "preserves content integrity (hash verification)"
   - **Error**: Hash mismatch on read
   - **Fix needed**: Debug hash calculation

3. **Test**: "provides lazy file accessors (text(), stream())"
   - **Error**: Stream not properly initialized
   - **Fix needed**: Review lazyFile integration

**Files Changed**:
- src/storage/RunBundleStore.ts (+220 lines)
- tests/unit/storage/runBundle.test.ts (+180 lines)

**Progress Trackers Updated**:
- 🚧 PROGRESS.md: Marked as in-progress (not complete)
- 🚧 TEST_MATRIX.md: Added 10 tests (7 passing, 3 failing)
- 🚧 ring1/OVERVIEW.md: Storage track at 50%

**Blockers**:
1. **Race condition in NDJSON append** (High priority)
   - Need to add file locking mechanism
   - Estimated fix: 1-2 hours

2. **Hash verification failing** (Medium priority)
   - Debug hash calculation logic
   - Estimated fix: 30 min

**Next Steps**:
1. **Fix test failures** (Priority: Critical)
   - Add file locking for concurrent writes
   - Debug hash verification
   - Review lazyFile stream initialization
2. **Re-run tests** until all passing
3. **Bring coverage to 95%+**
4. **Then mark complete**

**Suggested Action**: ⚠️ DO NOT COMMIT YET

**Recommendation**:
Fix the 3 failing tests before committing. Tests must pass and coverage must meet 95% target for kernel components.

**Session Log**: Updated with failure details for next session
</expected_output>

<reasoning>
Session made progress but not complete due to test failures. The output clearly marks the task as in-progress (🚧 not ✅), documents the specific test failures with fix recommendations, and warns NOT to commit yet. Progress trackers show partial completion.
</reasoning>
</example>

<example index="3">
<scenario>Blocker encountered - cannot complete due to dependency</scenario>

<input>
User invokes: `/tasks/end-session`

Auto-detected: `.claude/tasks/SESSION_LOG/2025-10-07-vibetest.md`

Session goals:
1. Implement vibeTest fixtures ✅
2. Integrate with AgentRunner ❌ (blocked - ContextManager missing)
3. Write tests ⚠️ (cannot test without integration)

Work stopped due to missing ContextManager dependency.
</input>

<expected_output>
❌ Session Blocked (Dependency Missing)

**Session**: 2025-10-07 - Implement vibeTest
**Duration**: 2 hours (stopped early)
**Component**: src/testing/vibeTest.ts

**Completed** 🚧:
- ✅ Implemented fixture structure (test.extend wrapper)
- ✅ Created VibeTestContext type definitions
- ❌ Cannot integrate with AgentRunner (ContextManager missing)
- ❌ Cannot write tests (integration blocked)

**Blocker Discovered**:
**Issue**: ContextManager from Ring 1 not implemented yet
- **Impact**: Cannot complete vibeTest integration
- **Why**: vibeTest.runAgent() depends on AgentRunner, which depends on ContextManager
- **Severity**: Critical (blocks entire Ring 2 progress)

**Resolution Path**:
1. **PAUSE vibeTest work**
2. **Switch to Ring 1**: Complete ContextManager
3. **Then resume vibeTest** (after Ring 1 complete)

**Files Changed**:
- src/testing/vibeTest.ts (+80 lines, incomplete)
- src/testing/context.ts (+40 lines, type definitions only)

**Progress Trackers Updated**:
- 🚧 PROGRESS.md: Marked vibeTest as blocked ❌
- 🚧 TEST_MATRIX.md: No tests (cannot test yet)
- ❌ ring2/OVERVIEW.md: vibeTest track blocked
- 📝 PROGRESS.md "Blockers" section: Added blocker note

**Next Steps**:
1. ❌ **DO NOT continue vibeTest work**
2. ✅ **Switch to ContextManager** (Ring 1, Priority: Critical)
3. ✅ **Complete Ring 1 Agent System**
4. ✅ **Then resume vibeTest**

**Suggested Action**: ⚠️ COMMIT PARTIAL WORK, THEN SWITCH TASKS

**Suggested Git Commit** (for partial work):
```bash
git add src/testing/vibeTest.ts src/testing/context.ts .claude/tasks/

git commit -m "$(cat <<'EOF'
[Phase 3] WIP: Start vibeTest fixture structure (blocked)

- Add vibeTest test.extend wrapper (partial)
- Add VibeTestContext type definitions
- BLOCKED: Cannot integrate with AgentRunner (ContextManager missing)

Next: Complete Ring 1 ContextManager before continuing

🤖 Generated with [Vibe Kit](https://vibez.abuusama.dev)

Co-Authored-By: VibeChecker <vibez@abuusama.dev>
EOF
)"
```

**Recommendation**:
Commit partial work to save progress, then switch to completing Ring 1 Agent System. Do not continue Ring 2 until Ring 1 is fully complete (radial architecture requirement).

**Session Log**: Updated with blocker details
</expected_output>

<reasoning>
Session blocked due to missing dependency. The output clearly identifies the blocker, explains why it's blocking, provides a resolution path, and recommends committing partial work before switching tasks. The git commit message uses "WIP:" prefix and explains the block.
</reasoning>
</example>

<example index="4">
<scenario>Multi-component session - worked on several files</scenario>

<input>
User invokes: `/tasks/end-session`

Auto-detected: `.claude/tasks/SESSION_LOG/2025-10-07-phase-1-final.md`

Session goals:
1. Complete remaining kernel utilities ✅
2. Document kernel API ✅
3. Mark kernel as immutable ✅

Completed: hash.ts, ndjson.ts, git.ts, kernel/README.md, kernel/API.md
</input>

<expected_output>
✅ Session Complete (Multi-Component)

**Session**: 2025-10-07 - Complete Phase 1 Kernel
**Duration**: 6 hours
**Components**: Multiple (hash, ndjson, git utils + documentation)

**Completed** ✅:
- ✅ Implemented src/utils/hash.ts (SHA-256 content addressing)
- ✅ Implemented src/utils/ndjson.ts (serialize/deserialize)
- ✅ Implemented src/utils/git.ts (git helpers)
- ✅ Documented kernel/README.md (API overview)
- ✅ Documented kernel/API.md (API contracts)
- ✅ Marked kernel as immutable

**Files Changed**:
- src/utils/hash.ts (+120 lines)
- src/utils/ndjson.ts (+90 lines)
- src/utils/git.ts (+150 lines)
- tests/unit/utils/hash.test.ts (+100 lines)
- tests/unit/utils/ndjson.test.ts (+80 lines)
- tests/unit/utils/git.test.ts (+120 lines)
- kernel/README.md (+200 lines)
- kernel/API.md (+150 lines)
- kernel/STABILITY.md (new file, +50 lines)

**Test Results**:
- Hash utilities: 15 tests, 100% coverage ✅
- NDJSON utilities: 12 tests, 98% coverage ✅
- Git utilities: 18 tests, 95% coverage ✅
- **Total**: 45 new tests, all passing ✅

**Progress Trackers Updated**:
- ✅ PROGRESS.md: Checked off hash.ts, ndjson.ts, git.ts, kernel docs
- ✅ TEST_MATRIX.md: Added 45 tests across 3 components
- ✅ kernel/README.md: Complete API documentation
- ✅ Phase 1 marked COMPLETE in PROGRESS.md

**🎉 Milestone: Phase 1 Complete!**
- All kernel components implemented ✅
- 98% average coverage (target: 95% ✅✅)
- Kernel API documented and locked 🔒
- Ready for Ring 1 to begin

**Next Steps**:
1. Begin Phase 2 (Ring 1)
2. Run `/tasks/start-phase 2`
3. Start with Storage System (first track)

**Suggested Git Commit**:
```bash
git add src/utils/ tests/unit/utils/ kernel/ .claude/tasks/

git commit -m "$(cat <<'EOF'
[Phase 1] Complete kernel implementation (Phase 1 DONE)

Utils:
- Add hash.ts (SHA-256 content addressing, 100% coverage)
- Add ndjson.ts (NDJSON serialization, 98% coverage)
- Add git.ts (git helpers, 95% coverage)

Documentation:
- Complete kernel/README.md (API overview)
- Complete kernel/API.md (API contracts)
- Add kernel/STABILITY.md (immutability guarantee)

Tests: +45 unit tests (all passing)
Overall Phase 1: 98% average coverage (target: 95%)

🔒 Kernel is now IMMUTABLE

🤖 Generated with [Vibe Kit](https://vibez.abuusama.dev)

Co-Authored-By: VibeChecker <vibez@abuusama.dev>
EOF
)"
```

**Status**: Phase 1 Complete! Ready to begin Ring 1 🎉
</expected_output>

<reasoning>
Multi-component session completing an entire phase. The output celebrates the milestone (Phase 1 complete), lists all files changed, shows test results across multiple components, and provides a comprehensive commit message. The 🎉 emoji celebrates the phase completion.
</reasoning>
</example>

<example index="5">
<scenario>No session today - user forgot to create session log</scenario>

<input>
User invokes: `/tasks/end-session`

No session log found for today (2025-10-07)
Last session: 2025-10-05 (2 days ago)
</input>

<expected_output>
⚠️ No Active Session Found

**Issue**: No session log found for today (2025-10-07)

**Last Session**: 2025-10-05 (2 days ago)
- Component: src/utils/correlation.ts
- Status: Completed ✅

**Possible Reasons**:
1. Forgot to run `/tasks/create-session` before starting work
2. Working ad-hoc without session tracking
3. Session log created with wrong date

**Recommendation**:

If you did work today:
1. Run `/tasks/create-session {component}` now (retroactive)
2. Fill in session details manually
3. Then run `/tasks/end-session` again

If you haven't started work yet:
1. Run `/tasks/check-progress` to see what's next
2. Run `/tasks/create-session` to plan your session
3. Then begin working

**Next Command**: `/tasks/create-session` or `/tasks/check-progress`
</expected_output>

<reasoning>
Handles the case where user forgot to create a session log. Provides helpful guidance on how to recover (create retroactive session or start new one). Doesn't fail silently - gives clear explanation and next steps.
</reasoning>
</example>
</examples>

## Success Criteria

- [ ] Today's session log auto-detected (or last 3 days searched)
- [ ] Session completion assessed (full, partial, or blocked)
- [ ] PROGRESS.md updated with correct task status
- [ ] TEST_MATRIX.md updated with test counts and coverage
- [ ] Phase OVERVIEW.md updated with component status
- [ ] Test coverage validated against targets
- [ ] Session log "What We Did" section filled
- [ ] Git commit message generated with proper format
- [ ] Next steps identified
- [ ] If tests failing: Warning NOT to commit
- [ ] If blocker found: Clear resolution path provided
- [ ] If phase complete: Celebratory tone with milestone announcement
