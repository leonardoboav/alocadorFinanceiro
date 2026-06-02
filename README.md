# Alocador

Ferramenta web para organizar sua estratégia de asset allocation e saber exatamente onde aportar no próximo mês.

> Saiba onde aportar hoje para manter sua carteira alinhada com seu plano.

## Stack

- **Next.js 15** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **Zustand** — estado + persistência no localStorage
- **Recharts** — gráficos de alocação
- **Lucide React** — ícones

## Funcionalidades

- **Sem login** — dados salvos localmente no navegador
- **Alocação** — define classes, percentual alvo e valor atual em uma única tela
- **Dashboard** — pie chart + desvio vs. meta em barra
- **Simulador de aporte** — distribui o aporte priorizando classes com déficit
- **Backup** — exporta/importa JSON

## Algoritmo

O aporte é distribuído proporcionalmente ao déficit de cada classe em relação à meta no patrimônio projetado (atual + aporte). Classes acima da meta recebem zero. Nenhuma venda é sugerida.

## Rodando

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
npm start
```

## Aviso

Fins organizacionais e educacionais. Não constitui recomendação de investimento.
# alocadorFinanceiro
