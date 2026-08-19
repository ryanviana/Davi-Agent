import type { Angulo, Conversa, Motivo } from '../types'
import { mediaGlobal, melhorAngulo, pct, taxaAngulo, taxaToque } from './curva'

/**
 * O motor. TS puro, determinístico, zero LLM.
 *
 * Fronteira do projeto, e a resposta de Q&A: **o motor decide, o LLM só escreve.**
 * Nada aqui chama modelo. Nada em llm/ decide quem tocar.
 */

export type Acao = 'tocar' | 'esperar' | 'parar'

export interface Decisao {
  conversaId: string
  nome: string
  acao: Acao
  angulo: Angulo | null
  /** justificativa auditável, com número real da curva — vai pro `porque` do balão */
  porque: string
  /** ganho esperado em R$ = P(resposta) × valor travado */
  esperado: number
  prioridade: number
  nToque: number
}

/** Teto de toques antes da pausa longa. Regra dura, não estatística. */
export const MAX_TOQUES = 3
export const PAUSA_DIAS = 30

/** Espera mínima entre toques, por motivo — quem foi falar com o marido precisa de tempo. */
const CARENCIA_HORAS: Record<Motivo, number> = {
  terceiro: 48,
  preco: 72,
  sem_grana: 168,
  sumico_pos_acordo: 24,
  pacote_parado: 24,
  outro: 48,
}

export function decidirUma(c: Conversa): Decisao | null {
  const k = c.compromisso
  if (!k) return null
  if (k.estado === 'recuperado' || k.estado === 'perdido' || k.estado === 'pausado') return null

  const motivo: Motivo = k.motivo ?? 'outro'
  const nToque = k.toques.length
  const proximo = nToque + 1
  const valor = k.valorTotal ?? 0
  const base = {
    conversaId: c.id,
    nome: c.nome,
    nToque,
  }

  // 1. Regra dura: 3 toques sem resposta e a gente para. Insistir queima o cliente.
  if (nToque >= MAX_TOQUES && !k.toques.some((t) => t.respondeu)) {
    const t = taxaToque(proximo)
    return {
      ...base,
      acao: 'parar',
      angulo: null,
      esperado: 0,
      prioridade: 0,
      porque: `${MAX_TOQUES} toques sem resposta · ${proximo}º converte ${pct(t.p)} (n=${t.n}) — pausado por ${PAUSA_DIAS} dias`,
    }
  }

  const { angulo, taxa, vice, taxaVice } = melhorAngulo(motivo)
  const tToque = taxaToque(proximo)

  // 2. Carência: tocou agora há pouco, esperar rende mais que insistir.
  const ultimo = k.toques.length ? Math.min(...k.toques.map((t) => t.min)) : Infinity
  const carencia = CARENCIA_HORAS[motivo] * 60
  if (ultimo < carencia) {
    return {
      ...base,
      acao: 'esperar',
      angulo,
      esperado: 0,
      prioridade: 0,
      porque: `último toque há ${Math.round(ultimo / 60)}h · travamento por '${motivo}' pede ${CARENCIA_HORAS[motivo]}h de respiro`,
    }
  }

  // 3. Tocar. P(resposta) = queda por nº de toque, reponderada pela força do
  //    ângulo em relação à média do histórico. Teto de 0.8: nenhuma mensagem
  //    de WhatsApp converte mais que isso, e prometer mais infla o R$ esperado.
  const p = Math.min(0.8, tToque.p * (taxa.p / mediaGlobal()))
  const esperado = p * valor
  const jaTentado = k.toques.map((t) => t.angulo as Angulo)
  const escolhido = jaTentado.includes(angulo) ? vice : angulo
  const tEscolhido = taxaAngulo(motivo, escolhido)

  const porque = jaTentado.includes(angulo)
    ? `'${angulo}' já foi tentado aqui · ${escolhido} converte ${pct(tEscolhido.p)} (n=${tEscolhido.n}) em '${motivo}'`
    : `${proximo}º toque converte ${pct(tToque.p)} (n=${tToque.n}) · ângulo ${escolhido} rende ${pct(taxa.p)} (n=${taxa.n}) em '${motivo}', vs ${pct(taxaVice.p)} do ${vice}`

  return {
    ...base,
    acao: 'tocar',
    angulo: escolhido,
    esperado,
    prioridade: esperado,
    porque,
  }
}

/** Fila completa, ordenada por R$ esperado. Inclui quem NÃO será tocado e por quê. */
export function decidir(conversas: Conversa[]): Decisao[] {
  return conversas
    .map(decidirUma)
    .filter((d): d is Decisao => d !== null)
    .sort((a, b) => b.prioridade - a.prioridade)
}

export const fila = (conversas: Conversa[]) => decidir(conversas).filter((d) => d.acao === 'tocar')
