/**
 * Gera src/data/historico.ts — o ledger de toques PASSADOS e já resolvidos do
 * Studio Lumi. Determinístico (mulberry32, semente fixa): rodar duas vezes
 * produz o mesmo arquivo, então os números que aparecem nas justificativas do
 * Davi não mudam entre um ensaio e a apresentação.
 *
 *   node scripts/gerar-historico.mjs
 *
 * Por que esse arquivo existe: as conversas da inbox estão TODAS travadas, ou
 * seja, todo toque nelas foi ignorado. Curva de conversão tirada dali daria 0%.
 * A estatística tem que sair de quem já resolveu — fechou ou morreu.
 */
import { writeFileSync } from 'node:fs'

const mulberry32 = (a) => () => {
  a |= 0; a = (a + 0x6D2B79F5) | 0
  let t = Math.imul(a ^ (a >>> 15), 1 | a)
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296
}
const rnd = mulberry32(1993)
const pick = (a) => a[Math.floor(rnd() * a.length)]

const MOTIVOS = ['preco', 'terceiro', 'sumico_pos_acordo', 'sem_grana', 'pacote_parado']
const ANGULOS = ['lembrete_simples', 'facilita_pagamento', 'retomada_pacote', 'prova_social', 'escassez', 'desconto']

/** Verdade oculta do mundo. A curva.ts NÃO lê isto — ela reestima a partir das linhas. */
const PORTOQUE = { 1: 0.34, 2: 0.29, 3: 0.12, 4: 0.05, 5: 0.03 }
const PAR = {
  preco:             { facilita_pagamento: 0.34, desconto: 0.30, lembrete_simples: 0.08, escassez: 0.14, prova_social: 0.16, retomada_pacote: 0.06 },
  terceiro:          { prova_social: 0.36, escassez: 0.22, lembrete_simples: 0.12, facilita_pagamento: 0.18, desconto: 0.16, retomada_pacote: 0.07 },
  sumico_pos_acordo: { lembrete_simples: 0.30, escassez: 0.26, facilita_pagamento: 0.14, prova_social: 0.11, desconto: 0.12, retomada_pacote: 0.10 },
  sem_grana:         { facilita_pagamento: 0.31, desconto: 0.24, lembrete_simples: 0.07, escassez: 0.08, prova_social: 0.10, retomada_pacote: 0.09 },
  pacote_parado:     { retomada_pacote: 0.47, lembrete_simples: 0.17, escassez: 0.20, prova_social: 0.13, facilita_pagamento: 0.11, desconto: 0.10 },
}
const TICKET = { preco: 980, terceiro: 1050, sumico_pos_acordo: 210, sem_grana: 640, pacote_parado: 410 }

const linhas = []
let id = 0
// 96 clientes resolvidos nos últimos 8 meses, cada um com 1..4 toques até responder ou morrer
for (let c = 0; c < 96; c++) {
  const motivo = pick(MOTIVOS)
  const dias = 20 + Math.floor(rnd() * 220)
  const limite = 1 + Math.floor(rnd() * 4)
  for (let n = 1; n <= limite; n++) {
    const angulo = pick(ANGULOS)
    const base = (PORTOQUE[n] ?? 0.02) * (PAR[motivo][angulo] / 0.22)
    const respondeu = rnd() < Math.min(0.72, base)
    linhas.push({
      id: `h${++id}`,
      motivo,
      angulo,
      nToque: n,
      respondeu,
      diasAtras: dias - n * 3,
      valor: respondeu ? Math.round((TICKET[motivo] * (0.7 + rnd() * 0.6)) / 10) * 10 : 0,
    })
    if (respondeu) break
  }
}

const corpo = linhas
  .map((l) => `  { id: '${l.id}', motivo: '${l.motivo}', angulo: '${l.angulo}', nToque: ${l.nToque}, respondeu: ${l.respondeu}, diasAtras: ${l.diasAtras}, valor: ${l.valor} },`)
  .join('\n')

writeFileSync(
  'src/data/historico.ts',
  `import type { Motivo, Angulo } from '../types'

/**
 * GERADO por scripts/gerar-historico.mjs — não editar à mão.
 * Toques passados e JÁ RESOLVIDOS do Studio Lumi. É daqui que engine/curva.ts
 * estima P(resposta | nº do toque) e P(resposta | motivo × ângulo).
 * A inbox atual não serve pra isso: lá tudo está travado por definição.
 */
export interface ToqueHistorico {
  id: string
  motivo: Motivo
  angulo: Angulo
  nToque: number
  respondeu: boolean
  diasAtras: number
  valor: number
}

export const HISTORICO: ToqueHistorico[] = [
${corpo}
]
`,
)
console.log(`historico.ts — ${linhas.length} toques, ${linhas.filter((l) => l.respondeu).length} respondidos`)
