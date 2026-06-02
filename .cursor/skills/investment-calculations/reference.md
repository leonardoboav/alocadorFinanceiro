# Formulas and Algorithms

## Projected total (with contribution)

```
projectedTotal = currentTotal + contributionAmount
projectedTarget(class) = projectedTotal * (targetPercentage / 100)
projectedDeficit(class) = max(0, projectedTarget - currentValueInBase)
```

## Contribution distribution algorithm

### When sum(deficits) > contributionAmount (partial fill)

```
allocation(class) = contributionAmount * (deficit(class) / sum(deficits))
```

### When sum(deficits) <= contributionAmount (full fill + remainder)

```
allocation(class) = deficit(class)   // for classes with deficit > 0
remainder = contributionAmount - sum(allocations)
// remainder distributed proportionally to targetPercentage of all classes
```

### When all classes are aligned (no deficits)

```
allocation(class) = contributionAmount * (targetPercentage / 100)
```

Inform user: "Portfolio is aligned — contribution follows target allocation."

## Penny correction

After distributing, fix floating-point rounding:

```typescript
const diff = roundMoney(contributionAmount - sum(allocations));
// apply diff to the class with the largest allocation
```

## Rounding constants

```typescript
const ROUND_MONEY = (n: number) => Math.round(n * 100) / 100;
const PERCENT_TOLERANCE = 0.01;
```

## Asset-level distribution within a class

When `settings.showAssetLevel === true`:

```
classAmount = allocation for this class
if sum(asset.valueInBase) > 0 within class:
  assetShare = classAmount * (asset.valueInBase / classTotal)
else:
  assetShare = classAmount / count(assets)  // equal split
```

## V1 — no sale suggestions

Never suggest negative allocations. If a class is overweight, contribution to it is 0 (deficit = 0). Inform user which classes are above target.
