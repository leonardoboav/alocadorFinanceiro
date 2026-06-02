import { Outlet, NavLink } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { TrendingUp, PieChart, Zap, Download, Settings, LayoutDashboard, Menu, X } from 'lucide-react'
import { useStore } from '../store/store'
import { getTotalValue } from '../utils/calculations'
import { formatCurrency } from '../utils/format'

const nav = [
  { to: '/app', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/app/alocacao', label: 'Alocação', icon: PieChart },
  { to: '/app/aportes', label: 'Aportes', icon: Zap },
  { to: '/app/backup', label: 'Backup', icon: Download },
  { to: '/app/configuracoes', label: 'Configurações', icon: Settings },
]

export default function Layout() {
  const [open, setOpen] = useState(false)
  const classes = useStore((s) => s.assetClasses)
  const settings = useStore((s) => s.settings)
  const loadRates = useStore((s) => s.loadRates)
  const total = getTotalValue(classes)

  useEffect(() => { loadRates() }, [loadRates])

  const sidebar = (
    <aside className="w-56 flex-shrink-0 flex flex-col bg-[#0a1628] border-r border-[#152a52] h-full">
      <div className="px-5 py-4 border-b border-[#152a52] flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-teal-500/15 flex items-center justify-center">
            <TrendingUp size={14} className="text-teal-400" />
          </div>
          <span className="font-semibold text-sm text-slate-100">Alocador</span>
        </div>
        <button onClick={() => setOpen(false)} className="lg:hidden text-slate-500 hover:text-slate-200">
          <X size={16} />
        </button>
      </div>

      <div className="px-5 py-3.5 border-b border-[#152a52]">
        <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">Patrimônio</p>
        <p className="font-mono text-teal-400 font-semibold text-base">
          {formatCurrency(total, settings.showDecimals)}
        </p>
      </div>

      <nav className="flex-1 px-2.5 py-3 space-y-0.5">
        {nav.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={() => setOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all ${
                isActive
                  ? 'bg-teal-500/12 text-teal-400'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-[#0f2040]'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon size={15} className={isActive ? 'text-teal-400' : 'text-slate-500'} />
                {label}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="px-5 py-3.5 border-t border-[#152a52]">
        <p className="text-[10px] text-slate-600">Dados salvos localmente</p>
      </div>
    </aside>
  )

  return (
    <div className="flex h-screen bg-[#050d1a] overflow-hidden">
      {/* Mobile overlay */}
      {open && (
        <div className="fixed inset-0 bg-black/60 z-20 lg:hidden" onClick={() => setOpen(false)} />
      )}

      {/* Desktop sidebar */}
      <div className="hidden lg:flex h-full">{sidebar}</div>

      {/* Mobile sidebar */}
      {open && (
        <div className="fixed inset-y-0 left-0 z-30 lg:hidden flex h-full">{sidebar}</div>
      )}

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile topbar */}
        <header className="lg:hidden flex items-center gap-3 px-4 py-3.5 border-b border-[#152a52]">
          <button onClick={() => setOpen(true)} className="text-slate-400 hover:text-slate-200">
            <Menu size={19} />
          </button>
          <div className="flex items-center gap-2">
            <TrendingUp size={14} className="text-teal-400" />
            <span className="font-semibold text-sm text-slate-100">Alocador</span>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
