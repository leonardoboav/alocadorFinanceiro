import { useState, useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { Info } from 'lucide-react'
import { useStore } from '../../store/store'
import { getTotalValue, suggestContribution, getProjectedPercentage } from '../../utils/calculations'
import { formatCurrency, formatPercent } from '../../utils/format'

export default function Aportes() {
  const classes = useStore((s) => s.assetClasses)
  const settings = useStore((s) => s.settings)

  const [amount, setAmount] = useState('')
  const [showInfo, setShowInfo] = useState(false)

  const numAmount = parseFloat(amount.replace(',', '.')) || 0
  const total = getTotalValue(classes)
  const sd = settings.showDecimals

  const suggestions = useMemo(() => suggestContribution(classes, numAmount), [classes, numAmount])
  const contributionTotal = suggestions.reduce((s, sg) => s + sg.amount, 0)

  const chartData = classes.map((c) => ({
    name: c.name.length > 10 ? c.name.slice(0, 10) + '…' : c.name,
    fullName: c.name,
    atual: parseFloat((total > 0 ? (c.currentValue / total) * 100 : 0).toFixed(1)),
    meta: c.targetPercentage,
    projetado: parseFloat(getProjectedPercentage(c, suggestions, total, contributionTotal).toFixed(1)),
    color: c.color,
  }))

  return (
    <div className="p-6 space-y-5 max-w-3xl mx-auto">
      <div>
        <h1 className="text-lg font-semibold text-slate-100">Simulador de Aporte</h1>
        <p className="text-sm text-slate-500 mt-0.5">Informe o valor disponível e veja onde cada real deve ir.</p>
      </div>

      <div className="card">
        <label className="label">Valor do aporte</label>
        <div className="relative">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium">R$</span>
          <input
            type="number"
            className="input pl-9 text-base font-mono py-3"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0,00"
            min={0}
            step={100}
          />
        </div>
        {numAmount > 0 && (
          <p className="text-xs text-slate-500 mt-2">
            Atual: <span className="font-mono text-slate-400">{formatCurrency(total, sd)}</span>
            {' · '}
            Após: <span className="font-mono text-teal-400">{formatCurrency(total + numAmount, sd)}</span>
          </p>
        )}
      </div>

      {numAmount > 0 && (
        <>
          {suggestions.length === 0 ? (
            <div className="card text-center py-8 text-slate-500 text-sm">
              Adicione classes de ativos na aba Alocação para receber sugestões.
            </div>
          ) : (
            <div className="card space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-slate-300">Distribuição sugerida</h3>
                <button onClick={() => setShowInfo(!showInfo)} className="text-slate-500 hover:text-slate-300 transition-colors">
                  <Info size={15} />
                </button>
              </div>
              {showInfo && (
                <p className="text-xs text-slate-400 bg-[#0f2040] rounded-xl p-3 leading-relaxed">
                  Distribuição proporcional ao déficit de cada classe em relação à meta no patrimônio projetado.
                  Classes acima da meta recebem zero. Nenhuma venda é sugerida.
                </p>
              )}
              <div className="space-y-3">
                {suggestions.map((sg) => (
                  <div key={sg.assetClassId}>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: sg.color }} />
                        <span className="text-sm text-slate-300 truncate">{sg.assetClassName}</span>
                        <span className="text-xs text-slate-600 hidden sm:inline">
                          {formatPercent(sg.currentPercentage)} → {formatPercent(sg.targetPercentage)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2.5 flex-shrink-0">
                        <span className="text-xs text-slate-500">{formatPercent(sg.share)}</span>
                        <span className="font-mono text-sm text-teal-400 font-medium">{formatCurrency(sg.amount, sd)}</span>
                      </div>
                    </div>
                    <div className="h-1.5 bg-[#0f2040] rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-500" style={{ width: `${sg.share}%`, backgroundColor: sg.color }} />
                    </div>
                  </div>
                ))}
              </div>
              <div className="border-t border-[#152a52] pt-3 flex justify-between text-sm">
                <span className="text-slate-400">Total</span>
                <span className="font-mono font-semibold text-teal-400">{formatCurrency(contributionTotal, sd)}</span>
              </div>
            </div>
          )}

          {total > 0 && suggestions.length > 0 && (
            <div className="card">
              <h3 className="text-sm font-medium text-slate-300 mb-4">Antes e depois do aporte</h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={chartData} margin={{ left: -25 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#152a52" vertical={false} />
                  <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} unit="%" />
                  <Tooltip
                    contentStyle={{ background: '#0a1628', border: '1px solid #152a52', borderRadius: 8, fontSize: 12 }}
                    formatter={(v: number, name: string | number) => {
                      const labels: Record<string, string> = { atual: 'Atual', projetado: 'Após aporte', meta: 'Meta' }
                      return [`${v.toFixed(1)}%`, labels[String(name)] ?? String(name)]
                    }}
                    labelFormatter={(_l, pl) => (pl as { payload?: { fullName?: string } }[])?.[0]?.payload?.fullName ?? ''}
                  />
                  <Bar dataKey="atual" fill="#1e3a5f" radius={[3, 3, 0, 0]} />
                  <Bar dataKey="projetado" radius={[3, 3, 0, 0]}>
                    {chartData.map((e) => <Cell key={e.fullName} fill={e.color} />)}
                  </Bar>
                  <Bar dataKey="meta" fill="#0f2040" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
              <div className="flex gap-4 mt-2 text-[10px] text-slate-500">
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-sm bg-[#1e3a5f] inline-block" />Atual</span>
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-sm bg-teal-500 inline-block" />Após aporte</span>
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-sm bg-[#0f2040] border border-[#152a52] inline-block" />Meta</span>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
