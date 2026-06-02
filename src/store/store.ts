import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AssetClass, Settings } from '../types'
import { generateId } from '../utils/format'
import { CLASS_COLORS } from '../types'
import { getRates, fetchDailyRates, loadCachedRates, convertToBRL } from '../utils/rates'
import type { Currency, RatesCache } from '../utils/rates'

interface State {
  // Asset classes
  assetClasses: AssetClass[]
  settings: Settings

  // Exchange rates
  ratesCache: RatesCache | null
  ratesFetching: boolean
  ratesError: string | null

  // Asset class actions
  addAssetClass: (partial: Omit<AssetClass, 'id'>) => void
  updateAssetClass: (id: string, updates: Partial<Omit<AssetClass, 'id'>>) => void
  removeAssetClass: (id: string) => void
  setAssetClasses: (classes: AssetClass[]) => void
  applyTemplate: (classes: Omit<AssetClass, 'id' | 'currentValue'>[]) => void

  // Rates actions
  loadRates: () => Promise<void>    // use cache if today, else fetch
  refreshRates: () => Promise<void> // force re-fetch

  // Settings
  updateSettings: (s: Partial<Settings>) => void
  reset: () => void
}

function computeBRL(cls: AssetClass, rates: RatesCache | null): number {
  if (cls.currency === 'BRL' || !cls.currency) return cls.currentValue
  if (cls.foreignValue == null || cls.foreignValue === 0) return 0
  return convertToBRL(cls.foreignValue, cls.currency, rates?.rates ?? {})
}

function recomputeValues(classes: AssetClass[], rates: RatesCache | null): AssetClass[] {
  return classes.map((c) =>
    c.currency && c.currency !== 'BRL'
      ? { ...c, currentValue: computeBRL(c, rates) }
      : c
  )
}

const defaultClasses: AssetClass[] = [
  { id: generateId(), name: 'Renda Fixa',         color: CLASS_COLORS[0], targetPercentage: 35, currentValue: 0, currency: 'BRL' },
  { id: generateId(), name: 'Ações Brasil',        color: CLASS_COLORS[2], targetPercentage: 25, currentValue: 0, currency: 'BRL' },
  { id: generateId(), name: 'Fundos Imobiliários', color: CLASS_COLORS[1], targetPercentage: 20, currentValue: 0, currency: 'BRL' },
  { id: generateId(), name: 'ETFs Internacionais', color: CLASS_COLORS[3], targetPercentage: 15, currentValue: 0, currency: 'USD' },
  { id: generateId(), name: 'Criptomoedas',        color: CLASS_COLORS[4], targetPercentage: 5,  currentValue: 0, currency: 'BTC' },
]

export const useStore = create<State>()(
  persist(
    (set, get) => ({
      assetClasses: defaultClasses,
      settings: { showDecimals: true },
      ratesCache: loadCachedRates(),
      ratesFetching: false,
      ratesError: null,

      addAssetClass: (partial) =>
        set((s) => ({ assetClasses: [...s.assetClasses, { ...partial, id: generateId() }] })),

      updateAssetClass: (id, updates) =>
        set((s) => {
          const classes = s.assetClasses.map((c) => {
            if (c.id !== id) return c
            const merged = { ...c, ...updates }
            // Recompute BRL value if foreign currency
            if (merged.currency !== 'BRL' && merged.foreignValue != null) {
              merged.currentValue = convertToBRL(merged.foreignValue, merged.currency as Currency, s.ratesCache?.rates ?? {})
            }
            return merged
          })
          return { assetClasses: classes }
        }),

      removeAssetClass: (id) =>
        set((s) => ({ assetClasses: s.assetClasses.filter((c) => c.id !== id) })),

      setAssetClasses: (classes) =>
        set((s) => ({ assetClasses: recomputeValues(classes, s.ratesCache) })),

      applyTemplate: (tplClasses) =>
        set({
          assetClasses: tplClasses.map((c) => ({
            ...c,
            id: generateId(),
            currentValue: 0,
            currency: (c as Partial<AssetClass>).currency ?? 'BRL',
          })),
        }),

      loadRates: async () => {
        const s = get()
        if (s.ratesFetching) return
        set({ ratesFetching: true, ratesError: null })
        try {
          const cache = await getRates()
          set((prev) => ({
            ratesCache: cache,
            ratesFetching: false,
            assetClasses: recomputeValues(prev.assetClasses, cache),
          }))
        } catch (err) {
          set({ ratesFetching: false, ratesError: err instanceof Error ? err.message : 'Erro ao buscar cotações' })
        }
      },

      refreshRates: async () => {
        set({ ratesFetching: true, ratesError: null })
        try {
          const cache = await fetchDailyRates()
          set((prev) => ({
            ratesCache: cache,
            ratesFetching: false,
            assetClasses: recomputeValues(prev.assetClasses, cache),
          }))
        } catch (err) {
          set({ ratesFetching: false, ratesError: err instanceof Error ? err.message : 'Erro ao buscar cotações' })
        }
      },

      updateSettings: (s) =>
        set((prev) => ({ settings: { ...prev.settings, ...s } })),

      reset: () => set({ assetClasses: defaultClasses }),
    }),
    {
      name: 'alocador-v1',
      // Don't persist fetching/error state
      partialize: (s) => ({
        assetClasses: s.assetClasses,
        settings: s.settings,
      }),
    }
  )
)
