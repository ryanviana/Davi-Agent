import { useEffect, useMemo, useRef, useState } from 'react'
import { useApp, TOTAL_PARADO, N_OPORTUNIDADES, N_SEM_RESPOSTA } from './store'
import type { Conversa, Mensagem } from './types'
import QR from './ui/QR'
import {
  IcStatus, IcMenu, IcBusca, IcEmoji, IcClipe,
  IcMic, IcEnviar, IcDavi, IcPin, IcTick, IcPlay, IcNovaConversa, IcConfig,
  IcChatCheio, IcLigacao, IcComunidade, IcCatalogo, IcTransmissao, IcMidia, IcSeta, IcCadeado,
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
            {digitando ? <i style={{ color: '#00d18f', fontStyle: 'normal' }}>digitando…</i>
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
        <span className="left-title">Studio Lumi</span>
        <div className="head-icons">
          <button className="icon-btn"><IcNovaConversa /></button>
          <button className="icon-btn"><IcMenu /></button>
        </div>
      </div>
      <div className="search-wrap">
        <div className="search">
          <span style={{ color: '#8696a0' }}><IcBusca /></span>
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
          <span className="th-sub">{digitando ? <i style={{ color: '#00d18f', fontStyle: 'normal' }}>digitando…</i> : 'online'}</span>
        </div>
        {rodando && <span className="tag-davi"><i />Davi conduzindo</span>}
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
        <button className="icon-btn"><IcEmoji /></button>
        <button className="icon-btn"><IcClipe /></button>
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
  const { daviItens, daviFase, scan, lerConversas, autorizar, conversas } = useApp()
  const fim = useRef<HTMLDivElement>(null)
  useEffect(() => { fim.current?.scrollIntoView({ behavior: 'smooth' }) }, [daviItens.length, daviFase, scan])

  return (
    <>
      <div className="thread-head">
        <Av c={{ iniciais: 'D' }} tam={40} />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
          <span className="th-name">Davi</span>
          <span className="th-sub" style={{ color: '#00d18f' }}>
            {daviFase === 'trabalhando' ? 'vendendo agora' : 'online'}
          </span>
        </div>
      </div>

      <div className="wall">
        <div className="divider"><span>hoje</span></div>
        {daviItens.map((it) => {
          if (it.tipo === 'davi') return (
            <div className="msg" key={it.id}><div className="msg-col">
              <div className="bub them">{it.texto}<span className="meta">{hhmm(AGORA)}</span></div>
            </div></div>
          )
          if (it.tipo === 'scan') return (
            <div className="msg" key={it.id}><div className="msg-col" style={{ maxWidth: '72%' }}>
              <div className="card-davi">
                <div className="scan">
                  <span className="card-lbl">LENDO</span>
                  <div className="scan-bar"><i style={{ width: `${scan * 100}%` }} /></div>
                  <span className="scan-txt">{Math.round(scan * conversas.length)} de {conversas.length} conversas</span>
                </div>
              </div>
            </div></div>
          )
          if (it.tipo === 'proposta') return (
            <div className="msg" key={it.id}><div className="msg-col" style={{ maxWidth: '72%' }}>
              <div className="card-davi">
                <span className="card-lbl">ACHEI</span>
                <span className="card-num">{brl(TOTAL_PARADO)}</span>
                <span className="card-sub">
                  parados em {N_OPORTUNIDADES} clientes. Tem gente que pagou pacote e sumiu no meio, gente esperando preço,
                  e gente que fechou e nunca mandou o Pix.
                </span>
                <div className="acts">
                  <button className="act" onClick={autorizar} disabled={useApp.getState().daviFase !== 'proposta'}>
                    Pode buscar
                  </button>
                  <button className="act ghost">Quero ver antes</button>
                </div>
              </div>
            </div></div>
          )
          return (
            <div className="msg" key={it.id}><div className="msg-col" style={{ maxWidth: '72%' }}>
              <div className="card-davi card-venda">
                <span className="card-lbl">VENDA FECHADA</span>
                <span className="card-num">+ {brl(it.valor!)}</span>
                <span className="card-sub">{it.rotulo}</span>
              </div>
            </div></div>
          )
        })}

        {daviFase === 'apresentando' && (
          <div className="msg"><div className="msg-col" style={{ maxWidth: '72%' }}>
            <div className="acts" style={{ marginTop: 6 }}>
              <button className="act" onClick={lerConversas}>Pode ler</button>
            </div>
          </div></div>
        )}
        <div ref={fim} />
      </div>

      <div className="composer">
        <button className="icon-btn"><IcEmoji /></button>
        <div className="field"><textarea rows={1} placeholder="Fale com o Davi" /></div>
        <button className="send"><IcMic /></button>
      </div>
    </>
  )
}

/* -------------------------------------------------------------------- app */

export default function App() {
  const { fase, aberta, conversas, recuperado, toasts, rodando, daviNaoLidas } = useApp()
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
        <button className="rail-btn"><IcComunidade /></button>
        <div className="rail-sep" />
        <button className="rail-btn" style={{ position: 'relative' }}>
          <IcCatalogo />
          <span style={{ position: 'absolute', top: 9, right: 9, width: 8, height: 8, borderRadius: 4, background: '#00d18f' }} />
        </button>
        <button className="rail-btn"><IcTransmissao /></button>
        <div style={{ flex: 1 }} />
        <button className="rail-btn"><IcMidia /></button>
        <button className="rail-btn"><IcConfig /></button>
        <div className="av" style={{ width: 34, height: 34, fontSize: 13, background: '#3b4a54', color: '#cfd9de', marginTop: 6 }}>SL</div>
      </div>

      <Lateral />

      <div className="main">
        {rodando && (
          <div className="davibar">
            <i />
            <b>{brl(recuperado)}</b>
            <span>recuperados hoje · Davi cuidando de {N_OPORTUNIDADES} clientes</span>
          </div>
        )}
        {aberta === 'davi' ? <ChatDavi /> : c ? <Conversa_ c={c} /> : (
          <div className="empty">
            <svg width="290" height="190" viewBox="0 0 290 190" fill="none">
              <rect x="58" y="52" width="150" height="104" rx="14" fill="#1c3a30" />
              <rect x="80" y="78" width="76" height="52" rx="7" fill="#2f8f6b" />
              <path d="M80 100h76M106 78v52M131 78v52" stroke="#1c3a30" strokeWidth="3" />
              <circle cx="86" cy="42" r="17" fill="#233b45" />
              <path d="M69 42h34M86 25v34M74 31c7 7 17 7 24 0M74 53c7-7 17-7 24 0" stroke="#4a6572" strokeWidth="1.6" />
              <path d="M196 92l26-32M222 60h-17M222 60v17" stroke="#25d366" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M196 148c14 0 20-9 22-18" stroke="#25d366" strokeWidth="5" strokeLinecap="round" />
              <path d="M52 136l-14 12 20 4z" fill="#e9edef" />
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
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#00d18f" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12.5l5 5L20 6.5" /></svg>
            <b>+ {brl(t.valor)}</b><span>{t.rotulo}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
