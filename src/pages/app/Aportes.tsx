import { useState, useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { Link } from 'react-router-dom'
import { Info, ArrowRight, TrendingUp } from 'lucide-react'
import { useStore } from '../../store/store'
import { getTotalValue, suggestContribution, getProjectedPercentage, resolveClassValues } from '../../utils/calculations'
import { formatCurrency, formatPercent, truncateName, chartLabelFormatter } from '../../utils/format'

const CHART_TOOLTIP = {
  background: '#161b22', border: '1px solid #30363d', borderRadius: 10,
  fontSize: 12, color: '#e2e8f0', fontFamily: "'DM Sans', sans-serif",
}

// ── SuggestionRow ─────────────────────────────────────────────────────────────

interface SuggestionRowProps {
  name: string; color: string; amount: number; share: number
  currentPct: number; targetPct: number; showDecimals: boolean
}

function SuggestionRow({ name, color, amount, share, currentPct, targetPct, showDecimals }: SuggestionRowProps) {
  const gain = targetPct - currentPct
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', padding: '0.875rem 0', borderBottom: '1px solid var(--border)' }}
      className="last:border-0">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', minWidth: 0 }}>
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: color, flexShrink: 0 }} />
          <span style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--txt-1)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</span>
        </div>
        <span style={{ fontFamily: "'DM Mono', monospace", fontSize: '1rem', fontWeight: 400, color: 'var(--accent)', flexShrink: 0, marginLeft: '0.75rem' }}>
          {formatCurrency(amount, showDecimals)}
        </span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.75rem', fontFamily: "'DM Mono', monospace", color: 'var(--txt-3)' }}>
        <span>{formatPercent(currentPct)}</span>
        <ArrowRight size={9} style={{ color: 'var(--accent)' }} />
        <span style={{ color: 'var(--accent)' }}>{formatPercent(currentPct + gain * (share / 100))}</span>
        <span style={{ marginLeft: 'auto' }}>{formatPercent(share)} do aporte</span>
      </div>
      <div style={{ height: 4, background: 'var(--border)', borderRadius: 9999, overflow: 'hidden' }}>
        <div style={{ height: '100%', borderRadius: 9999, background: color, width: `${share}%`, transition: 'width 500ms' }} />
      </div>
    </div>
  )
}

// ── EmptyState ────────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div className="card" style={{ textAlign: 'center', padding: '3rem 1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
      <div style={{
        width: 40, height: 40, borderRadius: 10,
        background: 'var(--surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <TrendingUp size={18} style={{ color: 'var(--txt-3)' }} />
      </div>
      <p style={{ color: 'var(--txt-2)', fontSize: '0.875rem' }}>Nenhuma classe de ativo configurada.</p>
      <Link to="/app/alocacao" className="btn-secondary" style={{ fontSize: '0.8125rem' }}>
        Configurar alocação →
      </Link>
    </div>
  )
}

// ── Aportes ───────────────────────────────────────────────────────────────────

export default function Aportes() {
  const rawClasses = useStore((s) => s.assetClasses)
  const assets = useStore((s) => s.assets)
  const classes = resolveClassValues(rawClasses, assets)
  const settings = useStore((s) => s.settings)

  const [amount, setAmount] = useState('')
  const [showInfo, setShowInfo] = useState(false)

  const numAmount = parseFloat(amount.replace(',', '.')) || 0
  const total = getTotalValue(classes)
  const sd = settings.showDecimals

  const suggestions = useMemo(() => suggestContribution(classes, numAmount), [classes, numAmount])
  const contributionTotal = useMemo(() => suggestions.reduce((s, sg) => s + sg.amount, 0), [suggestions])

  const chartData = classes.map((c) => ({
    name: truncateName(c.name), fullName: c.name,
    atual: parseFloat((total > 0 ? (c.currentValue / total) * 100 : 0).toFixed(1)),
    meta: c.targetPercentage,
    projetado: parseFloat(getProjectedPercentage(c, suggestions, total, contributionTotal).toFixed(1)),
    color: c.color,
  }))

  return (
    <div style={{ maxWidth: '56rem', margin: '0 auto', padding: '2rem 1.5rem 3rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: '1.75rem', fontWeight: 400, color: 'var(--txt-1)', letterSpacing: '-0.02em', lineHeight: 1.1, marginBottom: '0.375rem' }}>
          Simulador de Aporte
        </h1>
        <p style={{ color: 'var(--txt-3)', fontSize: '0.875rem' }}>Informe o valor disponível e veja onde cada real deve ir.</p>
      </div>

      {/* Amount input */}
      <div className="card" style={{ marginBottom: '1.25rem' }}>
        <label className="label">Valor do aporte</label>
        <div style={{ position: 'relative' }}>
          <span style={{
            position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)',
            color: 'var(--txt-3)', fontWeight: 500, fontFamily: "'DM Mono', monospace",
          }}>R$</span>
          <input type="number" className="input"
            style={{ paddingLeft: '2.75rem', fontSize: '1.375rem', fontFamily: "'DM Mono', monospace", fontWeight: 300, paddingTop: '0.875rem', paddingBottom: '0.875rem' }}
            value={amount} onChange={(e) => setAmount(e.target.value)}
            placeholder="0" min={0} step={100} />
        </div>
        {numAmount > 0 && total > 0 && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '1rem',
            padding: '0.875rem 1rem', borderRadius: '0.75rem', background: 'var(--surface-2)', fontSize: '0.8125rem',
          }}>
            <div style={{ flex: 1 }}>
              <p style={{ color: 'var(--txt-3)', marginBottom: '0.25rem', fontSize: '0.75rem' }}>Patrimônio atual</p>
              <p style={{ fontFamily: "'DM Mono', monospace", fontWeight: 400, color: 'var(--txt-1)' }}>{formatCurrency(total, sd)}</p>
            </div>
            <ArrowRight size={14} style={{ color: 'var(--accent)', flexShrink: 0 }} />
            <div style={{ flex: 1, textAlign: 'right' }}>
              <p style={{ color: 'var(--txt-3)', marginBottom: '0.25rem', fontSize: '0.75rem' }}>Após aporte</p>
              <p style={{ fontFamily: "'DM Mono', monospace", fontWeight: 400, color: 'var(--accent)' }}>{formatCurrency(total + numAmount, sd)}</p>
            </div>
          </div>
        )}
      </div>

      {classes.length === 0 && <EmptyState />}

      {/* Suggestions */}
      {numAmount > 0 && classes.length > 0 && (
        <div className="card" style={{ marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
            <h3 style={{ fontSize: '0.9375rem', fontWeight: 500, color: 'var(--txt-1)' }}>Distribuição sugerida</h3>
            <button onClick={() => setShowInfo(!showInfo)} style={{
              background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--txt-3)',
              display: 'flex', alignItems: 'center',
            }}>
              <Info size={14} />
            </button>
          </div>
          {showInfo && (
            <p style={{
              fontSize: '0.8125rem', color: 'var(--txt-2)', background: 'var(--surface-2)',
              borderRadius: '0.75rem', padding: '0.875rem 1rem', marginTop: '0.75rem', lineHeight: 1.6,
            }}>
              O aporte é distribuído proporcionalmente ao déficit de cada classe no patrimônio projetado. Classes no alvo ou acima recebem zero. Nenhuma venda é sugerida.
            </p>
          )}
          {suggestions.length === 0 ? (
            <p style={{ fontSize: '0.875rem', color: 'var(--txt-3)', padding: '1.5rem 0', textAlign: 'center' }}>
              Todas as classes estão no alvo — qualquer distribuição é válida.
            </p>
          ) : (
            <>
              <div style={{ marginTop: '0.75rem' }}>
                {suggestions.map((sg) => (
                  <SuggestionRow key={sg.assetClassId}
                    name={sg.assetClassName} color={sg.color}
                    amount={sg.amount} share={sg.share}
                    currentPct={sg.currentPercentage} targetPct={sg.targetPercentage}
                    showDecimals={sd} />
                ))}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.875rem', marginTop: '0.25rem' }}>
                <span style={{ fontSize: '0.8125rem', color: 'var(--txt-3)' }}>Total distribuído</span>
                <span style={{ fontFamily: "'DM Mono', monospace", fontWeight: 400, color: 'var(--accent)', fontSize: '1.125rem' }}>
                  {formatCurrency(contributionTotal, sd)}
                </span>
              </div>
            </>
          )}
        </div>
      )}

      {/* Before / after chart */}
      {total > 0 && numAmount > 0 && suggestions.length > 0 && (
        <div className="card">
          <h3 style={{ fontSize: '0.9375rem', fontWeight: 500, color: 'var(--txt-1)', marginBottom: '1.25rem' }}>Antes e depois do aporte</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData} margin={{ left: -25 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#30363d" vertical={false} />
              <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 10, fontFamily: "'DM Mono', monospace" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#64748b', fontSize: 10, fontFamily: "'DM Mono', monospace" }} axisLine={false} tickLine={false} unit="%" />
              <Tooltip contentStyle={CHART_TOOLTIP}
                formatter={(v: number, name: string | number) => {
                  const labels: Record<string, string> = { atual: 'Atual', projetado: 'Após aporte', meta: 'Meta' }
                  return [`${v.toFixed(1)}%`, labels[String(name)] ?? String(name)]
                }}
                labelFormatter={chartLabelFormatter}
              />
              <Bar dataKey="atual" fill="#1e3a5f" radius={[3, 3, 0, 0]} />
              <Bar dataKey="projetado" radius={[3, 3, 0, 0]}>
                {chartData.map((e) => <Cell key={e.fullName} fill={e.color} />)}
              </Bar>
              <Bar dataKey="meta" fill="#21262d" stroke="#30363d" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          <div style={{ display: 'flex', gap: '1.25rem', marginTop: '0.75rem', fontSize: '0.75rem', color: 'var(--txt-3)' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
              <span style={{ width: 8, height: 8, borderRadius: 2, background: '#1e3a5f', display: 'inline-block' }} />Atual
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
              <span style={{ width: 8, height: 8, borderRadius: 2, background: 'var(--accent)', display: 'inline-block' }} />Após aporte
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
              <span style={{ width: 8, height: 8, borderRadius: 2, background: '#21262d', border: '1px solid #30363d', display: 'inline-block' }} />Meta
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
