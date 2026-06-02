---
name: app-screens
description: >-
  Specifies every route, page, layout, empty state, and MVP priority for the
  asset allocation web app. Supports Brazilian, international, and mixed investor
  profiles. Use when creating pages, navigation, onboarding flow, or prioritizing
  what to build next.
disable-model-invocation: true
---

# App Screens

Implementation map aligned to `docs/product-pages.md`.

## When to use

- Creating routes and page files (Next.js, React Router, etc.)
- Defining `/app` layout (sidebar or tab nav)
- Implementing empty states and CTAs
- Prioritizing MVP vs v1 vs v2 features

## Route structure

```text
src/app/                      # or pages/ depending on framework
├── page.tsx                  # Home (public)
├── methodology/page.tsx      # Public
├── privacy/page.tsx          # Public
├── roadmap/page.tsx          # Public
└── app/
    ├── layout.tsx            # App shell (nav, no auth required)
    ├── page.tsx              # Dashboard
    ├── setup/page.tsx        # Onboarding wizard
    ├── portfolio/page.tsx    # Portfolio view
    ├── allocation/page.tsx   # Target allocation editor
    ├── contributions/page.tsx
    ├── simulator/page.tsx
    ├── history/page.tsx
    ├── data/page.tsx         # Export / Import / Reset
    └── settings/page.tsx     # FX rates, currency, preferences
```

## MVP priority

| Route | Priority | Skills |
|-------|----------|--------|
| `/` Home | P0 | — |
| `/app/setup` | P0 | asset-allocation, portfolio-data-model |
| `/app` Dashboard | P0 | investment-calculations, contribution-allocation |
| `/app/portfolio` | P0 | portfolio-data-model, investment-calculations |
| `/app/allocation` | P0 | investment-calculations, asset-allocation |
| `/app/contributions` | P0 | contribution-allocation |
| `/app/settings` | P0 | local-first-storage (FX rates live here) |
| `/app/data` | P0 | local-first-storage |
| `/methodology` | P1 | asset-allocation reference.md |
| `/privacy` | P1 | local-first-storage |
| `/app/simulator` | P1 | contribution-simulator |
| `/app/history` | P2 | contribution-allocation |

## Screen specifications

### Home `/`

- Hero + CTA "Get started — no account needed" → `/app/setup`
- 3-step visual: set your target → log your portfolio → simulate your contribution
- Investor profile selector: 🇧🇷 Brazil / 🌍 International / 🌐 Mixed (pre-fills setup)
- Educational disclaimer in footer

### Setup `/app/setup`

Wizard steps:

1. Portfolio name
2. Choose investor profile (BR / INTL / MIXED)
3. Choose strategy template filtered by profile ([asset-allocation](../asset-allocation/SKILL.md))
4. Adjust target percentages (validates sum = 100%)
5. Enter current values per class (in base currency)
6. Set base currency (default: BRL for BR/MIXED, USD for INTL)
7. Confirm → `savePortfolio()` → `/app`

### Dashboard `/app`

Cards:

- Total portfolio value (`formatCurrency(total, baseCurrency)`)
- Investor profile badge (BR / INTL / Mixed)
- Donut chart: current vs target allocation
- Top 3 most underweight classes (`deviationPp` most negative)
- "Contribute now" widget: amount input → `/app/contributions?amount=X`
- Empty state: redirect to `/app/setup`

### Portfolio `/app/portfolio`

- Table: class | market flag | current value | current % | target % | deviation (pp + value)
- Inline value editing (updates via `setPortfolio`)
- Toggle "Show assets" (`settings.showAssetLevel`)
- Market filter tabs: All | Brazil | International

### Allocation `/app/allocation`

- Target percentage editor with progress bar (sum must reach 100%)
- Re-apply template (confirm before overwriting)
- Show which classes are BR vs INTL (market badge)
- Validation: sum ≠ 100% → inline error

### Contributions `/app/contributions`

See [contribution-allocation](../contribution-allocation/SKILL.md) for full screen spec.

Key addition for multi-market: currency selector next to amount field (default: baseCurrency).

### Settings `/app/settings`

**FX Rates section (new — required for multi-market):**

```text
Exchange Rates
──────────────
Base currency: BRL ▼        (set during setup, editable here)

Currency   Rate (1 X = ? BRL)   Last updated
USD        5.20                  3 days ago   [Edit]
EUR        5.65                  3 days ago   [Edit]

[+ Add currency]
```

- User enters rates manually in MVP v1
- v2: optional "Fetch latest rates" button (requires network permission)
- Warning banner on portfolio/contribution pages if FX rates are stale (> 7 days)

**Other settings:**

- Locale (pt-BR / en-US)
- Show assets within classes toggle
- Reset / clear all data

### Simulator `/app/simulator`

See [contribution-simulator](../contribution-simulator/SKILL.md).

### Data `/app/data`

- Export JSON button
- Import JSON file picker
- "Clear all data" with confirmation modal
- Link to `/privacy`

## App layout `/app`

```text
┌───────────────────────────────────────────────────┐
│  Logo   Dashboard  Portfolio  Contributions  ···   │
├───────────────────────────────────────────────────┤
│                   {children}                       │
│                                                    │
│  ── FX rate stale banner (if applicable) ──       │
└───────────────────────────────────────────────────┘
```

Mobile: bottom nav — Dashboard / Portfolio / Contribute / More

## Empty states

| State | Message | CTA |
|-------|---------|-----|
| No portfolio | "Set up your strategy to get started." | `/app/setup` |
| No history | "Your contributions will appear here." | `/app/contributions` |
| Portfolio aligned | "You're on target — great work." | `/app/simulator` |
| Missing FX rate | "Add an exchange rate to contribute in foreign currency." | `/app/settings` |
| FX rate stale | "Exchange rates haven't been updated in 7 days." | `/app/settings` |

## Cross-References

- Product spec: `docs/product-pages.md`
- All skills: `.cursor/skills/`

## Resources

- MVP checklist: [reference.md](reference.md)
