import { useState } from 'react'
import { Plus, Pencil, Trash2, Check, X, TrendingUp, TrendingDown } from 'lucide-react'
import { useStore } from '../../store/store'
import { formatCurrency } from '../../utils/format'
import { convertToBRL, formatForeign, CURRENCY_SYMBOLS } from '../../utils/rates'
import { resolveClassValues, computePortfolioTotal } from '../../utils/calculations'
import type { Currency, RatesCache } from '../../utils/rates'
import type { Asset } from '../../types'

// ── helpers ───────────────────────────────────────────────────────────────────

function investedValue(a: Asset) { return a.quantity * a.avgPrice }
function currentValue(a: Asset) { return investedValue(a) * (1 + a.gainLossPct / 100) }
function pnlBRL(a: Asset) { return currentValue(a) - investedValue(a) }

function totals(assets: Asset[]) {
  const invested = assets.reduce((s, a) => s + investedValue(a), 0)
  const current  = assets.reduce((s, a) => s + currentValue(a), 0)
  const pnl      = current - invested
  const pnlPct   = invested > 0 ? (pnl / invested) * 100 : 0
  return { invested, current, pnl, pnlPct }
}

function fmtPct(pct: number) {
  const sign = pct >= 0 ? '+' : '−'
  return `${sign}${Math.abs(pct).toFixed(2)}%`
}

// ── SummaryCard ───────────────────────────────────────────────────────────────

interface SummaryCardProps {
  label: string
  value: string
  sub?: string
  accent?: boolean
  positive?: boolean
  negative?: boolean
}

function SummaryCard({ label, value, sub, accent, positive, negative }: SummaryCardProps) {
  const valueColor = positive ? 'var(--positive)' : negative ? 'var(--negative)' : accent ? 'var(--accent)' : 'var(--txt-1)'
  return (
    <div className="card">
      <p style={{ fontSize: '0.6875rem', color: 'var(--txt-3)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.625rem' }}>
        {label}
      </p>
      <p style={{ fontFamily: "'DM Mono', monospace", fontSize: '1.375rem', fontWeight: 400, color: valueColor, lineHeight: 1.1, letterSpacing: '-0.02em' }}>
        {value}
      </p>
      {sub && (
        <p style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.8125rem', color: 'var(--txt-3)', marginTop: '0.25rem' }}>
          {sub}
        </p>
      )}
    </div>
  )
}

// ── EmptyRow ──────────────────────────────────────────────────────────────────

function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <div style={{ textAlign: 'center', padding: '4rem 1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
      <div style={{
        width: 48, height: 48, borderRadius: 12,
        background: 'color-mix(in srgb, var(--accent) 8%, transparent)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <TrendingUp size={20} style={{ color: 'var(--accent)' }} />
      </div>
      <div>
        <p style={{ color: 'var(--txt-1)', fontWeight: 500, marginBottom: '0.25rem' }}>Nenhum ativo cadastrado</p>
        <p style={{ color: 'var(--txt-3)', fontSize: '0.875rem' }}>Adicione seu primeiro ativo para acompanhar o desempenho.</p>
      </div>
      <button className="btn-primary" onClick={onAdd}>
        <Plus size={14} /> Adicionar ativo
      </button>
    </div>
  )
}

// ── AssetForm ─────────────────────────────────────────────────────────────────

interface FormState {
  name: string
  ticker: string
  quantity: string
  avgPrice: string
  gainLossPct: string
  currency: Currency
  classId: string
}

const emptyForm: FormState = { name: '', ticker: '', quantity: '', avgPrice: '', gainLossPct: '', currency: 'BRL', classId: '' }

interface AssetFormProps {
  initial?: FormState
  onSave: (f: FormState) => void
  onCancel: () => void
  isEdit?: boolean
  ratesCache: RatesCache | null
  assetClasses: { id: string; name: string; color: string }[]
}

function AssetForm({ initial = emptyForm, onSave, onCancel, isEdit, ratesCache, assetClasses }: AssetFormProps) {
  const [f, setF] = useState<FormState>(initial)
  const set = (k: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement>) => setF((p) => ({ ...p, [k]: e.target.value }))

  const usdRate = ratesCache?.rates?.USD ?? 0
  const noRateWarning = f.currency === 'USD' && !usdRate
  const brlFactor = f.currency === 'USD' ? usdRate : 1

  const qty    = parseFloat(f.quantity)    || 0
  const price  = parseFloat(f.avgPrice)    || 0
  const pct    = parseFloat(f.gainLossPct) || 0
  const inv    = qty * price * brlFactor
  const cur    = inv * (1 + pct / 100)
  const pnl    = cur - inv

  const valid = f.name.trim() && parseFloat(f.quantity) > 0 && parseFloat(f.avgPrice) > 0 && f.gainLossPct !== '' && !noRateWarning

  const currSymbol = CURRENCY_SYMBOLS[f.currency]

  return (
    <div style={{
      border: '1px solid var(--border)',
      borderRadius: '0.75rem',
      padding: '1.25rem',
      background: 'var(--surface-2)',
      display: 'flex', flexDirection: 'column', gap: '1rem',
    }}>
      <p style={{ fontWeight: 500, color: 'var(--txt-1)', fontSize: '0.875rem' }}>{isEdit ? 'Editar ativo' : 'Novo ativo'}</p>

      {/* Row 1: name + ticker */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '0.75rem' }}>
        <div>
          <label className="label">Nome do ativo</label>
          <input className="input" value={f.name} onChange={set('name')} placeholder="Ex: Petrobras, Bitcoin" />
        </div>
        <div style={{ width: 96 }}>
          <label className="label">Ticker</label>
          <input className="input" value={f.ticker} onChange={set('ticker')} placeholder="PETR4" style={{ textTransform: 'uppercase' }} />
        </div>
      </div>

      {/* Class selector */}
      {assetClasses.length > 0 && (
        <div>
          <label className="label">Classe de alocação</label>
          <div style={{ position: 'relative' }}>
            {f.classId && (
              <span style={{
                position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)',
                width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
                background: assetClasses.find((c) => c.id === f.classId)?.color ?? 'transparent',
                pointerEvents: 'none',
              }} />
            )}
            <select className="input" value={f.classId}
              onChange={(e) => setF((p) => ({ ...p, classId: e.target.value }))}
              style={{ paddingLeft: f.classId ? '1.875rem' : '0.75rem', color: f.classId ? 'var(--txt-1)' : 'var(--txt-3)' }}>
              <option value="">Sem classe</option>
              {assetClasses.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Row 2: qty + avgPrice + pct */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
        <div>
          <label className="label">Quantidade</label>
          <input className="input" type="number" value={f.quantity} onChange={set('quantity')}
            placeholder="0" min="0" step="any" style={{ fontFamily: "'DM Mono', monospace" }} />
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.375rem' }}>
            <label className="label" style={{ margin: 0 }}>Preço médio</label>
            <div style={{ display: 'flex', borderRadius: 5, border: '1px solid var(--border)', overflow: 'hidden' }}>
              {(['BRL', 'USD'] as Currency[]).map((c) => (
                <button key={c} type="button"
                  onClick={() => setF((p) => ({ ...p, currency: c }))}
                  style={{
                    padding: '0.125rem 0.4rem', border: 'none', cursor: 'pointer',
                    background: f.currency === c ? 'var(--accent)' : 'transparent',
                    color: f.currency === c ? '#fff' : 'var(--txt-3)',
                    fontFamily: "'DM Mono', monospace", fontSize: '0.6875rem',
                    transition: 'all 120ms ease',
                  }}>
                  {CURRENCY_SYMBOLS[c]}
                </button>
              ))}
            </div>
          </div>
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--txt-3)', fontSize: '0.8125rem', fontFamily: "'DM Mono', monospace" }}>
              {currSymbol}
            </span>
            <input className="input" type="number" value={f.avgPrice} onChange={set('avgPrice')}
              placeholder="0" min="0" step="any"
              style={{ paddingLeft: f.currency === 'USD' ? '3rem' : '2.5rem', fontFamily: "'DM Mono', monospace" }} />
          </div>
          {noRateWarning && (
            <p style={{ fontSize: '0.6875rem', color: 'var(--negative)', marginTop: '0.25rem' }}>
              Cotação USD indisponível. Aguarde ou recarregue.
            </p>
          )}
        </div>
        <div>
          <label className="label">Variação (%)</label>
          <div style={{ position: 'relative' }}>
            <input className="input" type="number" value={f.gainLossPct} onChange={set('gainLossPct')}
              placeholder="0" step="any" style={{ paddingRight: '2rem', fontFamily: "'DM Mono', monospace",
                color: pct >= 0 ? 'var(--positive)' : 'var(--negative)' }} />
            <span style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--txt-3)', fontSize: '0.875rem' }}>%</span>
          </div>
        </div>
      </div>

      {/* Live preview */}
      {inv > 0 && (
        <div style={{
          display: 'flex', gap: '1.5rem', flexWrap: 'wrap',
          padding: '0.75rem 1rem', borderRadius: '0.5rem',
          background: 'var(--surface)', border: '1px solid var(--border)',
          fontSize: '0.8125rem',
        }}>
          <span style={{ color: 'var(--txt-3)' }}>Investido: <span style={{ fontFamily: "'DM Mono', monospace", color: 'var(--txt-1)' }}>{formatCurrency(inv)}</span></span>
          <span style={{ color: 'var(--txt-3)' }}>Atual: <span style={{ fontFamily: "'DM Mono', monospace", color: 'var(--txt-1)' }}>{formatCurrency(cur)}</span></span>
          <span style={{ color: 'var(--txt-3)' }}>P&L: <span style={{ fontFamily: "'DM Mono', monospace", color: pnl >= 0 ? 'var(--positive)' : 'var(--negative)' }}>{pnl >= 0 ? '+' : '−'}{formatCurrency(Math.abs(pnl))}</span></span>
        </div>
      )}

      {/* Actions */}
      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
        <button className="btn-ghost" onClick={onCancel} style={{ color: 'var(--txt-2)' }}>
          <X size={13} /> Cancelar
        </button>
        <button className="btn-primary" onClick={() => valid && onSave(f)} disabled={!valid}>
          <Check size={13} /> {isEdit ? 'Salvar' : 'Adicionar'}
        </button>
      </div>
    </div>
  )
}

// ── AssetRow ──────────────────────────────────────────────────────────────────

interface AssetRowProps {
  asset: Asset
  showDecimals: boolean
  linkedClass?: { name: string; color: string; dev?: number }
  onEdit: () => void
  onDelete: () => void
}

function AssetRow({ asset, showDecimals, linkedClass, onEdit, onDelete }: AssetRowProps) {
  const inv  = investedValue(asset)
  const cur  = currentValue(asset)
  const pnl  = pnlBRL(asset)
  const isPos = asset.gainLossPct >= 0

  const classDev = linkedClass?.dev
  const classDevLabel = classDev !== undefined
    ? Math.abs(classDev) <= 2 ? '✓'
      : classDev > 0 ? `↓${classDev.toFixed(1)}pp`
      : `↑${Math.abs(classDev).toFixed(1)}pp`
    : null
  const classDevColor = classDev !== undefined
    ? Math.abs(classDev) <= 2 ? 'var(--positive)'
      : classDev > 0 ? 'var(--warning)'
      : 'var(--negative)'
    : 'var(--txt-3)'

  const cellStyle: React.CSSProperties = {
    padding: '1rem 0.75rem',
    borderBottom: '1px solid var(--border)',
    fontSize: '0.875rem',
    verticalAlign: 'middle',
  }
  const monoStyle: React.CSSProperties = { fontFamily: "'DM Mono', monospace", fontWeight: 300 }

  return (
    <tr style={{ transition: 'background 100ms ease' }}
      onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--surface-2)')}
      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}>
      {/* Ativo */}
      <td style={cellStyle}>
        <div style={{ fontWeight: 500, color: 'var(--txt-1)' }}>{asset.name}</div>
        {asset.ticker && (
          <div style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.75rem', color: 'var(--txt-3)', marginTop: '0.125rem' }}>
            {asset.ticker.toUpperCase()}
          </div>
        )}
        {linkedClass && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', marginTop: '0.25rem', flexWrap: 'wrap' }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: linkedClass.color, flexShrink: 0 }} />
            <span style={{ fontSize: '0.6875rem', color: 'var(--txt-3)' }}>{linkedClass.name}</span>
            {classDevLabel && (
              <span style={{ fontSize: '0.625rem', fontFamily: "'DM Mono', monospace", color: classDevColor }}>
                {classDevLabel}
              </span>
            )}
          </div>
        )}
      </td>
      {/* Qtd */}
      <td style={{ ...cellStyle, textAlign: 'right' }}>
        <span style={{ ...monoStyle, color: 'var(--txt-2)' }}>{asset.quantity.toLocaleString('pt-BR', { maximumFractionDigits: 8 })}</span>
      </td>
      {/* Preço médio */}
      <td style={{ ...cellStyle, textAlign: 'right' }}>
        <span style={{ ...monoStyle, color: 'var(--txt-2)' }}>
          {asset.currency && asset.currency !== 'BRL' && asset.foreignAvgPrice != null
            ? formatForeign(asset.foreignAvgPrice, asset.currency)
            : formatCurrency(asset.avgPrice, showDecimals)}
        </span>
      </td>
      {/* Variação */}
      <td style={{ ...cellStyle, textAlign: 'right' }}>
        <span style={{ ...monoStyle, fontWeight: 400, color: isPos ? 'var(--positive)' : 'var(--negative)' }}>
          {isPos ? '+' : '−'}{Math.abs(asset.gainLossPct).toFixed(2)}%
        </span>
      </td>
      {/* Investido */}
      <td style={{ ...cellStyle, textAlign: 'right' }}>
        <span style={{ ...monoStyle, color: 'var(--txt-2)' }}>{formatCurrency(inv, showDecimals)}</span>
      </td>
      {/* Valor atual */}
      <td style={{ ...cellStyle, textAlign: 'right' }}>
        <span style={{ ...monoStyle, color: 'var(--txt-1)' }}>{formatCurrency(cur, showDecimals)}</span>
      </td>
      {/* P&L */}
      <td style={{ ...cellStyle, textAlign: 'right' }}>
        <div style={{ ...monoStyle, fontWeight: 400, color: isPos ? 'var(--positive)' : 'var(--negative)' }}>
          {pnl >= 0 ? '+' : '−'}{formatCurrency(Math.abs(pnl), showDecimals)}
        </div>
      </td>
      {/* Actions */}
      <td style={{ ...cellStyle, textAlign: 'right', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', gap: '0.25rem', justifyContent: 'flex-end' }}>
          <button onClick={onEdit} style={{
            width: 28, height: 28, borderRadius: 6, border: 'none',
            background: 'transparent', cursor: 'pointer', color: 'var(--txt-3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all 120ms ease',
          }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--surface-2)'; e.currentTarget.style.color = 'var(--txt-1)' }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--txt-3)' }}>
            <Pencil size={13} />
          </button>
          <button onClick={onDelete} style={{
            width: 28, height: 28, borderRadius: 6, border: 'none',
            background: 'transparent', cursor: 'pointer', color: 'var(--txt-3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all 120ms ease',
          }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'color-mix(in srgb, var(--negative) 8%, transparent)'; e.currentTarget.style.color = 'var(--negative)' }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--txt-3)' }}>
            <Trash2 size={13} />
          </button>
        </div>
      </td>
    </tr>
  )
}

// ── Carteira ──────────────────────────────────────────────────────────────────

export default function Carteira() {
  const assets = useStore((s) => s.assets)
  const assetClasses = useStore((s) => s.assetClasses)
  const settings = useStore((s) => s.settings)
  const addAsset = useStore((s) => s.addAsset)
  const updateAsset = useStore((s) => s.updateAsset)
  const removeAsset = useStore((s) => s.removeAsset)

  const ratesCache = useStore((s) => s.ratesCache)

  const [adding, setAdding] = useState(false)
  const [editing, setEditing] = useState<string | null>(null)
  const sd = settings.showDecimals

  const resolvedClasses = resolveClassValues(assetClasses, assets)
  const portfolioTotal = computePortfolioTotal(assetClasses, assets)
  const classDevMap = new Map(
    resolvedClasses.map(c => [c.id, {
      name: c.name,
      color: c.color,
      dev: c.targetPercentage - (portfolioTotal > 0 ? (c.currentValue / portfolioTotal) * 100 : 0),
    }])
  )

  const { invested, current, pnl, pnlPct } = totals(assets)
  const isPnlPos = pnl >= 0

  function handleAdd(f: FormState) {
    const foreignPrice = parseFloat(f.avgPrice)
    const avgPriceBRL = f.currency === 'BRL'
      ? foreignPrice
      : convertToBRL(foreignPrice, f.currency, ratesCache?.rates ?? {})
    addAsset({
      name: f.name.trim(),
      ticker: f.ticker.trim().toUpperCase() || undefined,
      quantity: parseFloat(f.quantity),
      avgPrice: avgPriceBRL,
      gainLossPct: parseFloat(f.gainLossPct),
      ...(f.currency !== 'BRL' ? { currency: f.currency, foreignAvgPrice: foreignPrice } : {}),
      ...(f.classId ? { classId: f.classId } : {}),
    })
    setAdding(false)
  }

  function handleUpdate(id: string, f: FormState) {
    const foreignPrice = parseFloat(f.avgPrice)
    const avgPriceBRL = f.currency === 'BRL'
      ? foreignPrice
      : convertToBRL(foreignPrice, f.currency, ratesCache?.rates ?? {})
    updateAsset(id, {
      name: f.name.trim(),
      ticker: f.ticker.trim().toUpperCase() || undefined,
      quantity: parseFloat(f.quantity),
      avgPrice: avgPriceBRL,
      gainLossPct: parseFloat(f.gainLossPct),
      currency: f.currency !== 'BRL' ? f.currency : undefined,
      foreignAvgPrice: f.currency !== 'BRL' ? foreignPrice : undefined,
      classId: f.classId || undefined,
    })
    setEditing(null)
  }

  function toForm(a: Asset): FormState {
    return {
      name: a.name,
      ticker: a.ticker ?? '',
      quantity: String(a.quantity),
      avgPrice: a.currency && a.currency !== 'BRL' && a.foreignAvgPrice != null
        ? String(a.foreignAvgPrice)
        : String(a.avgPrice),
      gainLossPct: String(a.gainLossPct),
      currency: a.currency ?? 'BRL',
      classId: a.classId ?? '',
    }
  }

  const thStyle: React.CSSProperties = {
    padding: '0.625rem 0.75rem',
    fontSize: '0.6875rem',
    fontWeight: 500,
    color: 'var(--txt-3)',
    textTransform: 'uppercase',
    letterSpacing: '0.07em',
    borderBottom: '1px solid var(--border)',
    background: 'var(--surface)',
  }

  return (
    <div style={{ maxWidth: '72rem', margin: '0 auto', padding: '2rem 1.5rem 3rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '2rem', gap: '1rem' }}>
        <div>
          <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: '1.75rem', fontWeight: 400, color: 'var(--txt-1)', letterSpacing: '-0.02em', lineHeight: 1.1, marginBottom: '0.375rem' }}>
            Minha Carteira
          </h1>
          <p style={{ color: 'var(--txt-3)', fontSize: '0.875rem' }}>Desempenho individual dos seus investimentos</p>
        </div>
        {assets.length > 0 && !adding && !editing && (
          <button className="btn-primary" onClick={() => setAdding(true)}>
            <Plus size={14} /> Adicionar ativo
          </button>
        )}
      </div>

      {/* Summary cards */}
      {assets.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
          <SummaryCard label="Total investido" value={formatCurrency(invested, sd)} />
          <SummaryCard label="Valor atual" value={formatCurrency(current, sd)} accent />
          <SummaryCard
            label="Resultado (P&L)"
            value={`${isPnlPos ? '+' : '−'}${formatCurrency(Math.abs(pnl), sd)}`}
            sub={fmtPct(pnlPct)}
            positive={isPnlPos && pnl !== 0}
            negative={!isPnlPos}
          />
        </div>
      )}

      {/* Add form */}
      {adding && (
        <div style={{ marginBottom: '1.5rem' }}>
          <AssetForm onSave={handleAdd} onCancel={() => setAdding(false)} ratesCache={ratesCache} assetClasses={assetClasses} />
        </div>
      )}

      {/* Empty state */}
      {assets.length === 0 && !adding && (
        <div className="card">
          <EmptyState onAdd={() => setAdding(true)} />
        </div>
      )}

      {/* Assets table */}
      {assets.length > 0 && (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ ...thStyle, textAlign: 'left', borderRadius: '1rem 0 0 0' }}>Ativo</th>
                  <th style={{ ...thStyle, textAlign: 'right' }}>Qtd.</th>
                  <th style={{ ...thStyle, textAlign: 'right' }}>Preço médio</th>
                  <th style={{ ...thStyle, textAlign: 'right' }}>Var. %</th>
                  <th style={{ ...thStyle, textAlign: 'right' }}>Investido</th>
                  <th style={{ ...thStyle, textAlign: 'right' }}>Atual</th>
                  <th style={{ ...thStyle, textAlign: 'right' }}>P&L</th>
                  <th style={{ ...thStyle, textAlign: 'right', borderRadius: '0 1rem 0 0' }}></th>
                </tr>
              </thead>
              <tbody>
                {assets.map((asset) =>
                  editing === asset.id ? (
                    <tr key={asset.id}>
                      <td colSpan={8} style={{ padding: '0.75rem', borderBottom: '1px solid var(--border)', background: 'var(--surface-2)' }}>
                        <AssetForm
                          initial={toForm(asset)}
                          onSave={(f) => handleUpdate(asset.id, f)}
                          onCancel={() => setEditing(null)}
                          isEdit
                          ratesCache={ratesCache}
                          assetClasses={assetClasses}
                        />
                      </td>
                    </tr>
                  ) : (
                    <AssetRow key={asset.id} asset={asset} showDecimals={sd}
                      linkedClass={asset.classId ? classDevMap.get(asset.classId) : undefined}
                      onEdit={() => { setEditing(asset.id); setAdding(false) }}
                      onDelete={() => removeAsset(asset.id)} />
                  )
                )}
              </tbody>
            </table>
          </div>

          {/* Add from bottom of table */}
          {!adding && !editing && (
            <div style={{ padding: '0.875rem 1.25rem', borderTop: assets.length > 0 ? '1px solid var(--border)' : 'none' }}>
              <button onClick={() => setAdding(true)} style={{
                display: 'flex', alignItems: 'center', gap: '0.5rem',
                color: 'var(--accent)', fontSize: '0.875rem', fontWeight: 500,
                background: 'transparent', border: 'none', cursor: 'pointer',
                padding: '0.25rem 0', transition: 'opacity 120ms ease',
              }}>
                <Plus size={14} /> Adicionar ativo
              </button>
            </div>
          )}

          {adding && (
            <div style={{ padding: '0.75rem 1.25rem 1.25rem', borderTop: '1px solid var(--border)', background: 'var(--surface-2)' }}>
              <AssetForm onSave={handleAdd} onCancel={() => setAdding(false)} ratesCache={ratesCache} assetClasses={assetClasses} />
            </div>
          )}
        </div>
      )}

      {/* Disclaimer */}
      {assets.length > 0 && (
        <p style={{ fontSize: '0.75rem', color: 'var(--txt-3)', marginTop: '1.5rem' }}>
          Variação inserida manualmente. Os valores são calculados com base no preço médio e no percentual informado.
        </p>
      )}
    </div>
  )
}
