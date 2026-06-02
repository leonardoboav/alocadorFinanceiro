# Algorithm Details and Edge Cases

## Full algorithm (pseudocode)

See `investment-calculations/scripts/calculations.ts → suggestContributionByDeficit`.

```
projectedTotal = currentTotal + amountInBase
for each class:
  projectedTarget = projectedTotal * targetPct / 100
  deficit = max(0, projectedTarget - currentValueInBase)

if sum(deficit) == 0:
  allocate proportionally to targetPct
else if sum(deficit) <= amountInBase:
  allocate full deficit per class
  distribute remainder proportionally to targetPct
else:
  allocate amountInBase * (deficit / sum(deficits))

apply penny correction to largest allocation line
```

## Asset-level distribution within a class

```
if sum(asset.valueInBase) > 0 within class:
  assetShare = classAmount * (asset.valueInBase / classTotal)
else:
  assetShare = classAmount / count(assets)  // equal split
```

## Manual override validation

Before confirming a manually edited allocation:

- `sum(lines.amountInBase)` must equal `totalAmountInBase` (tolerance R$0.01 / $0.01)
- No negative amounts
- Show inline error if invalid

## History record

```typescript
{
  id: crypto.randomUUID(),
  date: new Date().toISOString(),
  totalAmountInBase,
  currency,                    // contribution currency
  fxRateAtTime,                // if foreign currency
  allocations,                 // per-class lines
  source: "suggested" | "manual",
  notes,
}
```

## Minimum unit tests

- Mixed portfolio + partial deficit fill (see investment-calculations/examples.md)
- 100% BR portfolio aligned → proportional allocation
- 100% INTL portfolio in USD with BRL base → FX conversion applied
- Zero amount → blocked
- Manual override sum mismatch → inline error
