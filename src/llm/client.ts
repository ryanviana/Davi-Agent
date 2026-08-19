import { TIMEOUT_MS, RETRIES, CONCORRENCIA, usaRede } from '../config'

/** JSON Schema no dialeto strict da OpenAI. */
export interface Schema {
  name: string
  schema: Record<string, unknown>
}

export interface Opcoes {
  model: string
  reasoning_effort?: string
}

/** Registro do que aconteceu — alimenta a bancada de console e o modo sombra. */
export interface Chamada {
  chave: string
  ok: boolean
  ms: number
  erro?: string
  saida?: unknown
}

export const historico: Chamada[] = []

/* --------------------------------------------------- limite de concorrência */

let emVoo = 0
const fila: (() => void)[] = []

async function vaga<T>(f: () => Promise<T>): Promise<T> {
  if (emVoo >= CONCORRENCIA) await new Promise<void>((r) => fila.push(r))
  emVoo++
  try {
    return await f()
  } finally {
    emVoo--
    fila.shift()?.()
  }
}

/* ----------------------------------------------------------------- chamada */

/**
 * Uma chamada estruturada ao modelo. NUNCA lança.
 * Retorna `null` em qualquer falha — timeout, 4xx, JSON quebrado, modo roteiro.
 * Quem chama é sempre obrigado a ter um fallback.
 */
export async function chamar<T>(
  chave: string,
  schema: Schema,
  system: string,
  user: string,
  opcoes: Opcoes,
): Promise<T | null> {
  // Em modo roteiro nada sai da máquina. Este early-return é o interruptor.
  if (!usaRede()) return null

  const t0 = performance.now()

  for (let tentativa = 0; tentativa <= RETRIES; tentativa++) {
    const abortar = new AbortController()
    const alarme = setTimeout(() => abortar.abort(), TIMEOUT_MS)
    try {
      const r = await vaga(() =>
        fetch('/oai/v1/chat/completions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: abortar.signal,
          body: JSON.stringify({
            model: opcoes.model,
            ...(opcoes.reasoning_effort ? { reasoning_effort: opcoes.reasoning_effort } : {}),
            messages: [
              { role: 'system', content: system },
              { role: 'user', content: user },
            ],
            response_format: {
              type: 'json_schema',
              json_schema: { name: schema.name, strict: true, schema: schema.schema },
            },
          }),
        }),
      )
      clearTimeout(alarme)

      if (!r.ok) throw new Error(`HTTP ${r.status} ${(await r.text()).slice(0, 200)}`)

      const corpo = await r.json()
      const cru = corpo?.choices?.[0]?.message?.content
      if (typeof cru !== 'string') throw new Error('resposta sem content')

      const saida = JSON.parse(cru) as T
      historico.push({ chave, ok: true, ms: Math.round(performance.now() - t0), saida })
      return saida
    } catch (e) {
      clearTimeout(alarme)
      const erro = e instanceof Error ? e.message : String(e)
      if (tentativa === RETRIES) {
        historico.push({ chave, ok: false, ms: Math.round(performance.now() - t0), erro })
        console.warn(`[davi] ${chave} falhou → fallback:`, erro)
        return null
      }
    }
  }
  return null
}

/** Roda em paralelo respeitando o teto de concorrência do client. */
export function emLote<A, R>(itens: A[], f: (a: A, i: number) => Promise<R>): Promise<R[]> {
  return Promise.all(itens.map(f))
}
