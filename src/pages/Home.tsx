import { useState, useMemo, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import { TrendingUp, Shield, ArrowRight, Zap, RefreshCw } from 'lucide-react'
import { suggestContribution, getTotalValue, getCurrentPercentage } from '../utils/calculations'
import { formatCurrency, formatPercent } from '../utils/format'
import { getRates, convertToBRL, CURRENCY_SYMBOLS } from '../utils/rates'
import type { AssetClass } from '../types'
import type { RatesCache, Currency } from '../utils/rates'

// Demo uses foreignValue for ETF (USD) and Crypto (BTC)
const DEMO_CLASSES: AssetClass[] = [
  { id: '1', name: 'Renda Fixa',          color: '#14b8a6', targetPercentage: 35, currentValue: 18000, currency: 'BRL' },
  { id: '2', name: 'Ações Brasil',         color: '#f59e0b', targetPercentage: 25, currentValue: 11000, currency: 'BRL' },
  { id: '3', name: 'Fundos Imobiliários',  color: '#6366f1', targetPercentage: 20, currentValue: 12000, currency: 'BRL' },
  { id: '4', name: 'ETFs Internacionais',  color: '#ec4899', targetPercentage: 15, currentValue: 0, currency: 'USD', foreignValue: 1200 },
  { id: '5', name: 'Criptomoedas',         color: '#f97316', targetPercentage: 5,  currentValue: 0, currency: 'BTC', foreignValue: 0.025 },
]

export default function Home() {
  const [classes, setClasses] = useState<AssetClass[]>(DEMO_CLASSES)
  const [contribution, setContribution] = useState('1000')
  const [ratesCache, setRatesCache] = useState<RatesCache | null>(null)
  const [ratesFetching, setRatesFetching] = useState(true)

  useEffect(() => {
    getRates()
      .then((cache) => {
        setRatesCache(cache)
        // Apply rates to demo classes
        setClasses((prev) => prev.map((c) =>
          c.currency !== 'BRL' && c.foreignValue != null
            ? { ...c, currentValue: convertToBRL(c.foreignValue, c.currency as Currency, cache.rates) }
            : c
        ))
      })
      .catch(() => {})
      .finally(() => setRatesFetching(false))
  }, [])

  const rates = ratesCache?.rates ?? {}
  const numContribution = parseFloat(contribution.replace(',', '.')) || 0
  const total = getTotalValue(classes)

  const suggestions = useMemo(
    () => suggestContribution(classes, numContribution),
    [classes, numContribution]
  )

  const pieData = classes.map((c) => ({ name: c.name, value: c.currentValue, color: c.color }))

  function updateValue(id: string, value: string) {
    const num = parseFloat(value) || 0
    setClasses(classes.map((c) => {
      if (c.id !== id) return c
      if (c.currency !== 'BRL') {
        const brl = convertToBRL(num, c.currency as Currency, rates)
        return { ...c, foreignValue: num, currentValue: brl }
      }
      return { ...c, currentValue: num }
    }))
  }

  return (
    <div className="min-h-screen bg-[#050d1a] text-slate-100">
      {/* Header */}
      <header className="border-b border-[#152a52] px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal-500/15 flex items-center justify-center">
              <TrendingUp size={16} className="text-teal-400" />
            </div>
            <span className="font-semibold text-slate-100">Alocador</span>
          </div>
          <Link to="/app" className="btn-secondary text-xs py-2 px-3">Abrir app</Link>
        </div>
      </header>

      {/* Hero */}
      <section className="px-6 pt-16 pb-10 text-center">
        <div className="max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-teal-500/10 border border-teal-500/20 rounded-full px-4 py-1.5 mb-7 text-teal-400 text-sm">
            <Shield size={12} />
            Sem login · dados só no seu navegador
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold leading-tight mb-5">
            Saiba exatamente{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-emerald-400">
              onde aportar
            </span>{' '}
            no próximo mês
          </h1>
          <p className="text-lg text-slate-400 mb-8 max-w-xl mx-auto leading-relaxed">
            Defina sua alocação alvo, registre os valores atuais e veja a distribuição ideal
            para manter seu plano nos trilhos.
          </p>
          <Link
            to="/app"
            className="inline-flex items-center gap-2 bg-teal-500 hover:bg-teal-400 text-[#050d1a] font-semibold px-7 py-3.5 rounded-xl transition-colors text-base"
          >
            Usar com minha carteira <ArrowRight size={17} />
          </Link>
        </div>
      </section>

      {/* ── LIVE SIMULATION ── */}
      <section className="px-6 py-10 border-t border-[#152a52]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8">
            <p className="text-[10px] text-teal-500 uppercase tracking-widest mb-2">Simulação interativa</p>
            <h2 className="text-xl font-semibold text-slate-100">Experimente agora — edite os valores abaixo</h2>
            <p className="text-sm text-slate-500 mt-1.5">Altere os valores da carteira e o aporte para ver a sugestão em tempo real.</p>
            {ratesCache && (
              <div className="inline-flex items-center gap-1.5 mt-3 text-[10px] text-slate-600 bg-[#0a1628] border border-[#152a52] rounded-full px-3 py-1">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-500 inline-block" />
                Cotações de {new Date(ratesCache.fetchedAt).toLocaleDateString('pt-BR')}
                {' · '}
                {(['USD','EUR','BTC'] as Currency[]).map((c, i) =>
                  rates[c] ? <span key={c}>{i > 0 && ' · '}{c} {formatCurrency(rates[c]!, false)}</span> : null
                )}
                <button onClick={() => {
                  setRatesFetching(true)
                  import('../utils/rates').then(({ fetchDailyRates }) =>
                    fetchDailyRates().then((cache) => {
                      setRatesCache(cache)
                      setClasses((prev) => prev.map((c) =>
                        c.currency !== 'BRL' && c.foreignValue != null
                          ? { ...c, currentValue: convertToBRL(c.foreignValue, c.currency as Currency, cache.rates) }
                          : c
                      ))
                    }).finally(() => setRatesFetching(false))
                  )
                }} className="ml-1 hover:text-teal-400 transition-colors">
                  <RefreshCw size={10} className={ratesFetching ? 'animate-spin' : ''} />
                </button>
              </div>
            )}
            {ratesFetching && !ratesCache && (
              <p className="text-xs text-slate-600 mt-2">Buscando cotações do dia…</p>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left: inputs */}
            <div className="space-y-4">
              {/* Portfolio values */}
              <div className="card space-y-3">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-sm font-medium text-slate-300">Carteira atual</h3>
                  <span className="font-mono text-xs text-teal-400">{formatCurrency(total, true)}</span>
                </div>

                {classes.map((cls) => {
                  const isForeign = cls.currency !== 'BRL'
                  const pct = getCurrentPercentage(cls, total)
                  const symbol = CURRENCY_SYMBOLS[cls.currency as Currency] ?? 'R$'
                  const inputValue = isForeign ? (cls.foreignValue ?? '') : (cls.currentValue || '')
                  const step = cls.currency === 'BTC' || cls.currency === 'ETH' ? 0.001 : isForeign ? 10 : 500
                  return (
                    <div key={cls.id}>
                      <div className="flex items-center gap-2.5 mb-1">
                        <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: cls.color }} />
                        <span className="text-xs text-slate-300 flex-1">{cls.name}</span>
                        <span className="text-[10px] font-mono text-slate-500">
                          {formatPercent(pct)} · meta {formatPercent(cls.targetPercentage)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 space-y-1">
                          <div className="relative">
                            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500 text-xs">{symbol}</span>
                            <input
                              type="number"
                              className="input py-1.5 text-sm pl-7"
                              value={inputValue}
                              min={0}
                              step={step}
                              onChange={(e) => updateValue(cls.id, e.target.value)}
                            />
                          </div>
                          {isForeign && cls.currentValue > 0 && (
                            <p className="text-[10px] font-mono text-slate-600 text-right">
                              ≈ {formatCurrency(cls.currentValue, false)}
                              {ratesFetching && ' (buscando cotação…)'}
                            </p>
                          )}
                        </div>
                        <div className="w-20 flex-shrink-0">
                          <div className="h-1.5 bg-[#0f2040] rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-300"
                              style={{ width: `${Math.min(pct / Math.max(cls.targetPercentage, 0.1) * 100, 100)}%`, backgroundColor: cls.color }}
                            />
                          </div>
                          <p className="text-[9px] text-slate-600 mt-0.5 text-right">
                            {pct >= cls.targetPercentage
                              ? <span className="text-emerald-600">no alvo</span>
                              : <span className="text-amber-600">abaixo</span>
                            }
                          </p>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Contribution input */}
              <div className="card">
                <label className="label">Quanto você vai aportar?</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium">R$</span>
                  <input
                    type="number"
                    className="input pl-9 text-base font-mono py-3"
                    value={contribution}
                    onChange={(e) => setContribution(e.target.value)}
                    min={0}
                    step={500}
                  />
                </div>
              </div>
            </div>

            {/* Right: results */}
            <div className="space-y-4">
              {/* Pie chart */}
              <div className="card">
                <h3 className="text-sm font-medium text-slate-300 mb-3">Composição atual</h3>
                <div className="flex items-center gap-4">
                  <ResponsiveContainer width={140} height={140}>
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={38}
                        outerRadius={62}
                        paddingAngle={2}
                        dataKey="value"
                        startAngle={90}
                        endAngle={-270}
                      >
                        {pieData.map((e) => <Cell key={e.name} fill={e.color} />)}
                      </Pie>
                      <Tooltip
                        contentStyle={{ background: '#0a1628', border: '1px solid #152a52', borderRadius: 8, fontSize: 11 }}
                        formatter={(v: number) => [formatCurrency(v), '']}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex-1 space-y-1.5">
                    {classes.map((c) => (
                      <div key={c.id} className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: c.color }} />
                        <span className="text-xs text-slate-400 flex-1 truncate">{c.name}</span>
                        <span className="font-mono text-xs text-slate-300">
                          {formatPercent(getCurrentPercentage(c, total))}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Suggestions */}
              <div className="card space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-slate-300">
                    Sugestão de aporte
                  </h3>
                  <div className="flex items-center gap-1.5 text-xs text-teal-400">
                    <Zap size={12} />
                    {formatCurrency(numContribution)} a distribuir
                  </div>
                </div>

                {numContribution <= 0 ? (
                  <p className="text-sm text-slate-500 py-2 text-center">Informe o valor do aporte acima</p>
                ) : suggestions.length === 0 ? (
                  <p className="text-sm text-slate-500 py-2 text-center">Todas as classes estão no alvo</p>
                ) : (
                  <>
                    {suggestions.map((sg) => (
                      <div key={sg.assetClassId}>
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center gap-2 min-w-0">
                            <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: sg.color }} />
                            <span className="text-xs text-slate-300 truncate">{sg.assetClassName}</span>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <span className="text-[10px] text-slate-500 font-mono">{formatPercent(sg.share)}</span>
                            <span className="font-mono text-sm font-semibold text-teal-400">
                              {formatCurrency(sg.amount)}
                            </span>
                          </div>
                        </div>
                        <div className="h-1.5 bg-[#0f2040] rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{ width: `${sg.share}%`, backgroundColor: sg.color }}
                          />
                        </div>
                      </div>
                    ))}
                    <p className="text-[10px] text-slate-600 pt-1 leading-relaxed">
                      Distribuição proporcional ao déficit de cada classe. Classes no alvo não recebem aporte.
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="mt-8 text-center">
            <Link
              to="/app"
              className="inline-flex items-center gap-2 bg-teal-500 hover:bg-teal-400 text-[#050d1a] font-semibold px-6 py-3 rounded-xl transition-colors"
            >
              Usar com minha carteira real
              <ArrowRight size={16} />
            </Link>
            <p className="text-xs text-slate-600 mt-3">Seus dados ficam só no seu navegador. Sem cadastro.</p>
          </div>
        </div>
      </section>

      {/* Disclaimer */}
      <section className="px-6 py-8 border-t border-[#152a52]">
        <div className="max-w-3xl mx-auto">
          <p className="text-xs text-slate-600 leading-relaxed">
            <span className="text-slate-500">Aviso: </span>
            Esta ferramenta tem fins organizacionais e educacionais. Não constitui recomendação de investimento nem consultoria financeira.
          </p>
        </div>
      </section>

      <footer className="border-t border-[#152a52] px-6 py-5 text-center text-xs text-slate-600">
        Alocador · Dados armazenados localmente no seu navegador
      </footer>
    </div>
  )
}
