# Semrush Functional Parity Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a provenance-aware SEO intelligence parity layer for Digital Dominance and wire it into the existing generator without adding a paid dependency.

**Architecture:** A pure normalizer builds eight Semrush-like capability modules from existing owned signals and bounded competitor evidence. The current `seoGenerator` remains the single entry point and the existing Semrush adapter is retained as an optional verifier.

**Tech Stack:** Node ESM, Base44 backend functions, Google Search Console, GA4, PageSpeed Insights, existing GitHub/Vercel preview pipeline.

**Spec:** `docs/superpowers/specs/2026-09-27-semrush-functional-parity-design.md`

## Global Constraints
- No new database schema, secrets, scheduler, or autonomous spend.
- Never upgrade PARTIAL/BLOCKED evidence to VERIFIED without direct provenance.
- Existing `runFullCycle` behavior remains backward-compatible.
- Production promotion requires exact-SHA validation.

## Review Focus
- Stale GSC snapshots must not be treated as current rank evidence.
- Duplicate query observations must not inflate keyword coverage.
- LLM competitor records must remain PARTIAL.
- Missing GA/CWV inputs must yield BLOCKED/PARTIAL modules, not zero-valued fake metrics.
- Semrush unavailability must not fail owned-data parity.

### Task 1: Pure parity core
**Files:** Create `base44/shared/seoParity.mjs`; create `scripts/seo-parity.test.mjs`.
**Produces:** `buildParitySnapshot(input)` and `summarizeParity(snapshot)`.
- [x] Write failing tests for provenance, dedupe, stale data, and missing-source behavior.
- [x] Run tests and confirm failure because module is absent.
- [x] Implement the minimal pure module.
- [x] Run tests and confirm pass.

### Task 2: Runtime integration
**Files:** Modify `base44/functions/seoGenerator/entry.ts`; modify `package.json`.
**Consumes:** `buildParitySnapshot`.
**Produces:** `seoGenerator` action `semrushParity`.
- [ ] Add runtime contract assertions for action/import behavior.
- [ ] Wire canonical registry, SeoContent, GA sync, CWV, technical audit, CompetitorInsight, and Semrush preflight into the parity snapshot.
- [ ] Keep all unavailable sources explicit and non-fatal.
- [ ] Add `test:seo-parity` script.

### Task 3: Documentation and validation
- [ ] Run parity tests, existing Semrush tests, and Alpha Prime regressions.
- [ ] Verify Vercel preview READY at the exact final SHA.
- [ ] Inspect preview runtime/build errors.
- [ ] Mark PR ready and merge only if clean; verify production deployment exact SHA.
