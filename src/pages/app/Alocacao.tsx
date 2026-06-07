import { useState } from 'react'
import { Plus, Trash2, Check, AlertCircle, ChevronDown, RefreshCw, AlertTriangle } from 'lucide-react'
import { useStore } from '../../store/store'
import { getTotalValue, resolveClassValues } from '../../utils/calculations'
import { formatCurrency, formatPercent, generateId } from '../../utils/format'
import { CLASS_COLORS, STRATEGY_TEMPLATES } from '../../types'
import type { AssetClass, Asset } from '../../types'
import { CURRENCY_LABELS, CURRENCY_SYMBOLS, convertToBRL, formatForeign } from '../../utils/rates'
import type { Currency, RatesCache } from '../../utils/rates'

const CURRENCIES = Object.keys(CURRENCY_LABELS) as Currency[]

// ── RatesBanner ───────────────────────────────────────────────────────────────

interface RatesBannerProps {
  ratesCache: RatesCache | null
  ratesFetching: boolean
  ratesError: string | null
  rates: Partial<Record<Currency, number>>
  onRefresh: () => void
}

function RatesBanner({ ratesCache, ratesFetching, ratesError, rates, onRefresh }: RatesBannerProps) {
  const borderColor = ratesError ? 'color-mix(in srgb, var(--negative) 30%, transparent)'
    : !Object.keys(rates).length ? 'color-mix(in srgb, var(--warning) 30%, transparent)'
    : 'var(--border)'
  const bgColor = ratesError ? 'color-mix(in srgb, var(--negative) 5%, transparent)'
    : !Object.keys(rates).length ? 'color-mix(in srgb, var(--warning) 5%, transparent)'
    : 'var(--surface-2)'
  const textColor = ratesError ? 'var(--negative)'
    : !Object.keys(rates).length ? 'var(--warning)'
    : 'var(--txt-2)'

  const label = ratesError ? `Erro: ${ratesError}`
    : ratesFetching ? 'Buscando cotações do dia…'
    : ratesCache ? `Cotações de ${new Date(ratesCache.fetchedAt).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}`
    : 'Cotações não carregadas'

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '0.75rem',
      padding: '0.75rem 1rem', borderRadius: '0.75rem',
      border: `1px solid ${borderColor}`, background: bgColor,
      color: textColor, fontSize: '0.8125rem',
    }}>
      {ratesError
        ? <AlertTriangle size={13} style={{ flexShrink: 0 }} />
        : <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent)', flexShrink: 0, display: 'inline-block', animation: 'pulse 2s infinite' }} />}
      <span style={{ flex: 1 }}>{label}</span>
      {!ratesFetching && (
        <button onClick={onRefresh} title="Atualizar" style={{
          background: 'transparent', border: 'none', cursor: 'pointer',
          color: 'var(--txt-3)', display: 'flex', alignItems: 'center',
        }}>
          <RefreshCw size={13} />
        </button>
      )}
      {ratesCache && (
        <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.6875rem', fontFamily: "'DM Mono', monospace", color: 'var(--txt-3)' }}
          className="hidden sm:flex">
          {(['USD', 'EUR', 'GBP', 'BTC', 'ETH'] as Currency[]).map((cur) =>
            rates[cur] ? <span key={cur}>{cur} {formatCurrency(rates[cur]!, false)}</span> : null
          )}
        </div>
      )}
    </div>
  )
}

// ── SumIndicator ──────────────────────────────────────────────────────────────

interface SumIndicatorProps { sumTarget: number; isValid: boolean; remaining: number }

function SumIndicator({ sumTarget, isValid, remaining }: SumIndicatorProps) {
  const borderColor = isValid ? 'color-mix(in srgb, var(--accent) 25%, transparent)' : 'color-mix(in srgb, var(--warning) 30%, transparent)'
  const bgColor = isValid ? 'color-mix(in srgb, var(--accent) 5%, transparent)' : 'color-mix(in srgb, var(--warning) 5%, transparent)'
  const color = isValid ? 'var(--accent)' : 'var(--warning)'

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '0.75rem',
      padding: '0.75rem 1rem', borderRadius: '0.75rem',
      border: `1px solid ${borderColor}`, background: bgColor,
      color, fontSize: '0.875rem',
    }}>
      {isValid ? <Check size={15} /> : <AlertCircle size={15} />}
      <span style={{ fontFamily: "'DM Mono', monospace", fontWeight: 500 }}>{sumTarget.toFixed(1)}%</span>
      <span style={{ color: 'var(--txt-3)' }}>de 100%</span>
      {!isValid && (
        <span style={{ marginLeft: 'auto', fontSize: '0.8125rem' }}>
          {remaining > 0 ? `faltam ${remaining.toFixed(1)}%` : `excesso de ${(-remaining).toFixed(1)}%`}
        </span>
      )}
    </div>
  )
}

// ── TemplatesMenu ─────────────────────────────────────────────────────────────

interface TemplatesMenuProps { open: boolean; onToggle: () => void; onApply: (idx: number) => void }

function TemplatesMenu({ open, onToggle, onApply }: TemplatesMenuProps) {
  return (
    <div style={{ position: 'relative' }}>
      <button onClick={onToggle} className="btn-secondary">
        Modelos <ChevronDown size={13} style={{ transition: 'transform 150ms', transform: open ? 'rotate(180deg)' : 'none' }} />
      </button>
      {open && (
        <div style={{
          position: 'absolute', right: 0, marginTop: 6, width: 256,
          background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: 12, overflow: 'hidden',
          boxShadow: '0 8px 32px rgba(0,0,0,0.08)', zIndex: 10,
        }}>
          {STRATEGY_TEMPLATES.map((tpl, i) => (
            <button key={tpl.name} onClick={() => onApply(i)} style={{
              width: '100%', padding: '0.875rem 1rem', textAlign: 'left',
              background: 'transparent', border: 'none', cursor: 'pointer',
              borderBottom: i < STRATEGY_TEMPLATES.length - 1 ? '1px solid var(--border)' : 'none',
              transition: 'background 100ms',
            }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--surface-2)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}>
              <p style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--txt-1)' }}>{tpl.name}</p>
              <p style={{ fontSize: '0.75rem', color: 'var(--txt-3)', marginTop: '0.125rem' }}>{tpl.description}</p>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ── ProgressBars ─────────────────────────────────────────────────────────────

interface ProgressBarsProps {
  currPct: number; targetPct: number; dev: number; total: number
  showDecimals: boolean; color: string; foreignLabel: string
}

function ProgressBars({ currPct, targetPct, dev, total, showDecimals, color, foreignLabel }: ProgressBarsProps) {
  return (
    <div style={{ borderTop: '1px solid var(--border)', paddingTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
      <div style={{ height: 4, borderRadius: 9999, background: 'var(--border)', overflow: 'hidden' }}>
        <div style={{ height: '100%', borderRadius: 9999, opacity: 0.5, background: color, width: `${Math.min(currPct, 100)}%`, transition: 'width 200ms' }} />
      </div>
      <div style={{ height: 4, borderRadius: 9999, background: 'var(--border)', overflow: 'hidden' }}>
        <div style={{ height: '100%', borderRadius: 9999, background: color, width: `${Math.min(targetPct, 100)}%`, transition: 'width 200ms' }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.6875rem', color: 'var(--txt-3)' }}>
        <span>Atual (claro) · Meta (cheio){foreignLabel}</span>
        <span style={{ color: dev > 0 ? 'var(--warning)' : 'var(--positive)' }}>
          {dev > 0 ? '−' : '+'}{formatCurrency(Math.abs(dev / 100 * total), showDecimals)} para meta
        </span>
      </div>
    </div>
  )
}

// ── ClassCard ─────────────────────────────────────────────────────────────────

interface ClassCardProps {
  cls: AssetClass
  total: number
  rates: Partial<Record<Currency, number>>
  showDecimals: boolean
  linkedCount: number
  linkedValue: number
  linkedAssets: Asset[]
  onChange: (id: string, key: keyof AssetClass, value: string | number) => void
  onRemove: (id: string) => void
}

function ClassCard({ cls, total, rates, showDecimals, linkedCount, linkedValue, linkedAssets, onChange, onRemove }: ClassCardProps) {
  const [expanded, setExpanded] = useState(false)
  const isForeign = cls.currency && cls.currency !== 'BRL'
  const manualBRL = isForeign ? convertToBRL(cls.foreignValue ?? 0, cls.currency as Currency, rates) : cls.currentValue
  const effectiveValue = linkedCount > 0 ? linkedValue : manualBRL
  const currPct = total > 0 ? (effectiveValue / total) * 100 : 0
  const dev = cls.targetPercentage - currPct

  const devColor = total > 0 && Math.abs(dev) > 2
    ? (dev > 0 ? 'var(--warning)' : 'var(--positive)')
    : 'var(--txt-3)'

  return (
    <div style={{
      background: 'var(--surface)', border: '1px solid var(--border)',
      borderRadius: '0.75rem', padding: '0.875rem 1rem',
      display: 'flex', flexDirection: 'column', gap: '0.5rem',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
        <input type="color" value={cls.color} onChange={(e) => onChange(cls.id, 'color', e.target.value)}
          style={{ width: 28, height: 28, borderRadius: 6, border: '1px solid var(--border)', cursor: 'pointer', padding: 2, background: 'transparent', flexShrink: 0 }} />
        <input className="input" value={cls.name} placeholder="Nome da classe" style={{ flex: 1, minWidth: 100 }}
          onChange={(e) => onChange(cls.id, 'name', e.target.value)} />
        {linkedCount === 0 && (
          <select value={cls.currency ?? 'BRL'} onChange={(e) => onChange(cls.id, 'currency', e.target.value)}
            className="input" style={{ width: 68, flexShrink: 0, padding: '0.5rem', fontSize: '0.8125rem' }}>
            {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        )}

        {/* Value: auto from linked assets OR manual input */}
        {linkedCount > 0 ? (
          <div style={{
            width: 116, padding: '0.5rem 0.75rem', borderRadius: '0.5rem', flexShrink: 0,
            border: '1px solid color-mix(in srgb, var(--accent) 25%, transparent)',
            background: 'color-mix(in srgb, var(--accent) 4%, transparent)',
            fontFamily: "'DM Mono', monospace", fontSize: '0.8125rem', color: 'var(--accent)',
            display: 'flex', alignItems: 'center', gap: '0.25rem',
          }}>
            <span style={{ fontSize: '0.6875rem', color: 'var(--txt-3)', flexShrink: 0 }}>R$</span>
            <span style={{ flex: 1, textAlign: 'right', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {linkedValue.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
        ) : (
          <div style={{ position: 'relative', width: 116, flexShrink: 0 }}>
            <span style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--txt-3)', fontSize: '0.8125rem', fontFamily: "'DM Mono', monospace", pointerEvents: 'none' }}>
              {CURRENCY_SYMBOLS[cls.currency ?? 'BRL']}
            </span>
            <input type="number" className="input" style={{ paddingLeft: '2.25rem', fontFamily: "'DM Mono', monospace" }}
              value={isForeign ? (cls.foreignValue ?? '') : (cls.currentValue || '')} min={0} placeholder="0"
              step={isForeign && (cls.currency === 'BTC' || cls.currency === 'ETH') ? 0.0001 : 100}
              onChange={(e) => onChange(cls.id, isForeign ? 'foreignValue' : 'currentValue', parseFloat(e.target.value) || 0)} />
          </div>
        )}

        <div style={{ position: 'relative', width: 96, flexShrink: 0 }}>
          <input type="number" className="input" style={{ paddingRight: '2rem', textAlign: 'right', fontFamily: "'DM Mono', monospace" }}
            value={cls.targetPercentage || ''} min={0} max={100} step={0.5} placeholder="Meta"
            onChange={(e) => onChange(cls.id, 'targetPercentage', parseFloat(e.target.value) || 0)} />
          <span style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--txt-3)', fontSize: '0.8125rem', pointerEvents: 'none' }}>%</span>
        </div>
        <div style={{
          width: 72, padding: '0.625rem 0.75rem', borderRadius: '0.5rem',
          border: '1px solid var(--border)', background: 'var(--surface-2)',
          fontFamily: "'DM Mono', monospace", fontSize: '0.875rem', fontWeight: 400,
          textAlign: 'right', color: devColor, flexShrink: 0,
        }}>
          {formatPercent(currPct)}
        </div>
        <button onClick={() => onRemove(cls.id)} style={{
          width: 32, height: 32, borderRadius: 6, border: 'none', background: 'transparent',
          cursor: 'pointer', color: 'var(--txt-3)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'all 120ms', flexShrink: 0,
        }}
          onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--negative)'; e.currentTarget.style.background = 'color-mix(in srgb, var(--negative) 8%, transparent)' }}
          onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--txt-3)'; e.currentTarget.style.background = 'transparent' }}>
          <Trash2 size={14} />
        </button>
      </div>

      {/* Linked assets note + expandable list */}
      {linkedCount > 0 && (
        <div style={{ paddingLeft: '2.25rem' }}>
          <button
            onClick={() => setExpanded((p) => !p)}
            style={{
              background: 'none', border: 'none', cursor: 'pointer', padding: 0,
              display: 'flex', alignItems: 'center', gap: '0.375rem',
              color: 'var(--accent)', fontSize: '0.75rem', opacity: 0.85,
            }}>
            <span>
              {linkedCount} ativo{linkedCount > 1 ? 's' : ''} vinculado{linkedCount > 1 ? 's' : ''} · calculado automaticamente
            </span>
            <span style={{
              fontSize: '0.625rem', transition: 'transform 150ms',
              display: 'inline-block', transform: expanded ? 'rotate(180deg)' : 'none',
            }}>▾</span>
          </button>

          {expanded && (
            <div style={{
              marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.25rem',
              borderLeft: `2px solid color-mix(in srgb, var(--accent) 25%, transparent)`,
              paddingLeft: '0.75rem',
            }}>
              {linkedAssets.map((a) => {
                const val = a.quantity * a.avgPrice * (1 + a.gainLossPct / 100)
                const pctOfClass = linkedValue > 0 ? (val / linkedValue) * 100 : 0
                return (
                  <div key={a.id} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    gap: '0.5rem', fontSize: '0.75rem',
                  }}>
                    <span style={{ color: 'var(--txt-2)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {a.ticker
                        ? <><span style={{ fontFamily: "'DM Mono', monospace", color: 'var(--txt-3)', marginRight: '0.375rem' }}>{a.ticker}</span>{a.name}</>
                        : a.name}
                    </span>
                    <span style={{ fontFamily: "'DM Mono', monospace", color: 'var(--txt-1)', flexShrink: 0 }}>
                      {formatCurrency(val, showDecimals)}
                    </span>
                    <span style={{ fontFamily: "'DM Mono', monospace", color: 'var(--txt-3)', flexShrink: 0, width: 38, textAlign: 'right' }}>
                      {pctOfClass.toFixed(1)}%
                    </span>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* Foreign rate note (manual mode only) */}
      {linkedCount === 0 && isForeign && (
        <p style={{ fontSize: '0.75rem', fontFamily: "'DM Mono', monospace", color: 'var(--txt-3)', paddingLeft: '2.25rem' }}>
          {rates[cls.currency as Currency] ? `≈ ${formatCurrency(manualBRL, showDecimals)}` : 'cotação não disponível'}
        </p>
      )}

      {total > 0 && (
        <ProgressBars currPct={currPct} targetPct={cls.targetPercentage} dev={dev} total={total}
          showDecimals={showDecimals} color={cls.color}
          foreignLabel={linkedCount === 0 && isForeign && cls.foreignValue ? ` · ${formatForeign(cls.foreignValue, cls.currency as Currency)}` : ''} />
      )}
    </div>
  )
}

// ── useAlocacaoState ──────────────────────────────────────────────────────────

function useAlocacaoState() {
  const storeClasses = useStore((s) => s.assetClasses)
  const assets = useStore((s) => s.assets)
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
  const resolvedClasses = resolveClassValues(classes, assets)
  const total = getTotalValue(resolvedClasses)
  const sumTarget = classes.reduce((s, c) => s + c.targetPercentage, 0)
  const isValid = Math.abs(sumTarget - 100) < 0.01

  function getLinkedInfo(classId: string): { count: number; value: number; linkedAssets: Asset[] } {
    const linked = assets.filter((a) => a.classId === classId)
    const value = linked.reduce((s, a) => s + a.quantity * a.avgPrice * (1 + a.gainLossPct / 100), 0)
    return { count: linked.length, value, linkedAssets: linked }
  }

  function update(id: string, key: keyof AssetClass, value: string | number) {
    setClasses((prev) => prev.map((c) => {
      if (c.id !== id) return c
      const updated = { ...c, [key]: value }
      if ((key === 'foreignValue' || key === 'currency') && updated.currency !== 'BRL') {
        updated.currentValue = convertToBRL(updated.foreignValue ?? 0, updated.currency as Currency, rates)
      }
      if (key === 'currency' && value === 'BRL') { updated.foreignValue = undefined }
      return updated
    }))
    setSaved(false)
  }

  function add() {
    const usedColors = classes.map((c) => c.color)
    const color = CLASS_COLORS.find((c) => !usedColors.includes(c)) ?? CLASS_COLORS[classes.length % CLASS_COLORS.length]
    setClasses([...classes, { id: generateId(), name: 'Nova Classe', color, targetPercentage: 0, currentValue: 0, currency: 'BRL' }])
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

  function removeClass(id: string) {
    setClasses((prev) => prev.filter((c) => c.id !== id))
    setSaved(false)
  }

  const unlinkedAssets = assets.filter((a) => !a.classId)
  const unlinkedTotal = unlinkedAssets.reduce(
    (s, a) => s + a.quantity * a.avgPrice * (1 + a.gainLossPct / 100), 0
  )

  return {
    classes, settings, ratesCache, ratesFetching, ratesError, refreshRates,
    rates, total, sumTarget, isValid, remaining: 100 - sumTarget,
    needsRates: classes.some((c) => c.currency && c.currency !== 'BRL'),
    saved, showTemplates, setShowTemplates,
    update, add, applyTemplate, save, removeClass, getLinkedInfo,
    unlinkedAssets, unlinkedTotal,
  }
}

// ── Alocacao ──────────────────────────────────────────────────────────────────

export default function Alocacao() {
  const s = useAlocacaoState()

  return (
    <div style={{ maxWidth: '72rem', margin: '0 auto', padding: '2rem 1.5rem 3rem' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '2rem', gap: '1rem', flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: '1.75rem', fontWeight: 400, color: 'var(--txt-1)', letterSpacing: '-0.02em', lineHeight: 1.1, marginBottom: '0.375rem' }}>
            Alocação
          </h1>
          <p style={{ color: 'var(--txt-3)', fontSize: '0.875rem' }}>Defina o percentual alvo e o valor atual de cada classe.</p>
        </div>
        <TemplatesMenu open={s.showTemplates} onToggle={() => s.setShowTemplates(!s.showTemplates)} onApply={s.applyTemplate} />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {s.needsRates && (
          <RatesBanner ratesCache={s.ratesCache} ratesFetching={s.ratesFetching} ratesError={s.ratesError}
            rates={s.rates} onRefresh={s.refreshRates} />
        )}

        <SumIndicator sumTarget={s.sumTarget} isValid={s.isValid} remaining={s.remaining} />

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {s.classes.map((cls) => {
            const { count: linkedCount, value: linkedValue, linkedAssets } = s.getLinkedInfo(cls.id)
            return (
              <ClassCard key={cls.id} cls={cls} total={s.total} rates={s.rates}
                showDecimals={s.settings.showDecimals}
                linkedCount={linkedCount} linkedValue={linkedValue} linkedAssets={linkedAssets}
                onChange={s.update} onRemove={s.removeClass} />
            )
          })}
        </div>

        {/* Unclassified assets warning */}
        {s.unlinkedAssets.length > 0 && (
          <div style={{
            display: 'flex', alignItems: 'flex-start', gap: '0.75rem',
            padding: '0.875rem 1rem', borderRadius: '0.75rem',
            border: '1px solid color-mix(in srgb, var(--warning) 30%, transparent)',
            background: 'color-mix(in srgb, var(--warning) 5%, transparent)',
          }}>
            <span style={{ fontSize: '0.875rem', flexShrink: 0, marginTop: '0.125rem' }}>⚠</span>
            <div style={{ flex: 1, fontSize: '0.8125rem' }}>
              <p style={{ color: 'var(--warning)', fontWeight: 500, marginBottom: '0.25rem' }}>
                {s.unlinkedAssets.length} ativo{s.unlinkedAssets.length > 1 ? 's' : ''} sem classe
                <span style={{ fontFamily: "'DM Mono', monospace", fontWeight: 400, marginLeft: '0.5rem', color: 'var(--txt-2)' }}>
                  · {formatCurrency(s.unlinkedTotal, s.settings.showDecimals)}
                </span>
              </p>
              <p style={{ color: 'var(--txt-3)', lineHeight: 1.5 }}>
                {s.unlinkedAssets.map((a, i) => (
                  <span key={a.id}>
                    {i > 0 && ', '}
                    <span style={{ fontFamily: "'DM Mono', monospace" }}>{a.ticker ?? a.name}</span>
                  </span>
                ))}
                {' '}não contribuem para a análise de alocação. Vincule-os a uma classe na{' '}
                <a href="/app/carteira" style={{ color: 'var(--accent)', textDecoration: 'none' }}>Carteira</a>.
              </p>
            </div>
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '0.5rem' }}>
          <button onClick={s.add} className="btn-ghost">
            <Plus size={14} /> Nova classe
          </button>
          <button onClick={s.save} disabled={!s.isValid} className="btn-primary">
            {s.saved ? <><Check size={14} /> Salvo!</> : 'Salvar alocação'}
          </button>
        </div>
      </div>
    </div>
  )
}
