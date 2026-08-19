import type { Conversa } from '../types'
import type { MotivoReprova, Veredito } from '../llm/contratos'

/**
 * A última porta antes do cliente. TS puro, determinístico, zero LLM.
 *
 * Nenhuma mensagem gerada chega no WhatsApp de ninguém sem passar por `validar`.
 * É a resposta pra "e se o modelo alucinar um preço?": o valor inventado não é
 * corrigido por outro modelo — é barrado por regra e devolvido pro retry dentro
 * de `detalhe`, já escrito como instrução acionável.
 */

/* --------------------------------------------------------- regras da loja */

const MAX_CARACTERES = 320
const MIN_UTEIS = 15
/** A loja arredonda centavo na conversa real ("3x de 326" pra 326,67). Isso não é alucinação. */
const TOLERANCIA_REAIS = 1
const MAX_PARCELAS = 12

/* ------------------------------------------------------------- números */

/** Grafias de número que aparecem de verdade num WhatsApp brasileiro. */
const NUMERO = String.raw`\d{1,3}(?:\.\d{3})+(?:,\d{1,2})?|\d{1,3}(?:,\d{3})+(?:\.\d{1,2})?|\d+(?:[.,]\d{1,2})?`

const TODO_NUMERO = new RegExp(NUMERO, 'g')

function paraNumero(bruto: string): number | null {
  const s = bruto.trim()
  const ptBr = /^\d{1,3}(?:\.\d{3})+(?:,\d{1,2})?$/.test(s)
  const enUs = /^\d{1,3}(?:,\d{3})+(?:\.\d{1,2})?$/.test(s)
  const limpo = ptBr
    ? s.replace(/\./g, '').replace(',', '.')
    : enUs
      ? s.replace(/,/g, '')
      : s.replace(',', '.')
  const n = Number(limpo)
  return Number.isFinite(n) ? n : null
}

/**
 * Só conta como preço o que tem cara de preço. "sobraram 4 sessões" e "quinta 9h"
 * não podem virar reprova: falso positivo aqui trava a fila inteira do Davi, que
 * é um estrago maior que deixar passar um número solto sem R$.
 */
const CITACOES: { regex: RegExp; minimo: number }[] = [
  { regex: new RegExp(String.raw`R\$\s*(${NUMERO})`, 'gi'), minimo: 0 },
  { regex: new RegExp(String.raw`(${NUMERO})\s*(?:reais|real|contos?|pila)\b`, 'gi'), minimo: 0 },
  // "4x de 162,50", "3x 326", "em 4x de R$ 162,50" — o que vale é a parcela
  { regex: new RegExp(String.raw`\d{1,2}\s*x\s*(?:de\s*)?(?:R\$\s*)?(${NUMERO})`, 'gi'), minimo: 0 },
  // "1.050" e "1050,00" soltos: a pontuação já denuncia dinheiro
  { regex: new RegExp(String.raw`(?:^|[^\d.,])(\d{1,3}(?:\.\d{3})+(?:,\d{2})?|\d+,\d{2})(?!\d)`, 'g'), minimo: 0 },
  // "980 no pix", "130 cada sessão" — a forma que a dona escreve preço de verdade
  {
    regex: new RegExp(
      String.raw`(${NUMERO})\s*(?:no\s+pix|no\s+cart[aã]o|[aà]\s+vista|cada\s+sess[aã]o|a\s+sess[aã]o|por\s+sess[aã]o)`,
      'gi',
    ),
    minimo: 0,
  },
  // "sai por 980", "faço 390": inteiro seco só é preço com verbo de preço na frente,
  // nenhuma unidade atrás e valor >= 20 — nada no cardápio custa menos, e o piso é o
  // que impede "seguro por 3 dias" ou "deixo 2 horários" de virarem R$ 3 e R$ 2.
  {
    regex: new RegExp(
      String.raw`\b(?:por|fica|ficam|sai|saem|custa|custam|faco|faço|fecho|deixo|cobro|cobramos)\s+(?:R\$\s*)?(${NUMERO})(?!\s*(?:%|x\b|h\b|de\b|dias?\b|semanas?\b|horas?\b|minutos?\b|meses\b|vezes\b|anos?\b))`,
      'gi',
    ),
    minimo: 20,
  },
]

const unicos = (ns: number[]): number[] => [...new Set(ns)].sort((a, b) => a - b)

/** Todo valor em R$ que o texto promete pra cliente. */
export function valoresCitados(texto: string): number[] {
  const achados: number[] = []
  for (const { regex, minimo } of CITACOES) {
    for (const achado of texto.matchAll(regex)) {
      const bruto = achado[1]
      if (bruto === undefined) continue
      const valor = paraNumero(bruto)
      if (valor !== null && valor > 0 && valor >= minimo) achados.push(valor)
    }
  }
  return unicos(achados)
}

/** Todo valor que essa cliente já ouviu — do compromisso e do histórico da conversa. */
export function valoresPermitidos(conversa: Conversa): number[] {
  const permitidos: number[] = []
  const compromisso = conversa.compromisso
  if (compromisso) {
    if (typeof compromisso.valorTotal === 'number') permitidos.push(compromisso.valorTotal)
    for (const item of compromisso.itens) {
      if (typeof item.valor === 'number') permitidos.push(item.valor)
    }
  }
  // Número já dito na conversa é território conhecido: a Aline negociou 1.050 pra
  // 980, então 980 é dela — e 980 não está em nenhum campo do compromisso.
  for (const mensagem of conversa.mensagens) {
    for (const achado of mensagem.texto.matchAll(TODO_NUMERO)) {
      const valor = paraNumero(achado[0])
      if (valor !== null) permitidos.push(valor)
    }
  }
  return unicos(permitidos)
}

/** Parcelamento é aritmética do valor fechado, não invenção: 650 em 4x dá 162,50. */
function parcelas(conversa: Conversa): number[] {
  const compromisso = conversa.compromisso
  if (!compromisso) return []
  const bases = [compromisso.valorTotal, ...compromisso.itens.map((i) => i.valor)]
    .filter((v): v is number => typeof v === 'number' && v > 0)
  const saida: number[] = []
  for (const base of bases) {
    for (let n = 2; n <= MAX_PARCELAS; n++) saida.push(Math.round((base / n) * 100) / 100)
  }
  return unicos(saida)
}

/* ---------------------------------------------------------------- texto */

/** Sem acento e em caixa baixa: o modelo escreve "graça", "Graca" e "GRÁTIS" no mesmo dia. */
const semAcento = (texto: string): string =>
  texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()

/** Sem lookbehind de propósito: a borda vai explícita pra rodar em qualquer WebView. */
const DOMINGO = /(?:^|[^\p{L}\p{N}])(?:domingos?|dom\.)(?:[^\p{L}\p{N}]|$)/u

const PROMESSAS: { termo: RegExp; rotulo: string }[] = [
  { termo: /garantid[oa]s?|garanto|garantimos/, rotulo: '"garantido"' },
  { termo: /100\s*%/, rotulo: '"100%"' },
  { termo: /sem\s+custo\s+(?:nenhum|algum)/, rotulo: '"sem custo nenhum"' },
  { termo: /de\s+graca/, rotulo: '"de graça"' },
  { termo: /\bgratis\b|\bgratuit[oa]s?\b/, rotulo: '"grátis"' },
  { termo: /devolv[oe]\s+(?:o\s+)?(?:seu\s+)?dinheiro|dinheiro\s+de\s+volta/, rotulo: '"devolvo seu dinheiro"' },
]

function formatarReais(valor: number): string {
  const centavos = Math.round(valor * 100)
  const inteiro = Math.trunc(centavos / 100)
  const resto = centavos % 100
  const grupos = String(inteiro).replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  return resto === 0 ? `R$ ${grupos}` : `R$ ${grupos},${String(resto).padStart(2, '0')}`
}

/** Os valores que o retry PODE usar, com o rótulo que explica o que cada um é. */
function referencias(conversa: Conversa): string[] {
  const compromisso = conversa.compromisso
  if (!compromisso) return []
  const vistos = new Set<number>()
  const lista: string[] = []
  if (typeof compromisso.valorTotal === 'number') {
    vistos.add(compromisso.valorTotal)
    lista.push(`${formatarReais(compromisso.valorTotal)} (valor combinado)`)
  }
  for (const item of compromisso.itens) {
    if (typeof item.valor === 'number' && !vistos.has(item.valor)) {
      vistos.add(item.valor)
      lista.push(`${formatarReais(item.valor)} (${item.descricao})`)
    }
  }
  return lista
}

function detalhePreco(inventados: number[], conversa: Conversa): string {
  const lista = inventados.map(formatarReais).join(', ')
  const cabeca = inventados.length > 1
    ? `Os valores ${lista} não aparecem nesta conversa.`
    : `O valor ${lista} não aparece nesta conversa.`
  const alvos = referencias(conversa)
  if (alvos.length === 0) {
    return `${cabeca} Esta conversa não tem valor fechado: não cite preço nenhum.`
  }
  if (alvos.length === 1) {
    return `${cabeca} Use apenas ${alvos[0]} ou não cite preço.`
  }
  return `${cabeca} Use apenas os valores desta conversa: ${alvos.join(', ')} — ou não cite preço.`
}

/* -------------------------------------------------------------- veredito */

/**
 * Reprova é barata (custa um retry), mensagem errada no cliente é cara.
 * Roda todas as regras de uma vez pro retry corrigir tudo numa tacada só.
 */
export function validar(texto: string, conversa: Conversa): Veredito {
  const motivos: MotivoReprova[] = []
  const detalhes: string[] = []

  const aceitos = [...valoresPermitidos(conversa), ...parcelas(conversa)]
  const inventados = valoresCitados(texto)
    .filter((v) => !aceitos.some((a) => Math.abs(v - a) <= TOLERANCIA_REAIS))
  if (inventados.length > 0) {
    motivos.push('preco_inventado')
    detalhes.push(detalhePreco(inventados, conversa))
  }

  // "útil" é letra e dígito: emoji e pontuação não sustentam um toque de venda.
  const uteis = (texto.match(/[\p{L}\p{N}]/gu) ?? []).length
  if (uteis < MIN_UTEIS) {
    motivos.push('vazia')
    detalhes.push(
      `A mensagem tem só ${uteis} caracteres úteis. Escreva 1 ou 2 frases: retome o que ficou pendente com a cliente e termine com um convite claro.`,
    )
  }

  // Conta ponto de código: emoji vale 1 caractere, e a dona escreve com emoji.
  const tamanho = [...texto].length
  if (tamanho > MAX_CARACTERES) {
    motivos.push('muito_longa')
    detalhes.push(
      `A mensagem tem ${tamanho} caracteres e o teto é ${MAX_CARACTERES}. Corte explicação e história: 2 frases curtas, o que ficou combinado e o convite.`,
    )
  }

  const plano = semAcento(texto)

  if (DOMINGO.test(plano)) {
    motivos.push('dia_invalido')
    detalhes.push(
      'O studio atende de segunda a sábado e a mensagem ofereceu domingo. Troque por um dia útil ou sábado.',
    )
  }

  const promessa = PROMESSAS.find((p) => p.termo.test(plano))
  if (promessa) {
    motivos.push('prometeu_demais')
    detalhes.push(
      `Tire ${promessa.rotulo}: a loja não pode prometer isso. Fale só do que já existe — horário reservado, valor já combinado e o parcelamento que a loja realmente faz.`,
    )
  }

  return { ok: motivos.length === 0, motivos, detalhe: detalhes.join(' ') }
}

/*
 * Casos rodados contra src/data/conversas.ts:
 *
 * 1. Aline (preço negociado). Mensagens citam 1.050, 900 e 980; o compromisso só
 *    guarda 1050. "Consigo fechar seu pacote por R$ 980 no pix" passa, porque 980
 *    veio da contraproposta da própria loja. "Fecha por R$ 850?" reprova com
 *    preco_inventado e o detalhe manda usar R$ 1.050 (valor combinado).
 *
 * 2. Bruna (parcela). valorTotal 650 e a loja só disse "ate 4x sem juros", sem
 *    citar a parcela. "Dá pra dividir em 4x de R$ 162,50" passa por 650/4 exato;
 *    "4x de R$ 199" reprova. Mesma trava salva a Letícia: a loja escreveu "3x de
 *    326" e 980/3 = 326,67, dentro da tolerância de R$ 1.
 *
 * 3. Flávia (sem compromisso, perguntou de domingo). "Consigo te encaixar domingo
 *    às 10h" reprova com dia_invalido; um "R$ 140" na mesma mensagem reprova junto,
 *    porque a conversa dela não tem nenhum valor — o detalhe manda não citar preço.
 *    "Segunda 10h te serve?" passa: o 10 de "10h" não é lido como dinheiro.
 */
