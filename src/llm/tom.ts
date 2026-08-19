import { MODELOS, modo } from '../config'
import { CONVERSAS } from '../data/conversas'
import { FERNANDA } from '../data/davi'
import type { Conversa } from '../types'
import { chamar } from './client'
import type { PerfilTom } from './contratos'
import { strict } from './contratos'

/**
 * O Davi não pergunta o tom pra dona num onboarding — ele lê o que ela já escreveu.
 * Fonte única: as mensagens com `autor === 'loja'` do histórico parado.
 *
 * Com rede: uma chamada ao modelo. Sem rede (modo roteiro, timeout, 4xx): o mesmo
 * perfil sai por TS puro das mesmas mensagens. Os dois caminhos leem a mesma coisa.
 */

export interface Fala {
  texto: string
  /** nome da cliente daquela conversa — é o que deixa detectar apelido ("Ju" de "Juliana") */
  cliente: string
}

/* ------------------------------------------------------------- utilidades */

const EMOJI = /\p{Extended_Pictographic}\uFE0F?/gu
const ABERTURA = /^(oi+e?|ol[aá]|bom dia|boa(?: tarde| noite)?|e a[ií]|a+e+|opa)\b/i
/** vogal dobrada = alongamento afetivo ("Oii", "Aeee"); consoante dobrada é só ortografia */
const ALONGAMENTO = /\b\w*([aeiou])\1\w*\b/
/** gírias de WhatsApp. Sem "nao"/"ja": o histórico inteiro é digitado sem acento,
    isso é artefato do teclado dela, não escolha de estilo. */
const ABREVIACOES = ['vc', 'vcs', 'pra', 'pro', 'ta', 'tao', 'tb', 'tbm', 'pq', 'blz',
  'obg', 'hj', 'msg', 'qnt', 'mt', 'mto', 'vlw', 'bjs', 'bj', 'kk', 'kkk', 'neh', 'oq']
const ABREV_RE = ABREVIACOES.map((a) => new RegExp(`\\b${a}\\b`))

const semAcento = (s: string) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
const palavras = (s: string) => s.split(/\s+/).filter(Boolean)
const emojisDe = (s: string) => s.match(EMOJI) ?? []
const semEmoji = (s: string) => s.replace(EMOJI, '').replace(/\s+/g, ' ').trim()
const canonico = (s: string) => semAcento(s).replace(/\s+/g, ' ').trim()
const arredondar = (n: number) => Math.round(n * 100) / 100
const media = (ns: number[]) => (ns.length ? ns.reduce((a, b) => a + b, 0) / ns.length : 0)
const unicos = (ss: string[]) => [...new Set(ss)]

/** Agrupa por chave preservando os originais. Map + sort estável = saída determinística. */
function agrupar(pares: { chave: string; valor: string }[]): { chave: string; itens: string[] }[] {
  const m = new Map<string, string[]>()
  for (const p of pares) {
    const lista = m.get(p.chave)
    if (lista) lista.push(p.valor)
    else m.set(p.chave, [p.valor])
  }
  return [...m]
    .map(([chave, itens]) => ({ chave, itens }))
    .sort((a, b) => b.itens.length - a.itens.length)
}

export function falasDaLoja(conversas: Conversa[]): Fala[] {
  return conversas.flatMap((c) =>
    c.mensagens
      .filter((m) => m.autor === 'loja')
      .map((m) => ({ texto: m.texto.trim(), cliente: c.nome }))
      .filter((f) => f.texto.length > 0),
  )
}

/* ------------------------------------------------- extração determinística */

function emojisPreferidos(falas: Fala[]): string[] {
  return agrupar(falas.flatMap((f) => emojisDe(f.texto).map((e) => ({ chave: e, valor: e }))))
    .slice(0, 5)
    .map((g) => g.chave)
}

function saudacoesDe(falas: Fala[]): string[] {
  const achadas = falas.flatMap((f) => {
    const m = ABERTURA.exec(f.texto)
    if (!m) return []
    const fim = f.texto.search(/[!,.?]/)
    // "Bom dia Aline!" vale mais que "Bom dia" — a saudação dela carrega o nome.
    const bruta = fim > 0 && fim <= 24 ? f.texto.slice(0, fim + 1) : m[0]
    return [{ chave: semAcento(m[0]), valor: semEmoji(bruta) }]
  })
  return agrupar(achadas)
    .slice(0, 4)
    .map((g) => [...g.itens].sort((a, b) => a.length - b.length).at(0))
    .filter((s): s is string => Boolean(s))
}

function fechosDe(falas: Fala[]): string[] {
  const pedacos = falas.flatMap((f) =>
    semEmoji(f.texto)
      .split(/(?<=[,.!?])/)
      .map((p) => p.trim())
      // pedaço com número é preço/horário: muda toda hora, não é fecho dela
      .filter((p) => p.length > 0 && !/\d/.test(p) && palavras(p).length <= 3)
      .map((p) => ({ chave: semAcento(p).replace(/[,.!?]+$/, ''), valor: p.replace(/,$/, '') })),
  )
  return agrupar(pedacos)
    .filter((g) => g.itens.length >= 2 && g.chave.length >= 3)
    .slice(0, 3)
    .map((g) => g.itens.at(0))
    .filter((s): s is string => Boolean(s))
}

function apelidosDe(falas: Fala[]): string[] {
  const achados = falas.flatMap((f) => {
    const nomes = palavras(f.cliente).map(semAcento)
    return palavras(semEmoji(f.texto))
      .map((p) => p.replace(/[^\p{L}]/gu, ''))
      .filter((p) => p.length >= 2 && p.length <= 6 && /^\p{Lu}/u.test(p))
      // prefixo estrito do nome real: pega "Ju"/"Fê"/"Tati" e descarta o nome inteiro
      .filter((p) => nomes.some((n) => n !== semAcento(p) && n.startsWith(semAcento(p))))
  })
  return unicos(achados).slice(0, 4)
}

function formalidadeDe(falas: Fala[]): number {
  if (falas.length === 0) return 0.5
  const informal = media(
    falas.map((f) => {
      const t = semAcento(f.texto)
      const marcas = [
        emojisDe(f.texto).length > 0,
        ABREV_RE.some((r) => r.test(t)),
        f.texto.includes('!'),
        ALONGAMENTO.test(t),
      ]
      return marcas.filter(Boolean).length / marcas.length
    }),
  )
  // Os 4 sinais quase nunca disparam juntos numa frase de 8 palavras. Sem essa escala
  // até quem escreve puro papo de amiga ficaria empatado perto de 0.5.
  return arredondar(Math.min(1, Math.max(0, 1 - informal * 1.6)))
}

function expressividade(texto: string): number {
  const t = semAcento(texto)
  const n = palavras(texto).length
  return (
    emojisDe(texto).length * 2 +
    Math.min((texto.match(/!/g) ?? []).length, 2) +
    ABREV_RE.filter((r) => r.test(t)).length +
    (ALONGAMENTO.test(t) ? 1.5 : 0) +
    (n >= 6 && n <= 14 ? 0.5 : 0)
  )
}

function exemplosDe(falas: Fala[]): string[] {
  const ordenadas = [...falas].sort((a, b) => expressividade(b.texto) - expressividade(a.texto))
  const aberturas = new Set<string>()
  const fora: string[] = []
  for (const f of ordenadas) {
    // 3 exemplos que começam igual ensinam um truque só; variar a abertura ensina a voz
    const primeira = semAcento(palavras(f.texto).at(0) ?? '')
    if (aberturas.has(primeira)) continue
    aberturas.add(primeira)
    fora.push(f.texto)
    if (fora.length === 3) break
  }
  return fora
}

function resumoDe(falas: Fala[], emojis: string[], apelidos: string[]): string {
  const total = falas.length || 1
  const tamanho = Math.round(media(falas.map((f) => palavras(f.texto).length)))
  const comEmoji = falas.filter((f) => emojisDe(f.texto).length > 0).length / total
  const comPreco = falas.filter((f) => /\d/.test(f.texto)).length / total
  const partes = [`responde curto, ${tamanho} palavras por mensagem em média`]
  partes.push(
    comEmoji >= 0.3
      ? `emoji em ${Math.round(comEmoji * 100)}% das mensagens (${emojis.slice(0, 3).join(' ')})`
      : 'quase não usa emoji',
  )
  if (apelidos.length) partes.push(`chama a cliente pelo apelido (${apelidos.slice(0, 3).join(', ')})`)
  if (comPreco >= 0.35) partes.push('diz o preço na cara, sem rodeio e sem pedir desculpa')
  return `Dona de studio de estética: ${partes.join('; ')}.`
}

/** O perfil inteiro por TS puro. Nada aqui é chumbado — tudo sai das falas. */
function tomDeterministico(falas: Fala[]): PerfilTom {
  const emojis = emojisPreferidos(falas)
  const apelidos = apelidosDe(falas)
  const fechos = fechosDe(falas)
  return {
    emojis,
    saudacoes: saudacoesDe(falas),
    assinatura: [...fechos, ...emojis.slice(0, 2)].join(' · '),
    formalidade: formalidadeDe(falas),
    exemplos: exemplosDe(falas),
    resumo: resumoDe(falas, emojis, apelidos),
  }
}

/** Fallback do app: sai das mensagens semeadas, não de um objeto escrito à mão. */
export const TOM_PADRAO: PerfilTom = tomDeterministico(falasDaLoja([...CONVERSAS, FERNANDA]))

/* ------------------------------------------------------------------ modelo */

const ESQUEMA = strict('perfil_tom', {
  emojis: {
    type: 'array',
    items: { type: 'string' },
    description: 'emojis que ela realmente usa, do mais frequente pro menos',
  },
  saudacoes: {
    type: 'array',
    items: { type: 'string' },
    description: 'aberturas reais dela, com o nome quando ela usa: "Oii Tati!"',
  },
  assinatura: {
    type: 'string',
    description: 'fechos e apelidos recorrentes, separados por " · "',
  },
  formalidade: { type: 'number', description: '0 = papo de amiga, 1 = formal' },
  exemplos: {
    type: 'array',
    items: { type: 'string' },
    description: '3 mensagens copiadas LITERALMENTE da lista, sem editar',
  },
  resumo: { type: 'string', description: 'uma frase descrevendo o jeito dela de escrever' },
})

const SYSTEM = [
  'Você lê as mensagens que a dona de um studio de estética mandou no WhatsApp e descreve o jeito dela de escrever.',
  '',
  'Regras:',
  '- Descreva o que ESTÁ na lista. Não invente emoji, saudação nem frase que não aparece.',
  '- Os 3 exemplos são cópias literais de mensagens da lista, sem corrigir nada (nem acento, nem pontuação).',
  '- emojis e saudacoes vêm em ordem de frequência, do mais usado pro menos usado.',
  '- formalidade entre 0 e 1: 0 é papo de amiga, 1 é atendimento formal de empresa.',
  '- resumo é UMA frase em português do Brasil, escrita pra outro modelo imitar a voz dela.',
].join('\n')

function usuario(corpus: string[]): string {
  return [`Mensagens escritas pela dona (${corpus.length}):`, ...corpus.map((t, i) => `${i + 1}. ${t}`)].join('\n')
}

/* ------------------------------------------------------ saneamento da saída */

function listaDeTexto(v: unknown): string[] {
  if (!Array.isArray(v)) return []
  const itens: unknown[] = v
  return unicos(
    itens
      .filter((x): x is string => typeof x === 'string')
      .map((s) => s.trim())
      .filter(Boolean),
  )
}

const textoDe = (v: unknown, alt: string) => (typeof v === 'string' && v.trim() ? v.trim() : alt)

const numeroDe = (v: unknown, alt: number) =>
  typeof v === 'number' && Number.isFinite(v) ? Math.min(1, Math.max(0, v)) : alt

function normalizar(bruto: PerfilTom, base: PerfilTom, corpus: string[]): PerfilTom {
  const reais = new Set(corpus.map(canonico))
  // Exemplo inventado vira few-shot falso e contamina toda redação que vier depois:
  // só passa frase que a dona escreveu mesmo, palavra por palavra.
  const doModelo = listaDeTexto(bruto.exemplos).filter((e) => reais.has(canonico(e)))
  const exemplos = unicos([...doModelo, ...base.exemplos]).slice(0, 3)

  const emojis = listaDeTexto(bruto.emojis).filter((e) => emojisDe(e).length > 0).slice(0, 5)
  const saudacoes = listaDeTexto(bruto.saudacoes).slice(0, 4)

  return {
    emojis: emojis.length ? emojis : base.emojis,
    saudacoes: saudacoes.length ? saudacoes : base.saudacoes,
    assinatura: textoDe(bruto.assinatura, base.assinatura),
    formalidade: numeroDe(bruto.formalidade, base.formalidade),
    exemplos: exemplos.length ? exemplos : base.exemplos,
    resumo: textoDe(bruto.resumo, base.resumo),
  }
}

/* ---------------------------------------------------------------- entrada */

const cache = new Map<string, Promise<PerfilTom>>()

function impressao(falas: Fala[]): string {
  let h = 5381
  for (const f of falas) {
    for (let i = 0; i < f.texto.length; i++) h = ((h * 33) ^ f.texto.charCodeAt(i)) >>> 0
  }
  return `${falas.length}.${h.toString(36)}`
}

async function aprender(falas: Fala[], base: PerfilTom): Promise<PerfilTom> {
  const corpus = falas.map((f) => f.texto)
  const bruto = await chamar<PerfilTom>('tom', ESQUEMA, SYSTEM, usuario(corpus), MODELOS.tom)
  return bruto ? normalizar(bruto, base, corpus) : base
}

/**
 * Lê o histórico e devolve a voz da dona. Nunca lança e nunca deixa de responder:
 * sem modelo, o perfil vem das mesmas falas por TS puro.
 */
export async function aprenderTom(conversas: Conversa[]): Promise<PerfilTom> {
  const falas = falasDaLoja(conversas)
  if (falas.length === 0) return TOM_PADRAO

  // O modo entra na chave: apertar M no meio da demo troca roteiro para vivo, e aí o
  // tom precisa ser reaprendido de verdade em vez de sair do cache determinístico.
  const chave = `${modo()}.${impressao(falas)}`
  const guardado = cache.get(chave)
  if (guardado) return guardado

  const base = tomDeterministico(falas)
  const promessa = aprender(falas, base).catch(() => base)
  cache.set(chave, promessa)
  return promessa
}

/** Bloco pronto pra colar num system prompt — os exemplos são o few-shot. */
export function tomParaPrompt(t: PerfilTom): string {
  const linhas = ['VOZ DA DONA — escreva como ela escreve, não como um atendente educado.']
  if (t.resumo) linhas.push(`Jeito: ${t.resumo}`)
  linhas.push(`Formalidade: ${numeroDe(t.formalidade, 0.5).toFixed(2)} de 1.00 (0 = papo de amiga · 1 = formal)`)
  if (t.emojis.length) {
    linhas.push(`Emojis dela: ${t.emojis.slice(0, 4).join(' ')} — no máximo um por mensagem, e só quando cabe.`)
  }
  if (t.saudacoes.length) linhas.push(`Abre assim: ${t.saudacoes.map((s) => `"${s}"`).join(' · ')}`)
  if (t.assinatura) linhas.push(`Fechos e apelidos dela: ${t.assinatura}`)
  if (t.exemplos.length) {
    linhas.push('Frases que ela escreveu de verdade — copie o ritmo e o tamanho, nunca o conteúdo:')
    t.exemplos.slice(0, 3).forEach((e, i) => linhas.push(`  ${i + 1}. "${e}"`))
  }
  return linhas.join('\n')
}
