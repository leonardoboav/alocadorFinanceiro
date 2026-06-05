export type Currency = 'BRL' | 'USD' | 'EUR' | 'GBP' | 'BTC' | 'ETH'

export const CURRENCY_LABELS: Record<Currency, string> = {
  BRL: 'Real (R$)',
  USD: 'Dólar (US$)',
  EUR: 'Euro (€)',
  GBP: 'Libra (£)',
  BTC: 'Bitcoin (₿)',
  ETH: 'Ethereum (Ξ)',
}

export const CURRENCY_SYMBOLS: Record<Currency, string> = {
  BRL: 'R$',
  USD: 'US$',
  EUR: '€',
  GBP: '£',
  BTC: '₿',
  ETH: 'Ξ',
}

export interface RatesCache {
  rates: Partial<Record<Currency, number>> // e.g. { USD: 5.12 } — multiplier to BRL
  date: string      // 'YYYY-MM-DD'
  fetchedAt: string // ISO timestamp
}

const STORAGE_KEY = 'alocador-rates'
const API_URL =
  'https://economia.awesomeapi.com.br/json/last/USD-BRL,EUR-BRL,GBP-BRL,BTC-BRL,ETH-BRL'

const API_KEYS: Record<string, Currency> = {
  USDBRL: 'USD',
  EURBRL: 'EUR',
  GBPBRL: 'GBP',
  BTCBRL: 'BTC',
  ETHBRL: 'ETH',
}

function todayStr(): string {
  return new Date().toISOString().slice(0, 10)
}

export function loadCachedRates(): RatesCache | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as RatesCache) : null
  } catch {
    return null
  }
}

function saveRates(cache: RatesCache): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cache))
  } catch (e) {
    console.warn('[alocador] Failed to persist rates cache:', e)
  }
}

export async function fetchDailyRates(): Promise<RatesCache> {
  const res = await fetch(API_URL)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)

  const data = await res.json() as Record<string, { bid: string }>

  const rates: Partial<Record<Currency, number>> = {}
  for (const [key, currency] of Object.entries(API_KEYS)) {
    const bid = parseFloat(data[key]?.bid ?? '0')
    if (bid > 0) rates[currency] = bid
  }

  const cache: RatesCache = { rates, date: todayStr(), fetchedAt: new Date().toISOString() }
  saveRates(cache)
  return cache
}

/** Returns cached rates if already fetched today, otherwise fetches fresh. */
export async function getRates(): Promise<RatesCache> {
  const cached = loadCachedRates()
  if (cached && cached.date === todayStr()) return cached
  return fetchDailyRates()
}

export function convertToBRL(
  value: number,
  currency: Currency,
  rates: Partial<Record<Currency, number>>
): number {
  if (currency === 'BRL') return value
  const rate = rates[currency] ?? 0
  return value * rate
}

export function formatForeign(value: number, currency: Currency): string {
  if (currency === 'BTC' || currency === 'ETH') {
    return `${CURRENCY_SYMBOLS[currency]} ${value.toLocaleString('pt-BR', { minimumFractionDigits: 4, maximumFractionDigits: 8 })}`
  }
  return `${CURRENCY_SYMBOLS[currency]} ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}
