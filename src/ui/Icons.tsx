const s = (p: { d: string; size?: number; w?: number; fill?: string }) => (
  <svg width={p.size ?? 22} height={p.size ?? 22} viewBox="0 0 24 24" fill={p.fill ?? 'none'}
    stroke={p.fill ? 'none' : 'currentColor'} strokeWidth={p.w ?? 1.8} strokeLinecap="round" strokeLinejoin="round">
    <path d={p.d} />
  </svg>
)

export const IcChat = (p: { size?: number }) => s({ ...p, d: 'M21 11.5a8.4 8.4 0 0 1-9 8.4 8.6 8.6 0 0 1-3.8-.9L3 21l2-4.9A8.4 8.4 0 0 1 12 3a8.4 8.4 0 0 1 9 8.5z' })
export const IcStatus = (p: { size?: number }) => s({ ...p, d: 'M12 3a9 9 0 1 0 9 9' })
export const IcCanal = (p: { size?: number }) => s({ ...p, d: 'M4 9v6h4l5 4V5L8 9H4zM17 9.5a4 4 0 0 1 0 5' })
export const IcNovo = (p: { size?: number }) => s({ ...p, d: 'M12 5v14M5 12h14' })
export const IcMenu = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
    <circle cx="12" cy="5" r="1.6" /><circle cx="12" cy="12" r="1.6" /><circle cx="12" cy="19" r="1.6" />
  </svg>
)
export const IcBusca = (p: { size?: number }) => (
  <svg width={p.size ?? 17} height={p.size ?? 17} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <circle cx="11" cy="11" r="7" /><path d="M20 20l-4-4" />
  </svg>
)
export const IcEmoji = () => s({ d: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM9 10h.01M15 10h.01M8.5 14.5a4.5 4.5 0 0 0 7 0', size: 24 })
export const IcClipe = () => s({ d: 'M17 8l-7.6 7.6a2.6 2.6 0 0 0 3.7 3.7L21 11a4.6 4.6 0 0 0-6.5-6.5L6 13a6.6 6.6 0 0 0 9.4 9.3', size: 24 })
export const IcMic = () => s({ d: 'M12 15a3 3 0 0 0 3-3V6a3 3 0 0 0-6 0v6a3 3 0 0 0 3 3zM19 11a7 7 0 0 1-14 0M12 18v3', size: 24 })
export const IcEnviar = () => s({ d: 'M21 3L3 10.5l7.5 3L14 21z', size: 22, w: 2 })
export const IcDavi = (p: { size?: number }) => (
  <svg width={p.size ?? 22} height={p.size ?? 22} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 18c4-1 5-4 5-7 0-2.5 1.4-4.5 3.5-4.5S16 8.2 16 10.4c0 2.6-2 4.1-4 4.1" />
    <circle cx="19" cy="6" r="2.1" />
  </svg>
)
export const IcPin = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M14 3l7 7-3 1-1 5-4-4-5 6 1-7-4-4 5-1z" /></svg>
)
export const IcTick = (p: { azul?: boolean }) => (
  <svg width="16" height="11" viewBox="0 0 18 12" fill="none" stroke={p.azul ? '#53bdeb' : 'currentColor'} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 6.5l3.2 3.2L10.5 2" /><path d="M6.5 8.6l1.2 1.1L14 2" />
  </svg>
)
export const IcPlay = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5.5v13l11-6.5z" /></svg>
)

export const IcNovaConversa = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 12.5V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h6.5" />
    <path d="M18.4 3.6a2 2 0 0 1 2.8 2.8L13.5 14l-3.5.9.9-3.5z" />
  </svg>
)
export const IcConfig = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-1.8-.3 1.6 1.6 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1A1.6 1.6 0 0 0 9 19.4a1.6 1.6 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.6 1.6 0 0 0 .3-1.8 1.6 1.6 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1A1.6 1.6 0 0 0 4.6 9a1.6 1.6 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.6 1.6 0 0 0 1.8.3H9a1.6 1.6 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.6 1.6 0 0 0 1 1.5 1.6 1.6 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0-.3 1.8V9a1.6 1.6 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.6 1.6 0 0 0-1.5 1z" />
  </svg>
)

export const IcChatCheio = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 3c-5 0-9 3.6-9 8.1 0 2.4 1.1 4.5 2.9 6L5 21l4.4-1.7c.8.2 1.7.3 2.6.3 5 0 9-3.6 9-8.1S17 3 12 3z" />
  </svg>
)
export const IcLigacao = () => (
  <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6.5 3h-2A1.5 1.5 0 0 0 3 4.6C3 13 11 21 19.4 21A1.5 1.5 0 0 0 21 19.5v-2a1.3 1.3 0 0 0-1-1.3l-3-.7a1.3 1.3 0 0 0-1.3.5l-1 1.3a14 14 0 0 1-5-5l1.3-1a1.3 1.3 0 0 0 .5-1.3l-.7-3A1.3 1.3 0 0 0 6.5 3z" />
  </svg>
)
export const IcComunidade = () => (
  <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="9" cy="8" r="3.2" /><path d="M2.5 19a6.5 6.5 0 0 1 13 0" />
    <circle cx="17.5" cy="9" r="2.4" /><path d="M16 14.2a5.6 5.6 0 0 1 5.5 4.8" />
  </svg>
)
export const IcCatalogo = () => (
  <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3.5 9.5h17V19a1.5 1.5 0 0 1-1.5 1.5H5A1.5 1.5 0 0 1 3.5 19z" />
    <path d="M3 9.5 4.6 4.6A1.5 1.5 0 0 1 6 3.5h12a1.5 1.5 0 0 1 1.4 1.1L21 9.5" />
    <path d="M8.2 3.6 7.5 9.5M15.8 3.6l.7 5.9" />
  </svg>
)
export const IcTransmissao = () => (
  <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 9v5h3l6 4V5L7 9H4z" /><path d="M17 9.2a4 4 0 0 1 0 5.6M19.6 6.6a7.6 7.6 0 0 1 0 10.8" />
  </svg>
)
export const IcMidia = () => (
  <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4.5" width="18" height="15" rx="2.2" /><circle cx="8.6" cy="10" r="1.7" />
    <path d="m3.6 17.4 4.8-4.3 3.6 3.2 3.4-3.1 4.6 4.2" />
  </svg>
)
export const IcSeta = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
)
export const IcMudo = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 13V10a6 6 0 0 0-8.2-5.6M6 9v4l-2 3h13M11 20a1.6 1.6 0 0 0 2.6 0M3 3l18 18" />
  </svg>
)
export const IcCadeado = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="4.5" y="10.5" width="15" height="10" rx="2" /><path d="M8 10.5V7.5a4 4 0 0 1 8 0v3" />
  </svg>
)
