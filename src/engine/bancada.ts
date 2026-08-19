import type { Conversa } from '../types'
import type { Modo } from '../config'
import { modo, setModo, ciclarModo, MODELOS } from '../config'
import { historico as chamadas } from '../llm/client'
import { tabela } from './curva'
import { decidir } from './decidir'
import { aprenderTom } from '../llm/tom'
import { validar } from './guardas'
import { preparar, redigirUma } from './loop'
import { classificar } from '../llm/intencao'

/**
 * Bancada de console. Existe pra provar que a infraestrutura funciona ENQUANTO a
 * tela ainda roda mockada — sem UI nova, sem risco de palco.
 *
 *   __davi.curva()          tabela de conversão derivada do histórico
 *   __davi.decidir()        fila do motor: quem tocar, quem esperar, quem parar
 *   __davi.tom()            perfil de tom aprendido do histórico da loja
 *   __davi.redigir('fernanda')   uma mensagem escrita ao vivo, já validada
 *   __davi.guarda(txt,'aline')   testa a guarda anti-preço-inventado
 *   __davi.intencao('para com a Bruna')
 *   __davi.modo('vivo')     liga o interruptor sem recarregar
 *   __davi.chamadas()       histórico de calls: chave, ok, ms, erro
 */

export interface Bancada {
  modo: (m?: Modo) => Modo
  ciclar: () => Modo
  curva: () => ReturnType<typeof tabela>
  decidir: () => void
  tom: () => Promise<unknown>
  redigir: (id: string) => Promise<unknown>
  guarda: (texto: string, id: string) => unknown
  intencao: (texto: string) => Promise<unknown>
  chamadas: () => void
  ultimo: unknown
  modelos: typeof MODELOS
}

export function instalarBancada(getConversas: () => Conversa[]) {
  const acha = (id: string) => {
    const c = getConversas().find((x) => x.id === id || x.nome.toLowerCase().startsWith(id.toLowerCase()))
    if (!c) console.warn(`[davi] conversa "${id}" não existe. ids:`, getConversas().map((x) => x.id).join(', '))
    return c
  }

  const api: Bancada = {
    modo: (m) => (m ? setModo(m) : modo()),
    ciclar: () => ciclarModo(),
    curva: () => tabela(),

    decidir: () => {
      const d = decidir(getConversas())
      console.table(d.map((x) => ({
        cliente: x.nome,
        acao: x.acao,
        angulo: x.angulo ?? '—',
        'R$ esperado': Math.round(x.esperado),
        toques: x.nToque,
      })))
      console.log('%cJustificativas do motor:', 'font-weight:bold')
      d.forEach((x) => console.log(`  ${x.acao.padEnd(8)} ${x.nome.padEnd(20)} ${x.porque}`))
      api.ultimo = d
    },

    tom: async () => {
      const t = await aprenderTom(getConversas())
      console.log(t)
      api.ultimo = t
      return t
    },

    redigir: async (id) => {
      const c = acha(id)
      if (!c) return
      const p = await preparar(getConversas(), new Map())
      const e = await redigirUma(c, p)
      console.log(`%c${c.nome}%c  [${e.origem}]`, 'font-weight:bold', 'color:#8696a0')
      console.log(`  "${e.texto}"`)
      console.log(`  ↳ ${e.porque}`)
      api.ultimo = e
      return e
    },

    guarda: (texto, id) => {
      const c = acha(id)
      if (!c) return
      const v = validar(texto, c)
      console.log(v.ok ? '%cAPROVADO' : '%cREPROVADO', `color:${v.ok ? '#21C063' : '#e8a3a3'};font-weight:bold`)
      if (!v.ok) console.log(`  ${v.motivos.join(', ')} — ${v.detalhe}`)
      api.ultimo = v
      return v
    },

    intencao: async (texto) => {
      const i = await classificar(texto, getConversas())
      console.log(i)
      api.ultimo = i
      return i
    },

    chamadas: () => {
      if (!chamadas.length) return console.log('[davi] nenhuma chamada ainda. Modo atual:', modo())
      console.table(chamadas.map((c) => ({ chave: c.chave, ok: c.ok, ms: c.ms, erro: c.erro ?? '' })))
    },

    ultimo: null,
    modelos: MODELOS,
  }

  ;(globalThis as unknown as { __davi: Bancada }).__davi = api

  console.log(
    `%c Davi %c motor ${modo()} %c — __davi.curva() · __davi.decidir() · __davi.modo('vivo')`,
    'background:#21C063;color:#111b21;font-weight:bold;border-radius:3px 0 0 3px;padding:2px 6px',
    'background:#202c33;color:#e9edef;border-radius:0 3px 3px 0;padding:2px 6px',
    'color:#8696a0',
  )
  return api
}
