import { Link } from 'react-router-dom'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts'
import { AlertTriangle, CheckCircle2, Zap, Plus, ArrowRight, TrendingUp, TrendingDown } from 'lucide-react'
import { useStore } from '../../store/store'
import { getTotalValue, getCurrentPercentage, getDeviation, resolveClassValues, computePortfolioTotal } from '../../utils/calculations'
import { formatCurrency, formatPercent, truncateName, chartLabelFormatter } from '../../utils/format'
import type { Asset } from '../../types'

// ── asset helpers ─────────────────────────────────────────────────────────────

function assetInvested(a: Asset) { return a.quantity * a.avgPrice }
function assetCurrent(a: Asset) { return assetInvested(a) * (1 + a.gainLossPct / 100) }

// ── KPI Card ──────────────────────────────────────────────────────────────────

interface KpiCardProps { label: string; children: React.ReactNode }

function KpiCard({ label, children }: KpiCardProps) {
  return (
    <div className="card">
      <p style={{ fontSize: '0.6875rem', color: 'var(--txt-3)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.625rem' }}>
        {label}
      </p>
      {children}
    </div>
  )
}

// ── AllocationTable ───────────────────────────────────────────────────────────

function AllocationTable({ classes }: { classes: ReturnType<typeof useStore>['assetClasses'] }) {
  const settings = useStore((s) => s.settings)
  const total = getTotalValue(classes)
  const sd = settings.showDecimals

  const thStyle: React.CSSProperties = {
    padding: '0.5rem 0.75rem',
    fontSize: '0.6875rem', fontWeight: 500,
    color: 'var(--txt-3)', textTransform: 'uppercase', letterSpacing: '0.07em',
    borderBottom: '1px solid var(--border)', textAlign: 'left',
  }

  return (
    <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem 1.5rem 0' }}>
        <h3 style={{ fontSize: '0.9375rem', fontWeight: 500, color: 'var(--txt-1)' }}>Posição por classe</h3>
        <Link to="/app/alocacao" style={{
          fontSize: '0.8125rem', color: 'var(--accent)', textDecoration: 'none',
          display: 'flex', alignItems: 'center', gap: '0.25rem',
        }}>
          Editar <ArrowRight size={12} />
        </Link>
      </div>
      <div style={{ overflowX: 'auto', marginTop: '1rem' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ ...thStyle, paddingLeft: '1.5rem' }}>Classe</th>
              <th style={{ ...thStyle, textAlign: 'right' }}>Valor</th>
              <th style={{ ...thStyle, textAlign: 'right' }}>Atual</th>
              <th style={{ ...thStyle, textAlign: 'right' }}>Meta</th>
              <th style={{ ...thStyle, textAlign: 'right', paddingRight: '1.5rem' }}>Desvio</th>
            </tr>
          </thead>
          <tbody>
            {classes.map((c) => {
              const pct = getCurrentPercentage(c, total)
              const dev = getDeviation(c, total)
              const devColor = dev > 2 ? 'var(--warning)' : dev < -2 ? 'var(--negative)' : 'var(--positive)'
              return (
                <tr key={c.id}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--surface-2)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  style={{ transition: 'background 100ms' }}>
                  <td style={{ padding: '0.875rem 0.75rem 0.875rem 1.5rem', borderBottom: '1px solid var(--border)', fontSize: '0.875rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: c.color, flexShrink: 0 }} />
                      <span style={{ color: 'var(--txt-1)' }}>{c.name}</span>
                    </div>
                  </td>
                  <td style={{ padding: '0.875rem 0.75rem', textAlign: 'right', borderBottom: '1px solid var(--border)', fontFamily: "'DM Mono', monospace", fontWeight: 300, fontSize: '0.875rem', color: 'var(--txt-1)' }}>
                    {formatCurrency(c.currentValue, sd)}
                  </td>
                  <td style={{ padding: '0.875rem 0.75rem', textAlign: 'right', borderBottom: '1px solid var(--border)', fontFamily: "'DM Mono', monospace", fontWeight: 300, fontSize: '0.875rem', color: 'var(--txt-2)' }}>
                    {formatPercent(pct)}
                  </td>
                  <td style={{ padding: '0.875rem 0.75rem', textAlign: 'right', borderBottom: '1px solid var(--border)', fontFamily: "'DM Mono', monospace", fontWeight: 300, fontSize: '0.875rem', color: 'var(--txt-3)' }}>
                    {formatPercent(c.targetPercentage)}
                  </td>
                  <td style={{ padding: '0.875rem 1.5rem 0.875rem 0.75rem', textAlign: 'right', borderBottom: '1px solid var(--border)', fontFamily: "'DM Mono', monospace", fontWeight: 400, fontSize: '0.875rem', color: devColor }}>
                    {dev > 0 ? '+' : ''}{formatPercent(dev)}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ── AssetsBlock ───────────────────────────────────────────────────────────────

function AssetsBlock() {
  const assets = useStore((s) => s.assets)
  const settings = useStore((s) => s.settings)
  const sd = settings.showDecimals

  if (assets.length === 0) {
    return (
      <div className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h3 style={{ fontSize: '0.9375rem', fontWeight: 500, color: 'var(--txt-1)', marginBottom: '0.25rem' }}>Seus Ativos</h3>
          <p style={{ fontSize: '0.8125rem', color: 'var(--txt-3)' }}>Acompanhe o desempenho individual de cada investimento.</p>
        </div>
        <Link to="/app/carteira" className="btn-primary">
          <Plus size={13} /> Adicionar ativo
        </Link>
      </div>
    )
  }

  const totalInvested = assets.reduce((s, a) => s + assetInvested(a), 0)
  const totalCurrent  = assets.reduce((s, a) => s + assetCurrent(a), 0)
  const totalPnl      = totalCurrent - totalInvested
  const totalPnlPct   = totalInvested > 0 ? (totalPnl / totalInvested) * 100 : 0
  const isPnlPos      = totalPnl >= 0

  const preview = assets.slice(0, 4)

  return (
    <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
      {/* Header row */}
      <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h3 style={{ fontSize: '0.9375rem', fontWeight: 500, color: 'var(--txt-1)', marginBottom: '0.5rem' }}>Seus Ativos</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.25rem', fontSize: '0.8125rem', color: 'var(--txt-3)' }}>
            <span>Investido: <span style={{ fontFamily: "'DM Mono', monospace", color: 'var(--txt-1)' }}>{formatCurrency(totalInvested, sd)}</span></span>
            <span>Atual: <span style={{ fontFamily: "'DM Mono', monospace", color: 'var(--accent)' }}>{formatCurrency(totalCurrent, sd)}</span></span>
            <span>P&L: <span style={{ fontFamily: "'DM Mono', monospace", fontWeight: 400, color: isPnlPos ? 'var(--positive)' : 'var(--negative)' }}>
              {isPnlPos ? '+' : '−'}{formatCurrency(Math.abs(totalPnl), sd)} ({isPnlPos ? '+' : '−'}{Math.abs(totalPnlPct).toFixed(2)}%)
            </span></span>
          </div>
        </div>
        <Link to="/app/carteira" style={{ fontSize: '0.8125rem', color: 'var(--accent)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.25rem', flexShrink: 0 }}>
          Ver todos <ArrowRight size={12} />
        </Link>
      </div>

      {/* Asset rows */}
      <div>
        {preview.map((asset, idx) => {
          const inv = assetInvested(asset)
          const cur = assetCurrent(asset)
          const pnl = cur - inv
          const isPos = asset.gainLossPct >= 0
          const isLast = idx === preview.length - 1

          return (
            <div key={asset.id} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '0.875rem 1.5rem', flexWrap: 'wrap', gap: '0.5rem',
              borderBottom: isLast ? 'none' : '1px solid var(--border)',
              transition: 'background 100ms',
            }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--surface-2)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, minWidth: 120 }}>
                <div style={{
                  width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                  background: isPos ? 'color-mix(in srgb, var(--positive) 10%, transparent)' : 'color-mix(in srgb, var(--negative) 10%, transparent)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {isPos
                    ? <TrendingUp size={14} style={{ color: 'var(--positive)' }} />
                    : <TrendingDown size={14} style={{ color: 'var(--negative)' }} />}
                </div>
                <div>
                  <div style={{ fontWeight: 500, fontSize: '0.875rem', color: 'var(--txt-1)' }}>{asset.name}</div>
                  {asset.ticker && <div style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.6875rem', color: 'var(--txt-3)' }}>{asset.ticker}</div>}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '2rem', alignItems: 'center', flexShrink: 0 }}>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.875rem', color: 'var(--txt-1)' }}>{formatCurrency(cur, sd)}</div>
                  <div style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.75rem', color: 'var(--txt-3)' }}>atual</div>
                </div>
                <div style={{ textAlign: 'right', minWidth: 72 }}>
                  <div style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.875rem', fontWeight: 400, color: isPos ? 'var(--positive)' : 'var(--negative)' }}>
                    {isPos ? '+' : '−'}{Math.abs(asset.gainLossPct).toFixed(2)}%
                  </div>
                  <div style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.75rem', color: isPos ? 'var(--positive)' : 'var(--negative)', opacity: 0.7 }}>
                    {pnl >= 0 ? '+' : '−'}{formatCurrency(Math.abs(pnl), false)}
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {assets.length > 4 && (
        <div style={{ padding: '0.75rem 1.5rem', borderTop: '1px solid var(--border)', textAlign: 'center' }}>
          <Link to="/app/carteira" style={{ fontSize: '0.8125rem', color: 'var(--accent)', textDecoration: 'none' }}>
            Ver todos os {assets.length} ativos →
          </Link>
        </div>
      )}
    </div>
  )
}

// ── Dashboard ─────────────────────────────────────────────────────────────────

function avgAbsDeviation(classes: ReturnType<typeof useStore>['assetClasses'], total: number): number {
  if (classes.length === 0) return 0
  return classes.reduce((s, c) => s + Math.abs(getDeviation(c, total)), 0) / classes.length
}

const CHART_TOOLTIP_STYLE = {
  background: '#161b22', border: '1px solid #30363d', borderRadius: 10, fontSize: 12,
  color: '#e2e8f0', fontFamily: "'DM Sans', sans-serif",
}

export default function Dashboard() {
  const rawClasses = useStore((s) => s.assetClasses)
  const assets = useStore((s) => s.assets)
  const settings = useStore((s) => s.settings)
  const classes = resolveClassValues(rawClasses, assets)
  const total = computePortfolioTotal(rawClasses, assets)
  const sd = settings.showDecimals

  const outOfTarget = classes.filter((c) => Math.abs(getDeviation(c, total)) > 2)
  const isAligned = outOfTarget.length === 0 && total > 0
  const avgDev = avgAbsDeviation(classes, total)
  const onTargetCount = classes.length - outOfTarget.length

  const pieData = classes.filter((c) => c.currentValue > 0).map((c) => ({
    name: c.name, value: c.currentValue, color: c.color,
  }))

  const barData = classes.map((c) => ({
    name: truncateName(c.name),
    fullName: c.name,
    desvio: parseFloat(getDeviation(c, total).toFixed(2)),
    color: c.color,
  }))

  return (
    <div style={{ maxWidth: '72rem', margin: '0 auto', padding: '2rem 1.5rem 3rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '2rem', gap: '1rem', flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: '1.75rem', fontWeight: 400, color: 'var(--txt-1)', letterSpacing: '-0.02em', lineHeight: 1.1, marginBottom: '0.375rem' }}>
            Dashboard
          </h1>
          <p style={{ color: 'var(--txt-3)', fontSize: '0.875rem' }}>Visão geral da sua carteira</p>
        </div>
        <Link to="/app/aportes" className="btn-primary">
          <Zap size={13} /> Simular aporte
        </Link>
      </div>

      {/* KPI cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}
        className="lg:grid-cols-4">
        <KpiCard label="Patrimônio">
          <p style={{ fontFamily: "'DM Mono', monospace", fontSize: '1.375rem', fontWeight: 400, color: 'var(--accent)', lineHeight: 1.1, letterSpacing: '-0.02em' }}>
            {formatCurrency(total, sd)}
          </p>
          {total > 0 && <p style={{ fontSize: '0.75rem', color: 'var(--txt-3)', marginTop: '0.25rem' }}>{classes.length} classes</p>}
        </KpiCard>

        <KpiCard label="Alinhamento">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.125rem' }}>
            {total === 0
              ? <span style={{ color: 'var(--txt-3)', fontSize: '0.875rem' }}>—</span>
              : isAligned
              ? <><CheckCircle2 size={16} style={{ color: 'var(--positive)' }} /><span style={{ color: 'var(--positive)', fontWeight: 500, fontSize: '0.875rem' }}>Alinhada</span></>
              : <><AlertTriangle size={16} style={{ color: 'var(--warning)' }} /><span style={{ color: 'var(--warning)', fontWeight: 500, fontSize: '0.875rem' }}>{outOfTarget.length} fora</span></>}
          </div>
          {total > 0 && <p style={{ fontSize: '0.75rem', color: 'var(--txt-3)', marginTop: '0.375rem' }}>{onTargetCount}/{classes.length} no alvo</p>}
        </KpiCard>

        <KpiCard label="Desvio médio">
          <p style={{
            fontFamily: "'DM Mono', monospace", fontSize: '1.375rem', fontWeight: 400, lineHeight: 1.1,
            color: avgDev < 2 ? 'var(--positive)' : avgDev < 5 ? 'var(--warning)' : 'var(--negative)',
            letterSpacing: '-0.02em',
          }}>
            {avgDev.toFixed(1)}<span style={{ fontSize: '0.875rem', fontWeight: 300, color: 'var(--txt-3)', marginLeft: 2 }}>pp</span>
          </p>
          {total > 0 && <p style={{ fontSize: '0.75rem', color: 'var(--txt-3)', marginTop: '0.25rem' }}>desvio absoluto médio</p>}
        </KpiCard>

        <KpiCard label="Com déficit">
          <p style={{ fontFamily: "'DM Mono', monospace", fontSize: '1.375rem', fontWeight: 400, color: 'var(--txt-1)', lineHeight: 1.1 }}>
            {classes.filter((c) => getDeviation(c, total) > 1).length}
            <span style={{ fontSize: '0.875rem', fontWeight: 300, color: 'var(--txt-3)', marginLeft: 4 }}>classes</span>
          </p>
          {total > 0 && (
            <Link to="/app/aportes" style={{ fontSize: '0.75rem', color: 'var(--accent)', marginTop: '0.375rem', display: 'block', textDecoration: 'none' }}>
              Ver sugestão →
            </Link>
          )}
        </KpiCard>
      </div>

      {/* Assets block */}
      <div style={{ marginBottom: '1.5rem' }}>
        <AssetsBlock />
      </div>

      {/* Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem', marginBottom: '1.5rem' }}
        className="lg:grid-cols-2">
        <div className="card">
          <h3 style={{ fontSize: '0.9375rem', fontWeight: 500, color: 'var(--txt-1)', marginBottom: '1.25rem' }}>Composição atual</h3>
          {total === 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 176, gap: '0.75rem' }}>
              <p style={{ color: 'var(--txt-3)', fontSize: '0.875rem' }}>Nenhum valor registrado</p>
              <Link to="/app/alocacao" className="btn-secondary" style={{ fontSize: '0.8125rem' }}>
                <Plus size={13} /> Registrar valores
              </Link>
            </div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={52} outerRadius={80} paddingAngle={2} dataKey="value">
                    {pieData.map((e) => <Cell key={e.name} fill={e.color} />)}
                  </Pie>
                  <Tooltip contentStyle={CHART_TOOLTIP_STYLE}
                    formatter={(v: number) => [formatCurrency(v, sd), '']} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.375rem 1rem', marginTop: '1rem' }}>
                {pieData.map((e) => (
                  <div key={e.name} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: e.color, flexShrink: 0 }} />
                    <span style={{ fontSize: '0.75rem', color: 'var(--txt-2)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.name}</span>
                    <span style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.75rem', color: 'var(--txt-3)' }}>
                      {formatPercent(getCurrentPercentage({ currentValue: e.value } as never, total))}
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        <div className="card">
          <h3 style={{ fontSize: '0.9375rem', fontWeight: 500, color: 'var(--txt-1)', marginBottom: '1.25rem' }}>
            Desvio vs. meta <span style={{ fontWeight: 300, color: 'var(--txt-3)', fontSize: '0.875rem' }}>(pp)</span>
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={barData} margin={{ left: -25 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#30363d" vertical={false} />
              <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 10, fontFamily: "'DM Mono', monospace" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#64748b', fontSize: 10, fontFamily: "'DM Mono', monospace" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={CHART_TOOLTIP_STYLE}
                formatter={(v: number) => [`${v > 0 ? '+' : ''}${v.toFixed(1)}pp`, 'Desvio']}
                labelFormatter={chartLabelFormatter} />
              <Bar dataKey="desvio" radius={[4, 4, 0, 0]}>
                {barData.map((e) => <Cell key={e.name} fill={e.desvio >= 0 ? '#0066CC' : '#946300'} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <p style={{ fontSize: '0.6875rem', color: 'var(--txt-3)', marginTop: '0.5rem' }}>Azul = acima da meta · Âmbar = abaixo da meta</p>
        </div>
      </div>

      {/* Allocation table */}
      <AllocationTable classes={classes} />
    </div>
  )
}
