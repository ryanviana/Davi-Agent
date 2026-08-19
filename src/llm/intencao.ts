import type { Conversa } from '../types'
import type { AcaoDono, Intencao } from './contratos'
import { strict } from './contratos'
import { chamar } from './client'
import { MODELOS } from '../config'
import * as fallbacks from './fallbacks'

/**
 * A dona escreve em português na DM do Davi — "para com a Bruna", "como tá indo?",
 * "pode voltar a falar com a Fernanda" — e isso vira ação no motor.
 *
 * Duas portas: `classificar` (LLM com queda pra palavra-chave) e `casarNome`
 * (TS puro, sem rede, usado também pelo fallback e pelo palpite do prompt).
 */

/* ------------------------------------------------------------ normalização */

function semAcento(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
}

/** Palavras que a dona usa o tempo todo e que colidem com nome de cliente:
 *  "ta" casaria Tatiane, "na" casaria Natalia, "de" casaria Debora. */
const RUIDO = new Set([
  'ta', 'tas', 'to', 'eh', 'ja', 'so', 'ai', 'ah', 'ok', 'oi', 'ola',
  'vc', 'voce', 'pq', 'pra', 'pro', 'por', 'que', 'se', 'de', 'do', 'da',
  'no', 'na', 'em', 'um', 'uma', 'os', 'as', 'me', 'te', 'ce', 'ne', 'nao', 'sim',
  'com', 'sem', 'mas', 'mais', 'menos', 'como', 'quanto', 'quantos', 'quantas',
  'hoje', 'agora', 'tudo', 'nada', 'todo', 'toda', 'todos', 'todas', 'ela', 'ele',
  'elas', 'eles', 'isso', 'esse', 'essa', 'aqui', 'ali', 'la', 'bem', 'bom', 'boa',
  'fala', 'falar', 'manda', 'mandar', 'para', 'pare', 'parar', 'pausa', 'pausar', 'chega',
  'volta', 'voltar', 'retoma', 'retomar', 'continua', 'continuar', 'segue',
  'deixa', 'deixar', 'pode', 'podia', 'quero', 'queria', 'status', 'andamento',
  'resumo', 'indo', 'vai', 'foi', 'ver', 'vamos', 'obrigada', 'valeu', 'gente',
  'cliente', 'clientes', 'mensagem', 'mensagens', 'venda', 'vendas', 'reais',
])

function pedacos(texto: string): string[] {
  return semAcento(texto)
    .replace(/[^a-z0-9\s]+/g, ' ')
    .split(/\s+/)
    .filter((p) => p.length >= 2 && !RUIDO.has(p) && !/^\d+$/.test(p))
}

/** Damerau-Levenshtein podado. Troca de letras vizinhas custa 1, não 2 — é o
 *  erro de digitação mais comum e a demo é digitada ao vivo ("fernnada"). */
function distancia(a: string, b: string): number {
  if (Math.abs(a.length - b.length) > 1) return 2
  let anterior: number[] = []
  let atual: number[] = Array.from({ length: b.length + 1 }, (_, i) => i)
  for (let i = 1; i <= a.length; i++) {
    const proxima: number[] = [i]
    for (let j = 1; j <= b.length; j++) {
      const custo = a[i - 1] === b[j - 1] ? 0 : 1
      let v = Math.min(atual[j] + 1, proxima[j - 1] + 1, atual[j - 1] + custo)
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
        v = Math.min(v, anterior[j - 2] + 1)
      }
      proxima[j] = v
    }
    anterior = atual
    atual = proxima
  }
  return atual[b.length]
}

/* --------------------------------------------------------- casamento de nome */

/**
 * Casa o texto contra as conversas pelo primeiro nome (e pelo id), sem acento e
 * sem case. "bruna" casa Bruna Sampaio; "fe" e "fernanda" casam Fernanda Klein.
 * Devolve o ID da conversa. Sobrenome só casa por igualdade exata — prefixo em
 * sobrenome faz "pra" virar "Prado".
 */
export function casarNome(texto: string, conversas: Conversa[]): string | null {
  if (!texto) return null
  const tokens = pedacos(texto)
  if (!tokens.length) return null

  let melhorId: string | null = null
  let melhorNota = 0
  let melhorTamanho = 0

  for (const c of conversas) {
    const partes = semAcento(c.nome).split(/\s+/).filter(Boolean)
    const primeiro = partes[0] ?? ''
    const id = semAcento(c.id)
    const sobrenomes = partes.slice(1)

    for (const t of tokens) {
      let nota = 0
      if (t === primeiro || t === id) nota = 4
      else if (primeiro.startsWith(t) || id.startsWith(t)) nota = 3
      else if (t.length >= 5 && distancia(t, primeiro) <= 1) nota = 2
      else if (sobrenomes.includes(t) && t.length >= 4) nota = 1

      if (nota > melhorNota || (nota === melhorNota && nota > 0 && t.length > melhorTamanho)) {
        melhorNota = nota
        melhorTamanho = t.length
        melhorId = c.id
      }
    }
  }

  return melhorId
}

/* ---------------------------------------------------------------- panorama */

const ABERTOS = ['novo', 'orcado', 'acordado', 'travado']

function emAberto(c: Conversa): boolean {
  return !!c.compromisso && ABERTOS.includes(c.compromisso.estado)
}

function dinheiro(v: number): string {
  return `R$ ${Math.round(v).toLocaleString('pt-BR')}`
}

function primeiroNome(c: Conversa): string {
  return c.nome.split(/\s+/)[0] ?? c.nome
}

/** Tudo que conta como "o nome dela" numa frase: id, primeiro nome, sobrenomes. */
function apelidos(c: Conversa): string[] {
  return [semAcento(c.id), ...semAcento(c.nome).split(/\s+/)].filter((n) => n.length >= 3)
}

function acharConversa(id: string | null, conversas: Conversa[]): Conversa | null {
  if (!id) return null
  return conversas.find((c) => c.id === id) ?? null
}

/* ------------------------------------------------------------------- fala */

const ESTADO_FEMININO: Record<string, string> = {
  novo: 'nova por aqui',
  orcado: 'com orçamento aberto',
  acordado: 'com acordo fechado',
  travado: 'travada',
  recuperado: 'recuperada',
  perdido: 'perdida',
  pausado: 'pausada',
}

/** Frase determinística do Davi — é o que aparece na tela no modo roteiro. */
function fraseLocal(acao: AcaoDono, alvo: Conversa | null, conversas: Conversa[]): string {
  const nome = alvo ? primeiroNome(alvo) : null

  if (acao === 'parar') {
    return nome
      ? `Fechado, parei com a ${nome}. Não mando mais nada pra ela até você me liberar.`
      : 'Fechado, parei tudo. Não falo com ninguém até você me liberar de novo.'
  }

  if (acao === 'retomar') {
    return nome
      ? `Voltei a falar com a ${nome} 💛 Te aviso assim que ela responder.`
      : 'Voltei com todo mundo. Te aviso na primeira resposta que chegar.'
  }

  if (acao === 'status') {
    if (alvo && alvo.compromisso) {
      const k = alvo.compromisso
      const estado = ESTADO_FEMININO[k.estado] ?? k.estado
      const toques = k.toques.length === 0
        ? 'ainda não toquei nela'
        : `${k.toques.length} toque${k.toques.length > 1 ? 's' : ''} até agora`
      return `A ${nome} tá ${estado}: ${dinheiro(k.valorTotal ?? 0)} parados e ${toques}.`
    }
    if (alvo) return `A ${nome} não tem nada em aberto agora — nada parado com ela.`

    const abertos = conversas.filter(emAberto)
    const total = abertos.reduce((s, c) => s + (c.compromisso?.valorTotal ?? 0), 0)
    return `Tenho ${abertos.length} cliente${abertos.length === 1 ? '' : 's'} em aberto e ${dinheiro(total)} parados. Tô indo pelas mais quentes primeiro.`
  }

  return 'Tô aqui, ó. Me fala com quem eu paro ou volto a falar, ou pede o resumo do dia que eu te passo.'
}

/* falaDavi() mora no módulo de fallbacks, escrito em paralelo por outro agente:
   assinatura e nome podem mudar até a integração. Por isso lemos pelo namespace
   e chamamos por adaptador — mudança lá não pode quebrar a compilação aqui, e
   este caminho é o PADRÃO (modo roteiro), então também não pode lançar. */
type Voz = (...args: unknown[]) => unknown
const voz = (fallbacks as unknown as { falaDavi?: Voz }).falaDavi

function comVoz(acao: AcaoDono, alvo: Conversa | null, conversas: Conversa[]): string {
  const local = fraseLocal(acao, alvo, conversas)
  let bruta: unknown = null
  try {
    if (typeof voz === 'function') bruta = voz(acao, alvo ? primeiroNome(alvo) : null, local)
  } catch {
    bruta = null
  }
  if (typeof bruta !== 'string') return local
  const frase = bruta.trim()
  if (!frase || frase.length > 200) return local
  // se a dona citou alguém, a confirmação só serve se disser o nome dela
  if (alvo && !apelidos(alvo).some((n) => semAcento(frase).includes(n))) return local
  return frase
}

/* --------------------------------------------------------- palavra-chave */

const PARAR = [
  /^\s*(par[ae]|parar|pausa|pausar|chega|silencio)\b/,
  /\b(par[ae]|parar)\s+(com|de|tudo)\b/,
  /\b(pausa|pausar|suspende|suspender|cancela|cancelar|congela)\b/,
  /\bnao\s+(fala|falar|manda|mandar|responde|responder|mexe)\b/,
  /\b(deixa|deixe)\s+(a|o|ela|ele|quieta|quieto|pra|de)\b/,
  /\b(esquece|esquecer|para\s+de\s+insistir)\b/,
]

const RETOMAR = [
  /\b(volta|voltar|voltou|retoma|retomar|reativa|reativar|libera|liberar|solta|desbloqueia)\b/,
  /\b(pode|podes)\s+(falar|voltar|mandar|seguir|continuar|retomar)\b/,
  /\b(continua|continuar|segue|seguir|toca|tocar)\b/,
  /\bde\s+novo\b/,
]

const STATUS = [
  /\b(como|quanto|quantos|quantas|status|andamento|resumo|relatorio|novidade|novidades)\b/,
  /\b(ta\s+indo|tudo\s+bem\s+por\s+ai|fechou|vendeu|rolando|parado|parados)\b/,
]

function porPalavraChave(texto: string): AcaoDono {
  const t = semAcento(texto)
  if (!t) return 'conversa'
  if (PARAR.some((r) => r.test(t))) return 'parar'
  if (RETOMAR.some((r) => r.test(t))) return 'retomar'
  if (STATUS.some((r) => r.test(t))) return 'status'
  return 'conversa'
}

function deterministica(texto: string, conversas: Conversa[]): Intencao {
  const acao = porPalavraChave(texto)
  const id = casarNome(texto, conversas)
  const alvo = acharConversa(id, conversas)
  return { acao, alvo: alvo ? alvo.id : null, resposta: comVoz(acao, alvo, conversas) }
}

/* --------------------------------------------------------------- LLM */

const ACOES: AcaoDono[] = ['parar', 'retomar', 'status', 'conversa']

const SCHEMA = strict('intencao_do_dono', {
  acao: {
    type: 'string',
    enum: ACOES,
    description:
      'parar = ela quer que você pare de falar com alguém; retomar = liberou pra voltar; status = quer saber como está indo; conversa = qualquer outra coisa',
  },
  alvo: {
    type: ['string', 'null'],
    description: 'o id EXATO da conversa citada, copiado da lista. null se ela não citou ninguém',
  },
  resposta: {
    type: 'string',
    description: 'o que o Davi responde pra dona no WhatsApp, até 200 caracteres',
  },
})

const SISTEMA = `Você é o Davi, um vendedor de IA que mora como contato fixado no WhatsApp do Studio Lumi, um studio de estética.
A dona te manda mensagem direta em português coloquial e você traduz isso em UMA ação:

parar    — ela quer que você pare de falar com uma cliente (ou com todo mundo)
retomar  — ela te liberou pra voltar a falar
status   — ela quer saber como está indo: quanto está parado, quem respondeu, quantos toques
conversa — qualquer outra coisa: pergunta, papo, dúvida

REGRAS
- alvo é sempre o id EXATO de uma conversa da lista, nunca o nome. Não citou ninguém, alvo é null.
- Na resposta você escreve o NOME da cliente como está na lista ("a Bruna"). Nunca o id,
  nunca "a conversa X", nunca em minúscula.
- Nunca invente cliente, valor ou número. Se ela pedir status, use os números do RESUMO REAL,
  exatamente como estão lá — não some nada de cabeça.
- resposta é o que você manda de volta pra ela: no máximo 200 caracteres, 1 ou 2 frases,
  tom de colega, calorosa, confirmando o que você acabou de fazer. Português do Brasil.
- Sem markdown, sem bullet, sem título. No máximo um emoji, e só quando couber.

JEITO CERTO DE RESPONDER (os números saem sempre do RESUMO REAL, nunca destes exemplos)
"para com a Bruna" → "Fechado, parei com a Bruna. Não mando mais nada pra ela até você liberar."
"como tá indo?" → "Tenho 12 clientes em aberto e R$ 4.300 parados. Tô indo pelas mais quentes primeiro."
"pode voltar a falar com a Fernanda" → "Voltei a falar com a Fernanda 💛 Te aviso quando ela responder."`

function contexto(texto: string, conversas: Conversa[]): string {
  const linhas = conversas.slice(0, 40).map((c) => {
    const k = c.compromisso
    const dados = k
      ? `${k.estado} · ${dinheiro(k.valorTotal ?? 0)} parados · ${k.toques.length} toque(s)`
      : 'sem compromisso aberto'
    return `${c.id} · ${c.nome} · ${dados}`
  })

  const abertos = conversas.filter(emAberto)
  const total = abertos.reduce((soma, c) => soma + (c.compromisso?.valorTotal ?? 0), 0)

  const palpite = casarNome(texto, conversas)
  const dica = palpite ? `\nCandidato por semelhança de nome (confira, pode estar errado): ${palpite}` : ''

  return [
    `CONVERSAS DISPONÍVEIS (id · nome · situação):\n${linhas.join('\n')}${dica}`,
    `RESUMO REAL AGORA: ${abertos.length} clientes em aberto · ${dinheiro(total)} parados`,
    `MENSAGEM DA DONA:\n"${texto}"`,
  ].join('\n\n')
}

function limpar(bruta: Intencao, texto: string, conversas: Conversa[]): Intencao {
  const acao: AcaoDono = ACOES.includes(bruta.acao) ? bruta.acao : porPalavraChave(texto)

  let alvo: Conversa | null = null
  if (typeof bruta.alvo === 'string' && bruta.alvo.trim()) {
    const cru = semAcento(bruta.alvo)
    alvo = conversas.find((c) => semAcento(c.id) === cru) ?? null
    if (!alvo) alvo = acharConversa(casarNome(bruta.alvo, conversas), conversas)
  }
  // o modelo às vezes acerta a ação e esquece o alvo: o casamento por nome cobre
  if (!alvo && acao !== 'conversa') {
    alvo = acharConversa(casarNome(texto, conversas), conversas)
  }

  const dita = typeof bruta.resposta === 'string' ? bruta.resposta.trim() : ''
  const resposta = dita && dita.length <= 200 ? dita : comVoz(acao, alvo, conversas)

  return { acao, alvo: alvo ? alvo.id : null, resposta }
}

/**
 * Classifica a mensagem da dona. Uma chamada ao modelo; sem rede (modo roteiro)
 * ou em qualquer falha, cai na classificação por palavra-chave. Nunca lança.
 */
export async function classificar(texto: string, conversas: Conversa[]): Promise<Intencao> {
  const entrada = typeof texto === 'string' ? texto.trim() : ''
  if (!entrada) return deterministica('', conversas)

  try {
    const bruta = await chamar<Intencao>(
      'intencao',
      SCHEMA,
      SISTEMA,
      contexto(entrada, conversas),
      MODELOS.intencao,
    )
    if (bruta) return limpar(bruta, entrada, conversas)
  } catch {
    // chamar() já promete não lançar; o catch é só pra garantir a promessa daqui
  }

  return deterministica(entrada, conversas)
}
