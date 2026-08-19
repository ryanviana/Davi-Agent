# Davi — Modelo de Domínio

[🇬🇧 English](DOMAIN.md) · 🇧🇷 **Português**

O vocabulário do produto, na língua do negócio que ele serve. Fonte da verdade:
[`src/types.ts`](../src/types.ts) — que serve também como JSON Schema da etapa de extração
com Structured Outputs descrita na [ARQUITETURA](ARQUITETURA.md#1--arquitetura).

O código é escrito em português de propósito. Estes não são estágios genéricos de CRM; são as
formas específicas pelas quais os negócios de um salão brasileiro efetivamente morrem. Nomear
isso com precisão é a maior parte do raciocínio de produto.

---

## `Estado` — em que pé está o compromisso

| Termo | Significado |
|---|---|
| `novo` | Cliente chegou, nada foi orçado ainda |
| `orcado` | Um preço foi informado |
| `acordado` | Cliente disse sim |
| **`travado`** | **Orçado ou acordado, e então parou. É aqui que está o dinheiro.** |
| `recuperado` | Fechado — pago ou atendido ✅ |
| `perdido` | Definitivamente perdido ❌ |
| `pausado` | A dona mandou o Davi deixar essa quieta ⏸️ |

Base de demonstração: 12 `travado`, 5 `orcado`, 4 `acordado`, 12 conversas sem compromisso algum.

## `Motivo` — *por que* travou

O campo mais importante do modelo. A razão pela qual o negócio morreu determina o que o revive.

| Termo | Como aparece na conversa |
|---|---|
| `preco` | _"nossa achei um pouco salgado"_ |
| `terceiro` | _"vou falar com meu marido e te confirmo"_ — precisa consultar alguém |
| `sumico_pos_acordo` | Disse sim, e depois silêncio. Nunca mandou o Pix. |
| `sem_grana` | Quer, mas não cabe no mês |
| `pacote_parado` | **Pagou 10 sessões, usou 6, sumiu.** Receita já recebida com serviço em aberto. |
| `outro` | Escape |

Base de demonstração: `pacote_parado` 4, `sumico_pos_acordo` 4, `preco` 3, `terceiro` 2,
`sem_grana` 2.

## `Angulo` — a jogada que o Davi faz

Escolhido a partir de `motivo` × `temperatura` × o que já foi tentado.

| Ângulo | Serve para |
|---|---|
| `lembrete_simples` | `sumico_pos_acordo` — a pessoa queria, só esqueceu |
| `retomada_pacote` | `pacote_parado` — "suas 4 sessões não vencem" |
| `facilita_pagamento` | `sem_grana` — parcelar, não descontar |
| `desconto` | `preco`, e só dentro do teto da dona |
| `escassez` | Leads quentes com prazo real |
| `prova_social` | `terceiro` — ajuda a pessoa a defender a compra em casa |

## Entidades principais

```ts
Conversa    { id, nome, iniciais, cor, mensagens[], naoLidas, compromisso? }
Mensagem    { id, autor, texto, min, audio?, porque? }
Compromisso { itens[{descricao, valor}], valorTotal, estado, motivo,
              temperatura, confianca, toques[] }
Toque       { min, angulo, respondeu }
```

| Campo | Notas |
|---|---|
| `autor` | `'cliente'` \| `'loja'` \| `'davi'` — o agente é um **terceiro de primeira classe**, distinguido em toda a interface (tick azul, avatar âmbar) |
| `porque` | A justificativa exibida sob cada mensagem do Davi. Não é campo de comentário — é o mecanismo de confiança. |
| `min` | Minutos antes de "agora". Congelado em `AGORA = 2026-08-19 11:04` para demos reprodutíveis. |
| `audio` | Duração do áudio em segundos. Cinco na base, de 36 a 52s, cada um com informação real de negócio. |
| `temperatura` | `quente` \| `morno` \| `frio` |
| `confianca` | 0–1. Abaixo do limiar, o Davi escala em vez de agir. |
| `toques` | Tentativas anteriores de follow-up, com o ângulo usado e se funcionou. Impede repetir jogada que falhou e alimenta o Loop de Resultado. |

## Métricas derivadas

Calculadas em tempo de execução em [`src/store.ts`](../src/store.ts) — estas são reais, não
escritas à mão:

| Métrica | Definição | Valor na demo |
|---|---|---|
| `TOTAL_PARADO` | Σ `valorTotal` onde `estado` ∉ {`recuperado`, `perdido`} | **R$ 11.482** |
| `N_OPORTUNIDADES` | Contagem de compromissos abertos | **22** |
| `N_SEM_RESPOSTA` | Conversas em que o cliente falou por último | **22 de 33** |
