import { useEffect, useRef } from 'react'
import QRCode from 'qrcode'
import './landing.css'
import { TOTAL_PARADO, N_OPORTUNIDADES } from './store'

/**
 * Landing pública (rota /). A copy fala com o DONO do pequeno negócio, não com
 * jurado: nada de máquina de estados, modelo ou eval. Só o dinheiro que está
 * parado, quem vai atrás dele e por que o cliente não vai se incomodar.
 * Os números saem do store — se o seed mudar, a landing muda junto.
 */

const brl = (n: number) => n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })

/** Recuperando só 1 em cada 5 compromissos parados. Piso deliberado, não promessa. */
const RECUPERA_20 = Math.round(TOTAL_PARADO * 0.2)

/* ------------------------------------------------------------------ ícones */

const Seta = ({ s = 17 }: { s?: number }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h13" /><path d="M13 6l6 6-6 6" />
  </svg>
)

const Check = ({ s = 20, cor = 'currentColor' }: { s?: number; cor?: string }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={cor} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <path d="M5 13l4.5 4.5L19 7" />
  </svg>
)

const Xis = ({ s = 20 }: { s?: number }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="#A8321C" strokeWidth="2" strokeLinecap="round" style={{ flexShrink: 0 }}>
    <path d="M6 6l12 12" /><path d="M18 6L6 18" />
  </svg>
)

const Faisca = ({ s = 18 }: { s?: number }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3l2.2 5.6L20 10l-5.8 1.4L12 17l-2.2-5.6L4 10l5.8-1.4L12 3z" />
  </svg>
)

const IcBalao = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#A15A08" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 5h16v11H8l-4 4V5z" /><path d="M8 9h8" /><path d="M8 12.5h5" />
  </svg>
)

const IcLupa = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#A15A08" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="7" /><path d="M16.5 16.5L21 21" /><path d="M11 8v6" /><path d="M8 11h6" />
  </svg>
)

const IcAviao = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#A15A08" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 12l16-7-6 16-2.5-6.5L4 12z" />
  </svg>
)

/* ---------------------------------------------------------------- QR real */

function QrDoApp() {
  const canvas = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    if (!canvas.current) return
    QRCode.toCanvas(canvas.current, `${window.location.origin}/app`, {
      width: 252, margin: 0, errorCorrectionLevel: 'M',
      color: { dark: '#17130F', light: '#FBF8F3' },
    })
  }, [])
  return <canvas ref={canvas} aria-label="QR code que abre o Davi" />
}

const Rotulo = ({ n, texto }: { n: string; texto: string }) => (
  <div className="lp-rot">
    <b className="mono">{n}</b>
    <span className="mono">{texto}</span>
    <i />
  </div>
)

/* ------------------------------------------------------------------ página */

export default function Landing() {
  useEffect(() => {
    document.body.classList.add('landing-mode')
    return () => document.body.classList.remove('landing-mode')
  }, [])

  return (
    <div className="lp">

      {/* ----------------------------------------------------------- nav */}
      <div className="lp-wrap">
        <nav className="lp-nav">
          <div className="lp-marca">
            <span className="serif">davi</span>
            <span className="lp-ponto" />
          </div>
          <div className="lp-nav-links">
            <a href="#parado">O que está parado</a>
            <a href="#cena">Como funciona</a>
            <a href="#conta">Quanto vale</a>
            <a className="lp-btn sm" href="/app">Ver rodando <Seta s={15} /></a>
          </div>
        </nav>

        {/* --------------------------------------------------------- hero */}
        <section className="lp-hero">
          <div className="lp-hero-txt">
            <h1 className="serif lp-h1">
              Tem dinheiro parado no seu <span className="lp-grifo">WhatsApp</span>.
            </h1>
            <p className="lp-sub">
              Orçamento que ninguém respondeu. Pacote pago pela metade. O "depois eu te falo" que nunca voltou.
              O Davi acha tudo isso sozinho, fala com o cliente no seu jeito de falar e traz a venda de volta.
            </p>
            <div className="lp-cta-linha">
              <a className="lp-btn" href="/app">Ver o Davi rodando <Seta /></a>
              <a className="lp-link-sub" href="#cena">Ver uma venda voltar</a>
            </div>
            <div className="lp-selo mono">
              <span>Funciona no WhatsApp que você já usa</span><i /><span>sem instalar nada</span>
            </div>
          </div>

          <div className="lp-app">
            <div className="lp-app-head">
              <div className="lp-av-davi"><Faisca /></div>
              <div className="lp-app-head-txt">
                <span className="lp-app-nome">Davi</span>
                <span className="lp-app-sub">leu suas conversas · 24 clientes</span>
              </div>
              <div className="lp-tag"><i />trabalhando</div>
            </div>
            <div className="lp-app-corpo">
              <div className="lp-bub them">Terminei de ler tudo. Achei dinheiro parado que ninguém foi atrás.</div>

              <div className="lp-cartao">
                <div className="lp-cartao-rot">Parado agora</div>
                <div className="lp-cartao-val">{brl(TOTAL_PARADO)}</div>
                <div className="lp-cartao-sub">em {N_OPORTUNIDADES} clientes esperando resposta</div>
                <div className="lp-item"><span>Pacote pago, parou na 6ª de 10 sessões</span><span>R$ 420</span></div>
                <div className="lp-item"><span>Orçamento sem resposta há 9 dias</span><span>R$ 1.050</span></div>
                <div className="lp-item"><span>Pix prometido que nunca caiu</span><span>R$ 980</span></div>
                <div className="lp-item mudo"><span>+ {N_OPORTUNIDADES - 3} clientes</span></div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <div className="lp-qrbtn">Pode ir atrás de todos</div>
                <div className="lp-qrbtn">Quero aprovar um por um</div>
              </div>

              <div className="lp-app-nota">Você não digitou nada. Tudo isso já estava nas suas conversas.</div>
            </div>
          </div>
        </section>

        {/* ------------------------------------------- 01 o que está parado */}
        <section className="lp-sec" id="parado">
          <Rotulo n="01" texto="O que está parado" />
          <div className="lp-2col">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
              <h2 className="serif lp-h2">
                Você não perde venda pro concorrente. Perde no <em style={{ fontStyle: 'italic' }}>silêncio</em>.
              </h2>

              <svg className="lp-timeline" width="620" height="64" viewBox="0 0 620 64" fill="none">
                <line x1="0" y1="32" x2="270" y2="32" stroke="#17130F" strokeWidth="1.5" />
                <circle cx="26" cy="32" r="6" fill="#17130F" />
                <circle cx="118" cy="32" r="6" fill="#17130F" />
                <circle cx="210" cy="32" r="6" fill="#17130F" />
                <line x1="270" y1="32" x2="600" y2="32" stroke="#F0A63C" strokeWidth="1.5" strokeDasharray="2 12" strokeLinecap="round" />
                <text x="0" y="58" fill="#6E635A" fontFamily="IBM Plex Mono, monospace" fontSize="11" letterSpacing="0.06em">ORÇAMENTO</text>
                <text x="96" y="58" fill="#6E635A" fontFamily="IBM Plex Mono, monospace" fontSize="11" letterSpacing="0.06em">"VOU PENSAR"</text>
                <text x="212" y="58" fill="#6E635A" fontFamily="IBM Plex Mono, monospace" fontSize="11" letterSpacing="0.06em">"TE FALO"</text>
                <text x="420" y="58" fill="#A15A08" fontFamily="IBM Plex Mono, monospace" fontSize="11" letterSpacing="0.06em">NINGUÉM VOLTOU</text>
              </svg>

              <p className="lp-p" style={{ maxWidth: 560 }}>
                Não é falta de cliente. É que o dia acaba, chega gente nova no WhatsApp, e quem
                pediu orçamento na terça desce na lista. Ninguém volta. E ninguém lembra que não voltou.
              </p>
            </div>

            <div className="lp-stats">
              <div className="lp-stat">
                <b className="serif">8 em 10</b>
                <span>pequenos negócios no Brasil vendem pelo WhatsApp</span>
                <small className="mono">SEBRAE · PULSO DOS PEQUENOS NEGÓCIOS</small>
              </div>
              <div className="lp-stat">
                <b className="serif" style={{ color: '#A15A08' }}>20 a 40%</b>
                <span>das vendas se perdem só por falta de resposta</span>
                <small className="mono">DATACRAZY</small>
              </div>
              <div className="lp-stat">
                <b className="serif">{brl(TOTAL_PARADO)}</b>
                <span>foi o que o Davi achou parado num salão de bairro, em trinta segundos</span>
                <small className="mono">{N_OPORTUNIDADES} CLIENTES ESPERANDO RESPOSTA</small>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* ------------------------------------------------- 02 o que ele faz */}
      <section className="lp-banda">
        <div className="lp-wrap">
          <Rotulo n="02" texto="O que ele faz" />
          <h2 className="serif lp-h2" style={{ maxWidth: 760, marginBottom: 48 }}>
            É um vendedor que já leu tudo, nunca esquece e sabe a hora de parar.
          </h2>
          <div className="lp-cards">
            <div className="lp-card">
              <IcBalao />
              <h3>Lê tudo que já rolou</h3>
              <p>Todas as suas conversas, do começo. Inclusive áudio, e inclusive aquele cliente de sete meses atrás. Você não precisa contar nada pra ele.</p>
            </div>
            <div className="lp-card">
              <IcLupa />
              <h3>Acha o que ficou pra trás</h3>
              <p>Orçamento sem resposta, pacote pago e não usado, "vou pensar" que venceu, Pix prometido que nunca caiu. Com nome, valor e há quanto tempo parou.</p>
            </div>
            <div className="lp-card">
              <IcAviao />
              <h3>Fala no seu jeito</h3>
              <p>Ele aprende a escrever lendo as suas próprias respostas. O cliente recebe uma mensagem sua, não um robô se apresentando.</p>
            </div>
          </div>
        </div>
      </section>

      {/* -------------------------------------------------- 03 como funciona */}
      <div className="lp-wrap">
        <section className="lp-sec" id="cena">
          <Rotulo n="03" texto="Como funciona na prática" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, paddingBottom: 48 }}>
            <h2 className="serif lp-h2" style={{ maxWidth: 820 }}>
              A Fernanda sumiu há quatro meses com quatro sessões pagas.
            </h2>
            <p className="lp-p">Ninguém no salão lembrava disso. O Davi lembrou — e trouxe ela de volta no mesmo dia.</p>
          </div>

          <div className="lp-2col inverso">
            <div className="lp-app">
              <div className="lp-app-head">
                <div className="lp-av-fk">FK</div>
                <div className="lp-app-head-txt">
                  <span className="lp-app-nome">Fernanda Klein</span>
                  <span className="lp-app-sub">online</span>
                </div>
              </div>
              <div className="lp-app-corpo" style={{ gap: 2 }}>
                <div className="lp-divisor">4 de abril</div>
                <div className="lp-bub them">oi meninas! consigo remarcar a de terça? surgiu uma coisa aqui no trabalho</div>
                <div className="lp-bub me" style={{ marginTop: 6 }}>Oi Fê! Claro, me fala um dia que eu vejo aqui 😊</div>
                <div className="lp-bub them" style={{ marginTop: 6 }}>vou ver minha agenda e te falo!</div>

                <div className="lp-silencio"><i /><span>124 dias de silêncio</span><i /></div>

                <div className="lp-bub them">sumi né kkkk ainda tenho sessão sobrando?</div>
                <div className="lp-bub me" style={{ marginTop: 14 }}>Fernanda!! Tem sim, sobraram 4 sessões do seu laser, e elas não vencem 😊 Reservo pra vc essa semana?</div>
                <div className="lp-bub-nota">escrito pelo Davi · enviado depois que você aprovou</div>
                <div className="lp-bub them" style={{ marginTop: 14 }}>quero sim!</div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div className="mono" style={{ fontSize: 12, color: '#9A8E82', letterSpacing: '.08em', textTransform: 'uppercase' }}>
                  O que o Davi entendeu sozinho
                </div>
                <div className="lp-campos">
                  <div className="lp-campo"><b className="mono">o que ela tem</b><span>4 de 10 sessões de laser, <em>já pagas — R$ 420 do bolso dela</em></span></div>
                  <div className="lp-campo"><b className="mono">por que parou</b><span>esquecimento, <em>não foi preço e não foi briga</em></span></div>
                  <div className="lp-campo"><b className="mono">está quente?</b><span style={{ color: '#A15A08' }}>muito <em>— ela mesma reabriu a conversa hoje</em></span></div>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div className="mono" style={{ fontSize: 12, color: '#9A8E82', letterSpacing: '.08em', textTransform: 'uppercase' }}>
                  E aí decidiu como um bom vendedor
                </div>
                <div className="lp-decisoes">
                  <div className="lp-decisao">
                    <b className="mono">QUANDO FALAR</b>
                    <strong>Hoje</strong>
                    <span>Ela mandou mensagem há 42 minutos. É agora ou esfria de novo.</span>
                  </div>
                  <div className="lp-decisao">
                    <b className="mono">O QUE FALAR</b>
                    <strong>Que as sessões não vencem</strong>
                    <span>Não precisou dar desconto. O que trava ela é achar que perdeu o que pagou.</span>
                  </div>
                  <div className="lp-decisao parar">
                    <b className="mono">QUANDO PARAR</b>
                    <strong>No 3º lembrete</strong>
                    <span>Se não responder até lá, ele para e só volta daqui um mês.</span>
                  </div>
                </div>
              </div>

              <div className="lp-resultado">
                <Check s={22} cor="#21C063" />
                <span>Remarcou as 4 sessões e ainda levou o combo de limpeza.</span>
                <b className="serif">R$ 510</b>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* -------------------------------------- 04 ele não queima o cliente */}
      <section className="lp-banda">
        <div className="lp-wrap">
          <Rotulo n="04" texto="Seu cliente não vai se incomodar" />
          <div className="lp-2col">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              <h2 className="serif lp-h2">Saber a hora de parar também é o trabalho dele.</h2>
              <p className="lp-p" style={{ maxWidth: 520 }}>
                O seu medo é justo: uma mensagem errada não custa uma mensagem, custa uma cliente.
                Por isso ele tem freio — e o freio não é opinião dele, é regra.
              </p>
              <div className="lp-guardas">
                <div className="lp-guarda"><b className="mono">NUNCA</b><span>inventa um preço que você não falou</span></div>
                <div className="lp-guarda"><b className="mono">NUNCA</b><span>promete um horário que a sua agenda não tem</span></div>
                <div className="lp-guarda"><b className="mono">NUNCA</b><span>insiste depois do terceiro lembrete sem resposta</span></div>
                <div className="lp-guarda"><b className="mono">NUNCA</b><span>manda nada em dúvida — nesse caso ele te pergunta antes</span></div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <div className="lp-recusa">
                <div className="lp-recusa-tit"><Xis /><span>Aqui ele se recusou a mandar</span></div>
                <p className="lp-p" style={{ fontSize: 16 }}>
                  A Priscila já levou três lembretes e não respondeu nenhum. Um quarto quase nunca traz
                  resposta — traz bloqueio. O Davi parou sozinho e avisou você.
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                  <span className="lp-pill mono">PAUSADO POR 30 DIAS</span>
                  <span className="mono" style={{ fontSize: 12, color: '#9A8E82' }}>R$ 980 · sumiu depois de fechar</span>
                </div>
              </div>

              <div className="lp-nota">
                <span className="mono" style={{ fontSize: 12, color: '#9A8E82', letterSpacing: '.06em' }}>QUEM MANDA É VOCÊ</span>
                <p className="lp-p" style={{ fontSize: 16 }}>
                  Nada sai sem a sua autorização. Você pode soltar tudo de uma vez, aprovar
                  mensagem por mensagem, ou dizer <strong style={{ color: '#17130F', fontWeight: 600 }}>"para com a Bruna"</strong> — e ele para.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------ 05 a conta */}
      <section className="lp-banda-dark" id="conta">
        <div className="lp-wrap">
          <Rotulo n="05" texto="Quanto isso vale" />
          <div className="lp-conta">
            <div>
              <div className="serif lp-conta-num">{brl(RECUPERA_20)}</div>
              <p className="lp-conta-cap">
                é o que volta pro caixa recuperando só 1 em cada 5 clientes parados —
                a conta mais conservadora que a gente conseguiu fazer.
              </p>
            </div>
            <div>
              <div className="lp-conta-linha"><b>Parado no WhatsApp desse salão</b><span>{brl(TOTAL_PARADO)}</span></div>
              <div className="lp-conta-linha"><b>Clientes esperando resposta</b><span>{N_OPORTUNIDADES}</span></div>
              <div className="lp-conta-linha"><b>Tempo que você gasta pra isso</b><span>zero</span></div>
              <div className="lp-conta-linha"><b>O que você precisa preencher</b><span>nada</span></div>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------ 06 começar */}
      <div className="lp-wrap">
        <section className="lp-sec">
          <Rotulo n="06" texto="Como começar" />
          <div className="lp-2col">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
              <h2 className="serif lp-h2" style={{ maxWidth: 560 }}>Você aponta a câmera e acabou.</h2>
              <div className="lp-trio">
                <div className="lp-trio-item"><Check /><span>Nada para instalar.</span></div>
                <div className="lp-trio-item"><Check /><span>Nada para preencher.</span></div>
                <div className="lp-trio-item"><Check /><span>Nada muda na sua rotina.</span></div>
              </div>
              <p className="lp-p" style={{ maxWidth: 520 }}>
                O Davi entra no WhatsApp que você já usa, do jeito que você já usa. Em quarenta
                segundos ele te diz quanto tem parado aí dentro.
              </p>
              <a className="lp-btn" href="/app" style={{ alignSelf: 'flex-start' }}>Abrir o Davi <Seta /></a>
            </div>

            <div className="lp-qr">
              <QrDoApp />
              <div className="lp-qr-txt">
                <b>Aponte a câmera</b>
                <span>o Davi entra em 40 segundos</span>
              </div>
            </div>
          </div>
        </section>

        {/* ------------------------------------------------------- fecho */}
        <section className="lp-fecho">
          <h2 className="serif">Todo pequeno negócio merece seu Davi.</h2>
          <div className="lp-fecho-linha">
            <div className="lp-fecho-botoes">
              <a className="lp-btn" href="/app">Ver o Davi rodando <Seta /></a>
              <a className="lp-btn ghost" href="[LINK DO VÍDEO]">Ver o vídeo de 1 minuto</a>
            </div>
            <p>Você não precisa de um sistema novo pra preencher. O dinheiro já está nas suas conversas.</p>
          </div>
        </section>

        <footer className="lp-rodape">
          <div className="lp-marca">
            <span className="serif">davi</span>
            <span className="lp-ponto" />
          </div>
          <div className="lp-rodape-meta mono">
            <span>[NOMES DA EQUIPE]</span><i /><span>OpenAI Hackathon Brasil · 2026</span>
          </div>
        </footer>
      </div>
    </div>
  )
}
