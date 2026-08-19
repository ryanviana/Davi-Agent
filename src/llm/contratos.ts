import type { Angulo, Conversa, Motivo } from '../types'
import type { Decisao } from '../engine/decidir'
import type { Schema } from './client'

/**
 * CONTRATO CONGELADO entre os módulos de LLM e o motor.
 * Ninguém edita este arquivo durante o fan-out — só implementa contra ele.
 *
 * Regra dura do strict da OpenAI, válida pra TODO schema daqui:
 *   additionalProperties: false · todo campo em `required` · opcional vira união
 *   com null (["string","null"]). Errar isso é 400 e a chamada morre.
 */

/* ------------------------------------------------------------------ tom */

export interface PerfilTom {
  /** emojis que a dona realmente usa, em ordem de frequência */
  emojis: string[]
  /** como ela abre uma mensagem: "Oii", "Bom dia Aline!" */
  saudacoes: string[]
  /** apelidos/fechos recorrentes */
  assinatura: string
  /** 0 = puro papo de amiga · 1 = formal */
  formalidade: number
  /** 3 frases reais dela, usadas como few-shot na redação */
  exemplos: string[]
  /** uma frase descrevendo o jeito dela, pro system prompt */
  resumo: string
}

/* -------------------------------------------------------------- redação */

export interface Redacao {
  texto: string
  /** o que ancora a mensagem: "4 sessões já pagas", "parcela em 4x" */
  ancora_de_valor: string
  /** true se o texto cita algum valor em R$ */
  usa_preco: boolean
}

export interface PedidoRedacao {
  conversa: Conversa
  decisao: Decisao
  tom: PerfilTom | null
  /**
   * Qual envio desta conversa. 'primeiro' e a reativacao; 'upsell' e a segunda
   * mensagem, depois que a cliente ja aceitou — texto diferente, nao repeticao.
   */
  momento?: 'primeiro' | 'upsell'
}

/* --------------------------------------------------------------- guarda */

export type MotivoReprova =
  | 'preco_inventado'
  | 'muito_longa'
  | 'dia_invalido'
  | 'vazia'
  | 'prometeu_demais'

export interface Veredito {
  ok: boolean
  motivos: MotivoReprova[]
  /** explicação curta, reinjetada no prompt no retry */
  detalhe: string
}

/* ------------------------------------------------------------- intenção */

export type AcaoDono = 'parar' | 'retomar' | 'status' | 'conversa'

export interface Intencao {
  acao: AcaoDono
  /** nome ou id do cliente citado, null se não citou ninguém */
  alvo: string | null
  /** resposta do Davi ao dono, no tom dele */
  resposta: string
}

/* ------------------------------------------------------- extração / eval */

export interface Extracao {
  itens: { descricao: string; valor: number | null }[]
  valorTotal: number | null
  estado: 'novo' | 'orcado' | 'acordado' | 'travado' | 'recuperado' | 'perdido' | 'pausado'
  motivo: Motivo | null
  temperatura: 'quente' | 'morno' | 'frio'
  confianca: number
}

/* -------------------------------------------------------- helper comum */

/** Monta um schema strict já com as travas obrigatórias aplicadas. */
export function strict(name: string, props: Record<string, unknown>): Schema {
  return {
    name,
    schema: {
      type: 'object',
      additionalProperties: false,
      required: Object.keys(props),
      properties: props,
    },
  }
}

export const ANGULOS_VALIDOS: Angulo[] = [
  'lembrete_simples', 'facilita_pagamento', 'retomada_pacote',
  'prova_social', 'escassez', 'desconto',
]
