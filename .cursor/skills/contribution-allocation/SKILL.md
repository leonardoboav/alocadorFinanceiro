---
name: contribution-allocation
description: >-
  Implements contribution suggestion and recording: distributes a contribution
  amount across asset classes, shows before/after preview, and persists the
  result. Supports contributions in any currency. Use when building /app/contributions,
  the dashboard quick-contribute widget, or the contribution history feature.
disable-model-invocation: true
---

# Contribution Allocation

Core product feature: turns a contribution amount into a concrete, per-class distribution.

## When to use

- Implementing `/app/contributions`
- "Quick contribute" button on the dashboard
- Recording a contribution and updating `currentValueInBase` + `contributions[]`
- Showing before/after comparison chart

## Screen flow

```text
1. User enters contribution amount + currency (default: portfolio.baseCurrency)
2. If currency != baseCurrency → convert using fxRates (or show manual conversion warning)
3. System computes suggestion via suggestContributionByDeficit()
4. UI shows table: class | market | deficit | suggested | % of contribution
5. Preview: donut chart current vs post-contribution
6. User confirms or edits manually
7. On confirm: applyContribution() → persist + history entry
```

## Required functions

### `suggestContribution(classes, amountInBase)`

Delegates to `suggestContributionByDeficit()` in [investment-calculations](../investment-calculations/SKILL.md).

Enriched return for UI:

```typescript
interface ContributionSuggestion {
  totalAmountInBase: number;
  baseCurrency: CurrencyCode;
  lines: Array<{
    classId: string;
    className: string;
    market: MarketRegion;
    suggestedAmountInBase: number;
    percentOfContribution: number;  // suggestedAmount / total * 100
    deficitBefore: number;
  }>;
  projectedSnapshots: ClassSnapshot[];
  allAligned: boolean;
  disclaimer: string;
}
```

`disclaimer` is always non-empty — see required UI copy below.

### `applyContribution(portfolio, lines, currency, fxRateAtTime?, source, notes?)`

1. Create `Contribution` record with `totalAmountInBase`, `currency`, `fxRateAtTime`
2. Increment each `assetClass.currentValueInBase` by the line amount
3. If asset-level enabled: distribute within class proportionally to `asset.valueInBase`
4. Update `portfolio.updatedAt`
5. Return new immutable portfolio object (never mutate in place)

### `previewAfterContribution(classes, lines)`

Returns projected `ClassSnapshot[]` without mutating state — used for charts only.

## Required UI copy

| Location | Text |
|----------|------|
| Suggestion heading | "Suggested distribution" (never "Buy recommendation") |
| Footer | "Suggestion based on your target allocation. You decide where to invest." |
| `allAligned` message | "Your portfolio is on target — contribution follows your target allocation." |
| Disclaimer | "This is not financial advice. Past allocation targets do not guarantee future returns." |

## Multi-currency contribution

When user contributes in a foreign currency (e.g., USD into a BRL portfolio):

```typescript
const amountInBase = toBase(nativeAmount, contributionCurrency, portfolio.fxRates);
// store both: totalAmountInBase + currency + fxRateAtTime
```

MVP: if no FX rate is set, show inline warning "Set an exchange rate in Settings to contribute in USD."

## V1 rules

- Never suggest selling
- Never suggest a specific security if the user has not added assets
- Allow manual editing before confirming
- Record `source: "suggested"` vs `"manual"` in history

## Suggested file structure

```text
src/features/contributions/
├── ContributionForm.tsx          # amount input + currency selector
├── SuggestionTable.tsx           # per-class table
├── BeforeAfterChart.tsx          # donut comparison
├── ConfirmContribution.tsx       # CTA + manual override
├── useContributionSuggestion.ts
└── applyContribution.ts
```

## Cross-References

- Calculation engine: [investment-calculations](../investment-calculations/SKILL.md)
- Simulator (no persist): [contribution-simulator](../contribution-simulator/SKILL.md)
- Domain model: [portfolio-data-model](../portfolio-data-model/SKILL.md)

## Resources

- Algorithm details and edge cases: [reference.md](reference.md)
