# README Architectural Comparison: README.md vs readme-exp.mdx

> **Deep comparison of architectural, DX, and structural differences between the two README versions**

## Executive Summary

The two READMEs represent fundamentally different approaches to documenting Vibe Check:

- **README.md** (1665 lines): Tutorial-first, high example density, progressive learning, testing-centric
- **readme-exp.mdx** (520 lines): Reference-first, API-centric, dual-purpose (automation + evaluation), production-focused

**Key Strategic Shift in readme-exp.mdx:**
1. **Product Identity**: From "testing framework" → "automation AND evaluation platform"
2. **Reporting**: From "feature" → "killer feature" (production-grade emphasis)
3. **API**: From scattered examples → consolidated TypeScript reference
4. **Entry Points**: From single path → dual Quick Start (automation + evaluation)

---

## 1. Architectural Differences

### 1.1 Product Identity & Positioning

| Aspect | README.md | readme-exp.mdx |
|--------|-----------|----------------|
| **Tagline** | "Vitest-based testing framework for Claude Code slash commands" | "Automation _and_ Evaluation for Claude Code — on top of Vitest" |
| **Primary Identity** | Testing framework | **Dual-purpose tool** (automation + evaluation) |
| **Use Case Framing** | Primary: Testing & Benchmarking<br>Secondary: LLM Judge | **Equal weight**: Automation Suite + Evaluation Framework |
| **Mental Model** | Run tests on agents | Run agent pipelines **OR** benchmark agents |

**Impact**: readme-exp.mdx positions Vibe Check as **two tools in one**, broadening the audience beyond QA/testing to include operational automation workflows.

---

### 1.2 Reporting as a Differentiator

| Aspect | README.md | readme-exp.mdx |
|--------|-----------|----------------|
| **Reporting Treatment** | Feature in "Reporters" section | **"Killer feature"** (3rd bullet in intro) |
| **Emphasis** | "HTML report at `./vibe-report.html`" (output detail) | "Production-grade reporting—costs, tokens, timelines, transcripts, todos, artifacts" |
| **Always On?** | Implied (needs config) | Explicit: "Ship with **rich terminal + HTML reports** by default" |

**Impact**: readme-exp.mdx elevates reporting from "nice output" to a **first-class product feature**, targeting teams needing audit trails, cost tracking, and stakeholder visibility.

---

### 1.3 API Documentation Philosophy

| Aspect | README.md | readme-exp.mdx |
|--------|-----------|----------------|
| **API Location** | Distributed across narrative sections | **Consolidated "API Reference" section** |
| **Type Signatures** | Shown inline with examples | **Complete TypeScript types** in dedicated section |
| **Learn By** | Examples → infer API | Types → build examples |
| **Length** | ~1665 lines (tutorial style) | ~520 lines (reference style) |

**Impact**:
- README.md is **tutorial-first** (learn by doing)
- readme-exp.mdx is **reference-first** (learn by API, then apply)

Experienced developers prefer readme-exp.mdx for faster lookup; beginners prefer README.md for hand-holding.

---

### 1.4 Quick Start Strategy

| Aspect | README.md | readme-exp.mdx |
|--------|-----------|----------------|
| **Examples** | Single: "Write Your First Test" (refactor with cost assertion) | **Two paths**: (1) "First Automation" (pipeline), (2) "First Evaluation" (benchmark) |
| **Entry Point** | Testing mindset assumed | **Choose your adventure**: automation OR evaluation |
| **Onboarding** | Linear: install → test → explore | Branching: install → config → pick use case → explore |

**Impact**: readme-exp.mdx **immediately demonstrates dual identity** with two working examples. Users self-select into automation or evaluation paths, reducing cognitive load.

---

### 1.5 Core Concepts Presentation

| Section | README.md | readme-exp.mdx |
|---------|-----------|----------------|
| **Prompts** | "Prompt Builder API" (dedicated section, ~100 lines) | "Prompts (atomic units)" (brief, ~10 lines) |
| **Agents** | "Agent Builder & Configuration" (progressive, ~250 lines) | "Agent Configuration" (direct, ~30 lines) + API Reference |
| **Results** | Implied (shown in examples) | Explicit: "Results (what you get back)" with `RunResult` type |
| **Matchers** | "Assertions & Matchers" section | "Matchers (quality gates)" 1-liner list |
| **Judges** | "LLM-Based Evaluation" section (~150 lines) | "Judges (LLM evaluation)" 1-liner + dedicated section |

**Impact**:
- README.md teaches **how to build** (builder pattern emphasis)
- readme-exp.mdx teaches **what exists** (concept + type reference)

---

### 1.6 Matrix Testing Philosophy

| Aspect | README.md | readme-exp.mdx |
|--------|-----------|----------------|
| **Intro** | "Matrix testing is simple: provide an array, get test dimensions" | "Rule: Any array in matrix is a dimension" |
| **Examples** | Progressive: simple (2-model) → multi-dim (2×2) → advanced (4 agents) | Single comprehensive (2 agents × 2 maxTurns) |
| **Metadata** | Shown with `task.meta.cost` for comparison | Mentioned briefly |

**Impact**: readme-exp.mdx is **more concise but assumes familiarity** with Cartesian products. README.md teaches step-by-step.

---

### 1.7 Source Management Depth

| Aspect | README.md | readme-exp.mdx |
|--------|-----------|----------------|
| **Detail Level** | 3 subsections: Temp, Local, Git (each ~40 lines) | Single "Project Source Management" section (~20 lines) |
| **Worktree Isolation** | Dedicated subsection with cleanup policies, mode options | 1 sentence: "All modes support isolation-first behavior" |
| **Safety** | Emphasized with examples | Stated upfront: "Original files never modified" |

**Impact**: README.md explains **how isolation works**; readme-exp.mdx states **that isolation works**. Reference vs tutorial.

---

### 1.8 Example Density & Use Cases

| Aspect | README.md | readme-exp.mdx |
|--------|-----------|----------------|
| **Inline Examples** | ~30+ code blocks (distributed) | ~10-15 code blocks (focused) |
| **Dedicated Use Cases** | 3 detailed scenarios (end of doc): benchmark models, tool allowlisting, cost-quality tradeoff | "Automation Use Cases" + "Evaluation Use Cases" (brief) + "Examples & Recipes" (minimal bullets) |
| **Common Scenarios** | "Common Testing Scenarios" section with 5+ detailed examples | Omitted (assumes users adapt API Reference examples) |

**Impact**:
- README.md is **copy-paste friendly** for common patterns
- readme-exp.mdx expects developers to **compose from API primitives**

---

## 2. Developer Experience (DX) Differences

### 2.1 Learning Curve

| Aspect | README.md | readme-exp.mdx |
|--------|-----------|----------------|
| **For Beginners** | Hand-holding, tutorial style | Jump right in, assumes testing knowledge |
| **For Experienced Devs** | Slower (must read narrative) | Faster (scan ToC → API Reference) |
| **Time to First Run** | ~5-10 min (read Quick Start + config) | ~2-5 min (Quick Start has 2 working examples) |

---

### 2.2 Mental Model Formation

| Model | README.md | readme-exp.mdx |
|-------|-----------|----------------|
| **Primary** | vibeTest = Vitest test for agents | vibeTest = automation step OR evaluation gate |
| **Secondary** | Agents are test subjects | Agents are pipeline workers OR benchmark configurations |
| **Reporting** | Test output | **Production artifact** (audit trail, cost tracking) |

**Impact**: readme-exp.mdx **broadens the mental model** beyond testing to include operational workflows (automation).

---

### 2.3 Discoverability

| Need | README.md | readme-exp.mdx |
|------|-----------|----------------|
| "Can this do X?" | Read narrative sections | Check "Why vibe-check?" bullets + ToC |
| "How do I use X?" | Search for section, read examples | Jump to API Reference + check Core Concepts |
| "What are all options for X?" | Read Agent Builder section | Check `defineAgent(spec)` type signature |

**Impact**: readme-exp.mdx is **better for random-access lookup**; README.md is **better for sequential learning**.

---

### 2.4 Type Information Access

| Aspect | README.md | readme-exp.mdx |
|--------|-----------|----------------|
| **Type Definitions** | Scattered in examples (`AgentSpec`, `RunResult`, etc.) | **Consolidated in API Reference** |
| **TypeScript Focus** | Implied (examples use TS) | Explicit: "TypeScript-first. Streaming-friendly." |
| **IntelliSense Friendliness** | Must infer types from examples | Types shown upfront → easier autocomplete discovery |

**Impact**: readme-exp.mdx is **more IDE-friendly** for developers using TypeScript tooling.

---

### 2.5 First Impression

When a developer lands on the README:

| README.md | readme-exp.mdx |
|-----------|----------------|
| "This is for **testing** my Claude Code workflows" | "This is for **automating OR evaluating** Claude Code workflows" |
| "Focus: quality assurance" | "Focus: automation + evaluation + **production reporting**" |
| "I can write tests with custom matchers" | "I can run pipelines, benchmark configs, and get rich reports" |

---

### 2.6 Navigation & Structure

| Aspect | README.md | readme-exp.mdx |
|--------|-----------|----------------|
| **Table of Contents** | Absent (rely on headings) | **Present** (14-item ToC) |
| **Sections** | ~15 major sections (deep nesting) | ~12 major sections (flatter hierarchy) |
| **API Scattered?** | Yes (prompt API, agent config, matchers, etc. in separate sections) | No (single "API Reference") |

**Impact**: readme-exp.mdx is **easier to scan** and navigate for experienced developers.

---

## 3. Structural Organization Comparison

### 3.1 README.md Structure

```
What is Vibe Check?
├── Primary Use Case
└── Secondary Use Case
Features (bullet list)
Quick Start
├── Install
├── Write Your First Test
├── Configure Vitest
└── Run Tests
Prompt Builder API (~100 lines)
├── API Signature
├── Simple Prompts
├── Prompts with Attachments
├── Prompts with Commands
├── Reusable Patterns
├── Composing
└── Matrix Testing with Prompts
Agent Builder & Configuration (~250 lines)
├── Simple Agent
├── Options
├── Project Sources (3 subsections)
├── System Prompts
├── Custom Commands
├── Overrides
├── Matrix Testing with Agents
└── Registry (Optional)
Common Testing Scenarios (5+ examples)
Matrix Testing (4 progressive examples)
Assertions & Matchers
Structured Results
Debugging & Error Handling
LLM-Based Evaluation
Reporters
Using as LLM Judge (standalone)
Architecture
Development Automation
Documentation links
Project Status
Example Use Cases (3 detailed)
License
```

**Total**: ~1665 lines, tutorial style, high example density

---

### 3.2 readme-exp.mdx Structure

```
Title + Tagline
Why vibe-check?
├── As an Automation Suite (4 bullets)
└── As an Evaluation Framework (4 bullets)
Quick Start
├── Install
├── Create Config
├── First Automation (pipeline example)
└── First Evaluation (benchmark example)
Core Concepts (brief 6 items)
Agent Configuration (direct, 1 example)
Project Source Management (concise)
Automation Use Cases (brief)
Evaluation Use Cases (brief)
Matrix Testing (single comprehensive example)
Rich Reporting (brief)
LLM Judges & Rubrics (focused)
API Reference (consolidated)
├── vibeTest
├── prompt
├── defineAgent (with full types)
├── runAgent (with full types)
├── judge
└── defineTestSuite
Advanced Topics (brief bullets)
Examples & Recipes (minimal)
Status
License
```

**Total**: ~520 lines, reference style, focused examples

---

## 4. What's Better in Each?

### 4.1 README.md Strengths

✅ **Tutorial-friendly** for complete beginners
✅ **High example density** (30+ code blocks) → copy-paste ready
✅ **Progressive learning** (simple → complex)
✅ **Explains mechanisms** (how worktrees work, isolation behavior)
✅ **Common Scenarios** section shows real-world patterns
✅ **Detailed Use Cases** at end (benchmark, tool safety, cost-quality)

**Best for**: Developers new to agent testing, learning by example

---

### 4.2 readme-exp.mdx Strengths

✅ **Clearer product positioning** (dual identity: automation + evaluation)
✅ **3x shorter** (~520 vs ~1665 lines) → faster scanning
✅ **Table of Contents** upfront
✅ **Consolidated API Reference** with full TypeScript types
✅ **Reporting as killer feature** (production-grade emphasis)
✅ **Two Quick Start paths** (automation + evaluation)
✅ **Reference-style** → better for lookup/IDE autocomplete
✅ **TypeScript-first** presentation

**Best for**: Experienced developers, teams needing automation + evaluation, reference lookups

---

## 5. Critical Architectural Takeaways

### 5.1 Product Framing Shift

readme-exp.mdx **reframes Vibe Check** from a testing-centric tool to a **dual-purpose automation + evaluation platform**. This is a strategic positioning change that broadens the audience.

### 5.2 Reporting Elevation

Moving reporting from "feature" to "killer feature" emphasizes **production-ready outputs** (audit trails, cost tracking, stakeholder reports). This targets teams, not just individual developers.

### 5.3 API Consolidation

readme-exp.mdx treats API documentation as **first-class** with a dedicated reference section containing full TypeScript types. This is more maintainable and IDE-friendly.

### 5.4 Entry Point Diversity

Providing **two Quick Start examples** (automation + evaluation) immediately demonstrates dual capabilities and lets users self-select their path.

### 5.5 Conciseness as a Feature

At 520 lines (vs 1665), readme-exp.mdx respects developer time. It's **scannable, navigable, and reference-friendly** without sacrificing completeness.

---

## 6. Merge Strategy Recommendation

**Goal**: Combine the strengths of both approaches

### 6.1 Primary README (Adopt readme-exp.mdx structure)

✅ Use readme-exp.mdx as **base structure**:
- Table of Contents upfront
- Dual Quick Start (automation + evaluation)
- Consolidated API Reference with TypeScript types
- Concise Core Concepts
- Reporting as killer feature

### 6.2 Extract Tutorial Content to Separate Docs

Move README.md's deep tutorial content to dedicated guides:

```
docs/
├── GUIDE.md          # Progressive tutorial (README.md style)
├── RECIPES.md        # Common Testing Scenarios → here
├── EXAMPLES.md       # 3 detailed use cases → here
└── ADVANCED.md       # Worktree isolation deep dive → here
```

### 6.3 What to Add Back from README.md

1. **Common Testing Scenarios** → `docs/RECIPES.md`
   - Quality Gates for Slash Commands
   - Model Performance Benchmarking
   - Tool Allowlisting for Safety
   - MCP Server Integration Testing

2. **Detailed Use Cases** → `docs/EXAMPLES.md`
   - Benchmark Slash Command Across Models
   - Progressive Tool Access Testing
   - Cost-Quality Tradeoff Analysis

3. **Isolation Deep Dive** → `docs/ADVANCED.md`
   - Worktree isolation mechanisms
   - Cleanup policies
   - Mode options (auto, branch, detached)

4. **Tutorial Content** → `docs/GUIDE.md`
   - Step-by-step prompt building
   - Agent configuration walkthrough
   - Progressive matrix testing examples

### 6.4 Benefits of This Approach

✅ **Scannable README** (like readme-exp.mdx) for quick understanding
✅ **Deep tutorial content** (like README.md) for learning
✅ **Clear documentation hierarchy**:
- README → product overview + API reference
- GUIDE → step-by-step learning
- RECIPES → copy-paste patterns
- EXAMPLES → real-world scenarios
- ADVANCED → mechanisms and internals

✅ **Better SEO/discoverability** (concise main README)
✅ **Easier maintenance** (separate concerns)
✅ **Serves both audiences**:
- Experienced devs → README + API Reference
- Beginners → README + GUIDE + RECIPES

---

## 7. Implementation Checklist

### Phase 1: Adopt readme-exp.mdx Structure
- [ ] Replace README.md with readme-exp.mdx structure
- [ ] Keep ToC, dual Quick Start, API Reference
- [ ] Preserve "killer feature" reporting emphasis

### Phase 2: Extract Tutorial Content
- [ ] Create `docs/GUIDE.md` with progressive learning path
- [ ] Create `docs/RECIPES.md` with Common Testing Scenarios
- [ ] Create `docs/EXAMPLES.md` with 3 detailed use cases
- [ ] Create `docs/ADVANCED.md` with isolation deep dive

### Phase 3: Link from Main README
- [ ] Add "Documentation" section with links:
  - 📚 [Complete Guide](./docs/GUIDE.md) - Step-by-step tutorial
  - 🧪 [Recipes & Patterns](./docs/RECIPES.md) - Common scenarios
  - 💡 [Real-World Examples](./docs/EXAMPLES.md) - Detailed use cases
  - 🔧 [Advanced Topics](./docs/ADVANCED.md) - Internals & mechanisms

### Phase 4: Validate
- [ ] Test Quick Start examples (both automation + evaluation)
- [ ] Verify API Reference completeness
- [ ] Ensure all TypeScript types are accurate
- [ ] Check links and navigation

---

## 8. Conclusion

**readme-exp.mdx is the superior foundation** for the main README due to:

1. **Strategic positioning** (automation + evaluation vs testing-only)
2. **Production focus** (reporting as killer feature)
3. **Developer efficiency** (3x shorter, scannable, API reference)
4. **Dual entry points** (serves both automation and evaluation users)
5. **TypeScript-first** (better IDE integration)

**README.md's strengths should be preserved** in separate documentation:

- Tutorial depth → `docs/GUIDE.md`
- Copy-paste patterns → `docs/RECIPES.md`
- Real-world scenarios → `docs/EXAMPLES.md`
- Mechanisms/internals → `docs/ADVANCED.md`

This approach gives you:
- A **concise, scannable README** for quick understanding and API lookup
- **Deep tutorial content** for learning and mastery
- **Clear documentation hierarchy** serving both experienced and beginner audiences

---

**Next Step**: Implement Phase 1 (adopt readme-exp.mdx structure) and validate with team feedback before extracting tutorial content.
