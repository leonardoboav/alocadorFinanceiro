---
name: contribution-simulator
description: >-
  Simulates single and recurring contributions without persisting to the portfolio.
  Supports multi-market portfolios. Use when building /app/simulator, what-if
  scenarios, or side-by-side strategy comparisons in the asset allocation app.
disable-model-invocation: true
---

# Contribution Simulator

What-if engine: runs scenarios in memory, never auto-persists.

## When to use

- Implementing `/app/simulator`
- "What if I contribute X/month for 12 months?"
- Comparing two contribution strategies side by side
- Exporting simulation results as JSON download (optional)

## Types

```typescript
interface SimulationInput {
  initialClasses: AssetClassInput[];
  baseCurrency: CurrencyCode;
  mode: "single" | "recurring";
  single?: { amountInBase: number };
  recurring?: { monthlyAmountInBase: number; months: number };
}

interface SimulationStep {
  month: number;
  contributionAmountInBase: number;
  allocations: AllocationLine[];
  classSnapshots: ClassSnapshot[];
  totalValueInBase: number;
}

interface SimulationResult {
  baseCurrency: CurrencyCode;
  steps: SimulationStep[];
  finalSnapshots: ClassSnapshot[];
  summary: {
    totalContributed: number;
    finalTotal: number;
    maxDeviationPp: number;
    alignedAtEnd: boolean;
  };
}
```

## Core function

### `runSimulation(input): SimulationResult`

```text
state = deep-clone(initialClasses)
steps = []
for month in 1..N:
  amount = input.recurring.monthlyAmountInBase (or single at month 1)
  allocations = suggestContributionByDeficit(state, amount)
  state = applyContributionInMemory(state, allocations)
  steps.push({ month, amount, allocations, snapshots: getClassSnapshots(state), total })
return { steps, finalSnapshots, summary }
```

`applyContributionInMemory` = same logic as `applyContribution` but returns new `AssetClassInput[]` without touching portfolio state.

## `/app/simulator` UI

| Section | Content |
|---------|---------|
| Input | Mode toggle: "Single contribution" / "Monthly recurring" |
| | Amount field + currency selector |
| | If recurring: number of months (1–120) |
| Results | Summary card: total contributed, final value, max deviation at end |
| | Month-by-month table (collapsible) |
| | Chart: max deviation over time OR % per class stacked over time |
| CTA | "Use this amount now" → navigate to `/app/contributions?amount=X` |

## Predefined scenarios (optional shortcuts)

- Single contribution (current dashboard quick-contribute amount)
- Monthly recurring over 12 months
- Monthly recurring over 24 months

## Limitations (display in UI)

"Simulation assumes no asset price changes — only new contributions are modeled."

## Cross-References

- Contribution feature: [contribution-allocation](../contribution-allocation/SKILL.md)
- Calculation engine: [investment-calculations](../investment-calculations/SKILL.md)

## Resources

- Numeric scenarios: [examples.md](examples.md)
