import { useStore } from '../../store/store'
import { formatCurrency } from '../../utils/format'

export default function Configuracoes() {
  const settings = useStore((s) => s.settings)
  const updateSettings = useStore((s) => s.updateSettings)

  return (
    <div style={{ maxWidth: '40rem', margin: '0 auto', padding: '2rem 1.5rem 3rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: '1.75rem', fontWeight: 400, color: 'var(--txt-1)', letterSpacing: '-0.02em', lineHeight: 1.1, marginBottom: '0.375rem' }}>
          Configurações
        </h1>
        <p style={{ color: 'var(--txt-3)', fontSize: '0.875rem' }}>Preferências de exibição.</p>
      </div>

      <div className="card" style={{ marginBottom: '1.25rem' }}>
        <h3 style={{ fontSize: '0.9375rem', fontWeight: 500, color: 'var(--txt-1)', marginBottom: '1.25rem' }}>Exibição</h3>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
          <div>
            <p style={{ fontSize: '0.9375rem', color: 'var(--txt-1)', marginBottom: '0.25rem' }}>Mostrar centavos</p>
            <p style={{ fontSize: '0.8125rem', color: 'var(--txt-3)' }}>Exibir casas decimais nos valores</p>
          </div>
          <button
            onClick={() => updateSettings({ showDecimals: !settings.showDecimals })}
            style={{
              position: 'relative', width: 44, height: 24, borderRadius: 9999, border: 'none',
              background: settings.showDecimals ? 'var(--accent)' : 'var(--border-2)',
              cursor: 'pointer', transition: 'background 200ms ease', flexShrink: 0,
            }}
          >
            <span style={{
              position: 'absolute', top: 2, left: settings.showDecimals ? 22 : 2,
              width: 20, height: 20, borderRadius: '50%', background: '#fff',
              transition: 'left 200ms ease',
              boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
            }} />
          </button>
        </div>
        <div style={{
          marginTop: '1.25rem', padding: '0.875rem 1rem', borderRadius: '0.75rem', background: 'var(--surface-2)',
        }}>
          <p style={{ fontSize: '0.75rem', color: 'var(--txt-3)', marginBottom: '0.375rem', textTransform: 'uppercase', letterSpacing: '0.07em', fontWeight: 500 }}>Prévia</p>
          <p style={{ fontFamily: "'DM Mono', monospace", fontSize: '1.125rem', color: 'var(--accent)', fontWeight: 300 }}>
            {formatCurrency(12345.67, settings.showDecimals)}
          </p>
        </div>
      </div>

      <div className="card">
        <h3 style={{ fontSize: '0.9375rem', fontWeight: 500, color: 'var(--txt-1)', marginBottom: '1rem' }}>Privacidade</h3>
        <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {[
            'Dados salvos exclusivamente neste navegador (localStorage)',
            'Nenhuma informação é enviada a servidores',
            'Limpar os dados do navegador pode apagar sua alocação',
            'Use Backup para exportar seus dados regularmente',
          ].map((item) => (
            <li key={item} style={{ display: 'flex', gap: '0.625rem', fontSize: '0.8125rem', color: 'var(--txt-2)', lineHeight: 1.5 }}>
              <span style={{ color: 'var(--txt-3)', flexShrink: 0 }}>·</span>
              {item}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
