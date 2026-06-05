import type { AssetClass, Settings } from '../types'

export interface AppData {
  assetClasses: AssetClass[]
  settings: Settings
}

export function exportToJSON(data: AppData): void {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `alocador_backup_${new Date().toISOString().slice(0, 10)}.json`
  a.click()
  setTimeout(() => URL.revokeObjectURL(url), 100)
}

export function importFromJSON(file: File): Promise<AppData> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string) as AppData
        if (!Array.isArray(data.assetClasses)) {
          reject(new Error('Arquivo inválido: estrutura não reconhecida.'))
          return
        }
        resolve(data)
      } catch {
        reject(new Error('Não foi possível ler o arquivo JSON.'))
      }
    }
    reader.onerror = () => reject(new Error('Erro ao ler o arquivo.'))
    reader.readAsText(file)
  })
}
