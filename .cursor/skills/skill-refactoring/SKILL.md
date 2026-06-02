---
name: skill-refactoring
description: >-
  Reviews, refactors, and improves existing skills in this project. Use when
  updating a skill's scope, fixing inconsistencies, translating language,
  syncing types across skills, or auditing cross-references in .cursor/skills/.
disable-model-invocation: true
---

# Skill Refactoring

Meta-skill: governs how to improve skills in this project without breaking agent guidance.

## When to use

- A skill's scope changed (e.g., new market regions added)
- Types in one skill drift out of sync with another
- Language needs to change (e.g., Portuguese → English)
- Cross-references point to deleted or renamed files
- A skill's description no longer matches its content
- New mandatory functions or UI patterns were introduced

## Inventory

All project skills live in `.cursor/skills/`:

| Skill | Purpose | Key file |
|-------|---------|----------|
| `portfolio-data-model` | Core domain types and validation | types.ts, schemas.ts |
| `investment-calculations` | Pure calculation functions | scripts/calculations.ts |
| `asset-allocation` | Strategy templates and class catalog | — |
| `contribution-allocation` | Suggest and apply contributions | features/contributions/ |
| `contribution-simulator` | What-if scenarios | — |
| `local-first-storage` | Browser persistence and backup | lib/storage/ |
| `app-screens` | Routes, pages, and MVP checklist | — |

Source of truth for product scope: `docs/product-pages.md`.

## Refactoring checklist

Run this checklist whenever editing a skill:

### 1. Frontmatter

- [ ] `name` matches the folder name exactly
- [ ] `description` is in third person, includes WHAT and WHEN
- [ ] Language is English throughout
- [ ] `disable-model-invocation: true` unless the skill should auto-trigger

### 2. Content consistency

- [ ] All types referenced in this skill match `portfolio-data-model`
- [ ] All function signatures match `investment-calculations/scripts/calculations.ts`
- [ ] File paths in "Suggested file structure" are consistent across skills
- [ ] Route paths (`/app/...`) match `app-screens`
- [ ] No Portuguese remaining in body text

### 3. Cross-references

- [ ] Every `[skill-name](../skill-name/SKILL.md)` link resolves
- [ ] No references to deleted skills (e.g., `portfolio-rebalancing`)
- [ ] Links are one level deep only (no `../a/b/c`)

### 4. Scope alignment (multi-market)

- [ ] `AssetClass` includes `market: MarketRegion`
- [ ] `Asset` includes `currency: CurrencyCode` and `valueInBase`
- [ ] `Portfolio` includes `baseCurrency` and `fxRates`
- [ ] Templates cover BR-only, International-only, and Mixed profiles
- [ ] Formatting functions handle both BRL and foreign currencies
- [ ] Contributions support `currency` and `fxRateAtTime`

### 5. Size and quality

- [ ] `SKILL.md` is under 500 lines
- [ ] Heavy content is in `reference.md`, not inline
- [ ] Examples are concrete numbers, not abstractions

## Process: translating a skill to English

1. Read the existing skill fully.
2. Translate body text, comments, and copy strings to English.
3. Keep all type names, interface names, and identifiers in English (they already should be).
4. Update the frontmatter `description` to English.
5. Run the checklist above.
6. Check that cross-reference skills are also updated (do not leave mixed-language sets).

## Process: expanding scope

When a skill's domain changes (e.g., adding international assets):

1. Start from `portfolio-data-model` — types propagate to all other skills.
2. Update `investment-calculations` — calculation logic may change (FX conversion).
3. Update `asset-allocation` — add new templates and asset class catalog.
4. Update downstream skills (`contribution-allocation`, `contribution-simulator`, `app-screens`).
5. Update `app-screens` last — it reflects all other changes in UI spec.

## Process: fixing type drift

If a type in one skill diverges from `portfolio-data-model`:

- `portfolio-data-model` is always the source of truth.
- Copy the canonical interface into the affected skill.
- Update the script in `investment-calculations/scripts/calculations.ts` to match.

## Cross-References

- All skills: `.cursor/skills/`
- Product spec: `docs/product-pages.md`
