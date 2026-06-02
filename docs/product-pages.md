# Documentacao de Produto: Asset Allocation Pessoal

## Visao Geral

Este documento descreve uma proposta inicial de produto web, acessivel pelo navegador e sem login, voltado para ajudar uma pessoa investidora a melhorar seus aportes mensais com base em uma estrategia de asset allocation.

O foco do produto nao e fazer recomendacao financeira individualizada, mas oferecer uma ferramenta de organizacao, simulacao e decisao que ajude o usuario a responder uma pergunta pratica:

> "Dado meu plano de alocacao ideal e minha carteira atual, onde devo aportar agora para aproximar minha carteira da meta?"

## Objetivo do Produto

Criar uma ferramenta simples, privada e direta para:

- Definir uma alocacao alvo por classe de ativo.
- Registrar ou importar a composicao atual da carteira.
- Simular novos aportes.
- Identificar quais classes ou ativos estao abaixo da meta.
- Sugerir uma distribuicao de aporte que ajude a rebalancear a carteira.
- Acompanhar a evolucao da carteira sem exigir conta, senha ou cadastro.

## Principios do Produto

- Sem login na primeira versao.
- Dados armazenados localmente no navegador, usando local storage ou IndexedDB.
- Interface simples, com foco em decisao de aporte.
- Transparencia sobre os calculos.
- Nenhuma promessa de rentabilidade.
- Nenhuma recomendacao automatica de compra de ativos especificos sem contexto do usuario.
- Produto expansivel para uma versao futura com conta, sincronizacao e recursos premium.

## Publico-Alvo

Investidores pessoa fisica que ja fazem aportes recorrentes e desejam seguir uma estrategia de alocacao, mas ainda controlam a carteira em planilhas ou de forma manual.

O usuario ideal:

- Investe mensalmente.
- Possui mais de uma classe de ativo.
- Quer manter percentuais alvo.
- Deseja saber onde aportar antes de comprar.
- Prefere uma ferramenta simples a uma plataforma completa de investimentos.

## Escopo Inicial

### Dentro do Escopo

- Criacao de uma carteira local.
- Cadastro de classes de ativo.
- Cadastro de ativos dentro de cada classe.
- Definicao de percentual alvo.
- Registro de valor atual por ativo ou por classe.
- Simulador de aporte.
- Resultado sugerindo a distribuicao ideal do proximo aporte.
- Visualizacao de desvio entre carteira atual e carteira alvo.
- Exportacao e importacao manual dos dados em JSON.

### Fora do Escopo Inicial

- Login.
- Sincronizacao em nuvem.
- Integracao com corretoras.
- Cotacoes em tempo real.
- Recomendacao personalizada de ativos.
- Execucao de ordens.
- Relatorios tributarios.
- Comunidade ou recursos sociais.

## Arvore de Paginas

```text
/
├── Home
│   ├── Hero com proposta de valor
│   ├── Como funciona
│   ├── Beneficios
│   ├── Aviso educacional
│   └── CTA: Comecar sem login
│
├── /app
│   ├── Dashboard
│   │   ├── Resumo da carteira
│   │   ├── Alocacao atual vs alvo
│   │   ├── Classes mais desalinhadas
│   │   ├── Proximo aporte sugerido
│   │   └── Acoes rapidas
│   │
│   ├── /app/setup
│   │   ├── Boas-vindas
│   │   ├── Escolha de modelo de carteira
│   │   ├── Cadastro de classes
│   │   ├── Definicao de percentuais alvo
│   │   └── Confirmacao da estrategia
│   │
│   ├── /app/carteira
│   │   ├── Lista de classes de ativos
│   │   ├── Lista de ativos por classe
│   │   ├── Valor atual por ativo
│   │   ├── Percentual atual
│   │   ├── Percentual alvo
│   │   └── Diferenca em valor e percentual
│   │
│   ├── /app/alocacao
│   │   ├── Editor de alocacao alvo
│   │   ├── Validacao de soma em 100%
│   │   ├── Templates de estrategia
│   │   └── Comparacao com alocacao atual
│   │
│   ├── /app/aportes
│   │   ├── Campo de valor do novo aporte
│   │   ├── Sugestao de distribuicao por classe
│   │   ├── Sugestao de distribuicao por ativo
│   │   ├── Antes e depois do aporte
│   │   └── Registro manual do aporte realizado
│   │
│   ├── /app/simulador
│   │   ├── Simular aporte unico
│   │   ├── Simular aportes recorrentes
│   │   ├── Simular rebalanceamento
│   │   └── Comparar cenarios
│   │
│   ├── /app/historico
│   │   ├── Historico de aportes
│   │   ├── Evolucao da alocacao
│   │   ├── Marcos da carteira
│   │   └── Exportacao do historico
│   │
│   ├── /app/importar-exportar
│   │   ├── Exportar dados locais
│   │   ├── Importar backup JSON
│   │   ├── Baixar modelo de planilha
│   │   └── Limpar dados locais
│   │
│   └── /app/configuracoes
│       ├── Moeda principal
│       ├── Preferencias de exibicao
│       ├── Avisos e disclaimers
│       ├── Dados locais
│       └── Resetar aplicacao
│
├── /metodologia
│   ├── O que e asset allocation
│   ├── Como os desvios sao calculados
│   ├── Como a sugestao de aporte funciona
│   ├── Limites da ferramenta
│   └── Disclaimer educacional
│
├── /privacidade
│   ├── Sem login
│   ├── Dados salvos no navegador
│   ├── O que nao coletamos
│   └── Como apagar seus dados
│
└── /roadmap
    ├── Versao atual
    ├── Proximas melhorias
    ├── Possiveis recursos premium
    └── Integracoes futuras
```

## Descricao das Paginas

### Home

Pagina publica de apresentacao. Deve explicar rapidamente o problema: o investidor sabe quanto vai aportar, mas nem sempre sabe onde aportar para manter a estrategia.

Conteudos principais:

- Proposta de valor clara.
- CTA para iniciar sem cadastro.
- Explicacao visual em 3 passos: informe sua meta, registre sua carteira, simule seu aporte.
- Aviso de que a ferramenta nao substitui consultoria financeira.

### Dashboard

Tela principal apos o usuario iniciar a aplicacao. Deve responder de imediato:

- Qual e o valor total da carteira?
- A carteira esta perto ou longe da alocacao alvo?
- Quais classes estao abaixo da meta?
- Para onde o proximo aporte deveria ir?

### Setup

Fluxo inicial para criar a primeira estrategia. Pode oferecer modelos prontos, como:

- Conservador.
- Moderado.
- Arrojado.
- Personalizado.

Mesmo com modelos, o usuario deve poder ajustar os percentuais manualmente.

### Carteira

Tela de gestao da carteira atual. Deve permitir cadastrar valores por classe ou por ativo.

Exemplo de classes:

- Renda fixa.
- Acoes Brasil.
- Fundos imobiliarios.
- ETFs internacionais.
- Criptoativos.
- Caixa ou reserva de oportunidade.

### Alocacao

Tela dedicada a ajustar a estrategia alvo. A soma dos percentuais deve obrigatoriamente fechar em 100%.

Essa tela deve destacar:

- Percentual alvo.
- Percentual atual.
- Diferenca.
- Valor necessario para atingir a meta no patrimonio atual.

### Aportes

Principal tela operacional do produto. O usuario informa quanto pretende investir e recebe uma sugestao de distribuicao.

Exemplo:

- Aporte disponivel: R$ 1.000.
- Classe mais abaixo da meta: ETFs internacionais.
- Sugestao: R$ 700 em ETFs internacionais, R$ 300 em fundos imobiliarios.

A tela tambem deve mostrar como a carteira ficaria apos o aporte sugerido.

### Simulador

Area para cenarios mais exploratorios. Permite testar aportes futuros, mudancas de estrategia e rebalanceamentos sem alterar a carteira real.

### Historico

Registro dos aportes e alteracoes relevantes. Mesmo sem login, esse historico pode ser mantido localmente e exportado.

### Importar e Exportar

Pagina importante para a confianca do usuario, ja que o produto nao tera login no inicio. Deve permitir backup dos dados locais.

### Configuracoes

Concentra preferencias gerais e gestao dos dados locais.

## Fluxo Principal do Usuario

```text
Home
→ Comecar sem login
→ Setup da estrategia
→ Cadastro da carteira atual
→ Dashboard
→ Informar valor do aporte
→ Ver sugestao
→ Registrar aporte realizado
→ Acompanhar evolucao
```

## Modelo Conceitual de Dados

```text
Portfolio
├── id
├── name
├── currency
├── createdAt
├── updatedAt
├── assetClasses[]
├── contributions[]
└── settings

AssetClass
├── id
├── name
├── targetPercentage
├── currentValue
├── color
└── assets[]

Asset
├── id
├── name
├── ticker
├── assetClassId
├── currentValue
└── notes

Contribution
├── id
├── date
├── totalAmount
├── allocations[]
└── notes

ContributionAllocation
├── assetClassId
├── assetId
└── amount
```

## Regra Inicial para Sugestao de Aporte

A primeira versao pode usar uma logica simples:

1. Calcular o valor total atual da carteira.
2. Somar o novo aporte ao patrimonio projetado.
3. Calcular o valor alvo de cada classe no patrimonio projetado.
4. Comparar o valor atual de cada classe com o valor alvo projetado.
5. Distribuir o aporte priorizando as classes com maior deficit em relacao ao alvo.
6. Nao sugerir venda de ativos na versao inicial, apenas direcionar novos aportes.

Essa abordagem e facil de explicar e combina com o comportamento de investidores que preferem rebalancear por novos aportes, sem necessariamente vender posicoes.

## Estados Vazios

O produto deve tratar bem momentos sem dados:

- Sem carteira criada: convidar o usuario a iniciar o setup.
- Sem ativos cadastrados: permitir trabalhar apenas por classe.
- Sem historico: explicar que os proximos aportes aparecerao ali.
- Sem backup: sugerir exportar dados periodicamente.

## Privacidade e Dados

Como a primeira versao nao tem login, os dados devem ficar no proprio navegador do usuario.

Mensagens importantes:

- "Seus dados ficam neste navegador."
- "Voce pode exportar um backup a qualquer momento."
- "Ao limpar os dados do navegador, suas informacoes podem ser perdidas."
- "Esta ferramenta nao envia suas informacoes para uma conta online nesta versao."

## Possivel Roadmap

### MVP

- Home.
- Setup de carteira.
- Cadastro de classes.
- Cadastro de valores atuais.
- Alocacao alvo.
- Simulador de aporte.
- Dashboard basico.
- Persistencia local.
- Exportacao e importacao JSON.

### Versao 1

- Cadastro detalhado por ativo.
- Historico de aportes.
- Simulacoes recorrentes.
- Melhorias visuais em graficos.
- Templates de estrategia.
- Backup manual mais amigavel.

### Versao 2

- Login opcional.
- Sincronizacao entre dispositivos.
- Cotacoes automaticas.
- Metas por objetivo.
- Alertas de desalinhamento.
- Importacao via planilha.

### Versao Futura Premium

- Integracao com corretoras.
- Relatorios avancados.
- Planejamento por objetivos.
- Carteiras multiplas.
- Cenarios com rentabilidade esperada.
- Comparacao de estrategias.
- Assistente educacional com explicacao dos desvios.

## Riscos e Cuidados

- Evitar linguagem de recomendacao financeira direta.
- Deixar claro que os calculos sao auxiliares.
- Nao prometer rentabilidade.
- Explicar a metodologia de forma simples.
- Evitar complexidade excessiva no MVP.
- Garantir que o usuario consiga exportar seus dados.

## Proposta de Posicionamento

Uma ferramenta simples para transformar sua estrategia de alocacao em decisoes praticas de aporte.

Frase curta:

> Saiba onde aportar hoje para manter sua carteira alinhada com seu plano.

## Nome Provisorio

Sugestoes de nome:

- Aloca+
- Aporte Certo
- Carteira Alvo
- Plano de Aporte
- Meu Rebalanceamento
- Alocador

## Proximos Passos Recomendados

1. Validar se o MVP deve operar por classe, por ativo ou ambos.
2. Definir a formula exata de sugestao de aporte.
3. Escolher stack tecnica.
4. Criar wireframes das telas principais.
5. Implementar um prototipo local-first.
6. Testar com uma carteira real ficticia.
