# Davi — Domain Model

🇬🇧 **English** · [🇧🇷 Português](DOMINIO.md)

The vocabulary of the product, in the language of the business it serves. Source of truth:
[`src/types.ts`](../src/types.ts) — which doubles as the JSON schema for the
Structured Outputs extraction step described in [ARCHITECTURE](ARCHITECTURE.md#1--architecture).

The code is written in Portuguese on purpose. These aren't generic CRM stages; they're the
specific ways a Brazilian salon's deals actually die. Naming them precisely is most of the
product thinking.

---

## `Estado` — where a commitment stands

| Term | English | Meaning |
|---|---|---|
| `novo` | new | Customer reached out, nothing quoted yet |
| `orcado` | quoted | A price was given |
| `acordado` | agreed | Customer said yes |
| **`travado`** | **stuck** | **Agreed or quoted, then stalled. This is where the money is.** |
| `recuperado` | recovered | Closed — paid or attended ✅ |
| `perdido` | lost | Definitively gone ❌ |
| `pausado` | paused | Owner told Davi to leave this one alone ⏸️ |

Demo dataset: 12 `travado`, 5 `orcado`, 4 `acordado`, 12 conversations with no commitment at all.

## `Motivo` — *why* it stalled

The most important field in the model. The reason a deal died determines what revives it.

| Term | English | What it looks like in the thread |
|---|---|---|
| `preco` | price objection | _"nossa achei um pouco salgado"_ — "that's a bit steep" |
| `terceiro` | needs a third party | _"vou falar com meu marido e te confirmo"_ — has to ask their spouse |
| `sumico_pos_acordo` | ghosted after agreeing | Said yes, then silence. Never sent the Pix. |
| `sem_grana` | no money right now | Wants it, can't afford it this month |
| `pacote_parado` | prepaid package abandoned | **Paid for 10 sessions, used 6, drifted away.** Already-collected revenue with unfulfilled service attached. |
| `outro` | other | Escape hatch |

Demo dataset: `pacote_parado` 4, `sumico_pos_acordo` 4, `preco` 3, `terceiro` 2, `sem_grana` 2.

## `Angulo` — the play Davi runs

Selected from `motivo` × `temperatura` × what's already been tried.

| Angle | English | Fits |
|---|---|---|
| `lembrete_simples` | simple reminder | `sumico_pos_acordo` — they meant to, they forgot |
| `retomada_pacote` | package resumption | `pacote_parado` — "your 4 sessions don't expire" |
| `facilita_pagamento` | easier payment | `sem_grana` — installments, not discount |
| `desconto` | discount | `preco`, and only within the owner's ceiling |
| `escassez` | scarcity | Warm leads with a real deadline |
| `prova_social` | social proof | `terceiro` — helps them make the case at home |

## Core entities

```ts
Conversa    { id, nome, iniciais, cor, mensagens[], naoLidas, compromisso? }
Mensagem    { id, autor, texto, min, audio?, porque? }
Compromisso { itens[{descricao, valor}], valorTotal, estado, motivo,
              temperatura, confianca, toques[] }
Toque       { min, angulo, respondeu }
```

| Field | Notes |
|---|---|
| `autor` | `'cliente'` \| `'loja'` (the shop) \| `'davi'` — the agent is a **first-class third party**, distinguished everywhere in the UI (blue tick, amber avatar) |
| `porque` | The rationale rendered under each Davi message. Not a comment field — the trust mechanism. |
| `min` | Minutes before "now". Frozen at `AGORA = 2026-08-19 11:04` for reproducible demos. |
| `audio` | Voice-note duration in seconds. Five in the dataset, 36–52s, each carrying real deal information. |
| `temperatura` | `quente` \| `morno` \| `frio` — hot / warm / cold |
| `confianca` | 0–1. Below threshold, Davi escalates instead of acting. |
| `toques` | Prior follow-up attempts, with the angle used and whether it worked. Prevents repeating a failed play and feeds the Outcome Loop. |

## Derived metrics

Computed at runtime in [`src/store.ts`](../src/store.ts) — these are real, not authored:

| Metric | Definition | Demo value |
|---|---|---|
| `TOTAL_PARADO` | Σ `valorTotal` where `estado` ∉ {`recuperado`, `perdido`} | **R$ 11.482** |
| `N_OPORTUNIDADES` | Count of open commitments | **22** |
| `N_SEM_RESPOSTA` | Threads where the customer spoke last | **22 of 33** |
