/**
 * Reference implementation — copy to src/lib/calculations/
 * No external dependencies.
 */

// ── Types (mirror portfolio-data-model types.ts) ─────────────────────────────

export type CurrencyCode = "BRL" | "USD" | "EUR" | "GBP" | "JPY" | (string & {});
export type MarketRegion = "BR" | "US" | "EU" | "GLOBAL";

export interface FxRates {
  base: CurrencyCode;
  rates: Record<CurrencyCode, number>;
  updatedAt: string;
}

export interface AssetClassInput {
  id: string;
  name: string;
  market: MarketRegion;
  targetPercentage: number;
  currentValueInBase: number;
}

export interface ClassSnapshot extends AssetClassInput {
  currentPercentage: number;
  deviationPp: number;
  deviationValue: number;
  targetValue: number;
  deficit: number;
}

export interface AllocationLine {
  classId: string;
  amountInBase: number;
}

// ── FX ───────────────────────────────────────────────────────────────────────

export function toBase(
  nativeValue: number,
  currency: CurrencyCode,
  fxRates: FxRates
): number {
  if (currency === fxRates.base) return nativeValue;
  const rate = fxRates.rates[currency];
  if (rate === undefined) throw new Error(`Missing FX rate for ${currency}`);
  return nativeValue * rate;
}

// ── Portfolio value ──────────────────────────────────────────────────────────

export function getTotalPortfolioValue(classes: AssetClassInput[]): number {
  return classes.reduce((sum, c) => sum + c.currentValueInBase, 0);
}

// ── Snapshots ────────────────────────────────────────────────────────────────

export function getClassSnapshots(classes: AssetClassInput[]): ClassSnapshot[] {
  const total = getTotalPortfolioValue(classes);
  return classes.map((c) => {
    const currentPercentage = total > 0 ? (c.currentValueInBase / total) * 100 : 0;
    const targetValue = total * (c.targetPercentage / 100);
    const deviationPp = currentPercentage - c.targetPercentage;
    const deviationValue = c.currentValueInBase - targetValue;
    const deficit = Math.max(0, targetValue - c.currentValueInBase);
    return { ...c, currentPercentage, deviationPp, deviationValue, targetValue, deficit };
  });
}

// ── Validation ───────────────────────────────────────────────────────────────

export function validateTargetPercentages(
  classes: AssetClassInput[],
  tolerance = 0.01
): { valid: boolean; sum: number; error?: string } {
  const sum = classes.reduce((s, c) => s + c.targetPercentage, 0);
  const valid = Math.abs(sum - 100) <= tolerance;
  return {
    valid,
    sum,
    error: valid ? undefined : `Target allocations sum to ${sum.toFixed(2)}%; must be 100%`,
  };
}

// ── Formatting ───────────────────────────────────────────────────────────────

export function formatCurrency(
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

export function formatPercentage(value: number, decimals = 1): string {
  return `${value.toFixed(decimals)}%`;
}

export function roundMoney(value: number): number {
  return Math.round(value * 100) / 100;
}

// ── Contribution suggestion ───────────────────────────────────────────────────

export function suggestContributionByDeficit(
  classes: AssetClassInput[],
  contributionAmount: number
): AllocationLine[] {
  if (contributionAmount <= 0) return [];

  const total = getTotalPortfolioValue(classes);
  const projectedTotal = total + contributionAmount;

  const deficits = classes.map((c) => ({
    classId: c.id,
    targetPercentage: c.targetPercentage,
    deficit: Math.max(0, projectedTotal * (c.targetPercentage / 100) - c.currentValueInBase),
  }));

  const totalDeficit = deficits.reduce((s, d) => s + d.deficit, 0);

  let lines: AllocationLine[];

  if (totalDeficit === 0) {
    // Portfolio aligned — distribute by target
    lines = deficits.map((d) => ({
      classId: d.classId,
      amountInBase: roundMoney(contributionAmount * (d.targetPercentage / 100)),
    }));
  } else if (totalDeficit <= contributionAmount) {
    // Full deficit fill + remainder by target
    lines = deficits
      .filter((d) => d.deficit > 0)
      .map((d) => ({ classId: d.classId, amountInBase: roundMoney(d.deficit) }));
    const allocated = lines.reduce((s, l) => s + l.amountInBase, 0);
    const remainder = roundMoney(contributionAmount - allocated);
    if (remainder > 0) {
      // Distribute remainder by target
      const remainderLines = deficits.map((d) => ({
        classId: d.classId,
        amountInBase: roundMoney(remainder * (d.targetPercentage / 100)),
      }));
      remainderLines.forEach((rl) => {
        const existing = lines.find((l) => l.classId === rl.classId);
        if (existing) existing.amountInBase = roundMoney(existing.amountInBase + rl.amountInBase);
        else lines.push(rl);
      });
    }
  } else {
    // Proportional to deficit
    lines = deficits
      .filter((d) => d.deficit > 0)
      .map((d) => ({
        classId: d.classId,
        amountInBase: roundMoney(contributionAmount * (d.deficit / totalDeficit)),
      }));
  }

  // Penny correction
  const sum = roundMoney(lines.reduce((s, l) => s + l.amountInBase, 0));
  const diff = roundMoney(contributionAmount - sum);
  if (diff !== 0 && lines.length > 0) {
    const maxIdx = lines.reduce(
      (best, l, i, arr) => (l.amountInBase > arr[best].amountInBase ? i : best),
      0
    );
    lines[maxIdx].amountInBase = roundMoney(lines[maxIdx].amountInBase + diff);
  }

  return lines.filter((l) => l.amountInBase > 0);
}
