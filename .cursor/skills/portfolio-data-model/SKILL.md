---
name: portfolio-data-model
description: >-
  Defines TypeScript types, Zod schemas, and validation rules for Portfolio,
  AssetClass, Asset, and Contribution. Supports multi-market portfolios (BR,
  international, or mixed). Use when creating models, stores, forms, persistence,
  or any data layer in the asset allocation app.
disable-model-invocation: true
---

# Portfolio Data Model

Canonical domain model. Source of truth: `docs/product-pages.md`.

Supports three investor profiles:
- **100% Brazil** — all classes in BRL, market = "BR"
- **100% International** — classes in USD/EUR, market = "US" | "EU" | "GLOBAL"
- **Mixed** — combination of BR and international classes

## When to use

- Creating TypeScript interfaces or Zod schemas
- Implementing setup, portfolio, and contribution forms
- Validating JSON import
- Building global state store or hooks

## Core types

### Primitives

```typescript
type CurrencyCode = "BRL" | "USD" | "EUR" | "GBP" | "JPY" | (string & {});
type MarketRegion = "BR" | "US" | "EU" | "GLOBAL";
```

### Portfolio

```typescript
interface Portfolio {
  id: string;
  name: string;
  baseCurrency: CurrencyCode;  // display and calculation currency (default: "BRL")
  createdAt: string;           // ISO 8601
  updatedAt: string;
  assetClasses: AssetClass[];
  contributions: Contribution[];
  fxRates: FxRates;
  settings: PortfolioSettings;
}

interface FxRates {
  base: CurrencyCode;                   // same as portfolio.baseCurrency
  rates: Record<CurrencyCode, number>;  // e.g. { USD: 5.20, EUR: 5.65 }
  updatedAt: string;                    // when user last set the rates
}

interface PortfolioSettings {
  locale: "pt-BR" | "en-US";
  showAssetLevel: boolean;
  investorProfile: "BR_ONLY" | "INTL_ONLY" | "MIXED";
  strategyTemplate?: "conservative" | "moderate" | "aggressive" | "custom" |
                     "br-conservative" | "br-moderate" | "br-aggressive" |
                     "intl-conservative" | "intl-moderate" | "intl-aggressive";
}
```

### AssetClass

```typescript
interface AssetClass {
  id: string;
  name: string;
  market: MarketRegion;
  targetPercentage: number;       // 0–100; all classes must sum to 100
  currentValueInBase: number;     // always in portfolio.baseCurrency
  color: string;                  // hex for charts
  sortOrder: number;
  assets: Asset[];
}
```

### Asset (optional in v1, required in v1.1)

```typescript
interface Asset {
  id: string;
  name: string;
  ticker?: string;
  exchange?: string;              // "B3" | "NYSE" | "NASDAQ" | "LSE" | etc.
  assetClassId: string;
  market: MarketRegion;
  currency: CurrencyCode;         // native currency of the asset
  nativeValue: number;            // value in asset's own currency
  valueInBase: number;            // computed: nativeValue * fxRate
  notes?: string;
}
```

`valueInBase` is always derived — never store independently. Recompute on FX rate update.

### Contribution

```typescript
interface Contribution {
  id: string;
  date: string;                   // ISO 8601
  totalAmountInBase: number;      // in portfolio.baseCurrency
  currency: CurrencyCode;         // original contribution currency
  fxRateAtTime?: number;          // if currency != baseCurrency
  allocations: ContributionAllocation[];
  notes?: string;
  source: "suggested" | "manual";
}

interface ContributionAllocation {
  assetClassId: string;
  assetId?: string;
  amountInBase: number;           // in portfolio.baseCurrency
  amountInNative?: number;        // optional: in asset's native currency
  currency?: CurrencyCode;
}
```

## Validation rules

| Rule | Error |
|------|-------|
| `sum(targetPercentage) === 100` | "Target allocations must sum to 100%" |
| `currentValueInBase >= 0` | "Value cannot be negative" |
| `assetClass.name` non-empty | "Asset class name is required" |
| At least 1 assetClass | "Portfolio must have at least one asset class" |
| IDs globally unique | "Duplicate ID" |
| `asset.assetClassId` exists | "Parent class not found" |
| `fxRates.rates[X] > 0` | "FX rate must be positive" |
| `asset.currency` in `fxRates.rates` OR equals `baseCurrency` | "Missing FX rate for currency X" |

Target percentage tolerance: `0.01` (rounding).

## Aggregated class value

If `assets[]` have values, prefer `sum(assets.valueInBase)` as source of truth and sync `assetClass.currentValueInBase`.

If `settings.showAssetLevel === false`, use only `assetClass.currentValueInBase`.

## FX rate handling (MVP)

MVP v1: user enters values already converted to `baseCurrency`. `fxRates` stored but not auto-applied in UI.

v1.1: user inputs `nativeValue` + app applies `fxRates` to compute `valueInBase`.

## Suggested file structure

```text
src/
├── domain/
│   ├── types.ts          # All interfaces above
│   ├── schemas.ts        # Zod schemas
│   ├── defaults.ts       # emptyPortfolio(), newAssetClass()
│   └── validators.ts     # validateTargetPercentages(), validateFxRates()
└── lib/
    └── ids.ts            # crypto.randomUUID()
```

## Cross-References

- Calculations: [investment-calculations](../investment-calculations/SKILL.md)
- Persistence: [local-first-storage](../local-first-storage/SKILL.md)
- Strategy templates: [asset-allocation](../asset-allocation/SKILL.md)

## Resources

- JSON export schema: [reference.md](reference.md)
