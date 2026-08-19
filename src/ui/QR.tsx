import { useEffect, useRef, useState } from 'react'
import QRCode from 'qrcode'
import { IcDavi } from './Icons'
import { useApp } from '../store'

const gerarCodigo = () =>
  Array.from({ length: 4 }, () => Math.random().toString(36).slice(2, 6).toUpperCase()).join('-')

export default function QR() {
  const conectar = useApp((s) => s.conectar)
  const fase = useApp((s) => s.fase)
  const [codigo, setCodigo] = useState(gerarCodigo)
  const [expirado, setExpirado] = useState(false)
  const canvas = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!canvas.current) return
    QRCode.toCanvas(canvas.current, `https://davi.app/pair/${codigo}`, {
      width: 264, margin: 0, errorCorrectionLevel: 'H',
      color: { dark: '#111b21', light: '#ffffff' },
    })
    setExpirado(false)
    const t = setTimeout(() => setExpirado(true), 20_000)
    return () => clearTimeout(t)
  }, [codigo])

  // qualquer tecla ou clique = pareado
  useEffect(() => {
    if (fase !== 'qr') return
    const go = () => conectar()
    window.addEventListener('keydown', go)
    window.addEventListener('click', go)
    return () => { window.removeEventListener('keydown', go); window.removeEventListener('click', go) }
  }, [fase, conectar])

  if (fase === 'conectando') {
    return (
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 22 }}>
        <div className="av davi" style={{ width: 64, height: 64 }}><IcDavi size={30} /></div>
        <div style={{ fontSize: 19, color: '#e9edef' }}>Conectando ao seu WhatsApp…</div>
        <div style={{ width: 210, height: 3, background: '#2a3942', borderRadius: 2, overflow: 'hidden' }}>
          <div style={{ height: 3, background: '#00a884', animation: 'carrega 1.3s ease-out forwards' }} />
        </div>
        <style>{'@keyframes carrega { from { width: 0 } to { width: 210px } }'}</style>
      </div>
    )
  }

  return (
    <div style={{ height: '100%', overflowY: 'auto', background: '#111b21' }}>
      <div style={{ maxWidth: 1050, margin: '0 auto', padding: '38px 30px 60px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 11, marginBottom: 34 }}>
          <div className="av davi" style={{ width: 34, height: 34 }}><IcDavi size={17} /></div>
          <span style={{ fontSize: 14, letterSpacing: 3.5, textTransform: 'uppercase', color: '#8696a0', fontWeight: 600 }}>Davi</span>
        </div>

        <div style={{ background: '#202c33', borderRadius: 6, padding: '56px 60px', display: 'flex', gap: 70, alignItems: 'center', boxShadow: '0 17px 50px 0 rgba(0,0,0,.19)' }}>
          <div style={{ flex: 1 }}>
            <h1 style={{ fontSize: 30, fontWeight: 300, margin: '0 0 34px', color: '#e9edef', letterSpacing: -.3 }}>
              Conecte o Davi ao WhatsApp do seu negócio
            </h1>
            <ol style={{ margin: 0, paddingLeft: 20, color: '#d1d7db', fontSize: 15.5, lineHeight: '30px' }}>
              <li>Abra o WhatsApp no seu celular</li>
              <li>Toque em <b style={{ fontWeight: 600 }}>Mais opções</b> e depois em <b style={{ fontWeight: 600 }}>Dispositivos conectados</b></li>
              <li>Toque em <b style={{ fontWeight: 600 }}>Conectar dispositivo</b></li>
              <li>Aponte o celular para esta tela</li>
            </ol>
            <div style={{ marginTop: 30, paddingTop: 22, borderTop: '1px solid #2a3942', fontSize: 13.5, color: '#8696a0', lineHeight: '20px' }}>
              O Davi lê o histórico para achar o que ficou parado. Ele não manda nenhuma mensagem sem você autorizar.
            </div>
          </div>

          <div style={{ position: 'relative', background: '#fff', padding: 12, borderRadius: 6, flexShrink: 0 }}>
            <canvas ref={canvas} style={{ display: 'block', width: 264, height: 264 }} />
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
              <div style={{ width: 54, height: 54, borderRadius: 12, background: '#111b21', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f0a63c', border: '3px solid #fff' }}>
                <IcDavi size={26} />
              </div>
            </div>
            {expirado && (
              <button
                onClick={(e) => { e.stopPropagation(); setCodigo(gerarCodigo()) }}
                style={{ position: 'absolute', inset: 12, background: 'rgba(255,255,255,.93)', borderRadius: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#00a884', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round"><path d="M20 11a8 8 0 1 0-2.3 5.7M20 5v6h-6" /></svg>
                </div>
                <span style={{ color: '#111b21', fontSize: 14.5, fontWeight: 500 }}>Clique para recarregar o código</span>
              </button>
            )}
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: 26, fontSize: 13, color: '#667781', fontVariantNumeric: 'tabular-nums' }}>
          código de pareamento {codigo}
        </div>
      </div>
    </div>
  )
}
