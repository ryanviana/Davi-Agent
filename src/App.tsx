import { useEffect, useMemo, useRef, useState } from 'react'
import { useApp, TOTAL_PARADO, N_OPORTUNIDADES, N_SEM_RESPOSTA } from './store'
import type { Conversa, Mensagem } from './types'
import QR from './ui/QR'
import {
  IcStatus, IcCanal, IcMenu, IcBusca, IcEmoji, IcVideo, IcMais,
  IcMic, IcEnviar, IcDavi, IcPin, IcTick, IcPlay, IcNovaConversa, IcConfig,
  IcChatCheio, IcLigacao, IcComunidade, IcCatalogo, IcTransmissao, IcMidia, IcSeta, IcCadeado,
  IcLigacaoCheia,
} from './ui/Icons'

const AGORA = new Date(2026, 7, 19, 11, 4)
const DIAS = ['domingo', 'segunda-feira', 'terça-feira', 'quarta-feira', 'quinta-feira', 'sexta-feira', 'sábado']

const quando = (min: number) => new Date(AGORA.getTime() - min * 60_000)
const hhmm = (d: Date) => `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
const brl = (n: number) => n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })

function rotuloLista(min: number) {
  const d = quando(min)
  const dias = Math.floor((AGORA.setHours(0, 0, 0, 0) - new Date(d).setHours(0, 0, 0, 0)) / 86_400_000)
  AGORA.setHours(11, 4, 0, 0)
  if (dias === 0) return hhmm(d)
  if (dias === 1) return 'ontem'
  if (dias < 7) return DIAS[d.getDay()].replace('-feira', '')
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' })
}

function rotuloDivisor(min: number) {
  const d = quando(min)
  const dias = Math.floor((AGORA.setHours(0, 0, 0, 0) - new Date(d).setHours(0, 0, 0, 0)) / 86_400_000)
  AGORA.setHours(11, 4, 0, 0)
  if (dias === 0) return 'hoje'
  if (dias === 1) return 'ontem'
  if (dias < 7) return DIAS[d.getDay()]
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

const Av = ({ c, tam }: { c: { iniciais: string; cor?: string }; tam?: number }) =>
  c.cor
    ? <div className="av" style={{ background: c.cor, ...(tam ? { width: tam, height: tam, fontSize: tam / 3 } : {}) }}>{c.iniciais}</div>
    : <div className="av davi" style={tam ? { width: tam, height: tam } : undefined}><IcDavi size={tam ? tam / 2.2 : 24} /></div>

/* ------------------------------------------------------------------ lista */

function Linha({ c, on, onClick, digitando }: { c: Conversa; on: boolean; onClick: () => void; digitando: boolean }) {
  const ult = c.mensagens[c.mensagens.length - 1]
  const prefixo = ult?.autor === 'davi' ? 'Davi: ' : ult?.autor === 'loja' ? 'Você: ' : ''
  return (
    <div className={`row${on ? ' on' : ''}`} onClick={onClick}>
      <Av c={c} />
      <div className="row-body">
        <div className="row-l1">
          <span className="row-name">{c.nome}</span>
          <span className={`row-time${c.naoLidas ? ' un' : ''}`}>{ult ? rotuloLista(ult.min) : ''}</span>
        </div>
        <div className="row-l2">
          <span className={`row-prev${ult?.autor === 'davi' ? ' davi' : ''}`}>
            {digitando ? <i style={{ color: '#21C063', fontStyle: 'normal' }}>digitando…</i>
              : <>{prefixo}{ult?.audio ? '🎤 Áudio' : ult?.texto}</>}
          </span>
          {c.naoLidas > 0 && <span className="badge">{c.naoLidas}</span>}
        </div>
      </div>
    </div>
  )
}

function LinhaDavi({ on, onClick }: { on: boolean; onClick: () => void }) {
  const itens = useApp((s) => s.daviItens)
  const nao = useApp((s) => s.daviNaoLidas)
  const ult = itens[itens.length - 1]
  const prev = ult?.tipo === 'venda' ? `Venda fechada · ${brl(ult.valor!)}`
    : ult?.tipo === 'proposta' ? `Achei ${brl(TOTAL_PARADO)} parados`
    : ult?.tipo === 'scan' ? 'Lendo suas conversas…'
    : ult?.texto ?? ''
  return (
    <div className={`row${on ? ' on' : ''}`} onClick={onClick}>
      <Av c={{ iniciais: 'D' }} />
      <div className="row-body">
        <div className="row-l1">
          <span className="row-name">Davi</span>
          <span className={`row-time${nao ? ' un' : ''}`}>{hhmm(AGORA)}</span>
        </div>
        <div className="row-l2">
          <span className="row-prev davi">{prev}</span>
          {nao > 0 ? <span className="badge">{nao}</span> : <span className="pin"><IcPin /></span>}
        </div>
      </div>
    </div>
  )
}

function Lateral() {
  const { conversas, aberta, abrir, busca, setBusca, digitando } = useApp()
  const [filtro, setFiltro] = useState<'tudo' | 'nao' | 'sem'>('tudo')

  const lista = useMemo(() => {
    let l = conversas
    if (busca.trim()) l = l.filter((c) => c.nome.toLowerCase().includes(busca.toLowerCase()))
    if (filtro === 'nao') l = l.filter((c) => c.naoLidas > 0)
    if (filtro === 'sem') l = l.filter((c) => c.mensagens[c.mensagens.length - 1]?.autor === 'cliente')
    return l
  }, [conversas, busca, filtro])

  const naoLidas = conversas.reduce((s, c) => s + c.naoLidas, 0)

  return (
    <div className="left">
      <div className="left-head">
        <span className="left-title">WhatsApp</span>
        <div className="head-icons">
          <button className="icon-btn"><IcNovaConversa /></button>
          <button className="icon-btn"><IcMenu /></button>
        </div>
      </div>
      <div className="search-wrap">
        <div className="search">
          <span style={{ color: 'rgba(255,255,255,.6)' }}><IcBusca /></span>
          <input placeholder="Pesquisar ou começar uma nova conversa" value={busca} onChange={(e) => setBusca(e.target.value)} />
        </div>
      </div>
      <div className="filters">
        <button className={`chip${filtro === 'tudo' ? ' on' : ''}`} onClick={() => setFiltro('tudo')}>Tudo</button>
        <button className={`chip${filtro === 'nao' ? ' on' : ''}`} onClick={() => setFiltro('nao')}>Não lidas {naoLidas}</button>
        <button className={`chip${filtro === 'sem' ? ' on' : ''}`} onClick={() => setFiltro('sem')}>Sem resposta {N_SEM_RESPOSTA}</button>
        <button className="chip" style={{ width: 33, height: 33, padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><IcSeta /></button>
      </div>
      <div className="list">
        {filtro === 'tudo' && !busca && <LinhaDavi on={aberta === 'davi'} onClick={() => abrir('davi')} />}
        {lista.map((c) => (
          <Linha key={c.id} c={c} on={aberta === c.id} onClick={() => abrir(c.id)} digitando={digitando.includes(c.id)} />
        ))}
      </div>
    </div>
  )
}

/* ---------------------------------------------------------------- balões */

function Balao({ m, agrupado }: { m: Mensagem; agrupado: boolean }) {
  const meu = m.autor !== 'cliente'
  return (
    <div className={`msg${meu ? ' me' : ''}`}>
      <div className="msg-col">
        <div className={`bub ${meu ? 'me' : 'them'}${agrupado ? ' grouped' : ''}`}>
          {m.audio ? (
            <>
              <div className="audio">
                <span className="play"><IcPlay /></span>
                <span className="wave">
                  {Array.from({ length: 26 }, (_, i) => (
                    <i key={i} style={{ height: `${5 + ((i * 7) % 15)}px` }} />
                  ))}
                </span>
                <span className="dur">{Math.floor(m.audio / 60)}:{String(m.audio % 60).padStart(2, '0')}</span>
              </div>
              <div className="transcricao">“{m.texto}”</div>
            </>
          ) : m.texto}
          <span className="meta">
            {hhmm(quando(m.min))}
            {meu && <IcTick azul={m.autor === 'davi'} />}
          </span>
        </div>
        {m.porque && <div className="why">{m.porque}</div>}
      </div>
    </div>
  )
}

function Conversa_({ c }: { c: Conversa }) {
  const digitando = useApp((s) => s.digitando.includes(c.id))
  const rodando = useApp((s) => s.rodando)
  const fim = useRef<HTMLDivElement>(null)
  useEffect(() => { fim.current?.scrollIntoView({ behavior: 'smooth' }) }, [c.mensagens.length, digitando])

  const [rascunho, setRascunho] = useState('')
  const enviar = useApp((s) => s.enviar)
  const mandar = () => { const t = rascunho.trim(); if (!t) return; enviar(c.id, t); setRascunho('') }
  let ultimoDia = ''
  let ultimoAutor = ''

  return (
    <>
      <div className="thread-head">
        <Av c={c} tam={40} />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
          <span className="th-name">{c.nome}</span>
          <span className="th-sub">{digitando ? <i style={{ color: '#21C063', fontStyle: 'normal' }}>digitando…</i> : 'online'}</span>
        </div>
        {rodando && <span className="tag-davi"><i />Davi conduzindo</span>}
        <button className="icon-btn"><IcVideo /></button>
        <button className="icon-btn"><IcLigacaoCheia /></button>
        <button className="icon-btn"><IcBusca size={20} /></button>
        <button className="icon-btn"><IcMenu /></button>
      </div>

      <div className="wall">
        {c.mensagens.map((m, i) => {
          const dia = rotuloDivisor(m.min)
          const novoDia = dia !== ultimoDia
          const agrupado = !novoDia && m.autor === ultimoAutor
          ultimoDia = dia
          const anterior = ultimoAutor
          ultimoAutor = m.autor
          const anteriorMin = i > 0 ? c.mensagens[i - 1].min : 0
          const salto = i > 0 && anteriorMin - m.min > 20_000 && anterior === 'cliente'
          return (
            <div key={m.id}>
              {novoDia && <div className="divider"><span>{dia}</span></div>}
              {salto && (
                <div className="gap">
                  <i /><span>{Math.round((anteriorMin - m.min) / 1440)} dias sem ninguém responder</span><i />
                </div>
              )}
              <Balao m={m} agrupado={agrupado} />
            </div>
          )
        })}
        {digitando && (
          <div className="msg"><div className="msg-col"><div className="bub them"><div className="typing"><i /><i /><i /></div></div></div></div>
        )}
        <div ref={fim} />
      </div>

      <div className="composer">
        <button className="icon-btn"><IcMais /></button>
        <button className="icon-btn"><IcEmoji /></button>
        <div className="field">
          <textarea rows={1} placeholder="Digite uma mensagem" value={rascunho}
            onChange={(e) => setRascunho(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); mandar() }
            }} />
        </div>
        <button className={`send${rascunho ? ' on' : ''}`} onClick={mandar}>{rascunho ? <IcEnviar /> : <IcMic />}</button>
      </div>
    </>
  )
}

/* ------------------------------------------------------------- chat Davi */

function ChatDavi() {
  const { daviItens, daviFase, scan, lerConversas, autorizar, conversas, recuperado, pensando, falarComDavi } = useApp()
  const fim = useRef<HTMLDivElement>(null)
  const [rascunho, setRascunho] = useState('')
  useEffect(() => { fim.current?.scrollIntoView({ behavior: 'smooth' }) }, [daviItens.length, daviFase, scan, pensando])
  const mandar = () => { const t = rascunho.trim(); if (!t || pensando) return; setRascunho(''); void falarComDavi(t) }

  const lidas = Math.round(scan * conversas.length)

  return (
    <>
      <div className="thread-head">
        <Av c={{ iniciais: 'D' }} tam={40} />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
          <span className="th-name">Davi</span>
          <span className="th-sub" style={{ color: recuperado ? '#21C063' : undefined }}>
            {pensando ? 'digitando…' : recuperado ? `${brl(recuperado)} recuperados hoje` : daviFase === 'trabalhando' ? 'vendendo agora' : 'online'}
          </span>
        </div>
        <button className="icon-btn"><IcVideo /></button>
        <button className="icon-btn"><IcLigacaoCheia /></button>
        <button className="icon-btn"><IcBusca size={20} /></button>
        <button className="icon-btn"><IcMenu /></button>
      </div>

      <div className="wall">
        <div className="divider"><span>hoje</span></div>

        {daviItens.map((it) => {
          const texto =
            it.tipo === 'scan'
              ? (scan < 1 ? `Lendo suas conversas… ${lidas} de ${conversas.length}` : `Li as ${conversas.length} conversas ✓`)
              : it.tipo === 'proposta'
                ? `Pronto. Tem ${brl(TOTAL_PARADO)} parados aí, espalhados em ${N_OPORTUNIDADES} clientes.\n\nTem gente que pagou pacote e parou na metade, gente que pediu preço e nunca teve resposta, e gente que fechou e nunca mandou o Pix.\n\nQuer que eu vá atrás?`
                : it.tipo === 'venda'
                  ? `${it.rotulo} · + ${brl(it.valor!)} ✓`
                  : it.texto ?? ''
          const ultimo = it === daviItens[daviItens.length - 1]
          const botoes =
            it.tipo === 'proposta' && daviFase === 'proposta'
              ? [{ t: 'Pode ir buscar', fn: autorizar }, { t: 'Quero ver a lista', fn: () => {} }]
              : ultimo && it.tipo === 'davi' && daviFase === 'apresentando'
                ? [{ t: 'Pode ler', fn: lerConversas }]
                : null
          const meu = it.tipo === 'dono'
          return (
            <div className={`msg${meu ? ' me' : ''}`} key={it.id}>
              <div className="msg-col">
                <div className={`bub ${meu ? 'me' : 'them'}`} style={{ whiteSpace: 'pre-line' }}>
                  {texto}
                  <span className="meta">{hhmm(AGORA)}{meu && <IcTick azul />}</span>
                </div>
                {botoes && (
                  <div className="qr-wrap">
                    {botoes.map((b) => (
                      <button className="qr-btn" key={b.t} onClick={b.fn}>{b.t}</button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )
        })}

        {pensando && (
          <div className="msg"><div className="msg-col">
            <div className="bub them"><div className="typing"><i /><i /><i /></div></div>
          </div></div>
        )}
        <div ref={fim} />
      </div>

      <div className="composer">
        <button className="icon-btn"><IcMais /></button>
        <button className="icon-btn"><IcEmoji /></button>
        <div className="field">
          <textarea rows={1} placeholder="Digite uma mensagem" value={rascunho}
            onChange={(e) => setRascunho(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); mandar() } }} />
        </div>
        <button className={`send${rascunho ? ' on' : ''}`} onClick={mandar}>{rascunho ? <IcEnviar /> : <IcMic />}</button>
      </div>
    </>
  )
}

/* -------------------------------------------------------------------- app */

export default function App() {
  const { fase, aberta, conversas, toasts, daviNaoLidas } = useApp()
  const naoLidasTotal = conversas.reduce((s, c) => s + c.naoLidas, 0) + daviNaoLidas
  if (fase !== 'app') return <QR />

  const c = conversas.find((x) => x.id === aberta)

  return (
    <div className="app">
      <div className="rail">
        <button className="rail-btn on">
          <IcChatCheio />
          {naoLidasTotal > 0 && <span className="rail-dot">{naoLidasTotal}</span>}
        </button>
        <button className="rail-btn"><IcLigacao /></button>
        <button className="rail-btn"><IcStatus /></button>
        <button className="rail-btn"><IcCanal /></button>
        <button className="rail-btn"><IcComunidade /></button>
        <div className="rail-sep" />
        <button className="rail-btn" style={{ position: 'relative' }}>
          <IcCatalogo />
          <span style={{ position: 'absolute', top: 9, right: 9, width: 8, height: 8, borderRadius: 4, background: '#21C063' }} />
        </button>
        <button className="rail-btn"><IcTransmissao /></button>
        <div style={{ flex: 1 }} />
        <button className="rail-btn"><IcMidia /></button>
        <button className="rail-btn"><IcConfig /></button>
        <div className="av" style={{ width: 34, height: 34, fontSize: 13, background: '#3A3C3C', color: '#FAFAFA', marginTop: 6 }}>SL</div>
      </div>

      <Lateral />

      <div className="main">
                {aberta === 'davi' ? <ChatDavi /> : c ? <Conversa_ c={c} /> : (
          <div className="empty">
            <svg width="290" height="190" viewBox="0 0 290 190" fill="none">
              <rect x="62" y="54" width="152" height="102" rx="16" fill="#dff5d8" />
              <rect x="92" y="80" width="66" height="50" rx="7" fill="#a3d977" />
              <path d="M92 105h66M114 80v50M136 80v50" stroke="#dff5d8" strokeWidth="3.4" />
              <circle cx="82" cy="44" r="19" fill="#f2f6f8" />
              <path d="M63 44h38M82 25v38M69 32c8 8 18 8 26 0M69 56c8-8 18-8 26 0" stroke="#c2ced6" strokeWidth="1.5" />
              <path d="M198 96l24-34M222 62h-18M222 62v18" stroke="#3ec26a" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M186 148c16-2 22-12 24-22" stroke="#0fb87f" strokeWidth="0" />
              <path d="M188 128c6-8 20-5 20 5s-14 15-20 20c-6-5-20-10-20-20s14-13 20-5z" fill="#12d39a" />
              <path d="M54 132l-16 14 23 4z" fill="#f2f6f8" />
            </svg>
            <h2>Davi no seu WhatsApp Business</h2>
            <p>Fale com o Davi na conversa fixada no topo. Ele lê tudo que ficou parado e te diz quanto tem de dinheiro esquecido aqui dentro.</p>
            <div className="cripto"><IcCadeado />Suas mensagens são protegidas com criptografia de ponta a ponta</div>
          </div>
        )}
      </div>

      <div className="toasts">
        {toasts.map((t) => (
          <div className="toast" key={t.id}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#21C063" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12.5l5 5L20 6.5" /></svg>
            <b>+ {brl(t.valor)}</b><span>{t.rotulo}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
