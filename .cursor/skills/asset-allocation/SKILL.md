---
name: asset-allocation
description: >-
  Defines strategy templates and asset class catalogs for Brazilian, international,
  and mixed investor profiles. Use when implementing /app/setup, /app/allocation,
  applying or switching strategy templates, or building /methodology content.
disable-model-invocation: true
---

# Asset Allocation

Strategy templates and asset class catalog for all three investor profiles.

## When to use

- Setup wizard step "Choose a template"
- Re-applying a template in `/app/allocation`
- Generating `/methodology` educational content
- Setting class defaults and colors

## Investor profiles

The app supports three profiles, selectable during setup:

| Profile | `investorProfile` | Description |
|---------|-------------------|-------------|
| 100% Brazil | `"BR_ONLY"` | All classes in BRL on B3 or Brazilian fixed income |
| 100% International | `"INTL_ONLY"` | All classes in USD/EUR on foreign exchanges |
| Mixed | `"MIXED"` | Combination of Brazilian and international classes |

Profile does not restrict what the user can do — it only changes the default template offered and the class catalog shown first.

## Asset class catalog

### Brazilian classes (`market: "BR"`)

| id | Name | Color | Typical assets |
|----|------|-------|---------------|
| `br-fixed-income` | Fixed Income | #3B82F6 | CDB, Tesouro Direto, LCI, LCA, Debentures |
| `br-stocks` | Brazilian Stocks | #10B981 | Bovespa equities, stock funds |
| `br-reits` | Real Estate Funds (FIIs) | #F59E0B | HGLG11, KNRI11, MXRF11, etc. |
| `br-multimarket` | Multi-Market Funds | #6366F1 | Macro, Long & Short |
| `br-cash` | Cash / Reserve | #6B7280 | Savings, DI funds |

### International classes (`market: "US"` / `"EU"` / `"GLOBAL"`)

| id | Name | Color | Typical assets |
|----|------|-------|---------------|
| `intl-us-stocks` | US Stocks | #0EA5E9 | VTI, QQQ, S&P 500 ETFs, individual stocks |
| `intl-global-stocks` | Global Stocks | #14B8A6 | VT, VXUS, MSCI World ETFs |
| `intl-us-bonds` | US Bonds / Fixed Income | #8B5CF6 | BND, AGG, TLT |
| `intl-reits` | International REITs | #F97316 | VNQ, REET |
| `intl-commodities` | Commodities | #EAB308 | GLD, IAU, oil, agricultural |
| `intl-crypto` | Crypto | #EF4444 | BTC, ETH, diversified crypto |
| `intl-cash-usd` | Cash USD | #9CA3AF | Money market, USD savings |

User can rename, add, or remove any class. These are defaults only.

## Strategy templates

```typescript
type TemplateId =
  | "br-conservative" | "br-moderate" | "br-aggressive"
  | "intl-conservative" | "intl-moderate" | "intl-aggressive"
  | "mixed-conservative" | "mixed-moderate" | "mixed-aggressive"
  | "custom";

const STRATEGY_TEMPLATES: Record<TemplateId, StrategyTemplate> = {

  // ── 100% Brazil ──────────────────────────────────────────────────────
  "br-conservative": {
    name: "Brazil — Conservative",
    investorProfile: "BR_ONLY",
    classes: {
      "br-fixed-income": 70,
      "br-stocks":       10,
      "br-reits":        10,
      "br-multimarket":   5,
      "br-cash":          5,
    },
  },
  "br-moderate": {
    name: "Brazil — Moderate",
    investorProfile: "BR_ONLY",
    classes: {
      "br-fixed-income": 45,
      "br-stocks":       30,
      "br-reits":        15,
      "br-multimarket":   5,
      "br-cash":          5,
    },
  },
  "br-aggressive": {
    name: "Brazil — Aggressive",
    investorProfile: "BR_ONLY",
    classes: {
      "br-fixed-income": 20,
      "br-stocks":       55,
      "br-reits":        15,
      "br-multimarket":  10,
    },
  },

  // ── 100% International ───────────────────────────────────────────────
  "intl-conservative": {
    name: "International — Conservative",
    investorProfile: "INTL_ONLY",
    classes: {
      "intl-us-bonds":      50,
      "intl-us-stocks":     25,
      "intl-global-stocks": 15,
      "intl-reits":          5,
      "intl-cash-usd":       5,
    },
  },
  "intl-moderate": {
    name: "International — Moderate",
    investorProfile: "INTL_ONLY",
    classes: {
      "intl-us-stocks":     40,
      "intl-global-stocks": 25,
      "intl-us-bonds":      20,
      "intl-reits":         10,
      "intl-commodities":    5,
    },
  },
  "intl-aggressive": {
    name: "International — Aggressive",
    investorProfile: "INTL_ONLY",
    classes: {
      "intl-us-stocks":     45,
      "intl-global-stocks": 30,
      "intl-reits":         10,
      "intl-commodities":    5,
      "intl-crypto":        10,
    },
  },

  // ── Mixed (BR + International) ────────────────────────────────────────
  "mixed-conservative": {
    name: "Mixed — Conservative",
    investorProfile: "MIXED",
    classes: {
      "br-fixed-income":    50,
      "br-stocks":          10,
      "br-reits":           10,
      "intl-us-stocks":     15,
      "intl-global-stocks": 10,
      "br-cash":             5,
    },
  },
  "mixed-moderate": {
    name: "Mixed — Moderate",
    investorProfile: "MIXED",
    classes: {
      "br-fixed-income":    30,
      "br-stocks":          20,
      "br-reits":           10,
      "intl-us-stocks":     20,
      "intl-global-stocks": 15,
      "intl-commodities":    5,
    },
  },
  "mixed-aggressive": {
    name: "Mixed — Aggressive",
    investorProfile: "MIXED",
    classes: {
      "br-fixed-income":    15,
      "br-stocks":          25,
      "br-reits":            5,
      "intl-us-stocks":     25,
      "intl-global-stocks": 15,
      "intl-crypto":         5,
      "intl-commodities":   10,
    },
  },

  "custom": {
    name: "Custom",
    investorProfile: "MIXED",
    classes: {},
  },
};
```

## `applyTemplate(templateId, existingClasses?)`

Returns `AssetClass[]` with:
- New unique IDs
- `targetPercentage` from template
- `currentValueInBase: 0`
- `market` from class catalog
- Colors from the catalog map

If `existingClasses` provided, merge current values by matching id or name.

## Product rules

- Never promise returns
- Templates are starting points, not personalized recommendations
- User always confirms percentages before saving
- Always show disclaimer on setup confirmation screen

## Cross-References

- Model: [portfolio-data-model](../portfolio-data-model/SKILL.md)
- Setup UI: [app-screens](../app-screens/SKILL.md)

## Resources

- Methodology page copy: [reference.md](reference.md)
