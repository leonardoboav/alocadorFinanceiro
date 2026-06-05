import { useState, useMemo, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, LineChart, Line, XAxis, YAxis, CartesianGrid, RadarChart, Radar, PolarGrid, PolarAngleAxis } from 'recharts'
import { TrendingUp, ArrowRight, Zap, Globe, Target, PieChart as PieIcon, ShieldCheck, Activity } from 'lucide-react'
import { suggestContribution, getTotalValue, getCurrentPercentage } from '../utils/calculations'
import type { AllocationSuggestion } from '../utils/calculations'
import { formatCurrency, formatPercent } from '../utils/format'
import { getRates, fetchDailyRates, convertToBRL, CURRENCY_SYMBOLS } from '../utils/rates'
import type { AssetClass } from '../types'
import type { RatesCache, Currency } from '../utils/rates'

const DEMO_CLASSES: AssetClass[] = [
  { id: '1', name: 'Renda Fixa',          color: '#0066CC', targetPercentage: 35, currentValue: 18000, currency: 'BRL' },
  { id: '2', name: 'Ações Brasil',         color: '#946300', targetPercentage: 25, currentValue: 11000, currency: 'BRL' },
  { id: '3', name: 'Fundos Imobiliários',  color: '#6366f1', targetPercentage: 20, currentValue: 12000, currency: 'BRL' },
  { id: '4', name: 'ETFs Internacionais',  color: '#1A7F37', targetPercentage: 15, currentValue: 0, currency: 'USD', foreignValue: 1200 },
  { id: '5', name: 'Criptomoedas',         color: '#f97316', targetPercentage: 5,  currentValue: 0, currency: 'BTC', foreignValue: 0.025 },
]

const FEATURES = [
  { icon: PieIcon, title: 'Mapa de alocação', desc: 'Defina percentuais-alvo por classe e acompanhe desvios em tempo real. Saiba exatamente onde sua carteira está vs. onde deveria estar.' },
  { icon: Globe, title: 'Cotações automáticas', desc: 'USD, EUR, GBP, BTC e ETH convertidos para BRL diariamente. Seus ativos internacionais e cripto sempre no valor correto.' },
  { icon: Target, title: 'Aporte preciso', desc: 'Algoritmo distribui seu capital proporcionalmente ao déficit de cada classe — sem vender nada, sem palpite.' },
]

const CHART_TOOLTIP = {
  background: '#161b22', border: '1px solid #30363d', borderRadius: 10, fontSize: 12,
  color: '#e2e8f0', fontFamily: "'DM Sans', sans-serif",
}

// ── useDemoPortfolio ──────────────────────────────────────────────────────────

function useDemoPortfolio() {
  const [classes, setClasses] = useState<AssetClass[]>(DEMO_CLASSES)
  const [ratesCache, setRatesCache] = useState<RatesCache | null>(null)
  const [ratesFetching, setRatesFetching] = useState(true)
  const rates = ratesCache?.rates ?? {}

  function applyRates(cache: RatesCache) {
    setRatesCache(cache)
    setClasses((prev) => prev.map((c) =>
      c.currency !== 'BRL' && c.foreignValue != null
        ? { ...c, currentValue: convertToBRL(c.foreignValue, c.currency as Currency, cache.rates) }
        : c
    ))
  }

  useEffect(() => {
    getRates()
      .then(applyRates)
      .catch((e: unknown) => { console.warn('[finativo] Demo rates fetch failed:', e) })
      .finally(() => setRatesFetching(false))
  }, [])

  function updateValue(id: string, value: string) {
    const num = parseFloat(value) || 0
    setClasses((prev) => prev.map((c) => {
      if (c.id !== id) return c
      if (c.currency !== 'BRL') return { ...c, foreignValue: num, currentValue: convertToBRL(num, c.currency as Currency, rates) }
      return { ...c, currentValue: num }
    }))
  }

  return { classes, ratesCache, ratesFetching, rates, updateValue }
}

// ── PortfolioDemo ─────────────────────────────────────────────────────────────

interface PortfolioDemoProps {
  classes: AssetClass[]
  total: number
  rates: Record<string, number>
  ratesFetching: boolean
  contribution: string
  onContributionChange: (v: string) => void
  onUpdateValue: (id: string, value: string) => void
  suggestions: AllocationSuggestion[]
  numContribution: number
}

function PortfolioDemo({ classes, total, rates, ratesFetching, contribution, onContributionChange, onUpdateValue, suggestions, numContribution }: PortfolioDemoProps) {
  const [chartType, setChartType] = useState<'donut' | 'line' | 'radar'>('donut')
  const pieData = classes.map((c) => ({ name: c.name, value: c.currentValue, color: c.color }))
  const chartData = classes.map((c) => ({
    name: c.name.split(' ')[0],
    fullName: c.name,
    pct: parseFloat((total > 0 ? (c.currentValue / total) * 100 : 0).toFixed(1)),
    meta: c.targetPercentage,
    color: c.color,
  }))

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Row 1: Carteira atual | Composição atual */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        {/* Carteira atual */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h3 style={{ fontSize: '0.9375rem', fontWeight: 500, color: 'var(--txt-1)' }}>Carteira atual</h3>
          {classes.map((cls) => {
            const isForeign = cls.currency !== 'BRL'
            const pct = getCurrentPercentage(cls, total)
            const symbol = CURRENCY_SYMBOLS[cls.currency as Currency] ?? 'R$'
            const inputValue = isForeign ? (cls.foreignValue ?? '') : (cls.currentValue || '')
            const step = cls.currency === 'BTC' || cls.currency === 'ETH' ? 0.001 : isForeign ? 10 : 500

            return (
              <div key={cls.id}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: cls.color, flexShrink: 0 }} />
                  <span style={{ fontSize: '0.8125rem', color: 'var(--txt-1)', flex: 1 }}>{cls.name}</span>
                  <span style={{ fontSize: '0.6875rem', fontFamily: "'DM Mono', monospace", color: 'var(--txt-3)' }}>
                    {formatPercent(pct)} · meta {formatPercent(cls.targetPercentage)}
                  </span>
                </div>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: '0.625rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--txt-3)', fontSize: '0.75rem', fontFamily: "'DM Mono', monospace" }}>{symbol}</span>
                  <input type="number" className="input" style={{ paddingLeft: '1.75rem', fontSize: '0.8125rem', padding: '0.5rem 0.5rem 0.5rem 1.75rem' }}
                    value={inputValue} min={0} step={step}
                    onChange={(e) => onUpdateValue(cls.id, e.target.value)} />
                </div>
                {isForeign && cls.currentValue > 0 && (
                  <p style={{ fontSize: '0.6875rem', fontFamily: "'DM Mono', monospace", color: 'var(--txt-3)', textAlign: 'right', marginTop: '0.125rem' }}>
                    ≈ {formatCurrency(cls.currentValue, false)}{ratesFetching && ' (atualizando…)'}
                  </p>
                )}
              </div>
            )
          })}

          <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem', marginTop: 'auto' }}>
            <label className="label">Valor do aporte</label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--txt-3)', fontFamily: "'DM Mono', monospace", fontSize: '0.875rem' }}>R$</span>
              <input type="number" className="input" style={{ paddingLeft: '2.5rem', fontFamily: "'DM Mono', monospace", fontSize: '1rem', paddingTop: '0.875rem', paddingBottom: '0.875rem' }}
                value={contribution} onChange={(e) => onContributionChange(e.target.value)} min={0} step={500} />
            </div>
          </div>
        </div>

        {/* Composição atual */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '0.9375rem', fontWeight: 500, color: 'var(--txt-1)' }}>Composição atual</h3>
            <div style={{ display: 'flex', gap: '0.25rem' }}>
              {[
                { type: 'donut' as const, icon: PieIcon, title: 'Donut' },
                { type: 'line' as const, icon: Activity, title: 'Linhas' },
                { type: 'radar' as const, icon: Target, title: 'Radar' },
              ].map(({ type, icon: Icon, title }) => (
                <button key={type} title={title} onClick={() => setChartType(type)} style={{
                  width: 28, height: 28, borderRadius: 7, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: chartType === type ? 'color-mix(in srgb, var(--accent) 12%, transparent)' : 'transparent',
                  border: chartType === type ? '1px solid color-mix(in srgb, var(--accent) 30%, transparent)' : '1px solid var(--border)',
                  color: chartType === type ? 'var(--accent)' : 'var(--txt-3)',
                  transition: 'all 120ms ease',
                }}>
                  <Icon size={13} />
                </button>
              ))}
            </div>
          </div>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ width: '100%', height: 260 }}>
              <ResponsiveContainer key={chartType} width="100%" height="100%">
                {chartType === 'donut' ? (
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius="42%" outerRadius="70%"
                      paddingAngle={2} dataKey="value" startAngle={90} endAngle={-270}>
                      {pieData.map((e) => <Cell key={e.name} fill={e.color} />)}
                    </Pie>
                    <Tooltip contentStyle={CHART_TOOLTIP} formatter={(v: number) => [formatCurrency(v), '']} />
                  </PieChart>
                ) : chartType === 'line' ? (
                  <LineChart data={chartData} margin={{ left: -20, right: 8, top: 8, bottom: 4 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#30363d" vertical={false} />
                    <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 10, fontFamily: "'DM Mono'" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#64748b', fontSize: 10, fontFamily: "'DM Mono'" }} axisLine={false} tickLine={false} unit="%" domain={[0, 'dataMax + 5']} />
                    <Tooltip contentStyle={CHART_TOOLTIP} formatter={(v: number, name: string | number) => [`${v.toFixed(1)}%`, name === 'pct' ? 'Atual' : 'Meta']} />
                    <Line type="monotone" dataKey="meta" stroke="#3d444d" strokeWidth={1.5} strokeDasharray="4 4" dot={false} />
                    <Line type="monotone" dataKey="pct" stroke="var(--accent)" strokeWidth={2}
                      dot={{ r: 5, fill: 'var(--accent)', stroke: '#161b22', strokeWidth: 2 }} />
                  </LineChart>
                ) : (
                  <RadarChart data={chartData} cx="50%" cy="50%" outerRadius="68%">
                    <PolarGrid stroke="#30363d" />
                    <PolarAngleAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 10, fontFamily: "'DM Mono'" }} />
                    <Radar name="Meta" dataKey="meta" stroke="#3d444d" fill="#3d444d" fillOpacity={0.15} strokeWidth={1} strokeDasharray="4 4" />
                    <Radar name="Atual" dataKey="pct" stroke="var(--accent)" fill="var(--accent)" fillOpacity={0.2} strokeWidth={2} />
                    <Tooltip contentStyle={CHART_TOOLTIP} formatter={(v: number, name: string | number) => [`${v.toFixed(1)}%`, name]} />
                  </RadarChart>
                )}
              </ResponsiveContainer>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
              {classes.map((c) => (
                <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: c.color, flexShrink: 0 }} />
                  <span style={{ fontSize: '0.875rem', color: 'var(--txt-2)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.name}</span>
                  <span style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.875rem', color: 'var(--txt-1)' }}>{formatPercent(getCurrentPercentage(c, total))}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Row 2: Sugestão de aporte */}
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
          <h3 style={{ fontSize: '0.9375rem', fontWeight: 500, color: 'var(--txt-1)' }}>Sugestão de aporte</h3>
          {numContribution > 0 && (
            <span style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.8125rem', color: 'var(--accent)' }}>
              {formatCurrency(numContribution)}
            </span>
          )}
        </div>
        {numContribution <= 0
          ? <p style={{ fontSize: '0.875rem', color: 'var(--txt-3)', padding: '0.75rem 0' }}>Informe o valor do aporte acima</p>
          : suggestions.length === 0
          ? <p style={{ fontSize: '0.875rem', color: 'var(--txt-3)', padding: '0.75rem 0' }}>Todas as classes estão no alvo</p>
          : suggestions.map((sg) => (
            <div key={sg.assetClassId} style={{ marginBottom: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.375rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: 0 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: sg.color, flexShrink: 0 }} />
                  <span style={{ fontSize: '0.8125rem', color: 'var(--txt-1)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{sg.assetClassName}</span>
                </div>
                <span style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.9375rem', fontWeight: 400, color: 'var(--accent)', flexShrink: 0 }}>{formatCurrency(sg.amount)}</span>
              </div>
              <div style={{ height: 4, background: 'var(--border)', borderRadius: 9999, overflow: 'hidden' }}>
                <div style={{ height: '100%', borderRadius: 9999, background: sg.color, width: `${sg.share}%`, transition: 'width 500ms' }} />
              </div>
            </div>
          ))
        }
      </div>
    </div>
  )
}

// ── Home ──────────────────────────────────────────────────────────────────────

export default function Home() {
  const { classes, ratesCache, ratesFetching, rates, updateValue } = useDemoPortfolio()
  const [contribution, setContribution] = useState('1000')

  const numContribution = parseFloat(contribution.replace(',', '.')) || 0
  const total = getTotalValue(classes)
  const suggestions = useMemo(() => suggestContribution(classes, numContribution), [classes, numContribution])

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      {/* Header */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 40,
        background: 'rgba(13, 17, 23, 0.88)',
        backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--border)',
      }}>
        <div style={{ maxWidth: '72rem', margin: '0 auto', padding: '0 1.5rem', height: 52, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ width: 28, height: 28, borderRadius: 7, background: 'color-mix(in srgb, var(--accent) 10%, transparent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <TrendingUp size={14} style={{ color: 'var(--accent)' }} />
            </div>
            <span style={{ fontWeight: 600, fontSize: '0.9375rem', color: 'var(--txt-1)', letterSpacing: '-0.02em' }}>FinAtivo</span>
          </div>
          <Link to="/app" className="btn-primary" style={{ fontSize: '0.8125rem', padding: '0.5rem 1rem' }}>
            Abrir carteira →
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section style={{ padding: '5rem 1.5rem 4rem', textAlign: 'center', maxWidth: '56rem', margin: '0 auto' }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
          padding: '0.375rem 1rem', borderRadius: 9999, marginBottom: '2.5rem',
          background: 'color-mix(in srgb, var(--accent) 6%, transparent)',
          border: '1px solid color-mix(in srgb, var(--accent) 20%, transparent)',
          fontSize: '0.75rem', color: 'var(--accent)', fontWeight: 500,
        }}>
          <ShieldCheck size={12} /> Sem login · 100% no seu navegador
        </div>

        <h1 style={{
          fontFamily: "'DM Serif Display', serif",
          fontSize: 'clamp(2.5rem, 6vw, 4.5rem)',
          fontWeight: 400, lineHeight: 1.05, letterSpacing: '-0.03em',
          color: 'var(--txt-1)', marginBottom: '1.5rem',
        }}>
          O cockpit do<br />
          <span style={{ color: 'var(--accent)' }}>investidor serial</span>
        </h1>

        <p style={{ fontSize: '1.0625rem', color: 'var(--txt-2)', marginBottom: '2.5rem', maxWidth: '34rem', margin: '0 auto 2.5rem', lineHeight: 1.65 }}>
          Acompanhe sua alocação, receba cotações do dia e descubra onde cada real deve trabalhar para turbinar seu patrimônio.
        </p>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap', marginBottom: '3rem' }}>
          <Link to="/app" style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
            padding: '0.875rem 1.75rem', borderRadius: 9999,
            background: 'var(--txt-1)', color: '#fff', fontWeight: 500, fontSize: '1rem',
            textDecoration: 'none', transition: 'opacity 150ms ease',
          }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.82')}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}>
            Abrir minha carteira <ArrowRight size={16} />
          </Link>
          <a href="#demo" style={{ fontSize: '0.9375rem', color: 'var(--txt-2)', textDecoration: 'none', transition: 'color 150ms' }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--txt-1)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--txt-2)')}>
            Ver demonstração ↓
          </a>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
          {['BTC · ETH', 'USD · EUR · GBP', 'Sem servidor', 'Código aberto'].map((t) => (
            <span key={t} style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.8125rem', color: 'var(--txt-3)' }}>
              <span style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--accent)', display: 'inline-block' }} />{t}
            </span>
          ))}
        </div>
      </section>

      {/* Features */}
      <section style={{ padding: '4rem 1.5rem', borderTop: '1px solid var(--border)' }}>
        <div style={{ maxWidth: '72rem', margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(1, 1fr)', gap: '1rem' }} className="md:grid-cols-3">
            {FEATURES.map(({ icon: Icon, title, desc }, i) => (
              <div key={title} className="card">
                <div style={{
                  width: 36, height: 36, borderRadius: 9, marginBottom: '1rem',
                  background: `color-mix(in srgb, var(--accent) ${8 + i * 2}%, transparent)`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Icon size={16} style={{ color: 'var(--accent)' }} />
                </div>
                <h3 style={{ fontSize: '0.9375rem', fontWeight: 500, color: 'var(--txt-1)', marginBottom: '0.5rem' }}>{title}</h3>
                <p style={{ fontSize: '0.8125rem', color: 'var(--txt-2)', lineHeight: 1.65 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Demo section */}
      <section id="demo" style={{ padding: '4rem 1.5rem', borderTop: '1px solid var(--border)' }}>
        <div style={{ maxWidth: '72rem', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <p style={{ fontSize: '0.75rem', color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 500, marginBottom: '0.75rem' }}>Simulação interativa</p>
            <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: '2rem', fontWeight: 400, color: 'var(--txt-1)', letterSpacing: '-0.02em', marginBottom: '0.75rem' }}>
              Edite os valores e veja em tempo real
            </h2>
            <p style={{ fontSize: '0.875rem', color: 'var(--txt-3)' }}>Experimente a lógica de rebalanceamento com uma carteira de exemplo.</p>
            {ratesCache && (
              <p style={{ fontSize: '0.75rem', color: 'var(--txt-3)', marginTop: '0.5rem', fontFamily: "'DM Mono', monospace" }}>
                Cotações de {new Date(ratesCache.fetchedAt).toLocaleDateString('pt-BR')}
              </p>
            )}
          </div>

          <PortfolioDemo
            classes={classes} total={total} rates={rates} ratesFetching={ratesFetching}
            contribution={contribution} onContributionChange={setContribution}
            onUpdateValue={updateValue} suggestions={suggestions} numContribution={numContribution}
          />

          <div style={{ marginTop: '3rem', textAlign: 'center' }}>
            <Link to="/app" style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
              padding: '0.875rem 1.75rem', borderRadius: 9999,
              background: 'var(--txt-1)', color: '#fff', fontWeight: 500,
              textDecoration: 'none', transition: 'opacity 150ms',
            }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.82')}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}>
              Usar com minha carteira real <ArrowRight size={16} />
            </Link>
            <p style={{ fontSize: '0.75rem', color: 'var(--txt-3)', marginTop: '0.75rem' }}>
              Seus dados ficam só no seu navegador. Sem cadastro. Sem servidor.
            </p>
          </div>
        </div>
      </section>

      {/* Disclaimer + footer */}
      <section style={{ padding: '2.5rem 1.5rem', borderTop: '1px solid var(--border)' }}>
        <div style={{ maxWidth: '56rem', margin: '0 auto' }}>
          <p style={{ fontSize: '0.75rem', color: 'var(--txt-3)', lineHeight: 1.6 }}>
            <span style={{ color: 'var(--txt-2)' }}>Aviso: </span>
            Esta ferramenta tem fins organizacionais e educacionais. Não constitui recomendação de investimento nem consultoria financeira.
          </p>
        </div>
      </section>

      <footer style={{ borderTop: '1px solid var(--border)', padding: '1.25rem 1.5rem', textAlign: 'center', fontSize: '0.75rem', color: 'var(--txt-3)' }}>
        FinAtivo · Dados armazenados localmente no seu navegador
      </footer>
    </div>
  )
}
