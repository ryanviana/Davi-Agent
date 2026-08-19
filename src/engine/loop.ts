import type { Conversa } from '../types'
import type { PedidoRedacao, PerfilTom, Redacao } from '../llm/contratos'
import type { Decisao } from './decidir'
import { decidir } from './decidir'
import { aprenderTom } from '../llm/tom'
import { redigir, redigirLote } from '../llm/redigir'
import { validar } from './guardas'
import { textoFallback, redacaoGenerica } from '../llm/fallbacks'
import { modo, usaNaTela } from '../config'

/**
 * A camada que liga o motor à tela — e o lugar onde o interruptor age.
 *
 * Desenho deliberado: o ROTEIRO continua sendo o RELÓGIO e o ELENCO da demo.
 * Ele carrega as respostas roteirizadas das clientes (rápidas e determinísticas,
 * por decisão de produto) e o timing ensaiado. O que o modo `vivo` troca é o
 * CONTEÚDO: o texto passa a ser escrito pelo modelo e a justificativa passa a ser
 * calculada pelo motor.
 *
 * Além disso, em `vivo` o motor emite os `extras`: clientes que ELE escolheu e que
 * não estão no roteiro. É ali que se vê a seleção autônoma acontecendo.
 */

/** quantos clientes fora do roteiro o motor pode abordar por conta própria */
export const EXTRAS_MAX = 3

export interface Preparo {
  tom: PerfilTom | null
  decisoes: Decisao[]
  /** conversaId -> lista de redações, uma por envio previsto naquela conversa */
  textos: Map<string, Redacao[]>
  prontoEm: number
}

const vazio = (): Preparo => ({ tom: null, decisoes: [], textos: new Map(), prontoEm: 0 })

/**
 * PRÉ-AQUECIMENTO. Roda durante a animação de "lendo suas conversas" — os ~2s de
 * scan são tempo de relógio que já ia ser gasto. Quando o dono autoriza, os textos
 * já estão prontos e a coreografia roda sem esperar por rede.
 */
export async function preparar(conversas: Conversa[], envios: Map<string, number>): Promise<Preparo> {
  const t0 = performance.now()
  const decisoes = decidir(conversas)

  if (!usaNaTela() && modo() === 'roteiro') {
    return { ...vazio(), decisoes, prontoEm: Math.round(performance.now() - t0) }
  }

  const tom = await aprenderTom(conversas)
  const porId = new Map(conversas.map((c) => [c.id, c]))

  // Uma redação por ENVIO previsto. A Fernanda tem dois — reativação e upsell —
  // e são mensagens diferentes: o segundo sai depois que ela já disse sim.
  // Chavear só por conversaId faria ela repetir o mesmo texto.
  // Só pré-aquece quem realmente vai falar nesta demo: o elenco do roteiro mais os
  // extras que o motor escolheu. Redigir as 24 da fila levava ~28s — mais que a
  // animação de scan inteira, então nenhum texto chegava a tempo e tudo caía no
  // roteiro. Com ~8 chamadas cabe numa leva só do teto de concorrência.
  const noRoteiro = decisoes.filter((d) => d.acao === 'tocar' && envios.has(d.conversaId))
  const restantes = decisoes.filter((d) => d.acao === 'tocar' && !envios.has(d.conversaId))
  const selecionadas = [...noRoteiro, ...restantes.slice(0, EXTRAS_MAX)]

  const pedidos: PedidoRedacao[] = []
  for (const d of selecionadas) {
    const c = porId.get(d.conversaId)
    if (!c) continue
    const n = envios.get(d.conversaId) ?? 1
    for (let i = 0; i < n; i++) {
      pedidos.push({ conversa: c, decisao: d, tom, momento: i === 0 ? 'primeiro' : 'upsell' })
    }
  }

  const mapa = await redigirLote(pedidos)
  const textos = new Map<string, Redacao[]>()
  for (const p of pedidos) {
    const r = mapa.get(`${p.conversa.id}#${p.momento ?? 'primeiro'}`)
    if (!r) continue
    const lista = textos.get(p.conversa.id) ?? []
    lista.push(r)
    textos.set(p.conversa.id, lista)
  }

  return { tom, decisoes, textos, prontoEm: Math.round(performance.now() - t0) }
}

export interface Emissao {
  texto: string
  porque: string
  origem: 'modelo' | 'roteiro' | 'template'
}

/**
 * Resolve o texto de um slot do roteiro.
 * Em `roteiro` e `sombra` devolve o texto de sempre — o palco não muda.
 * Em `vivo` devolve o que o modelo escreveu, se a guarda aprovar.
 */
export function emitir(
  preparo: Preparo,
  conversa: Conversa,
  nEnvio: number,
  doRoteiro: { texto: string; porque?: string },
): Emissao {
  const decisao = preparo.decisoes.find((d) => d.conversaId === conversa.id)
  const porqueMotor = decisao?.porque ?? doRoteiro.porque ?? ''

  if (!usaNaTela()) {
    return { texto: doRoteiro.texto, porque: doRoteiro.porque ?? porqueMotor, origem: 'roteiro' }
  }

  const candidato = preparo.textos.get(conversa.id)?.[nEnvio]
  if (candidato) {
    const v = validar(candidato.texto, conversa)
    if (v.ok) return { texto: candidato.texto, porque: porqueMotor, origem: 'modelo' }
    console.warn(`[davi] guarda reprovou ${conversa.id}: ${v.motivos.join(', ')} — ${v.detalhe}`)
  }

  const doScript = textoFallback(conversa.id, nEnvio)
  if (doScript) return { texto: doScript.texto, porque: porqueMotor, origem: 'roteiro' }

  return {
    texto: redacaoGenerica(conversa.nome, decisao?.angulo ?? 'lembrete_simples', String(conversa.compromisso?.valorTotal ?? '')),
    porque: porqueMotor,
    origem: 'template',
  }
}

/**
 * Clientes escolhidos PELO MOTOR que não estão no roteiro. É a prova visível de
 * seleção autônoma: ninguém escreveu essas conversas na coreografia.
 */
export function extras(preparo: Preparo, jaNoRoteiro: string[], max = EXTRAS_MAX): Decisao[] {
  return preparo.decisoes
    .filter((d) => d.acao === 'tocar' && !jaNoRoteiro.includes(d.conversaId))
    .slice(0, max)
}

/** Redação sob demanda, fora do lote — usada por extras e pela bancada. */
export async function redigirUma(conversa: Conversa, preparo: Preparo): Promise<Emissao> {
  const decisao = preparo.decisoes.find((d) => d.conversaId === conversa.id)
  if (!decisao) return { texto: '', porque: '', origem: 'template' }

  const r = await redigir({ conversa, decisao, tom: preparo.tom })
  const v = validar(r.texto, conversa)
  if (v.ok) return { texto: r.texto, porque: decisao.porque, origem: usaNaTela() ? 'modelo' : 'roteiro' }

  const doScript = textoFallback(conversa.id, 0)
  return {
    texto: doScript?.texto ?? redacaoGenerica(conversa.nome, decisao.angulo ?? 'lembrete_simples', ''),
    porque: decisao.porque,
    origem: doScript ? 'roteiro' : 'template',
  }
}
