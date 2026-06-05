export type { Currency } from '../utils/rates'

export interface AssetClass {
  id: string
  name: string
  color: string
  targetPercentage: number
  currentValue: number   // always BRL — computed from foreignValue * rate when currency != BRL
  currency: import('../utils/rates').Currency
  foreignValue?: number  // value in the original currency (only relevant when currency != BRL)
}

export interface Asset {
  id: string
  name: string
  ticker?: string
  quantity: number
  avgPrice: number         // always BRL (converted at input time)
  gainLossPct: number      // percentage, e.g. -15 means -15%
  currency?: import('../utils/rates').Currency  // original input currency, defaults to BRL
  foreignAvgPrice?: number // original price in the foreign currency
  classId?: string         // optional link to an AssetClass
}

export interface Settings {
  showDecimals: boolean
}

export const CLASS_COLORS = [
  '#14b8a6', '#6366f1', '#f59e0b', '#ec4899', '#f97316',
  '#84cc16', '#06b6d4', '#8b5cf6', '#ef4444', '#64748b',
]

export const STRATEGY_TEMPLATES: {
  name: string
  description: string
  classes: { name: string; targetPercentage: number; color: string }[]
}[] = [
  {
    name: 'Conservador',
    description: 'Foco em renda fixa com pequena exposição a renda variável e cripto.',
    classes: [
      { name: 'Renda Fixa', targetPercentage: 68, color: '#14b8a6' },
      { name: 'Fundos Imobiliários', targetPercentage: 15, color: '#6366f1' },
      { name: 'Ações Brasil', targetPercentage: 10, color: '#f59e0b' },
      { name: 'Caixa', targetPercentage: 5, color: '#64748b' },
      { name: 'Criptomoedas', targetPercentage: 2, color: '#f97316' },
    ],
  },
  {
    name: 'Moderado',
    description: 'Equilíbrio entre segurança, crescimento e cripto.',
    classes: [
      { name: 'Renda Fixa', targetPercentage: 38, color: '#14b8a6' },
      { name: 'Ações Brasil', targetPercentage: 25, color: '#f59e0b' },
      { name: 'Fundos Imobiliários', targetPercentage: 20, color: '#6366f1' },
      { name: 'ETFs Internacionais', targetPercentage: 10, color: '#ec4899' },
      { name: 'Caixa', targetPercentage: 2, color: '#64748b' },
      { name: 'Criptomoedas', targetPercentage: 5, color: '#f97316' },
    ],
  },
  {
    name: 'Arrojado',
    description: 'Maior exposição à renda variável, internacionais e cripto.',
    classes: [
      { name: 'Ações Brasil', targetPercentage: 30, color: '#f59e0b' },
      { name: 'ETFs Internacionais', targetPercentage: 28, color: '#ec4899' },
      { name: 'Fundos Imobiliários', targetPercentage: 17, color: '#6366f1' },
      { name: 'Criptomoedas', targetPercentage: 15, color: '#f97316' },
      { name: 'Renda Fixa', targetPercentage: 10, color: '#14b8a6' },
    ],
  },
]
