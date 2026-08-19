import type { Angulo, Motivo } from '../types'
import { HISTORICO } from '../data/historico'

/**
 * Curva de conversão estimada a partir do histórico resolvido.
 * TS puro, determinístico, zero LLM — roda em qualquer modo, inclusive `roteiro`.
 *
 * Nenhuma probabilidade está escrita aqui. Tudo sai de contagem sobre
 * data/historico.ts, com suavização de Laplace pra taxa com n pequeno não
 * explodir (um 1-de-1 viraria 100% sem isso).
 */

const ALFA = 1
const BETA = 4

export interface Taxa {
  p: number
  n: number
  respostas: number
}

const taxa = (linhas: { respondeu: boolean }[]): Taxa => ({
  n: linhas.length,
  respostas: linhas.filter((l) => l.respondeu).length,
  p: (linhas.filter((l) => l.respondeu).length + ALFA) / (linhas.length + ALFA + BETA),
})

const memo = <T>(f: () => T) => { let v: T | undefined; return () => (v ??= f()) }

/** P(resposta | nº do toque). É daqui que sai a regra dura de parar no 3º. */
export const porToque = memo(() => {
  const m = new Map<number, Taxa>()
  let teto = 1
  for (const n of [1, 2, 3, 4, 5]) {
    const t = taxa(HISTORICO.filter((h) => h.nToque === n))
    // Insistir nunca converte MAIS que o toque anterior. Sem esse teto, um balde
    // vazio herda so o prior de Laplace e o 5o toque apareceria melhor que o 3o.
    const p = Math.min(t.p, teto)
    teto = p
    m.set(n, { ...t, p })
  }
  return m
})

/** Taxa media do historico — normaliza o peso do angulo em decidir.ts. */
export const mediaGlobal = memo(() => taxa(HISTORICO).p)

/** P(resposta | motivo × ângulo). É daqui que sai a escolha de ângulo. */
export const porMotivoAngulo = memo(() => {
  const m = new Map<string, Taxa>()
  for (const h of HISTORICO) {
    const k = `${h.motivo}|${h.angulo}`
    if (!m.has(k)) m.set(k, taxa(HISTORICO.filter((x) => x.motivo === h.motivo && x.angulo === h.angulo)))
  }
  return m
})

export const taxaToque = (n: number): Taxa =>
  porToque().get(Math.min(5, Math.max(1, n))) ?? { p: 0.02, n: 0, respostas: 0 }

export const taxaAngulo = (motivo: Motivo, angulo: Angulo): Taxa =>
  porMotivoAngulo().get(`${motivo}|${angulo}`) ?? { p: 0.1, n: 0, respostas: 0 }

const ANGULOS: Angulo[] = [
  'lembrete_simples', 'facilita_pagamento', 'retomada_pacote',
  'prova_social', 'escassez', 'desconto',
]

/** Melhor ângulo para o motivo, e o vice — o vice vira a comparação da justificativa. */
export function melhorAngulo(motivo: Motivo): { angulo: Angulo; taxa: Taxa; vice: Angulo; taxaVice: Taxa } {
  const ranking = ANGULOS
    .map((a) => ({ angulo: a, taxa: taxaAngulo(motivo, a) }))
    .sort((x, y) => y.taxa.p - x.taxa.p)
  return {
    angulo: ranking[0].angulo,
    taxa: ranking[0].taxa,
    vice: ranking[1].angulo,
    taxaVice: ranking[1].taxa,
  }
}

export const pct = (p: number) => `${Math.round(p * 100)}%`

/** Tabela legível — `__davi.curva()` no console. */
export function tabela() {
  return {
    porToque: [...porToque()].map(([n, t]) => ({ toque: n, conversao: pct(t.p), n: t.n })),
    porMotivoAngulo: [...porMotivoAngulo()]
      .map(([k, t]) => ({ par: k, conversao: pct(t.p), n: t.n }))
      .sort((a, b) => parseInt(b.conversao) - parseInt(a.conversao)),
    amostra: HISTORICO.length,
  }
}
