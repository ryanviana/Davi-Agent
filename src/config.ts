/**
 * Interruptor único da infraestrutura.
 *
 * roteiro — padrão. Caminho de hoje, byte-idêntico. Zero rede, zero token.
 * sombra  — motor + LLM rodam de verdade em paralelo; a TELA continua roteirizada.
 *           A saída real vai pro console e pra `window.__davi.ultimo`.
 * vivo    — o que a infra produziu vai pra tela.
 *
 * Ligar: VITE_MOTOR=vivo no .env.local, ou tecla M em runtime, ou __davi.modo('vivo').
 */
export type Modo = 'roteiro' | 'sombra' | 'vivo'

const doAmbiente = (import.meta.env?.VITE_MOTOR as Modo | undefined) ?? 'roteiro'
const VALIDOS: Modo[] = ['roteiro', 'sombra', 'vivo']

let modoAtual: Modo = VALIDOS.includes(doAmbiente) ? doAmbiente : 'roteiro'
const ouvintes = new Set<(m: Modo) => void>()

export const modo = () => modoAtual
/** true quando a infra deve realmente chamar o modelo. */
export const usaRede = () => modoAtual !== 'roteiro'
/** true quando o que a infra produziu deve aparecer na tela. */
export const usaNaTela = () => modoAtual === 'vivo'

export function setModo(m: Modo) {
  if (!VALIDOS.includes(m)) return modoAtual
  modoAtual = m
  ouvintes.forEach((f) => f(m))
  return modoAtual
}

export const ciclarModo = () => setModo(VALIDOS[(VALIDOS.indexOf(modoAtual) + 1) % VALIDOS.length])
export const aoMudarModo = (f: (m: Modo) => void) => { ouvintes.add(f); return () => ouvintes.delete(f) }

/* --------------------------------------------------------------- modelos */
/* Travados por smoke test: gpt-5-mini + reasoning_effort minimal responde em ~1.7s
   com qualidade de tom melhor que gpt-4.1-mini (que erra `motivo`). gpt-5 leva
   9-10s — bom demais pra ser útil dentro do ritmo da demo. */
export const MODELOS = {
  extrair: { model: 'gpt-5-mini', reasoning_effort: 'minimal' },
  tom:     { model: 'gpt-5-mini', reasoning_effort: 'minimal' },
  redigir: { model: 'gpt-5-mini', reasoning_effort: 'minimal' },
  intencao:{ model: 'gpt-5-mini', reasoning_effort: 'minimal' },
} as const

export const TIMEOUT_MS = 8000
export const RETRIES = 1
/** teto de chamadas simultâneas — a extração em lote não pode saturar a rede do evento */
export const CONCORRENCIA = 6
