import { useRef, useState } from 'react'
import { Download, Upload, Trash2, CheckCircle } from 'lucide-react'
import { useStore } from '../../store/store'
import { exportToJSON, importFromJSON } from '../../utils/storage'
import { getTotalValue } from '../../utils/calculations'
import { formatCurrency } from '../../utils/format'

export default function Backup() {
  const classes = useStore((s) => s.assetClasses)
  const settings = useStore((s) => s.settings)
  const setAssetClasses = useStore((s) => s.setAssetClasses)
  const reset = useStore((s) => s.reset)

  const fileRef = useRef<HTMLInputElement>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [confirmReset, setConfirmReset] = useState(false)

  const total = getTotalValue(classes)
  const sd = settings.showDecimals

  async function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setError(null); setSuccess(false)
    try {
      const data = await importFromJSON(file)
      setAssetClasses(data.assetClasses)
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao importar.')
    } finally {
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  const rowStyle = (label: string, value: string) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0', borderBottom: '1px solid var(--border)' }}
      className="last:border-0">
      <span style={{ fontSize: '0.875rem', color: 'var(--txt-2)' }}>{label}</span>
      <span style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.875rem', color: 'var(--txt-1)' }}>{value}</span>
    </div>
  )

  return (
    <div style={{ maxWidth: '40rem', margin: '0 auto', padding: '2rem 1.5rem 3rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: '1.75rem', fontWeight: 400, color: 'var(--txt-1)', letterSpacing: '-0.02em', lineHeight: 1.1, marginBottom: '0.375rem' }}>
          Backup
        </h1>
        <p style={{ color: 'var(--txt-3)', fontSize: '0.875rem' }}>Seus dados ficam exclusivamente neste navegador.</p>
      </div>

      {/* Export */}
      <div className="card" style={{ marginBottom: '1.25rem' }}>
        <h3 style={{ fontSize: '0.9375rem', fontWeight: 500, color: 'var(--txt-1)', marginBottom: '1rem' }}>Exportar dados</h3>
        <div style={{ background: 'var(--surface-2)', borderRadius: '0.75rem', padding: '1rem', marginBottom: '1rem' }}>
          {rowStyle('Classes de ativos', String(classes.length))}
          {rowStyle('Patrimônio total', formatCurrency(total, sd))}
          {rowStyle('Data', new Date().toLocaleDateString('pt-BR'))}
        </div>
        <button
          onClick={() => exportToJSON({ assetClasses: classes, settings })}
          className="btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Download size={14} /> Baixar arquivo JSON
        </button>
      </div>

      {/* Import */}
      <div className="card" style={{ marginBottom: '1.25rem' }}>
        <h3 style={{ fontSize: '0.9375rem', fontWeight: 500, color: 'var(--txt-1)', marginBottom: '0.5rem' }}>Importar dados</h3>
        <p style={{ fontSize: '0.8125rem', color: 'var(--txt-3)', marginBottom: '1rem', lineHeight: 1.6 }}>
          Selecione um arquivo JSON previamente exportado pelo FinAtivo. Os dados atuais serão substituídos.
        </p>

        {error && (
          <div style={{
            padding: '0.75rem 1rem', borderRadius: '0.75rem', marginBottom: '1rem',
            background: 'color-mix(in srgb, var(--negative) 6%, transparent)',
            border: '1px solid color-mix(in srgb, var(--negative) 20%, transparent)',
            fontSize: '0.8125rem', color: 'var(--negative)',
          }}>{error}</div>
        )}

        {success && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: '0.5rem',
            padding: '0.75rem 1rem', borderRadius: '0.75rem', marginBottom: '1rem',
            background: 'color-mix(in srgb, var(--positive) 6%, transparent)',
            border: '1px solid color-mix(in srgb, var(--positive) 20%, transparent)',
            fontSize: '0.8125rem', color: 'var(--positive)',
          }}>
            <CheckCircle size={14} /> Dados importados com sucesso!
          </div>
        )}

        <input type="file" ref={fileRef} accept=".json" onChange={handleImport} style={{ display: 'none' }} />
        <button onClick={() => fileRef.current?.click()} className="btn-secondary">
          <Upload size={14} /> Selecionar arquivo
        </button>
      </div>

      {/* Reset */}
      <div className="card">
        <h3 style={{ fontSize: '0.9375rem', fontWeight: 500, color: 'var(--txt-1)', marginBottom: '0.5rem' }}>Redefinir dados</h3>
        <p style={{ fontSize: '0.8125rem', color: 'var(--txt-3)', marginBottom: '1rem', lineHeight: 1.6 }}>
          Remove todos os valores registrados e retorna ao estado inicial. Esta ação não pode ser desfeita.
        </p>
        {!confirmReset ? (
          <button onClick={() => setConfirmReset(true)} className="btn-danger">
            <Trash2 size={14} /> Redefinir carteira
          </button>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.875rem', color: 'var(--txt-1)', fontWeight: 500 }}>Tem certeza?</span>
            <button onClick={() => { reset(); setConfirmReset(false) }} className="btn-danger">
              <Trash2 size={14} /> Confirmar redefinição
            </button>
            <button onClick={() => setConfirmReset(false)} className="btn-ghost" style={{ color: 'var(--txt-2)' }}>
              Cancelar
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
