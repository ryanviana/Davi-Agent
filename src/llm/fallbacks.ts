import type { Angulo } from '../types'
import type { Evento } from '../data/davi'
import { ROTEIRO } from '../data/davi'

/**
 * A rede de segurança do palco.
 *
 * Toda função de llm/ recebe `null` do client quando o modelo falha — ou quando
 * o interruptor está em "roteiro". É daqui que sai o texto nesse caso, e o que
 * sai é EXATAMENTE o que a demo mostra hoje. Determinístico, sem rede, sem
 * estado: este módulo não tem direito de falhar.
 */

/** Usado quando um evento do roteiro não trouxe justificativa. */
const PORQUE_PADRAO = 'oportunidade parada na sua caixa'

/* ------------------------------------------------------------------ roteiro */

const eventos = (tipo: Evento['tipo'], conversaId: string): Evento[] =>
  ROTEIRO.filter((e) => e.tipo === tipo && e.conversa === conversaId && !!e.texto)

/** Índice seguro: nToque fora da faixa cai no evento existente mais próximo. */
function naFaixa(n: number, tamanho: number): number {
  if (!Number.isFinite(n)) return 0
  return Math.min(Math.max(Math.trunc(n), 0), tamanho - 1)
}

/**
 * Texto roteirizado que o Davi manda numa conversa de cliente.
 * A Fernanda tem dois envios (reativação e depois o upsell): `nToque` escolhe.
 * Retorna null pra conversa que não está no roteiro — aí quem chama usa
 * `redacaoGenerica`.
 */
export function textoFallback(
  conversaId: string,
  nToque = 0,
): { texto: string; porque: string } | null {
  const lista = eventos('envia', conversaId)
  if (lista.length === 0) return null
  const ev = lista[naFaixa(nToque, lista.length)]
  if (!ev?.texto) return null
  return { texto: ev.texto, porque: ev.porque ?? PORQUE_PADRAO }
}

/**
 * Resposta roteirizada do cliente. `nToque` segue a mesma regra do envio —
 * a Fernanda responde duas vezes (aceita o horário, depois aceita o combo).
 */
export function respostaCliente(conversaId: string, nToque = 0): string | null {
  const lista = eventos('responde', conversaId)
  if (lista.length === 0) return null
  return lista[naFaixa(nToque, lista.length)]?.texto ?? null
}

/** Venda roteirizada da conversa: alimenta o contador de R$ e o toast. */
export function vendaRoteirizada(conversaId: string): { valor: number; rotulo: string } | null {
  const ev = ROTEIRO.find(
    (e) => e.tipo === 'venda' && e.conversa === conversaId && typeof e.valor === 'number',
  )
  if (typeof ev?.valor !== 'number') return null
  return { valor: ev.valor, rotulo: ev.rotulo ?? 'Cliente fechou' }
}

/* ------------------------------------------------------- falas na DM do dono */

const PAROU_TUDO = 'Parei tudo. Não falo com mais ninguém até você mandar eu voltar 👍'
const RETOMOU_TUDO = 'Voltei pra fila 💪 Já tô mandando de novo e te aviso a cada venda que entra.'
const CONVERSA_SOLTA =
  'Tô aqui 👋 Me fala com quem eu paro ou volto a falar, ou pede o resumo do dia que eu te passo.'

/**
 * Falas gravadas do Davi na conversa com o dono. Chave desconhecida cai em
 * `nao_entendi` — é o que segura a demo quando a intenção volta null.
 */
const FALAS: Record<string, string> = {
  saudacao: 'Oi! Tô aqui 👋 Pode mandar.',
  comecou: 'Beleza! Comecei. Vou te avisando aqui a cada venda que fechar.',
  parou_cliente: 'Fechado, parei com ela. Não mando mais nada nessa conversa até você me liberar.',
  parou_tudo: PAROU_TUDO,
  retomou_cliente: 'Voltei com ela! Já entrou de novo na minha fila, te aviso quando fechar.',
  retomou_tudo: RETOMOU_TUDO,
  status:
    'Tô com a fila rodando 👊 Cada cliente que responde eu somo no seu recuperado aqui em cima — te chamo na hora que a próxima fechar.',
  sem_alvo: 'Me fala qual cliente que eu resolvo — pode ser só o primeiro nome.',
  ja_parado: 'Essa eu já tinha parado 😊 Se quiser que eu volte com ela, é só falar.',
  venda: 'Mais uma fechada! Já somei no seu recuperado de hoje 🎉',
  // Sem nome de cliente de propósito: intencao.ts só aceita uma fala com nome quando
  // a dona citou aquela cliente, e um nome do elenco aqui faria essa checagem passar
  // por engano.
  nao_entendi:
    'Essa eu não peguei 😅 Pode falar assim: "para com a fulana", "volta a falar com ela" ou "como tá indo?"',

  /* Chaves de `AcaoDono` (contratos.ts). intencao.ts chama falaDavi(acao) no caminho
     determinístico — que é o PADRÃO (modo roteiro). Sem estas entradas a ação caía
     em `nao_entendi` e o Davi respondia "não peguei" logo depois de ter parado de
     verdade. Todas sem nome: quando a dona cita alguém, intencao descarta a fala que
     não diz o nome dela e usa a frase local, que é a específica e correta. */
  parar: PAROU_TUDO,
  retomar: RETOMOU_TUDO,
  conversa: CONVERSA_SOLTA,
}

export function falaDavi(chave: string): string {
  return FALAS[chave] ?? FALAS.nao_entendi ?? 'Não entendi 😅 Me explica de outro jeito?'
}

/* --------------------------------------------------------- redação genérica */

function primeiroNome(nome: string): string {
  const p = nome.trim().split(/\s+/)[0] ?? ''
  return p ? p.charAt(0).toUpperCase() + p.slice(1) : ''
}

/** Âncora do motor pode vir vazia; cada ângulo tem a própria frase de reserva. */
const ANCORA_PADRAO: Record<Angulo, string> = {
  lembrete_simples: 'ficou parado no meio do caminho',
  facilita_pagamento: 'sei que o valor pesou na hora',
  retomada_pacote: 'tá tudo do jeito que você deixou',
  prova_social: 'todo mundo fala que valeu ter voltado',
  escassez: 'ficou uma coisa pendente aqui',
  desconto: 'vale pro que a gente já tinha conversado',
}

const abertura = (p: string) => (p ? `Oi ${p}!` : 'Oi!')
const chamado = (p: string) => (p ? `${p}!!` : 'Oii!!')

/**
 * Template determinístico, um por ângulo, pra conversa que não está no roteiro.
 * Nunca cita valor em R$: preço inventado é o que a guarda mais reprova, e aqui
 * não tem modelo pra reprovar depois.
 */
const MOLDES: Record<Angulo, (p: string, a: string) => string> = {
  lembrete_simples: (p, a) =>
    `${abertura(p)} Passando aqui pra não deixar isso esfriar 😊 ${a}. Quer que eu separe um horário pra você essa semana?`,
  facilita_pagamento: (p, a) =>
    `${abertura(p)} Lembrei de você aqui 💛 ${a}. Dá pra caber no seu mês sem apertar — quer que eu já deixe um horário reservado?`,
  retomada_pacote: (p, a) =>
    `${chamado(p)} Seu pacote continua aqui guardadinho e não vence 😊 ${a}. Bora terminar? Me fala o melhor dia que eu encaixo.`,
  prova_social: (p, a) =>
    `${abertura(p)} Essa semana teve bastante cliente voltando pra terminar o que tinha ficado pela metade 😊 ${a}. Quer que eu separe um horário pra você também?`,
  escassez: (p, a) =>
    `${abertura(p)} Minha agenda dessa semana tá fechando rápido. ${a} — consigo segurar um horário pra você, quer que eu reserve?`,
  desconto: (p, a) =>
    `${abertura(p)} Consegui uma condição especial pra quem fecha essa semana 💛 ${a}. Se topar, eu já deixo reservado pra você.`,
}

export function redacaoGenerica(nome: string, angulo: Angulo, ancora: string): string {
  const p = primeiroNome(nome)
  // Âncora vem do motor como frase solta ("4 sessões já pagas"); tira pontuação
  // de borda pra ela colar no molde sem virar "já pagas.." e entra sempre como
  // início de frase, então sobe a primeira letra.
  const limpa = ancora.trim().replace(/^[·\-—\s]+/, '').replace(/[.·\-—\s]+$/, '')
  // Âncora só com número ("420", "R$ 420") chega de quem passa o valorTotal cru: no
  // molde ela viraria um valor solto no meio da frase — exatamente o preço inventado
  // que este módulo promete nunca escrever. Cai na frase de reserva do ângulo.
  const util = limpa && !/^r?\$?[\s\d.,]+$/i.test(limpa) ? limpa : ''
  const molde = MOLDES[angulo] ?? MOLDES.lembrete_simples
  const bruta = util || ANCORA_PADRAO[angulo] || ANCORA_PADRAO.lembrete_simples
  return molde(p, bruta.charAt(0).toUpperCase() + bruta.slice(1))
}
