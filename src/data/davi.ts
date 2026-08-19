import type { Conversa } from '../types'

/** Conversa herói da demo: pacote parado + reativação + upsell. */
export const FERNANDA: Conversa = {
  id: 'fernanda',
  nome: 'Fernanda Klein',
  iniciais: 'FK',
  cor: '#e8bfd0',
  naoLidas: 3,
  mensagens: [
    { id: 'fernanda-1', autor: 'cliente', texto: 'oi meninas! consigo remarcar a de terça? surgiu uma coisa aqui no trabalho', min: 178_000 },
    { id: 'fernanda-2', autor: 'loja', texto: 'Oi Fê! Claro, me fala um dia que eu vejo aqui 😊', min: 177_800 },
    { id: 'fernanda-3', autor: 'cliente', texto: 'vou ver minha agenda e te falo!', min: 177_600 },
    { id: 'fernanda-4', autor: 'cliente', texto: 'sumi né kkkk ainda tenho sessão sobrando?', min: 42 },
  ],
  compromisso: {
    itens: [
      { descricao: 'Pacote depilação a laser · 4 de 10 sessões restantes', valor: 420 },
      // O combo do upsell precisa estar nos dados: a guarda anti-preço-inventado
      // só libera valor que exista no compromisso ou no histórico da conversa.
      { descricao: 'Limpeza de pele no combo (avulsa 140)', valor: 90 },
      { descricao: 'Limpeza de pele avulsa', valor: 140 },
    ],
    valorTotal: 420,
    estado: 'travado',
    motivo: 'pacote_parado',
    temperatura: 'quente',
    confianca: 0.92,
    toques: [],
  },
}

/** Perfil do contato Davi na lista. */
export const DAVI = {
  id: 'davi',
  nome: 'Davi',
  iniciais: 'D',
}

export type EventoTipo =
  | 'davi'          // mensagem do Davi na DM do dono
  | 'card'         // cartão especial na DM (scan / proposta / venda)
  | 'envia'        // Davi manda mensagem numa conversa de cliente
  | 'responde'     // cliente responde
  | 'digitando'    // cliente digitando
  | 'venda'        // registra R$ + toast

export interface Evento {
  em: number            // ms depois do início da fase
  tipo: EventoTipo
  conversa?: string
  texto?: string
  porque?: string
  valor?: number
  card?: 'scan' | 'proposta'
  rotulo?: string
}

/** Roteiro após o dono autorizar o Davi. */
export const ROTEIRO: Evento[] = [
  { em: 400,   tipo: 'davi', texto: 'Beleza! Comecei. Vou te avisando aqui a cada venda que fechar.' },

  { em: 1500,  tipo: 'envia', conversa: 'fernanda',
    texto: 'Fernanda!! Tem sim, sobraram 4 sessões do seu laser, e elas não vencem 😊 Reservo pra vc essa semana?',
    porque: 'parou na 6ª de 10 · R$ 420 já pagos' },

  { em: 3200,  tipo: 'envia', conversa: 'renata',
    texto: 'Oi Renata! Vi que vc quis remarcar e a gente acabou não fechando o dia. Tenho terça 10h ou quinta 16h, algum serve?',
    porque: 'remarcação pendente há 9 dias' },

  { em: 5000,  tipo: 'digitando', conversa: 'fernanda' },
  { em: 7200,  tipo: 'responde', conversa: 'fernanda', texto: 'nossa nem lembrava mais! pode ser quinta de manhã' },

  { em: 8600,  tipo: 'envia', conversa: 'fernanda',
    texto: 'Fechado, quinta 9h ✓ E já que vc vem — o combo com limpeza de pele sai por +R$ 90 (normal é 140). Junto?',
    porque: 'quem faz laser aceita esse combo 4 em 10 vezes' },

  { em: 9800,  tipo: 'envia', conversa: 'bruna',
    texto: 'Oi Bruna! Você tinha falado do design com henna. Tenho quinta 15h aberto, quer que eu segure pra você?',
    porque: 'orçado há 5 dias, sem resposta' },

  { em: 11500, tipo: 'digitando', conversa: 'fernanda' },
  { em: 13000, tipo: 'responde', conversa: 'fernanda', texto: 'quero sim!' },
  { em: 13400, tipo: 'venda',  conversa: 'fernanda', valor: 510, rotulo: 'Fernanda remarcou + combo' },
  { em: 13900, tipo: 'davi', texto: 'Fernanda voltou! Remarcou as 4 sessões que sobraram e ainda pegou o combo de limpeza.' },
  { em: 14100, tipo: 'card', card: 'proposta' },

  { em: 15500, tipo: 'responde', conversa: 'renata', texto: 'terça 10h eh perfeito!' },
  { em: 15900, tipo: 'venda', conversa: 'renata', valor: 280, rotulo: 'Renata remarcou' },

  { em: 18000, tipo: 'responde', conversa: 'bruna', texto: 'ai que otimo, pode segurar sim obg!!' },
  { em: 18400, tipo: 'venda', conversa: 'bruna', valor: 70, rotulo: 'Bruna agendou' },
]
