---
name: investment-calculations
description: >-
  Implements pure calculation functions for portfolio analysis: total value in
  base currency, class snapshots, FX conversion, deviation metrics, and
  contribution distribution. Use when building the calculation library,
  hooks, dashboard charts, or unit tests for the asset allocation app.
disable-model-invocation: true
---

# Investment Calculations

Pure calculation engine — no UI, no persistence. All functions are deterministic and testable.

Supports multi-market portfolios: values from international classes are converted to `baseCurrency` using `fxRates` before any calculation.

## When to use

- Implementing `src/lib/calculations/`
- Feeding chart data (current vs target)
- Showing deviations in dashboard and `/app/portfolio`
- Writing unit tests using [examples.md](examples.md)

## Conventions

- All monetary inputs/outputs in `baseCurrency` (e.g. BRL)
- Native asset values converted via `fxRates` before entering the engine
- Internal precision: full float; round only at display layer
- Percentages: 1 decimal place in display
- Pure functions: input → output, no side effects

## FX resolution

```typescript
function toBase(nativeValue: number, currency: CurrencyCode, fxRates: FxRates): number {
  if (currency === fxRates.base) return nativeValue;
  const rate = fxRates.rates[currency];
  if (!rate) throw new Error(`Missing FX rate for ${currency}`);
  return nativeValue * rate;
}
```

Call `toBase()` on every `Asset.nativeValue` to compute `Asset.valueInBase` before aggregating.

## Required functions

### `getTotalPortfolioValue(classes)`

```typescript
function getTotalPortfolioValue(classes: AssetClass[]): number {
  return classes.reduce((sum, c) => sum + c.currentValueInBase, 0);
}
```

### `getClassSnapshots(classes, total?)`

Returns per-class: `currentValueInBase`, `currentPercentage`, `targetPercentage`, `deviationPp`, `deviationValue`, `targetValue`, `deficit`.

```typescript
interface ClassSnapshot {
  classId: string;
  name: string;
  market: MarketRegion;
  currentValueInBase: number;
  currentPercentage: number;
  targetPercentage: number;
  deviationPp: number;       // current% − target% (negative = underweight)
  deviationValue: number;    // currentValueInBase − targetValue
  targetValue: number;       // total × target / 100
  deficit: number;           // max(0, targetValue − currentValueInBase)
}
```

### `validateTargetPercentages(classes)`

Returns `{ valid: boolean; sum: number; error?: string }`. Tolerance: `0.01`.

### `suggestContributionByDeficit(classes, contributionAmount)`

Full algorithm in [reference.md](reference.md) and [scripts/calculations.ts](scripts/calculations.ts).

### `formatCurrency(value, currency, locale?)`

```typescript
function formatCurrency(
  value: number,
  currency: CurrencyCode = "BRL",
  locale = "pt-BR"
): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(value);
}
```

For mixed portfolios: always format in `portfolio.baseCurrency` in calculation results; format in native currency only in the asset detail view.

### `formatPercentage(value, decimals?)`

```typescript
function formatPercentage(value: number, decimals = 1): string {
  return `${value.toFixed(decimals)}%`;
}
```

## Core formulas

```
total = sum(currentValueInBase)
currentPct = total > 0 ? (currentValueInBase / total) * 100 : 0
targetValue = total * (targetPct / 100)
deviationPp = currentPct - targetPct
deviationValue = currentValueInBase - targetValue
deficit = max(0, targetValue - currentValueInBase)
```

## Edge cases

| Case | Behavior |
|------|----------|
| `total === 0` | All `currentPct = 0`; use projected total for deficit calc |
| Single class | Normal; validate target = 100% |
| Class with target 0 and deficit 0 | Skip in contribution suggestion |
| Negative values | Reject in validation, never compute |
| Missing FX rate | Throw with currency name in message |
| `contributionAmount <= 0` | Return empty allocation |

## Suggested file structure

```text
src/lib/calculations/
├── fx.ts           # toBase(), validateFxRates()
├── portfolio.ts    # getTotalPortfolioValue(), getClassSnapshots()
├── validation.ts   # validateTargetPercentages()
├── format.ts       # formatCurrency(), formatPercentage()
├── contribution.ts # suggestContributionByDeficit()
└── index.ts
```

## Cross-References

- Types: [portfolio-data-model](../portfolio-data-model/SKILL.md)
- Contribution feature: [contribution-allocation](../contribution-allocation/SKILL.md)

## Resources

- Formulas and distribution algorithm: [reference.md](reference.md)
- Numeric examples / test cases: [examples.md](examples.md)
- TypeScript reference implementation: [scripts/calculations.ts](scripts/calculations.ts)
