import { create } from 'zustand'
import type { Conversa, Mensagem } from './types'
import { CONVERSAS } from './data/conversas'
import { FERNANDA, ROTEIRO } from './data/davi'

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

  conectar: () => void
  abrir: (id: string | null) => void
  setBusca: (s: string) => void
  lerConversas: () => void
  autorizar: () => void
  pular: () => void
  enviar: (id: string, texto: string) => void
}

let uid = 0
const nid = () => `g${++uid}`

let timers: number[] = []
const limpar = () => { timers.forEach(clearTimeout); timers = [] }
const daqui = (ms: number, fn: () => void) => { timers.push(setTimeout(fn, ms) as unknown as number) }

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

  conectar: () => {
    if (get().fase !== 'qr') return
    set({ fase: 'conectando' })
    daqui(1400, () => {
      set({
        fase: 'app',
        conversas: [],
        daviItens: [
          { id: nid(), tipo: 'davi', min: 0, texto: 'Oi! Sou o Davi 👋' },
          { id: nid(), tipo: 'davi', min: 0, texto: 'Sou o seu vendedor, aqui dentro do WhatsApp mesmo.' },
          { id: nid(), tipo: 'davi', min: 0, texto: 'Deixa eu ler tudo que tá parado aí atrás? Não mando nada pra ninguém sem você deixar.' },
        ],
      })
      // conversas chegam uma a uma — o caos se montando na frente do dono
      BASE.forEach((_, i) => {
        daqui(60 + i * 55, () => set(() => ({ conversas: BASE.slice(0, i + 1), visiveis: i + 1 })))
      })
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

    for (const ev of ROTEIRO) {
      daqui(ev.em, () => {
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
          const m: Mensagem = {
            id: nid(),
            autor: ev.tipo === 'envia' ? 'davi' : 'cliente',
            texto: ev.texto!,
            min: 0,
            porque: ev.porque,
          }
          set((s) => {
            const idx = s.conversas.findIndex((c) => c.id === ev.conversa)
            if (idx < 0) return {}
            const alvo = s.conversas[idx]
            const nova: Conversa = {
              ...alvo,
              mensagens: [...alvo.mensagens, m],
              naoLidas: ev.tipo === 'responde' && s.aberta !== alvo.id ? alvo.naoLidas + 1 : alvo.naoLidas,
            }
            const resto = s.conversas.filter((c) => c.id !== ev.conversa)
            return {
              conversas: [nova, ...resto],
              digitando: s.digitando.filter((d) => d !== ev.conversa),
            }
          })
        }

        if (ev.tipo === 'venda') {
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

  pular: () => {
    limpar()
    set({ fase: 'app', conversas: BASE, visiveis: BASE.length })
  },
}))
