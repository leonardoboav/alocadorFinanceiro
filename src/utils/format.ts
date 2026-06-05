export function formatCurrency(value: number, showDecimals = true): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: showDecimals ? 2 : 0,
    maximumFractionDigits: showDecimals ? 2 : 0,
  }).format(value)
}

export function formatPercent(value: number, decimals = 1): string {
  return `${value.toFixed(decimals)}%`
}

export function generateId(): string {
  return Math.random().toString(36).slice(2, 11) + Date.now().toString(36)
}

export function truncateName(name: string, max = 11): string {
  return name.length > max ? name.slice(0, max) + '…' : name
}

export function chartLabelFormatter(
  _label: unknown,
  payload: { payload?: { fullName?: string } }[]
): string {
  return payload?.[0]?.payload?.fullName ?? ''
}
