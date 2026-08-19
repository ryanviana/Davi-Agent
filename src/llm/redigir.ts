import type { Angulo, Conversa, Mensagem } from '../types'
import { MODELOS } from '../config'
import { chamar, emLote } from './client'
import type { PedidoRedacao, Redacao } from './contratos'
import { strict } from './contratos'
import { tomParaPrompt } from './tom'
import { textoFallback } from './fallbacks'

/**
 * Redação. Pega uma Decisao pronta do motor e escreve a mensagem no tom da dona.
 *
 * Este módulo NÃO decide nada: quem toca, quando toca e com qual ângulo já veio
 * resolvido em engine/decidir.ts. Aqui só se escolhe palavra. Essa fronteira é o
 * argumento técnico do projeto — por isso nenhuma heurística de venda mora aqui.
 */

const LIMITE = 320
/** histórico longo não melhora a redação e custa token na hora do pré-aquecimento */
const MAX_HISTORICO = 14

const ESQUEMA = strict('redacao', {
  texto: {
    type: 'string',
    description: 'A mensagem pronta pra colar no WhatsApp. Máx 320 caracteres, 1 a 3 frases, termina com pergunta.',
  },
  ancora_de_valor: {
    type: 'string',
    description: 'Em poucas palavras, o que segura a mensagem em pé: "4 sessões já pagas", "parcela em 4x".',
  },
  usa_preco: {
    type: 'boolean',
    description: 'true só se o texto citar algum valor em R$.',
  },
})

/** Cada ângulo do motor em uma linha — é isso que muda a mensagem, não o resto do prompt. */
const ANGULO_LINHA: Record<Angulo, string> = {
  lembrete_simples:
    'retoma leve, sem pressão nenhuma. Só lembra o que ficou em aberto e devolve a bola pra ela.',
  facilita_pagamento:
    'o preço não muda, a forma de pagar sim. Abre parcelamento ou pix pra tirar o atrito do valor.',
  retomada_pacote:
    'a cliente JÁ PAGOU e tem sessão sobrando. O dinheiro é dela e está parado — você está devolvendo o que é dela, não vendendo nada.',
  prova_social:
    'outras clientes do mesmo perfil fecharam. Cita o padrão ("as meninas que fazem laser costumam..."), nunca um nome real de cliente.',
  escassez:
    'a agenda está enchendo e ainda dá pra segurar um horário específico. Escassez real de agenda, nunca pressão inventada.',
  desconto:
    'oferece uma condição melhor, com piso. Desconta só o que já foi combinado no histórico e não abre mais que isso.',
}

const TOM_PADRAO = [
  'Caloroso e informal, jeito de quem já atendeu essa cliente pessoalmente.',
  'Frases curtas, "você"/"vc", no máximo um emoji.',
].join(' ')

/* ------------------------------------------------------------------ prompt */

export function promptRedacao(p: PedidoRedacao): { system: string; user: string } {
  const angulo: Angulo = p.decisao.angulo ?? 'lembrete_simples'
  const primeiro = primeiroNome(p.conversa.nome)

  const upsell = p.momento === 'upsell'
  const system = [
    'Você é o Davi, o vendedor que trabalha dentro do WhatsApp do Studio Lumi (estética, Pinheiros, São Paulo).',
    '',
    'QUEM ASSINA',
    'Quem manda a mensagem é a DONA do studio, e você escreve por ela: primeira pessoa, mesma voz, mesma intimidade de quem já atendeu essa cliente.',
    'Nunca se apresente, nunca diga que é assistente, IA ou robô, nunca escreva "em nome do Studio Lumi".',
    '',
    'COMO A DONA ESCREVE',
    blocoTom(p),
    '',
    'O QUE VOCÊ NÃO DECIDE',
    'Quem tocar, quando tocar e com qual ângulo já foi decidido por um motor determinístico. Você só redige.',
    `ÂNGULO OBRIGATÓRIO: ${angulo} — ${ANGULO_LINHA[angulo]}`,
    'Não misture outro ângulo. Se o ângulo é lembrete_simples, não ofereça desconto; se é retomada_pacote, não venda serviço novo.',
    ...(upsell
      ? [
          '',
          'ESTE É O SEGUNDO ENVIO — A CLIENTE JÁ DISSE SIM',
          'Ela acabou de aceitar o horário. NÃO reative de novo, NÃO repita o convite, NÃO agradeça e encerre.',
          'Confirme o agendamento em poucas palavras e ofereça UM serviço a mais que combine com o que ela já faz.',
          'A oferta tem que caber na mesma visita e ter um valor que esteja nos dados. Uma pergunta só no fim: junto ou não.',
        ]
      : []),
    '',
    'ANCORAGEM (a regra mais dura de todas)',
    'Você só pode citar um valor em R$ que apareça no histórico ou no compromisso, exatamente como aparece lá.',
    'Inventar preço, desconto, parcela ou prazo é o pior erro possível: é melhor mandar mensagem sem preço nenhum do que com preço errado.',
    'Sem valor confiável na mão, escreva sem citar preço.',
    'Também não invente dia, horário, promoção ou prazo que não esteja nos dados — ofereça que ela escolha.',
    'Nunca prometa resultado, garantia ou exclusividade.',
    '',
    'FORMATO',
    'Português do Brasil, WhatsApp de verdade: 1 a 3 frases, no máximo 320 caracteres no total.',
    'No máximo 2 emojis, e só se a dona usa emoji.',
    `Chame a cliente pelo primeiro nome (${primeiro}).`,
    'Termine SEMPRE com uma pergunta fácil de responder: sim/não ou escolha entre duas opções.',
    'Sem markdown, sem bullet, sem assinatura, sem "prezada", sem link, sem quebra de linha.',
  ].join('\n')

  const k = p.conversa.compromisso
  const valores = valoresPermitidos(p.conversa)

  const user = [
    `CLIENTE: ${p.conversa.nome}`,
    '',
    'HISTÓRICO (mais antigo primeiro):',
    historico(p.conversa),
    '',
    'COMPROMISSO PARADO:',
    k
      ? [
          `itens: ${k.itens.map((i) => (typeof i.valor === 'number' ? `${i.descricao} (${emReais(i.valor)})` : i.descricao)).join(' · ')}`,
          `valor total: ${typeof k.valorTotal === 'number' ? emReais(k.valorTotal) : 'não fechado'}`,
          `estado: ${k.estado}`,
          `motivo do travamento: ${k.motivo ?? 'não identificado'}`,
          `temperatura: ${k.temperatura}`,
          `toques já enviados: ${k.toques.length}`,
        ].join('\n')
      : 'sem compromisso registrado — escreva sem citar valor.',
    '',
    valores.length
      ? `VALORES QUE VOCÊ PODE CITAR (nenhum outro existe): ${valores.map(emReais).join(', ')}`
      : 'VALORES QUE VOCÊ PODE CITAR: nenhum. Escreva sem citar preço.',
    '',
    `POR QUE O MOTOR MANDOU TOCAR AGORA: ${p.decisao.porque}`,
    `ÂNGULO: ${angulo}`,
    '',
    `Escreva a mensagem que a dona mandaria agora pra ${primeiro}.`,
  ].join('\n')

  return { system, user }
}

function blocoTom(p: PedidoRedacao): string {
  // aceita tanto um bloco pronto quanto ausência de perfil — o tom é opcional na demo
  const bruto: unknown = p.tom ? tomParaPrompt(p.tom) : null
  return typeof bruto === 'string' && bruto.trim() ? bruto.trim() : TOM_PADRAO
}

function historico(c: Conversa): string {
  const ordenadas = [...c.mensagens].sort((a, b) => b.min - a.min)
  const cortadas = ordenadas.slice(Math.max(0, ordenadas.length - MAX_HISTORICO))
  const cabeca = cortadas.length < ordenadas.length ? [`(${ordenadas.length - cortadas.length} mensagens mais antigas omitidas)`] : []
  return [...cabeca, ...cortadas.map((m) => linha(m, c.nome))].join('\n')
}

function linha(m: Mensagem, nome: string): string {
  const quem = m.autor === 'cliente' ? primeiroNome(nome) : m.autor === 'davi' ? 'Davi' : 'você (studio)'
  const audio = typeof m.audio === 'number' ? ` [áudio de ${m.audio}s]` : ''
  return `[${quando(m.min)}] ${quem}:${audio} ${m.texto}`
}

/** `min` é MINUTOS ATRÁS: número maior = mais antigo. */
function quando(min: number): string {
  if (min < 60) return `há ${Math.max(1, Math.round(min))} min`
  if (min < 1440) return `há ${Math.round(min / 60)}h`
  return `há ${Math.round(min / 1440)} dias`
}

/* --------------------------------------------------------------- ancoragem */

const RE_VALOR = /(?:R\$\s*)?(\d{1,3}(?:\.\d{3})+(?:,\d{2})?|\d+(?:,\d{2})?)/g

/** Números que dá pra tratar como dinheiro no meio de um texto de WhatsApp. */
function valoresNoTexto(texto: string): number[] {
  const achados: number[] = []
  for (const m of texto.matchAll(RE_VALOR)) {
    const cru = m[1]
    if (!cru) continue
    const n = Number(cru.replace(/\./g, '').replace(',', '.'))
    const depois = texto.charAt((m.index ?? 0) + m[0].length)
    // "4x", "10h" e afins são parcela/horário, não preço
    if (/[xXhH%]/.test(depois)) continue
    if (Number.isFinite(n) && n >= 50 && n <= 100_000) achados.push(n)
  }
  return achados
}

/** Único conjunto de valores que a mensagem tem direito de citar. */
function valoresPermitidos(c: Conversa): number[] {
  const vindos = c.mensagens.flatMap((m) => valoresNoTexto(m.texto))
  const k = c.compromisso
  if (k) {
    if (typeof k.valorTotal === 'number') vindos.push(k.valorTotal)
    for (const i of k.itens) if (typeof i.valor === 'number') vindos.push(i.valor)
  }
  return [...new Set(vindos)].sort((a, b) => a - b)
}

const citaValor = (texto: string): boolean => /r\$/i.test(texto) || valoresNoTexto(texto).length > 0

const emReais = (v: number): string =>
  `R$ ${v.toLocaleString('pt-BR', { minimumFractionDigits: Number.isInteger(v) ? 0 : 2, maximumFractionDigits: 2 })}`

/* ---------------------------------------------------------------- redação */

export async function redigir(p: PedidoRedacao): Promise<Redacao> {
  const { system, user } = promptRedacao(p)
  const bruto = await chamar<Redacao>(`redigir:${p.decisao.conversaId}`, ESQUEMA, system, user, MODELOS.redigir)

  const texto = limitar(limpar(bruto?.texto ?? ''))
  if (!texto) return doRoteiro(p) ?? redacaoGenerica(p)

  const ancora = limpar(bruto?.ancora_de_valor ?? '') || ancoraDeterministica(p.conversa)
  // usa_preco descreve o texto FINAL (que pode ter sido cortado), então é recontado aqui
  return { texto, ancora_de_valor: ancora, usa_preco: bruto?.usa_preco === true || citaValor(texto) }
}

/**
 * Pré-aquecimento: dispara tudo de uma vez enquanto a tela ainda mostra a animação
 * de "lendo suas conversas", pra coreografia começar com os textos já na mão.
 * Nunca lança e nunca devolve item vazio — quem falha entra no Map com fallback.
 */
export async function redigirLote(pedidos: PedidoRedacao[]): Promise<Map<string, Redacao>> {
  // Chave = conversaId#momento. Dedupa a chamada repetida (que só gastaria token),
  // mas preserva os DOIS envios da Fernanda: reativação e upsell são mensagens
  // diferentes, e colapsar por conversaId fazia ela mandar o mesmo texto duas vezes.
  const chave = (p: PedidoRedacao) => `${p.decisao.conversaId}#${p.momento ?? 'primeiro'}`
  const unicos = [...new Map(pedidos.map((p) => [chave(p), p])).values()]

  const escritas = await emLote(unicos, async (p) => {
    try {
      return await redigir(p)
    } catch {
      return doRoteiro(p) ?? redacaoGenerica(p)
    }
  })
  const mapa = new Map<string, Redacao>()
  unicos.forEach((p, i) => {
    const r = escritas[i]
    mapa.set(chave(p), r ?? redacaoGenerica(p))
  })
  return mapa
}

/* --------------------------------------------------------------- fallback */

/** Texto do roteiro mockado, quando existe um pra essa conversa. */
function doRoteiro(p: PedidoRedacao): Redacao | null {
  const bruto: unknown = textoFallback(p.decisao.conversaId)
  const texto = limitar(limpar(typeof bruto === 'string' ? bruto : temTexto(bruto) ? bruto.texto : ''))
  if (!texto) return null
  return { texto, ancora_de_valor: ancoraDeterministica(p.conversa), usa_preco: citaValor(texto) }
}

/** Último recurso: retomada sem preço, sem data e sem promessa. Não tem como estar errada. */
function redacaoGenerica(p: PedidoRedacao): Redacao {
  const primeiro = primeiroNome(p.conversa.nome)
  return {
    texto: `Oii ${primeiro}! Passando aqui pra retomar o que a gente tinha combinado 😊 Quer que eu separe um horário pra você essa semana?`,
    ancora_de_valor: ancoraDeterministica(p.conversa),
    usa_preco: false,
  }
}

function ancoraDeterministica(c: Conversa): string {
  const k = c.compromisso
  if (!k) return 'conversa parada, sem compromisso registrado'
  const item = k.itens[0]?.descricao ?? 'atendimento em aberto'
  return typeof k.valorTotal === 'number' ? `${item} · ${emReais(k.valorTotal)} em aberto` : item
}

/* ---------------------------------------------------------------- limpeza */

const limpar = (t: string): string => t.replace(/\s+/g, ' ').trim()

const primeiroNome = (nome: string): string => limpar(nome).split(' ')[0] ?? nome

/** Corta por ponto de código pra não partir emoji no meio, e devolve a pergunta no fim. */
function limitar(t: string, max = LIMITE): string {
  const pontos = [...t]
  if (pontos.length <= max) return t
  const cortado = pontos.slice(0, max).join('')
  const espaco = cortado.lastIndexOf(' ')
  const base = (espaco > max * 0.6 ? cortado.slice(0, espaco) : cortado).replace(/[\s.,;:!?-]+$/u, '')
  return `${base}?`
}

function temTexto(x: unknown): x is { texto: string } {
  return typeof x === 'object' && x !== null && 'texto' in x && typeof x.texto === 'string'
}
