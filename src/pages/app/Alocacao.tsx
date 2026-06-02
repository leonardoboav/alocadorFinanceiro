import { useState } from 'react'
import { Plus, Trash2, Check, AlertCircle, ChevronDown, RefreshCw, AlertTriangle } from 'lucide-react'
import { useStore } from '../../store/store'
import { getTotalValue, getCurrentPercentage } from '../../utils/calculations'
import { formatCurrency, formatPercent, generateId } from '../../utils/format'
import { CLASS_COLORS, STRATEGY_TEMPLATES } from '../../types'
import type { AssetClass } from '../../types'
import { CURRENCY_LABELS, CURRENCY_SYMBOLS, convertToBRL, formatForeign } from '../../utils/rates'
import type { Currency } from '../../utils/rates'

const CURRENCIES = Object.keys(CURRENCY_LABELS) as Currency[]

export default function Alocacao() {
  const storeClasses = useStore((s) => s.assetClasses)
  const setAssetClasses = useStore((s) => s.setAssetClasses)
  const settings = useStore((s) => s.settings)
  const ratesCache = useStore((s) => s.ratesCache)
  const ratesFetching = useStore((s) => s.ratesFetching)
  const ratesError = useStore((s) => s.ratesError)
  const refreshRates = useStore((s) => s.refreshRates)

  const [classes, setClasses] = useState<AssetClass[]>(() => storeClasses.map((c) => ({ ...c })))
  const [saved, setSaved] = useState(false)
  const [showTemplates, setShowTemplates] = useState(false)

  const rates = ratesCache?.rates ?? {}
  const total = getTotalValue(classes)
  const sd = settings.showDecimals
  const sumTarget = classes.reduce((s, c) => s + c.targetPercentage, 0)
  const isValid = Math.abs(sumTarget - 100) < 0.01
  const remaining = 100 - sumTarget

  // Check if any class needs rates and we don't have them
  const needsRates = classes.some((c) => c.currency && c.currency !== 'BRL')
  const hasRates = Object.keys(rates).length > 0

  function update(id: string, key: keyof AssetClass, value: string | number) {
    setClasses((prev) => prev.map((c) => {
      if (c.id !== id) return c
      const updated = { ...c, [key]: value }
      // Recompute BRL value when foreignValue or currency changes
      if ((key === 'foreignValue' || key === 'currency') && updated.currency !== 'BRL') {
        updated.currentValue = convertToBRL(updated.foreignValue ?? 0, updated.currency as Currency, rates)
      }
      if (key === 'currency' && value === 'BRL') {
        updated.foreignValue = undefined
      }
      return updated
    }))
    setSaved(false)
  }

  function add() {
    const usedColors = classes.map((c) => c.color)
    const color = CLASS_COLORS.find((c) => !usedColors.includes(c)) ?? CLASS_COLORS[classes.length % CLASS_COLORS.length]
    setClasses([...classes, { id: generateId(), name: 'Nova Classe', color, targetPercentage: 0, currentValue: 0, currency: 'BRL' }])
  }

  function remove(id: string) {
    setClasses(classes.filter((c) => c.id !== id))
    setSaved(false)
  }

  function applyTemplate(idx: number) {
    const tpl = STRATEGY_TEMPLATES[idx]
    setClasses(tpl.classes.map((c) => ({ ...c, id: generateId(), currentValue: 0, currency: 'BRL' as Currency })))
    setShowTemplates(false)
    setSaved(false)
  }

  function save() {
    setAssetClasses(classes)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  return (
    <div className="p-6 space-y-5 max-w-3xl mx-auto">
      {/* Header row */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-lg font-semibold text-slate-100">Alocação</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Defina o percentual alvo e o valor atual de cada classe.
          </p>
        </div>
        <div className="relative">
          <button onClick={() => setShowTemplates(!showTemplates)} className="btn-secondary whitespace-nowrap">
            Modelos
            <ChevronDown size={13} className={`transition-transform ${showTemplates ? 'rotate-180' : ''}`} />
          </button>
          {showTemplates && (
            <div className="absolute right-0 mt-1.5 w-64 bg-[#0a1628] border border-[#152a52] rounded-xl shadow-xl z-10 overflow-hidden">
              {STRATEGY_TEMPLATES.map((tpl, i) => (
                <button key={tpl.name} onClick={() => applyTemplate(i)}
                  className="w-full px-4 py-3 text-left hover:bg-[#0f2040] transition-colors border-b border-[#152a52] last:border-0">
                  <p className="text-sm font-medium text-slate-200">{tpl.name}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{tpl.description}</p>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Rates banner */}
      {needsRates && (
        <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-xs ${
          ratesError
            ? 'border-red-900/40 bg-red-950/20 text-red-400'
            : !hasRates
            ? 'border-amber-900/40 bg-amber-950/20 text-amber-400'
            : 'border-[#152a52] bg-[#0a1628] text-slate-400'
        }`}>
          {ratesError
            ? <AlertTriangle size={13} className="flex-shrink-0" />
            : <span className="w-2 h-2 rounded-full bg-teal-500 flex-shrink-0 animate-pulse" />
          }
          <span className="flex-1">
            {ratesError
              ? `Erro ao buscar cotações: ${ratesError}`
              : ratesFetching
              ? 'Buscando cotações do dia…'
              : ratesCache
              ? `Cotações de ${new Date(ratesCache.fetchedAt).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}`
              : 'Cotações não carregadas'
            }
          </span>
          {!ratesFetching && (
            <button onClick={refreshRates} className="text-slate-500 hover:text-teal-400 transition-colors" title="Atualizar cotações">
              <RefreshCw size={13} />
            </button>
          )}
          {ratesCache && (
            <div className="flex gap-2 text-[10px] font-mono text-slate-500 hidden sm:flex">
              {(['USD','EUR','GBP','BTC','ETH'] as Currency[]).map((cur) =>
                rates[cur] ? (
                  <span key={cur}>{cur} {formatCurrency(rates[cur]!, false)}</span>
                ) : null
              )}
            </div>
          )}
        </div>
      )}

      {/* Sum indicator */}
      <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-sm ${
        isValid ? 'border-teal-500/30 bg-teal-500/5 text-teal-400' : 'border-amber-500/30 bg-amber-500/5 text-amber-400'
      }`}>
        {isValid ? <Check size={15} /> : <AlertCircle size={15} />}
        <span className="font-mono font-semibold">{sumTarget.toFixed(1)}%</span>
        <span className="text-slate-500">de 100%</span>
        {!isValid && (
          <span className="ml-auto text-xs">
            {remaining > 0 ? `faltam ${remaining.toFixed(1)}%` : `excesso de ${(-remaining).toFixed(1)}%`}
          </span>
        )}
      </div>

      {/* Column headers */}
      <div className="grid grid-cols-[1fr_auto_auto_auto_auto] gap-2 px-1 text-[10px] text-slate-500 uppercase tracking-wider">
        <span>Classe</span>
        <span className="w-36 text-right">Valor atual</span>
        <span className="w-20 text-right">Meta %</span>
        <span className="w-16 text-right">Atual %</span>
        <span className="w-5" />
      </div>

      {/* Classes */}
      <div className="space-y-2.5">
        {classes.map((cls) => {
          const isForeign = cls.currency && cls.currency !== 'BRL'
          const currPct = getCurrentPercentage(cls, total)
          const dev = cls.targetPercentage - currPct
          const brlValue = isForeign
            ? convertToBRL(cls.foreignValue ?? 0, cls.currency as Currency, rates)
            : cls.currentValue

          return (
            <div key={cls.id} className="card p-3 space-y-2.5">
              <div className="grid grid-cols-[1fr_auto_auto_auto_auto] gap-2 items-center">
                {/* Name + color */}
                <div className="flex items-center gap-2 min-w-0">
                  <input type="color" value={cls.color}
                    onChange={(e) => update(cls.id, 'color', e.target.value)}
                    className="w-7 h-7 rounded-md border-0 cursor-pointer bg-transparent p-0.5 flex-shrink-0" />
                  <input className="input py-1.5 text-sm min-w-0" value={cls.name}
                    onChange={(e) => update(cls.id, 'name', e.target.value)}
                    placeholder="Nome da classe" />
                </div>

                {/* Value input */}
                <div className="w-36 space-y-1">
                  <div className="flex gap-1">
                    {/* Currency selector */}
                    <select
                      value={cls.currency ?? 'BRL'}
                      onChange={(e) => update(cls.id, 'currency', e.target.value)}
                      className="input py-1.5 text-xs px-2 w-14 flex-shrink-0"
                    >
                      {CURRENCIES.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>

                    {/* Amount */}
                    <div className="relative flex-1">
                      <span className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-500 text-[10px]">
                        {CURRENCY_SYMBOLS[cls.currency ?? 'BRL']}
                      </span>
                      <input
                        type="number"
                        className="input py-1.5 text-sm pl-6"
                        value={isForeign ? (cls.foreignValue ?? '') : (cls.currentValue || '')}
                        min={0}
                        step={isForeign && (cls.currency === 'BTC' || cls.currency === 'ETH') ? 0.0001 : 100}
                        placeholder="0"
                        onChange={(e) => {
                          const val = parseFloat(e.target.value) || 0
                          if (isForeign) {
                            update(cls.id, 'foreignValue', val)
                          } else {
                            update(cls.id, 'currentValue', val)
                          }
                        }}
                      />
                    </div>
                  </div>
                  {/* BRL equivalent for foreign currencies */}
                  {isForeign && (
                    <p className="text-[10px] font-mono text-right text-slate-500">
                      {rates[cls.currency as Currency]
                        ? `≈ ${formatCurrency(brlValue, sd)}`
                        : 'cotação não disponível'
                      }
                    </p>
                  )}
                </div>

                {/* Target % */}
                <div className="relative w-20">
                  <input type="number" className="input py-1.5 text-sm pr-6 text-right"
                    value={cls.targetPercentage || ''}
                    min={0} max={100} step={0.5} placeholder="0"
                    onChange={(e) => update(cls.id, 'targetPercentage', parseFloat(e.target.value) || 0)} />
                  <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 text-xs">%</span>
                </div>

                {/* Actual % */}
                <div className="w-16 text-right">
                  <span className={`font-mono text-sm font-medium ${
                    total > 0 && Math.abs(dev) > 2
                      ? dev > 0 ? 'text-amber-400' : 'text-emerald-400'
                      : 'text-slate-400'
                  }`}>
                    {formatPercent(currPct)}
                  </span>
                </div>

                <button onClick={() => remove(cls.id)} className="text-slate-600 hover:text-red-400 transition-colors w-5">
                  <Trash2 size={14} />
                </button>
              </div>

              {/* Progress bars */}
              {total > 0 && (
                <div className="space-y-1 px-0.5">
                  <div className="h-1 rounded-full bg-[#0f2040] overflow-hidden">
                    <div className="h-full rounded-full opacity-40 transition-all"
                      style={{ width: `${Math.min(currPct, 100)}%`, backgroundColor: cls.color }} />
                  </div>
                  <div className="h-1 rounded-full bg-[#0f2040] overflow-hidden">
                    <div className="h-full rounded-full transition-all"
                      style={{ width: `${Math.min(cls.targetPercentage, 100)}%`, backgroundColor: cls.color }} />
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-600">
                    <span>
                      Atual (claro) · Meta (cheio)
                      {isForeign && cls.foreignValue ? ` · ${formatForeign(cls.foreignValue, cls.currency as Currency)}` : ''}
                    </span>
                    <span className={dev > 0 ? 'text-amber-500/70' : 'text-emerald-500/70'}>
                      {dev > 0 ? '−' : '+'}{formatCurrency(Math.abs(dev / 100 * total), sd)} para meta
                    </span>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      <div className="flex items-center justify-between pt-1">
        <button onClick={add} className="btn-ghost">
          <Plus size={14} /> Nova classe
        </button>
        <button onClick={save} disabled={!isValid} className="btn-primary disabled:opacity-40 disabled:cursor-not-allowed">
          {saved ? <><Check size={14} /> Salvo!</> : 'Salvar alocação'}
        </button>
      </div>
    </div>
  )
}
