import { useStore } from '../../store/store'
import { formatCurrency } from '../../utils/format'

export default function Configuracoes() {
  const settings = useStore((s) => s.settings)
  const updateSettings = useStore((s) => s.updateSettings)

  return (
    <div className="p-6 space-y-5 max-w-xl mx-auto">
      <div>
        <h1 className="text-lg font-semibold text-slate-100">Configurações</h1>
        <p className="text-sm text-slate-500 mt-0.5">Preferências de exibição.</p>
      </div>

      <div className="card space-y-5">
        <h3 className="text-sm font-medium text-slate-200">Exibição</h3>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-300">Mostrar centavos</p>
            <p className="text-xs text-slate-500 mt-0.5">Exibir casas decimais nos valores</p>
          </div>
          <button
            onClick={() => updateSettings({ showDecimals: !settings.showDecimals })}
            className={`relative w-10 h-5 rounded-full transition-colors ${settings.showDecimals ? 'bg-teal-500' : 'bg-[#152a52]'}`}
          >
            <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${settings.showDecimals ? 'translate-x-5' : 'translate-x-0.5'}`} />
          </button>
        </div>
        <div className="bg-[#0f2040] rounded-xl p-3">
          <p className="text-xs text-slate-500 mb-1">Prévia</p>
          <p className="font-mono text-teal-400">{formatCurrency(12345.67, settings.showDecimals)}</p>
        </div>
      </div>

      <div className="card space-y-2">
        <h3 className="text-sm font-medium text-slate-200 mb-3">Privacidade</h3>
        <ul className="space-y-1.5 text-xs text-slate-500 leading-relaxed">
          <li>· Dados salvos exclusivamente neste navegador (localStorage)</li>
          <li>· Nenhuma informação é enviada a servidores</li>
          <li>· Limpar os dados do navegador pode apagar sua alocação</li>
          <li>· Use Backup para exportar seus dados regularmente</li>
        </ul>
      </div>
    </div>
  )
}
