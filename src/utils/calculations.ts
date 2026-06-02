import type { AssetClass } from '../types'

export function getTotalValue(classes: AssetClass[]): number {
  return classes.reduce((s, c) => s + c.currentValue, 0)
}

export function getCurrentPercentage(cls: AssetClass, total: number): number {
  if (total === 0) return 0
  return (cls.currentValue / total) * 100
}

export function getDeviation(cls: AssetClass, total: number): number {
  return cls.targetPercentage - getCurrentPercentage(cls, total)
}

export interface AllocationSuggestion {
  assetClassId: string
  assetClassName: string
  color: string
  amount: number
  share: number
  currentPercentage: number
  targetPercentage: number
}

export function suggestContribution(
  classes: AssetClass[],
  amount: number
): AllocationSuggestion[] {
  if (classes.length === 0 || amount <= 0) return []

  const total = getTotalValue(classes)
  const projected = total + amount

  const deficits = classes.map((cls) => ({
    cls,
    deficit: Math.max(0, (cls.targetPercentage / 100) * projected - cls.currentValue),
  }))

  const totalDeficit = deficits.reduce((s, d) => s + d.deficit, 0)

  const suggestions: AllocationSuggestion[] = totalDeficit === 0
    ? classes.map((cls) => ({
        assetClassId: cls.id,
        assetClassName: cls.name,
        color: cls.color,
        amount: (cls.targetPercentage / 100) * amount,
        share: cls.targetPercentage,
        currentPercentage: getCurrentPercentage(cls, total),
        targetPercentage: cls.targetPercentage,
      }))
    : deficits
        .filter((d) => d.deficit > 0)
        .map(({ cls, deficit }) => ({
          assetClassId: cls.id,
          assetClassName: cls.name,
          color: cls.color,
          amount: (deficit / totalDeficit) * amount,
          share: (deficit / totalDeficit) * 100,
          currentPercentage: getCurrentPercentage(cls, total),
          targetPercentage: cls.targetPercentage,
        }))

  // Fix float rounding
  const diff = amount - suggestions.reduce((s, sg) => s + sg.amount, 0)
  if (suggestions.length > 0 && Math.abs(diff) > 0.0001) {
    const maxIdx = suggestions.reduce((mi, sg, i) => sg.amount > suggestions[mi].amount ? i : mi, 0)
    suggestions[maxIdx].amount += diff
  }

  return suggestions
}

export function getProjectedPercentage(
  cls: AssetClass,
  suggestions: AllocationSuggestion[],
  total: number,
  contributionTotal: number
): number {
  const projected = total + contributionTotal
  if (projected === 0) return 0
  const add = suggestions.find((s) => s.assetClassId === cls.id)?.amount ?? 0
  return ((cls.currentValue + add) / projected) * 100
}
