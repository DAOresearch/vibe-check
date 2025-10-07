# Ring 3: Evaluation & Reporting

**Phase**: Phase 4 (Week 7)
**Status**: 🔜 Not Started
**Dependencies**: Kernel + Ring 1 (Storage) + Ring 2 (vibeTest)

---

## Purpose

Build evaluation and visualization:
1. **Judge System** - LLM-based evaluation with rubrics
2. **Terminal Reporter** - Console cost aggregation
3. **HTML Reporter** - Rich HTML reports

---

## Tracks

### Track 3A: Judge System (2 devs)

**Components**:
- `src/judge/judge.ts` - LLM judge executor
- `src/judge/rubric.ts` - Rubric validation
- `src/judge/prompts.ts` - Prompt formatter
- `src/judge/parser.ts` - Result parser

**Status**: 🔜 Not Started

**Checklist**:
- [ ] judge.ts (0%)
- [ ] rubric.ts (0%)
- [ ] prompts.ts (0%)
- [ ] parser.ts (0%)
- [ ] Unit tests (0/42)
- [ ] Integration tests (0/8)

### Track 3B: Terminal Reporter (1 dev)

**Components**:
- `src/reporters/TerminalCostReporter.ts`

**Status**: 🔜 Not Started

**Checklist**:
- [ ] TerminalCostReporter.ts (0%)
- [ ] Unit tests (0/10)
- [ ] Integration tests (0/5)

### Track 3C: HTML Reporter (2 devs)

**Components**:
- `src/reporters/HtmlReporter.ts`
- `src/reporters/templates/` - HTML templates
- `src/reporters/assets/` - CSS/JS assets

**Status**: 🔜 Not Started

**Checklist**:
- [ ] HtmlReporter.ts (0%)
- [ ] Templates (0/4)
- [ ] Assets (0/2)
- [ ] Unit tests (0/18)
- [ ] Integration tests (0/8)

---

## Integration

**Cross-Track Dependencies**:
- Judge uses vibeTest (Ring 2) for fixture method
- Reporters use Storage (Ring 1) to read bundles
- All depend on Kernel types

**Integration Session**:
- Scheduled: End of Week 7
- Goal: Judge + reporters working with real RunBundles
- Tests: E2E evaluation + report generation

---

## Status Tracking

| Component | Status | Coverage | Tests Passing |
|-----------|--------|----------|---------------|
| Judge | 🔜 | 0% | 0/50 |
| Terminal Reporter | 🔜 | 0% | 0/15 |
| HTML Reporter | 🔜 | 0% | 0/26 |
| **Total** | **🔜** | **0%** | **0/91** |

---

**Next Action**: Complete Ring 2, then begin Ring 3 tracks
