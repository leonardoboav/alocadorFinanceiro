import { useRef, useState } from 'react'
import { Download, Upload, Trash2, AlertTriangle, CheckCircle } from 'lucide-react'
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
    setError(null)
    setSuccess(false)
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

  return (
    <div className="p-6 space-y-5 max-w-2xl mx-auto">
      <div>
        <h1 className="text-lg font-semibold text-slate-100">Backup</h1>
        <p className="text-sm text-slate-500 mt-0.5">Seus dados ficam exclusivamente neste navegador.</p>
      </div>

      <div className="card space-y-4">
        <h3 className="text-sm font-medium text-slate-200">Exportar dados</h3>
        <div className="bg-[#0f2040] rounded-xl p-4 text-sm space-y-2">
          {[
            ['Classes de ativos', `${classes.length}`],
            ['Patrimônio total', formatCurrency(total, sd)],
          ].map(([k, v]) => (
            <div key={k} className="flex justify-between text-slate-400">
              <span>{k}</span><span className="font-mono">{v}</span>
            </div>
          ))}
        </div>
        <button onClick={() => exportToJSON({ assetClasses: classes, settings })} className="btn-primary">
          <Download size={14} /> Exportar JSON
        </button>
      </div>

      <div className="card space-y-4">
        <h3 className="text-sm font-medium text-slate-200">Importar backup</h3>
        <p className="text-sm text-slate-400">Selecione um JSON exportado anteriormente. Os dados atuais serão substituídos.</p>
        {error && (
          <div className="flex items-center gap-2 bg-red-950/30 border border-red-900/40 rounded-xl p-3 text-sm text-red-400">
            <AlertTriangle size={14} />{error}
          </div>
        )}
        {success && (
          <div className="flex items-center gap-2 bg-emerald-950/30 border border-emerald-900/40 rounded-xl p-3 text-sm text-emerald-400">
            <CheckCircle size={14} />Dados importados com sucesso!
          </div>
        )}
        <input ref={fileRef} type="file" accept=".json" onChange={handleImport} className="hidden" />
        <button onClick={() => fileRef.current?.click()} className="btn-secondary">
          <Upload size={14} /> Selecionar arquivo JSON
        </button>
      </div>

      <div className="card border-red-900/30 space-y-3">
        <h3 className="text-sm font-medium text-red-400 flex items-center gap-2">
          <Trash2 size={14} /> Limpar dados
        </h3>
        <p className="text-sm text-slate-400">Remove toda a alocação e volta ao estado inicial. Irreversível.</p>
        {!confirmReset ? (
          <button onClick={() => setConfirmReset(true)} className="btn-danger">
            <Trash2 size={13} /> Limpar dados
          </button>
        ) : (
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-sm text-amber-400 flex items-center gap-1.5"><AlertTriangle size={13} />Tem certeza?</span>
            <button onClick={() => { reset(); setConfirmReset(false) }} className="btn-danger">Confirmar</button>
            <button onClick={() => setConfirmReset(false)} className="btn-ghost">Cancelar</button>
          </div>
        )}
      </div>
    </div>
  )
}
