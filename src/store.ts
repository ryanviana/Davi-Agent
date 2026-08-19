import { create } from 'zustand'
import type { Conversa, Mensagem } from './types'
import { CONVERSAS } from './data/conversas'
import { FERNANDA, ROTEIRO } from './data/davi'
import { modo, setModo, ciclarModo, usaNaTela, usaRede, type Modo } from './config'
import { emitir, extras, preparar, redigirUma, type Preparo } from './engine/loop'
import { instalarBancada } from './engine/bancada'
import { classificar } from './llm/intencao'
import { falaDavi } from './llm/fallbacks'
import { PAUSA_DIAS } from './engine/decidir'

export type Fase = 'qr' | 'conectando' | 'app'
export type DaviFase = 'apresentando' | 'lendo' | 'proposta' | 'trabalhando'

export interface ItemDavi {
  id: string
  tipo: 'davi' | 'dono' | 'scan' | 'proposta' | 'venda'
  texto?: string
  valor?: number
  rotulo?: string
  min: number
}

const BASE: Conversa[] = [FERNANDA, ...CONVERSAS]

/** total parado = soma dos compromissos não resolvidos */
export const TOTAL_PARADO = BASE.reduce((s, c) => {
  const e = c.compromisso?.estado
  return e && e !== 'recuperado' && e !== 'perdido' ? s + (c.compromisso?.valorTotal ?? 0) : s
}, 0)

export const N_OPORTUNIDADES = BASE.filter(
  (c) => c.compromisso && c.compromisso.estado !== 'recuperado' && c.compromisso.estado !== 'perdido',
).length

export const N_SEM_RESPOSTA = BASE.filter(
  (c) => c.mensagens[c.mensagens.length - 1]?.autor === 'cliente',
).length

/** quantos envios o roteiro prevê por conversa — a Fernanda tem dois (reativação + upsell) */
const ENVIOS_POR_CONVERSA = ROTEIRO.reduce((m, ev) => {
  if (ev.tipo === 'envia' && ev.conversa) m.set(ev.conversa, (m.get(ev.conversa) ?? 0) + 1)
  return m
}, new Map<string, number>())

const NO_ROTEIRO = [...ENVIOS_POR_CONVERSA.keys()]

interface Estado {
  fase: Fase
  conversas: Conversa[]
  visiveis: number
  aberta: string | null
  busca: string
  daviFase: DaviFase
  daviItens: ItemDavi[]
  daviNaoLidas: number
  scan: number
  digitando: string[]
  recuperado: number
  toasts: { id: number; valor: number; rotulo: string }[]
  rodando: boolean

  /** aditivos — a UI não precisa usar, mas ficam vivos para quando quiser */
  motor: Modo
  totalParado: number
  nOportunidades: number

  conectar: () => void
  abrir: (id: string | null) => void
  setBusca: (s: string) => void
  lerConversas: () => void
  autorizar: () => void
  pular: () => void
  enviar: (id: string, texto: string) => void
  /** o Davi esta processando o que o dono acabou de dizer — liga o "digitando..." */
  pensando: boolean
  falarComDavi: (texto: string) => Promise<void>
  /** alias historico de falarComDavi */
  enviarDavi: (texto: string) => void
}

let uid = 0
const nid = () => `g${++uid}`

let timers: number[] = []
const limpar = () => { timers.forEach(clearTimeout); timers = [] }
const daqui = (ms: number, fn: () => void) => { timers.push(setTimeout(fn, ms) as unknown as number) }

/** conversas pausadas pelo dono ("para com a Bruna") — nada mais sai pra elas */
const pausadas = new Set<string>()

/** resultado do pré-aquecimento; preenchido durante a fase 'lendo' */
let preparo: Preparo = { tom: null, decisoes: [], textos: new Map(), prontoEm: 0 }

export const useApp = create<Estado>((set, get) => ({
  fase: 'qr',
  conversas: [],
  visiveis: 0,
  aberta: null,
  busca: '',
  daviFase: 'apresentando',
  daviItens: [],
  daviNaoLidas: 1,
  scan: 0,
  digitando: [],
  recuperado: 0,
  toasts: [],
  rodando: false,

  motor: modo(),
  pensando: false,
  totalParado: TOTAL_PARADO,
  nOportunidades: N_OPORTUNIDADES,

  conectar: () => {
    if (get().fase !== 'qr') return
    set({ fase: 'conectando' })
    daqui(1400, () => {
      set({
        fase: 'app',
        conversas: [],
        daviItens: [
          { id: nid(), tipo: 'davi', min: 0, texto: 'Oi! Eu sou o Davi 👋' },
          { id: nid(), tipo: 'davi', min: 0, texto: 'Sou o vendedor que trabalha aqui dentro do seu WhatsApp. Sem site, sem painel, sem nada pra você preencher — é só falar comigo nesta conversa.' },
          { id: nid(), tipo: 'davi', min: 0, texto: 'Enquanto você atende quem chega, eu cuido de quem sumiu: o orçamento que ninguém respondeu, o "vou pensar" que nunca voltou, o pacote pago pela metade.' },
          { id: nid(), tipo: 'davi', min: 0, texto: 'Posso ler suas conversas pra te dizer quanto tem de dinheiro esquecido aí dentro?' },
        ],
      })
      // conversas chegam uma a uma — o caos se montando na frente do dono
      BASE.forEach((_, i) => {
        daqui(60 + i * 55, () => set(() => ({ conversas: BASE.slice(0, i + 1), visiveis: i + 1 })))
      })
      // Rede de segurança: se algum timer for limpo no meio, a caixa ainda enche.
      // A demo não pode abrir com a lista vazia.
      daqui(60 + BASE.length * 55 + 400, () =>
        set((s) => (s.conversas.length < BASE.length ? { conversas: BASE, visiveis: BASE.length } : {})),
      )
    })
  },

  abrir: (id) => {
    if (id === 'davi') { set({ aberta: 'davi', daviNaoLidas: 0 }); return }
    set((s) => ({
      aberta: id,
      conversas: s.conversas.map((c) => (c.id === id ? { ...c, naoLidas: 0 } : c)),
    }))
  },

  setBusca: (busca) => set({ busca }),

  lerConversas: () => {
    if (get().daviFase !== 'apresentando') return
    set((s) => ({
      daviFase: 'lendo',
      scan: 0,
      daviItens: [...s.daviItens, { id: nid(), tipo: 'scan', min: 0 }],
    }))

    // PRÉ-AQUECIMENTO: o motor decide e o modelo redige DURANTE a animação de scan.
    // Os ~2s de barra já iam ser gastos; quando o dono autorizar, tudo está pronto
    // e a coreografia roda sem esperar rede.
    void preparar(BASE, ENVIOS_POR_CONVERSA).then((p) => {
      preparo = p
      const vivos = [...p.textos.values()].flat().length
      console.log(`[davi] preparo em ${p.prontoEm}ms · ${p.decisoes.filter((d) => d.acao === 'tocar').length} a tocar · ${vivos} textos do modelo`)
      if (modo() === 'sombra') {
        console.log('%c[sombra] o modelo escreveu isto — a tela segue mostrando o roteiro:', 'color:#53bdeb')
        for (const [id, rs] of p.textos) rs.forEach((r) => console.log(`  ${id}: "${r.texto}"`))
      }
      set({ totalParado: TOTAL_PARADO, nOportunidades: p.decisoes.filter((d) => d.acao === 'tocar').length || N_OPORTUNIDADES })
    })

    const total = BASE.length
    let i = 0
    const passo = () => {
      i++
      set({ scan: Math.min(1, i / total) })
      if (i < total) daqui(1900 / total, passo)
      else daqui(500, () => set((s) => ({
        daviFase: 'proposta',
        daviItens: [...s.daviItens, { id: nid(), tipo: 'proposta', min: 0 }],
      })))
    }
    daqui(200, passo)
  },

  autorizar: () => {
    if (get().daviFase !== 'proposta') return
    set({ daviFase: 'trabalhando', rodando: true })

    // quantos envios já saíram por conversa — escolhe qual redação usar (reativação vs upsell)
    const nEnvio = new Map<string, number>()

    for (const ev of ROTEIRO) {
      daqui(ev.em, () => {
        if (ev.conversa && pausadas.has(ev.conversa)) return

        if (ev.tipo === 'davi') {
          set((s) => ({
            daviItens: [...s.daviItens, { id: nid(), tipo: 'davi', min: 0, texto: ev.texto }],
            daviNaoLidas: s.aberta === 'davi' ? 0 : s.daviNaoLidas + 1,
          }))
        }
        if (ev.tipo === 'card' && ev.card === 'proposta') return

        if (ev.tipo === 'digitando') {
          set((s) => ({ digitando: [...s.digitando, ev.conversa!] }))
        }

        if (ev.tipo === 'envia' || ev.tipo === 'responde') {
          const alvo = get().conversas.find((c) => c.id === ev.conversa)
          if (!alvo) return

          let texto = ev.texto ?? ''
          let porque = ev.porque

          if (ev.tipo === 'envia') {
            const n = nEnvio.get(alvo.id) ?? 0
            nEnvio.set(alvo.id, n + 1)
            const e = emitir(preparo, alvo, n, { texto, porque })
            texto = e.texto
            porque = e.porque || porque
          }

          const m: Mensagem = {
            id: nid(),
            autor: ev.tipo === 'envia' ? 'davi' : 'cliente',
            texto,
            min: 0,
            porque,
          }
          set((s) => {
            const idx = s.conversas.findIndex((c) => c.id === ev.conversa)
            if (idx < 0) return {}
            const atual = s.conversas[idx]
            const nova: Conversa = {
              ...atual,
              mensagens: [...atual.mensagens, m],
              naoLidas: ev.tipo === 'responde' && s.aberta !== atual.id ? atual.naoLidas + 1 : atual.naoLidas,
            }
            const resto = s.conversas.filter((c) => c.id !== ev.conversa)
            return {
              conversas: [nova, ...resto],
              digitando: s.digitando.filter((d) => d !== ev.conversa),
            }
          })
        }

        if (ev.tipo === 'venda') {
          // guarda: venda só conta se a conversa existe de verdade na lista
          if (ev.conversa && !get().conversas.some((c) => c.id === ev.conversa)) return
          const t = { id: ++uid, valor: ev.valor!, rotulo: ev.rotulo! }
          set((s) => ({
            recuperado: s.recuperado + ev.valor!,
            toasts: [...s.toasts, t],
            daviItens: [...s.daviItens, { id: nid(), tipo: 'venda', min: 0, valor: ev.valor, rotulo: ev.rotulo }],
            daviNaoLidas: s.aberta === 'davi' ? 0 : s.daviNaoLidas + 1,
          }))
          daqui(4200, () => set((s) => ({ toasts: s.toasts.filter((x) => x.id !== t.id) })))
        }
      })
    }

    // EXTRAS: clientes que o MOTOR escolheu e que ninguém escreveu na coreografia.
    // Só aparecem em `vivo` — é a prova visível de seleção autônoma.
    if (usaNaTela()) {
      const fim = Math.max(...ROTEIRO.map((e) => e.em))
      extras(preparo, NO_ROTEIRO, 3).forEach((d, i) => {
        daqui(fim + 1800 + i * 2400, () => {
          const alvo = get().conversas.find((c) => c.id === d.conversaId)
          if (!alvo || pausadas.has(alvo.id)) return
          set((s) => ({ digitando: [...s.digitando, alvo.id] }))
          void redigirUma(alvo, preparo).then((e) => {
            if (!e.texto) return set((s) => ({ digitando: s.digitando.filter((x) => x !== alvo.id) }))
            const m: Mensagem = { id: nid(), autor: 'davi', texto: e.texto, min: 0, porque: e.porque }
            set((s) => {
              const atual = s.conversas.find((c) => c.id === alvo.id)
              if (!atual) return {}
              const nova = { ...atual, mensagens: [...atual.mensagens, m] }
              return {
                conversas: [nova, ...s.conversas.filter((c) => c.id !== alvo.id)],
                digitando: s.digitando.filter((x) => x !== alvo.id),
              }
            })
          })
        })
      })
    }
  },

  enviar: (id, texto) => {
    const m: Mensagem = { id: nid(), autor: 'loja', texto, min: 0 }
    set((s) => {
      const alvo = s.conversas.find((c) => c.id === id)
      if (!alvo) return {}
      const nova = { ...alvo, mensagens: [...alvo.mensagens, m], naoLidas: 0 }
      return { conversas: [nova, ...s.conversas.filter((c) => c.id !== id)] }
    })
  },

  /**
   * O dono fala com o Davi em português: "para com a Bruna", "como tá indo?".
   * A intenção vira ação real no motor — a conversa pausada some da fila e nenhum
   * evento futuro do roteiro sai pra ela.
   */
  /**
   * O dono fala com o Davi em portugues: "para com a Bruna", "como ta indo?".
   * A intencao vira acao real no motor — a conversa pausada some da fila e nenhum
   * evento futuro do roteiro sai pra ela.
   */
  falarComDavi: async (texto) => {
    const t = texto.trim()
    if (!t || get().pensando) return
    set((s) => ({
      daviItens: [...s.daviItens, { id: nid(), tipo: 'dono', min: 0, texto: t }],
      aberta: 'davi',
      daviNaoLidas: 0,
      pensando: true,
    }))

    try {
      const i = await classificar(t, get().conversas)
      const chave = i.alvo
      const alvo = chave
        ? get().conversas.find((c) => c.id === chave || c.nome.toLowerCase().includes(chave.toLowerCase()))
        : undefined
      let resposta = i.resposta
      const nome = alvo?.nome.split(' ')[0] ?? ''

      if (i.acao === 'parar' && alvo) {
        pausadas.add(alvo.id)
        set((s) => ({
          conversas: s.conversas.map((c) =>
            c.id === alvo.id && c.compromisso ? { ...c, compromisso: { ...c.compromisso, estado: 'pausado' } } : c,
          ),
          digitando: s.digitando.filter((d) => d !== alvo.id),
        }))
        resposta ||= `Parei com a ${nome} agora. Fica pausada por ${PAUSA_DIAS} dias — nao mando mais nada pra ela.`
      }

      if (i.acao === 'retomar' && alvo) {
        pausadas.delete(alvo.id)
        set((s) => ({
          conversas: s.conversas.map((c) =>
            c.id === alvo.id && c.compromisso ? { ...c, compromisso: { ...c.compromisso, estado: 'travado' } } : c,
          ),
        }))
        resposta ||= `Voltei a cuidar da ${nome} 👍`
      }

      if (i.acao === 'status') {
        const brl = get().recuperado.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })
        const emFila = preparo.decisoes.filter((d) => d.acao === 'tocar' && !pausadas.has(d.conversaId)).length
        resposta ||= `Recuperei ${brl} ate agora. Tenho ${emFila} clientes na fila.`
      }

      set((s) => ({
        daviItens: [...s.daviItens, { id: nid(), tipo: 'davi', min: 0, texto: resposta || falaDavi('nao_entendi') }],
      }))
    } finally {
      set({ pensando: false })
    }
  },

  enviarDavi: (texto) => { void get().falarComDavi(texto) },

  pular: () => {
    limpar()
    set({ fase: 'app', conversas: BASE, visiveis: BASE.length })
  },
}))

/* ------------------------------------------------------------- interruptor */

/**
 * Tecla M cicla roteiro → sombra → vivo sem recarregar. Ignora quando o foco está
 * num campo de texto — senão o dono não consegue escrever "amanhã" pro Davi.
 */
if (typeof window !== 'undefined') {
  window.addEventListener('keydown', (e) => {
    if (e.key !== 'm' && e.key !== 'M') return
    const alvo = e.target as HTMLElement | null
    if (alvo && /^(INPUT|TEXTAREA)$/.test(alvo.tagName)) return
    if (alvo?.isContentEditable) return
    const m = ciclarModo()
    useApp.setState({ motor: m })
    console.log(`%c[davi] motor → ${m}`, 'color:#21C063;font-weight:bold', usaRede() ? '(chamando o modelo)' : '(offline, roteiro puro)')
  })

  instalarBancada(() => useApp.getState().conversas.length ? useApp.getState().conversas : BASE)
}

export { setModo, modo }
