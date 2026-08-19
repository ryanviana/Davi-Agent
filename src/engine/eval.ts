import { MODELOS, modo, usaRede } from '../config'
import { chamar, emLote } from '../llm/client'
import { strict } from '../llm/contratos'
import type { Extracao } from '../llm/contratos'
import { CONVERSAS } from '../data/conversas'
import type { Conversa, Estado, Motivo } from '../types'
import arquivo from '../data/eval.json'

/**
 * A prova de que a extração funciona. Roda no console, sem UI.
 *
 * 20 conversas do seed rotuladas a mão (src/data/eval.json), o modelo extrai,
 * a gente compara campo a campo. O número que mais importa não é a acurácia:
 * é o falso positivo de valor — rótulo diz "não tem dinheiro nessa conversa"
 * e o modelo inventa um número. Esse erro faz o Davi cobrar quem não deve nada.
 */

/* ------------------------------------------------------------- gabarito */

export type Temperatura = 'quente' | 'morno' | 'frio'

export interface Rotulo {
  id: string
  valorTotal: number | null
  estado: Estado
  motivo: Motivo | null
  temperatura: Temperatura
  /** só nas linhas onde o rótulo discorda do seed */
  nota?: string
}

interface ArquivoEval {
  versao: number
  criterio: string[]
  rotulos: Rotulo[]
}

// O import de JSON entrega os campos como string larga; o gabarito é escrito à
// mão contra os unions de types.ts, então a asserção só reafirma o que já vale.
const GABARITO = arquivo as ArquivoEval

/* -------------------------------------------------------------- extração */

const ESTADOS: Estado[] = ['novo', 'orcado', 'acordado', 'travado', 'recuperado', 'perdido', 'pausado']
const MOTIVOS: Motivo[] = ['preco', 'terceiro', 'sumico_pos_acordo', 'sem_grana', 'pacote_parado', 'outro']
const TEMPERATURAS: Temperatura[] = ['quente', 'morno', 'frio']

const SCHEMA = strict('extracao', {
  itens: {
    type: 'array',
    items: {
      type: 'object',
      additionalProperties: false,
      required: ['descricao', 'valor'],
      properties: {
        descricao: { type: 'string' },
        valor: { type: ['number', 'null'] },
      },
    },
  },
  valorTotal: { type: ['number', 'null'] },
  estado: { type: 'string', enum: ESTADOS },
  motivo: { type: ['string', 'null'], enum: [...MOTIVOS, null] },
  temperatura: { type: 'string', enum: TEMPERATURAS },
  confianca: { type: 'number' },
})

const SISTEMA = `Você lê o histórico de WhatsApp do Studio Lumi, um studio de estética, e identifica o COMPROMISSO COMERCIAL TRAVADO de cada conversa: quanto dinheiro está parado ali e o que impede de fechar.

COMO LER A CONVERSA
- Cada linha vem com "min atrás": minutos atrás de agora. Número maior = mais antigo. 1440 min = 1 dia.
- LOJA é a dona do studio. O nome da cliente marca as falas dela.
- "[áudio de 41s]" quer dizer que a cliente mandou áudio e o texto é a transcrição. Trate como fala normal, com a informação toda espalhada numa frase só.

TABELA DE PREÇOS DO STUDIO
- Depilação a laser: 145 a sessão avulsa, 1.050 no pacote de 10 (105 por sessão)
- Massagem modeladora: 120 avulsa, 980 no pacote de 10 (98 por sessão)
- Limpeza de pele profunda: 140
- Combo limpeza + hidratação: 190
- Peeling de diamante: 280
- Micropigmentação de sobrancelha (com retoque): 650
- Drenagem linfática: 130
- Design de sobrancelha com henna: 70

valorTotal
- É o dinheiro que está na mesa HOJE nessa conversa.
- Houve negociação de preço? vale o último valor que a LOJA colocou, não o de tabela.
- Pacote parado? vale sessões restantes x preço por sessão da tabela.
- A conversa não amarrou a cliente a nenhum serviço concreto? valorTotal é null e itens é lista vazia.
- NUNCA chute um número a partir do assunto. Perguntar quanto custa não é compromisso. Preencher valor onde não há compromisso é o pior erro possível.

estado
- novo: só pergunta operacional (endereço, horário, forma de pagamento), nenhum serviço definido.
- orcado: a loja passou preço e a cliente não se comprometeu nem objetou.
- acordado: fechou, e não existe promessa vencida.
- travado: existiu compromisso concreto e a conversa parou numa objeção ou numa promessa não cumprida. Acordo com pix/confirmação prometidos e vencidos há mais de 3 dias é travado.
- recuperado, perdido e pausado: só com evidência explícita no diálogo.

motivo (só quando estado é travado, senão null)
- preco: achou caro, pediu desconto, negociou.
- terceiro: precisa falar com marido, mãe, sócia.
- sem_grana: declarou aperto financeiro, desemprego, "mês que vem eu começo".
- sumico_pos_acordo: já tinha fechado e sumiu antes de pagar ou de aparecer.
- pacote_parado: comprou um pacote, parou no meio, sobraram sessões.
- outro: travou por qualquer outra coisa.

temperatura — o quanto está perto de virar dinheiro
- quente: sinal claro de intenção nos últimos ~3 dias.
- morno: interesse real, porém parado, até ~2 semanas.
- frio: silêncio longo (mais de ~2 semanas), objeção financeira dura, ou pergunta puramente operacional.

confianca: 0 a 1, o quanto o diálogo sustenta essa leitura. Baixa quando você teve que deduzir.

Responda só o JSON do schema, em português.`

function transcrever(c: Conversa): string {
  const primeiro = c.nome.split(' ')[0].toUpperCase()
  const linhas = c.mensagens.map((m) => {
    const quem = m.autor === 'cliente' ? primeiro : m.autor === 'loja' ? 'LOJA' : 'DAVI'
    const audio = m.audio ? ` [áudio de ${m.audio}s]` : ''
    return `(${m.min} min atrás) ${quem}${audio}: ${m.texto}`
  })
  return `Cliente: ${c.nome}\nMensagens não lidas: ${c.naoLidas}\n\n${linhas.join('\n')}`
}

export async function extrair(conversa: Conversa): Promise<Extracao | null> {
  return chamar<Extracao>(
    `extrair:${conversa.id}`,
    SCHEMA,
    SISTEMA,
    transcrever(conversa),
    MODELOS.extrair,
  )
}

/* -------------------------------------------------------------- relatório */

export interface Acuracia {
  acertos: number
  total: number
  /** 0 a 100, uma casa decimal */
  pct: number
}

export interface LinhaEval {
  id: string
  nome: string
  estadoEsperado: Estado
  estadoObtido: string
  estadoOk: boolean
  motivoEsperado: Motivo | null
  motivoObtido: string | null
  motivoOk: boolean
  temperaturaEsperada: Temperatura
  temperaturaObtida: string
  temperaturaOk: boolean
  valorEsperado: number | null
  valorObtido: number | null
  valorOk: boolean
  /** rótulo diz null e o modelo inventou número — o erro que mais importa */
  falsoPositivoValor: boolean
  /** rótulo tem número e o modelo devolveu null */
  falsoNegativoValor: boolean
  confianca: number | null
  tudoCerto: boolean
  /** a chamada voltou null (timeout, 4xx, JSON quebrado) */
  falhou: boolean
  nota: string | null
}

export interface Relatorio {
  rodou: boolean
  /** motivo de não ter rodado, ou null */
  aviso: string | null
  /** conversas rotuladas */
  total: number
  /** quantas voltaram do modelo */
  extraidas: number
  acuracia: {
    estado: Acuracia
    motivo: Acuracia
    temperatura: Acuracia
    valorTotal: Acuracia
    linhaInteira: Acuracia
  }
  falsosPositivosValor: { id: string; nome: string; inventou: number }[]
  falsosNegativosValor: { id: string; nome: string; perdeu: number }[]
  /** erro médio absoluto em R$, só onde rótulo e modelo têm número */
  erroMedioValor: number | null
  amostrasErroValor: number
  confianca: { media: number | null; mediaAcertos: number | null; mediaErros: number | null }
  linhas: LinhaEval[]
}

const AVISO_ROTEIRO =
  '[davi] eval não rodou: o motor está em modo roteiro e nenhuma chamada sai da máquina. ' +
  'Rode com VITE_MOTOR=sombra (ou vivo) no .env.local, ou troque em runtime com a tecla M / __davi.modo("sombra").'

const AVISO_REDE =
  '[davi] eval rodou mas nenhuma extração voltou — todas as chamadas falharam. ' +
  'Confira o proxy /oai e a chave da OpenAI antes de acreditar nesses zeros.'

function acuracia(acertos: number, total: number): Acuracia {
  return { acertos, total, pct: total === 0 ? 0 : Math.round((acertos / total) * 1000) / 10 }
}

function media(ns: number[]): number | null {
  if (ns.length === 0) return null
  return Math.round((ns.reduce((s, n) => s + n, 0) / ns.length) * 100) / 100
}

function vazio(aviso: string | null): Relatorio {
  const zero = acuracia(0, 0)
  return {
    rodou: false,
    aviso,
    total: GABARITO.rotulos.length,
    extraidas: 0,
    acuracia: { estado: zero, motivo: zero, temperatura: zero, valorTotal: zero, linhaInteira: zero },
    falsosPositivosValor: [],
    falsosNegativosValor: [],
    erroMedioValor: null,
    amostrasErroValor: 0,
    confianca: { media: null, mediaAcertos: null, mediaErros: null },
    linhas: [],
  }
}

export async function rodarEval(): Promise<Relatorio> {
  if (!usaRede()) {
    console.warn(AVISO_ROTEIRO)
    return vazio(AVISO_ROTEIRO)
  }

  const porId = new Map(CONVERSAS.map((c) => [c.id, c]))
  const pares: { rotulo: Rotulo; conversa: Conversa }[] = []
  for (const rotulo of GABARITO.rotulos) {
    const conversa = porId.get(rotulo.id)
    if (!conversa) {
      console.warn(`[davi] eval: rótulo "${rotulo.id}" não existe em CONVERSAS, pulando.`)
      continue
    }
    pares.push({ rotulo, conversa })
  }

  const saidas = await emLote(pares, (p) => extrair(p.conversa))

  const linhas: LinhaEval[] = pares.map(({ rotulo, conversa }, i) => {
    const e = saidas[i]
    const motivoEsperado = rotulo.motivo ?? null
    const motivoObtido = e ? (e.motivo ?? null) : null
    const valorObtido = e ? (e.valorTotal ?? null) : null
    const estadoOk = e !== null && e.estado === rotulo.estado
    const motivoOk = e !== null && motivoObtido === motivoEsperado
    const temperaturaOk = e !== null && e.temperatura === rotulo.temperatura
    const valorOk = e !== null && valorObtido === rotulo.valorTotal
    return {
      id: rotulo.id,
      nome: conversa.nome,
      estadoEsperado: rotulo.estado,
      estadoObtido: e ? e.estado : '—',
      estadoOk,
      motivoEsperado,
      motivoObtido,
      motivoOk,
      temperaturaEsperada: rotulo.temperatura,
      temperaturaObtida: e ? e.temperatura : '—',
      temperaturaOk,
      valorEsperado: rotulo.valorTotal,
      valorObtido,
      valorOk,
      falsoPositivoValor: e !== null && rotulo.valorTotal === null && valorObtido !== null,
      falsoNegativoValor: e !== null && rotulo.valorTotal !== null && valorObtido === null,
      confianca: e ? e.confianca : null,
      tudoCerto: estadoOk && motivoOk && temperaturaOk && valorOk,
      falhou: e === null,
      nota: rotulo.nota ?? null,
    }
  })

  const validas = linhas.filter((l) => !l.falhou)
  const n = validas.length

  const erros = validas
    .filter((l) => l.valorEsperado !== null && l.valorObtido !== null)
    .map((l) => Math.abs((l.valorEsperado ?? 0) - (l.valorObtido ?? 0)))

  const relatorio: Relatorio = {
    rodou: n > 0,
    aviso: n === 0 ? AVISO_REDE : null,
    total: linhas.length,
    extraidas: n,
    acuracia: {
      estado: acuracia(validas.filter((l) => l.estadoOk).length, n),
      motivo: acuracia(validas.filter((l) => l.motivoOk).length, n),
      temperatura: acuracia(validas.filter((l) => l.temperaturaOk).length, n),
      valorTotal: acuracia(validas.filter((l) => l.valorOk).length, n),
      linhaInteira: acuracia(validas.filter((l) => l.tudoCerto).length, n),
    },
    falsosPositivosValor: validas
      .filter((l) => l.falsoPositivoValor)
      .map((l) => ({ id: l.id, nome: l.nome, inventou: l.valorObtido ?? 0 })),
    falsosNegativosValor: validas
      .filter((l) => l.falsoNegativoValor)
      .map((l) => ({ id: l.id, nome: l.nome, perdeu: l.valorEsperado ?? 0 })),
    erroMedioValor: media(erros),
    amostrasErroValor: erros.length,
    confianca: {
      media: media(validas.map((l) => l.confianca ?? 0)),
      mediaAcertos: media(validas.filter((l) => l.tudoCerto).map((l) => l.confianca ?? 0)),
      mediaErros: media(validas.filter((l) => !l.tudoCerto).map((l) => l.confianca ?? 0)),
    },
    linhas,
  }

  if (n === 0) console.warn(AVISO_REDE)
  return relatorio
}

/* -------------------------------------------------------------- impressão */

const sim = (ok: boolean) => (ok ? 'ok' : 'ERRO')
const nulo = (v: string | number | null) => (v === null ? '—' : String(v))

export function imprimir(r: Relatorio): void {
  console.group(`Davi · eval de extração — ${r.extraidas}/${r.total} conversas, modo ${modo()}`)

  if (!r.rodou) {
    console.warn(r.aviso ?? 'eval não rodou.')
    console.groupEnd()
    return
  }

  console.table([
    { campo: 'estado', acertos: r.acuracia.estado.acertos, de: r.acuracia.estado.total, 'acurácia %': r.acuracia.estado.pct },
    { campo: 'motivo', acertos: r.acuracia.motivo.acertos, de: r.acuracia.motivo.total, 'acurácia %': r.acuracia.motivo.pct },
    { campo: 'temperatura', acertos: r.acuracia.temperatura.acertos, de: r.acuracia.temperatura.total, 'acurácia %': r.acuracia.temperatura.pct },
    { campo: 'valorTotal', acertos: r.acuracia.valorTotal.acertos, de: r.acuracia.valorTotal.total, 'acurácia %': r.acuracia.valorTotal.pct },
    { campo: 'linha inteira', acertos: r.acuracia.linhaInteira.acertos, de: r.acuracia.linhaInteira.total, 'acurácia %': r.acuracia.linhaInteira.pct },
  ])

  console.log(
    `Falsos positivos de valor (rótulo null, modelo inventou): ${r.falsosPositivosValor.length}` +
      ` · falsos negativos (rótulo tem valor, modelo devolveu null): ${r.falsosNegativosValor.length}` +
      ` · erro médio de valorTotal: ${r.erroMedioValor === null ? '—' : `R$ ${r.erroMedioValor}`}` +
      ` em ${r.amostrasErroValor} conversas` +
      ` · confiança média ${nulo(r.confianca.media)} (acertos ${nulo(r.confianca.mediaAcertos)} · erros ${nulo(r.confianca.mediaErros)})`,
  )

  if (r.falsosPositivosValor.length > 0) console.table(r.falsosPositivosValor)

  console.table(
    r.linhas.map((l) => ({
      cliente: l.nome,
      estado: `${l.estadoEsperado} → ${l.estadoObtido}`,
      'estado?': l.falhou ? 'falhou' : sim(l.estadoOk),
      motivo: `${nulo(l.motivoEsperado)} → ${l.falhou ? '—' : nulo(l.motivoObtido)}`,
      'motivo?': l.falhou ? 'falhou' : sim(l.motivoOk),
      temp: `${l.temperaturaEsperada} → ${l.temperaturaObtida}`,
      'temp?': l.falhou ? 'falhou' : sim(l.temperaturaOk),
      valor: `${nulo(l.valorEsperado)} → ${l.falhou ? '—' : nulo(l.valorObtido)}`,
      'valor?': l.falhou ? 'falhou' : l.falsoPositivoValor ? 'INVENTOU' : sim(l.valorOk),
      conf: nulo(l.confianca),
    })),
  )

  console.groupEnd()
}

export async function rodarEImprimir(): Promise<Relatorio> {
  const r = await rodarEval()
  imprimir(r)
  return r
}

// Registrado no import pra que o integrador só precise de um `import '../engine/eval'`
// e a bancada fique a uma linha de distância no console do evento.
Object.assign(globalThis, {
  __daviEval: { rodar: rodarEval, imprimir, rodarEImprimir, gabarito: GABARITO },
})
