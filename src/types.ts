export type Estado =
  | 'novo' | 'orcado' | 'acordado' | 'travado'
  | 'recuperado' | 'perdido' | 'pausado'

export type Motivo =
  | 'preco' | 'terceiro' | 'sumico_pos_acordo'
  | 'sem_grana' | 'pacote_parado' | 'outro'

export type Autor = 'cliente' | 'loja' | 'davi'

export type Angulo =
  | 'lembrete_simples' | 'facilita_pagamento' | 'retomada_pacote'
  | 'prova_social' | 'escassez' | 'desconto'


export interface Mensagem {
  id: string
  autor: Autor
  texto: string
  /** minutos atrás de AGORA (número positivo = passado) */
  min: number
  /** duração em segundos, quando a mensagem é um áudio */
  audio?: number
  /** justificativa do Davi, mostrada em cinza sob o balão */
  porque?: string
}

export interface Toque {
  min: number
  angulo: string
  respondeu: boolean
}

export interface Compromisso {
  itens: { descricao: string; valor?: number }[]
  valorTotal?: number
  estado: Estado
  motivo?: Motivo
  temperatura: 'quente' | 'morno' | 'frio'
  confianca: number
  toques: Toque[]
}

export interface Conversa {
  id: string
  nome: string
  iniciais: string
  cor: string
  mensagens: Mensagem[]
  naoLidas: number
  compromisso?: Compromisso
}
