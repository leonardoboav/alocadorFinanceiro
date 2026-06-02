import { Link } from 'react-router-dom'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts'
import { AlertTriangle, CheckCircle, Zap, Plus } from 'lucide-react'
import { useStore } from '../../store/store'
import { getTotalValue, getCurrentPercentage, getDeviation } from '../../utils/calculations'
import { formatCurrency, formatPercent } from '../../utils/format'

export default function Dashboard() {
  const classes = useStore((s) => s.assetClasses)
  const settings = useStore((s) => s.settings)
  const total = getTotalValue(classes)
  const sd = settings.showDecimals

  const pieData = classes.filter((c) => c.currentValue > 0).map((c) => ({
    name: c.name, value: c.currentValue, color: c.color,
  }))

  const barData = classes.map((c) => ({
    name: c.name.length > 11 ? c.name.slice(0, 11) + '…' : c.name,
    fullName: c.name,
    desvio: parseFloat(getDeviation(c, total).toFixed(2)),
    color: c.color,
  }))

  const outOfTarget = classes.filter((c) => Math.abs(getDeviation(c, total)) > 2)
  const isAligned = outOfTarget.length === 0 && total > 0

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-slate-100">Dashboard</h1>
        <Link to="/app/aportes" className="btn-primary">
          <Zap size={14} /> Simular aporte
        </Link>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card">
          <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-2">Patrimônio</p>
          <p className="font-mono text-xl font-semibold text-teal-400">{formatCurrency(total, sd)}</p>
        </div>
        <div className="card">
          <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-2">Status</p>
          <div className="flex items-center gap-1.5 mt-1">
            {total === 0
              ? <span className="text-slate-500 text-sm">Sem valores</span>
              : isAligned
              ? <><CheckCircle size={15} className="text-emerald-400" /><span className="text-emerald-400 text-sm font-medium">Alinhada</span></>
              : <><AlertTriangle size={15} className="text-amber-400" /><span className="text-amber-400 text-sm font-medium">{outOfTarget.length} fora</span></>
            }
          </div>
        </div>
        <div className="card">
          <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-2">Classes</p>
          <p className="text-xl font-semibold text-slate-200">{classes.length}</p>
        </div>
        <div className="card">
          <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-2">Com déficit</p>
          <p className="text-xl font-semibold text-slate-200">
            {classes.filter((c) => getDeviation(c, total) > 1).length}
          </p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="card">
          <h3 className="text-sm font-medium text-slate-300 mb-4">Composição atual</h3>
          {total === 0 ? (
            <div className="flex flex-col items-center justify-center h-44 gap-3">
              <p className="text-slate-500 text-sm">Nenhum valor registrado</p>
              <Link to="/app/alocacao" className="btn-secondary">
                <Plus size={13} /> Registrar valores
              </Link>
            </div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={78} paddingAngle={2} dataKey="value">
                    {pieData.map((e) => <Cell key={e.name} fill={e.color} />)}
                  </Pie>
                  <Tooltip
                    contentStyle={{ background: '#0a1628', border: '1px solid #152a52', borderRadius: 8, fontSize: 12 }}
                    formatter={(v: number) => [formatCurrency(v, sd), '']}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 mt-2">
                {pieData.map((e) => (
                  <div key={e.name} className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: e.color }} />
                    <span className="text-xs text-slate-400 truncate">{e.name}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        <div className="card">
          <h3 className="text-sm font-medium text-slate-300 mb-4">Desvio vs. meta (pp)</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={barData} margin={{ left: -25 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#152a52" vertical={false} />
              <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ background: '#0a1628', border: '1px solid #152a52', borderRadius: 8, fontSize: 12 }}
                formatter={(v: number) => [`${v > 0 ? '+' : ''}${v.toFixed(1)}pp`, 'Desvio']}
                labelFormatter={(_l, pl) => (pl as { payload?: { fullName?: string } }[])?.[0]?.payload?.fullName ?? ''}
              />
              <Bar dataKey="desvio" radius={[4, 4, 0, 0]}>
                {barData.map((e) => <Cell key={e.name} fill={e.desvio >= 0 ? '#14b8a6' : '#f59e0b'} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-x-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-slate-300">Resumo por classe</h3>
          <Link to="/app/alocacao" className="text-xs text-teal-400 hover:text-teal-300 transition-colors">
            Editar alocação →
          </Link>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-[10px] text-slate-500 uppercase tracking-wider border-b border-[#152a52]">
              <th className="text-left pb-2.5 font-medium">Classe</th>
              <th className="text-right pb-2.5 font-medium">Valor</th>
              <th className="text-right pb-2.5 font-medium">Atual</th>
              <th className="text-right pb-2.5 font-medium">Meta</th>
              <th className="text-right pb-2.5 font-medium">Desvio</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#152a52]">
            {classes.map((c) => {
              const pct = getCurrentPercentage(c, total)
              const dev = getDeviation(c, total)
              return (
                <tr key={c.id} className="hover:bg-[#0f2040]/40 transition-colors">
                  <td className="py-2.5">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: c.color }} />
                      <span className="text-slate-300">{c.name}</span>
                    </div>
                  </td>
                  <td className="py-2.5 text-right font-mono text-slate-300">{formatCurrency(c.currentValue, sd)}</td>
                  <td className="py-2.5 text-right font-mono text-slate-400">{formatPercent(pct)}</td>
                  <td className="py-2.5 text-right font-mono text-slate-400">{formatPercent(c.targetPercentage)}</td>
                  <td className={`py-2.5 text-right font-mono font-medium ${dev > 1 ? 'text-amber-400' : dev < -1 ? 'text-red-400' : 'text-emerald-400'}`}>
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
