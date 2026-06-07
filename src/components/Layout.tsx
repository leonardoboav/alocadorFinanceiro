import { Outlet, NavLink, Link } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'
import { TrendingUp, Menu, X, Settings, Download, MoreHorizontal } from 'lucide-react'
import { useStore } from '../store/store'
import { computePortfolioTotal } from '../utils/calculations'
import { formatCurrency } from '../utils/format'

const mainNav = [
  { to: '/app', label: 'Dashboard', end: true },
  { to: '/app/carteira', label: 'Carteira' },
  { to: '/app/alocacao', label: 'Alocação' },
  { to: '/app/aportes', label: 'Aportes' },
]

const utilNav = [
  { to: '/app/backup', label: 'Backup', icon: Download },
  { to: '/app/configuracoes', label: 'Configurações', icon: Settings },
]

const navLinkStyle = (isActive: boolean): React.CSSProperties => ({
  padding: '0.375rem 0.75rem',
  borderRadius: 8,
  fontSize: '0.875rem',
  fontWeight: isActive ? 500 : 400,
  color: isActive ? 'var(--txt-1)' : 'var(--txt-2)',
  background: isActive ? 'var(--surface)' : 'transparent',
  textDecoration: 'none',
  transition: 'all 120ms ease',
  border: isActive ? '1px solid var(--border)' : '1px solid transparent',
  whiteSpace: 'nowrap' as const,
})

export default function Layout() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [moreOpen, setMoreOpen] = useState(false)
  const moreRef = useRef<HTMLDivElement>(null)

  const rawClasses = useStore((s) => s.assetClasses)
  const assets = useStore((s) => s.assets)
  const settings = useStore((s) => s.settings)
  const loadRates = useStore((s) => s.loadRates)
  const total = computePortfolioTotal(rawClasses, assets)

  const totalInvested = assets.reduce((s, a) => s + a.quantity * a.avgPrice, 0)
  const totalCurrent  = assets.reduce((s, a) => s + a.quantity * a.avgPrice * (1 + a.gainLossPct / 100), 0)
  const pnl    = totalCurrent - totalInvested
  const pnlPct = totalInvested > 0 ? (pnl / totalInvested) * 100 : 0
  const isPnlPos = pnl >= 0


  useEffect(() => { loadRates() }, [loadRates])

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) setMoreOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  useEffect(() => {
    if (mobileOpen) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [mobileOpen])

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      {/* ── Top header ── */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 40,
        background: 'rgba(13, 17, 23, 0.88)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--border)',
      }}>
        <div style={{
          maxWidth: '72rem', margin: '0 auto',
          padding: '0 1.5rem', height: 52,
          display: 'flex', alignItems: 'center', gap: '0.5rem',
        }}>
          {/* Logo */}
          <Link to="/app" style={{
            display: 'flex', alignItems: 'center', gap: '0.5rem',
            textDecoration: 'none', flexShrink: 0, marginRight: '1rem',
          }}>
            <div style={{
              width: 28, height: 28, borderRadius: 7,
              background: 'color-mix(in srgb, var(--accent) 10%, transparent)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <TrendingUp size={14} style={{ color: 'var(--accent)' }} />
            </div>
            <span style={{
              fontWeight: 600, fontSize: '0.9375rem',
              color: 'var(--txt-1)', letterSpacing: '-0.02em',
            }}>FinAtivo</span>
          </Link>

          {/* Desktop nav links */}
          <nav style={{ display: 'flex', alignItems: 'center', gap: '0.125rem', flex: 1 }}
            className="hidden md:flex">
            {mainNav.map(({ to, label, end }) => (
              <NavLink key={to} to={to} end={end}
                style={({ isActive }) => navLinkStyle(isActive)}>
                {label}
              </NavLink>
            ))}
          </nav>

          {/* Desktop right side */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginLeft: 'auto' }}
            className="hidden md:flex">
            <div style={{ textAlign: 'right' }}>
              <div style={{
                fontSize: '0.625rem', color: 'var(--txt-3)',
                textTransform: 'uppercase', letterSpacing: '0.07em', lineHeight: 1, marginBottom: '0.25rem',
              }}>Patrimônio</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', justifyContent: 'flex-end' }}>
                <span style={{
                  fontFamily: "'DM Mono', monospace", fontWeight: 400,
                  fontSize: '0.9375rem', color: 'var(--accent)', lineHeight: 1.4,
                }}>
                  {formatCurrency(total, settings.showDecimals)}
                </span>
                {assets.length > 0 && totalInvested > 0 && (
                  <span style={{
                    fontFamily: "'DM Mono', monospace", fontSize: '0.6875rem', lineHeight: 1,
                    color: isPnlPos ? 'var(--positive)' : 'var(--negative)',
                  }}>
                    {isPnlPos ? '+' : '−'}{Math.abs(pnlPct).toFixed(2)}%
                  </span>
                )}
              </div>
            </div>

            {/* More dropdown */}
            <div ref={moreRef} style={{ position: 'relative' }}>
              <button
                onClick={() => setMoreOpen(!moreOpen)}
                style={{
                  width: 32, height: 32, borderRadius: 8,
                  background: moreOpen ? 'var(--surface)' : 'transparent',
                  border: moreOpen ? '1px solid var(--border)' : '1px solid transparent',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', color: 'var(--txt-2)',
                  transition: 'all 120ms ease',
                }}
                title="Mais opções"
              >
                <MoreHorizontal size={16} />
              </button>

              {moreOpen && (
                <div style={{
                  position: 'absolute', top: '100%', right: 0, marginTop: 6,
                  background: 'var(--surface)', border: '1px solid var(--border)',
                  borderRadius: 12, padding: '0.375rem', minWidth: 168,
                  boxShadow: '0 8px 32px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)',
                  zIndex: 50,
                }}>
                  {utilNav.map(({ to, label, icon: Icon }) => (
                    <NavLink key={to} to={to} onClick={() => setMoreOpen(false)}
                      style={({ isActive }) => ({
                        display: 'flex', alignItems: 'center', gap: '0.625rem',
                        padding: '0.5rem 0.75rem', borderRadius: 8,
                        fontSize: '0.875rem',
                        color: isActive ? 'var(--accent)' : 'var(--txt-1)',
                        background: isActive ? 'color-mix(in srgb, var(--accent) 6%, transparent)' : 'transparent',
                        textDecoration: 'none', transition: 'background 100ms ease',
                      })}>
                      <Icon size={14} style={{ color: 'var(--txt-3)' }} />
                      {label}
                    </NavLink>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Mobile right */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginLeft: 'auto' }}
            className="flex md:hidden">
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              style={{
                width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--txt-1)',
              }}
            >
              {mobileOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div style={{ borderTop: '1px solid var(--border)', background: 'var(--surface)' }}
            className="md:hidden">
            <div style={{ padding: '0.5rem 1rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.125rem' }}>
              {[...mainNav, ...utilNav.map((n) => ({ ...n, end: undefined }))].map(({ to, label, end }) => (
                <NavLink key={to} to={to} end={end}
                  onClick={() => setMobileOpen(false)}
                  style={({ isActive }) => ({
                    display: 'flex', alignItems: 'center',
                    padding: '0.75rem 0.875rem', borderRadius: 10,
                    fontSize: '0.9375rem',
                    fontWeight: isActive ? 500 : 400,
                    color: isActive ? 'var(--accent)' : 'var(--txt-1)',
                    background: isActive ? 'color-mix(in srgb, var(--accent) 6%, transparent)' : 'transparent',
                    textDecoration: 'none',
                  })}>
                  {label}
                </NavLink>
              ))}
            </div>
          </div>
        )}
      </header>

      <main>
        <Outlet />
      </main>
    </div>
  )
}
