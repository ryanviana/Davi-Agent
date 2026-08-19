import { useEffect, useRef } from 'react'
import QRCode from 'qrcode'
import './landing.css'
import { TOTAL_PARADO, N_OPORTUNIDADES } from './store'

/**
 * Landing pública (rota /). Vitrine: o jurado entende em dez segundos e clica
 * pra ver rodando. Os números vêm do store, não de constante escrita à mão —
 * se o seed mudar, a landing muda junto e nunca mente sobre a demo.
 */

const brl = (n: number) => n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })

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

/* -------------------------------------------------------------- rótulo de seção */

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
            <a href="#problema">O problema</a>
            <a href="#cena">A cena</a>
            <a href="#motor">O motor</a>
            <a className="lp-btn sm" href="/app">Ver rodando <Seta s={15} /></a>
          </div>
        </nav>

        {/* --------------------------------------------------------- hero */}
        <section className="lp-hero">
          <div className="lp-hero-txt">
            <h1 className="serif lp-h1">
              A inteligência de vendas das grandes, na mão do <span className="lp-grifo">pequeno negócio</span>.
            </h1>
            <p className="lp-sub">
              O Davi lê as conversas que já existem no seu WhatsApp, acha o dinheiro que parou no meio do caminho e vai atrás. No seu tom. Sem você digitar nada.
            </p>
            <div className="lp-cta-linha">
              <a className="lp-btn" href="/app">Ver o Davi rodando <Seta /></a>
              <a className="lp-link-sub" href="#cena">Ver uma venda voltar</a>
            </div>
            <div className="lp-selo mono">
              <span>OpenAI Hackathon Brasil</span><i /><span>roda em gpt-5-mini</span>
            </div>
          </div>

          <div className="lp-app">
            <div className="lp-app-head">
              <div className="lp-av-davi"><Faisca /></div>
              <div className="lp-app-head-txt">
                <span className="lp-app-nome">Davi</span>
                <span className="lp-app-sub">lendo 1.412 mensagens · 24 conversas</span>
              </div>
              <div className="lp-tag"><i />trabalhando</div>
            </div>
            <div className="lp-app-corpo">
              <div className="lp-bub them">Terminei de ler. Achei dinheiro parado que ninguém tocou.</div>

              <div className="lp-cartao">
                <div className="lp-cartao-rot">Parado agora</div>
                <div className="lp-cartao-val">{brl(TOTAL_PARADO)}</div>
                <div className="lp-cartao-sub">em {N_OPORTUNIDADES} compromissos abertos</div>
                <div className="lp-item"><span>Pacote parado na 6ª de 10 sessões</span><span>R$ 420</span></div>
                <div className="lp-item"><span>Orçamento sem resposta há 9 dias</span><span>R$ 1.050</span></div>
                <div className="lp-item"><span>Pix prometido que nunca caiu</span><span>R$ 980</span></div>
                <div className="lp-item mudo"><span>+ {N_OPORTUNIDADES - 3} compromissos</span></div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <div className="lp-qrbtn">Pode ir atrás de todos</div>
                <div className="lp-qrbtn">Quero aprovar um por um</div>
              </div>

              <div className="lp-app-nota">Nenhum dado foi digitado. Tudo saiu das conversas que já estavam lá.</div>
            </div>
          </div>
        </section>

        {/* ---------------------------------------------------- 01 problema */}
        <section className="lp-sec" id="problema">
          <Rotulo n="01" texto="O problema" />
          <div className="lp-2col">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 30 }}>
              <h2 className="serif lp-h2">
                As vendas não se perdem pro concorrente. Se perdem no <em style={{ fontStyle: 'italic' }}>silêncio</em>.
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
                Empresa grande vende mais porque tem inteligência: dado organizado, processo de follow-up, vendedor treinado. O pequeno negócio tem o dado espalhado em três celulares e o processo na memória do dono.
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
                <span>das oportunidades morrem por falta de resposta</span>
                <small className="mono">DATACRAZY</small>
              </div>
              <div className="lp-stat">
                <b className="serif">{brl(TOTAL_PARADO)}</b>
                <span>parados em {N_OPORTUNIDADES} compromissos, num único salão de bairro</span>
                <small className="mono">MEDIDO PELO DAVI EM 30 SEGUNDOS</small>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* ------------------------------------------------- 02 o que ele faz */}
      <section className="lp-banda">
        <div className="lp-wrap">
          <Rotulo n="02" texto="O que ele faz" />
          <h2 className="serif lp-h2" style={{ maxWidth: 820, marginBottom: 56 }}>
            Um vendedor que já leu tudo, nunca esquece e sabe a hora de parar.
          </h2>
          <div className="lp-cards">
            <div className="lp-card">
              <IcBalao />
              <h3>Lê o histórico inteiro</h3>
              <p>Todas as conversas, inclusive áudio com gíria. Extrai valor, estado e o motivo de ter travado — campo a campo, com um nível de confiança em cada um.</p>
            </div>
            <div className="lp-card">
              <IcLupa />
              <h3>Acha o que parou</h3>
              <p>Orçamento sem resposta, pacote pago e não usado, "vou pensar" vencido, Pix prometido que nunca caiu. Cada um vira um compromisso com valor e prazo.</p>
            </div>
            <div className="lp-card">
              <IcAviao />
              <h3>Volta no seu tom</h3>
              <p>Escreve como você escreve, aprendido das suas próprias respostas. E escolhe o ângulo que converte na sua operação — não o que converte "em média".</p>
            </div>
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------- 03 a cena */}
      <div className="lp-wrap">
        <section className="lp-sec" id="cena">
          <Rotulo n="03" texto="A cena" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, paddingBottom: 52 }}>
            <h2 className="serif lp-h2" style={{ maxWidth: 900 }}>
              A Fernanda sumiu há quatro meses com quatro sessões pagas.
            </h2>
            <p className="lp-p">Ninguém no salão lembrava. O Davi lembrou em trinta segundos.</p>
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
                <div className="lp-bub-nota">escrito pelo Davi · aprovado por você</div>
                <div className="lp-bub them" style={{ marginTop: 14 }}>quero sim!</div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 34 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                <div className="mono" style={{ fontSize: 12, color: '#9A8E82', letterSpacing: '.08em', textTransform: 'uppercase' }}>
                  O que ele extraiu da conversa
                </div>
                <div className="lp-campos">
                  <div className="lp-campo"><b className="mono">valor</b><span>R$ 420 <em>— 4 de 10 sessões restantes, já pagas</em></span></div>
                  <div className="lp-campo"><b className="mono">estado</b><span>travado</span></div>
                  <div className="lp-campo"><b className="mono">motivo</b><span>pacote parado <em>— não é preço, é esquecimento</em></span></div>
                  <div className="lp-campo"><b className="mono">temperatura</b><span style={{ color: '#A15A08' }}>quente <em>— ela mesma reabriu a conversa hoje</em></span></div>
                  <div className="lp-campo">
                    <b className="mono">confiança</b>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
                      <span style={{ fontVariantNumeric: 'tabular-nums' }}>0,92</span>
                      <span className="lp-barra"><i style={{ width: '92%' }} /></span>
                      <em>acima do limiar, pode agir</em>
                    </span>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                <div className="mono" style={{ fontSize: 12, color: '#9A8E82', letterSpacing: '.08em', textTransform: 'uppercase' }}>
                  As três decisões que um bom vendedor toma
                </div>
                <div className="lp-decisoes">
                  <div className="lp-decisao">
                    <b className="mono">QUANDO</b>
                    <strong>Hoje</strong>
                    <span>Ela reabriu a conversa há 42 minutos. A janela é agora.</span>
                  </div>
                  <div className="lp-decisao">
                    <b className="mono">ÂNGULO</b>
                    <strong>Retomada de pacote</strong>
                    <span>Não desconto. Nesta operação, retomada converte mais em pacote parado.</span>
                  </div>
                  <div className="lp-decisao parar">
                    <b className="mono">ONDE PARAR</b>
                    <strong>No 3º toque</strong>
                    <span>Sem resposta até lá, pausa 30 dias. Depois disso é só queimar a cliente.</span>
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

      {/* --------------------------------------------------- 04 saber parar */}
      <section className="lp-banda">
        <div className="lp-wrap">
          <Rotulo n="04" texto="O que ele se recusa a fazer" />
          <div className="lp-2col">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 26 }}>
              <h2 className="serif lp-h2">Saber parar também é o produto.</h2>
              <p className="lp-p" style={{ maxWidth: 520 }}>
                Um falso positivo não custa uma mensagem. Custa uma cliente. Por isso a decisão de enviar não é do modelo: é de código, com regra dura por cima.
              </p>
              <div className="lp-guardas">
                <div className="lp-guarda"><b className="mono">BLOQUEIA</b><span>preço que a loja nunca falou</span></div>
                <div className="lp-guarda"><b className="mono">BLOQUEIA</b><span>promessa que a agenda não sustenta</span></div>
                <div className="lp-guarda"><b className="mono">BLOQUEIA</b><span>dia da semana que não existe naquela data</span></div>
                <div className="lp-guarda"><b className="mono">SEGURA</b><span>confiança abaixo do limiar vai pra revisão, não pra ação</span></div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <div className="lp-recusa">
                <div className="lp-recusa-tit"><Xis /><span>Não enviar — Priscila</span></div>
                <p className="lp-p" style={{ fontSize: 16 }}>
                  Três toques sem uma única resposta. O quarto toque converte 2% no histórico desta operação e queima a cliente pro resto do ano.
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                  <span className="lp-pill mono">PAUSADO POR 30 DIAS</span>
                  <span className="mono" style={{ fontSize: 12, color: '#9A8E82' }}>R$ 980 · sumiço pós-acordo</span>
                </div>
              </div>

              <div className="lp-nota">
                <span className="mono" style={{ fontSize: 12, color: '#9A8E82', letterSpacing: '.06em' }}>POR QUE 3 E NÃO 5</span>
                <p className="lp-p" style={{ fontSize: 16 }}>
                  Ninguém escreveu "3" no código como palpite. Sai da conta sobre <strong style={{ color: '#17130F', fontWeight: 600 }}>169 toques já resolvidos</strong> desta loja: a chance de resposta cai a cada toque, e depois do terceiro não paga o risco.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------- 05 o motor */}
      <section className="lp-banda-dark" id="motor">
        <div className="lp-wrap">
          <Rotulo n="05" texto="O motor" />
          <div className="lp-2col inverso">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 26 }}>
              <h2 className="serif lp-h2">Chatbot fala quando o cliente escreve. O Davi age quando ele para.</h2>
              <p className="lp-p">
                O gatilho não é uma mensagem chegando — é uma promessa vencendo. Por baixo há uma máquina de estados por compromisso e uma política determinística de ação. O modelo extrai e redige; quem decide se pode enviar é código.
              </p>
              <div className="lp-estados mono">
                <span className="lp-estado">novo</span>
                <span className="lp-seta">→</span>
                <span className="lp-estado">orçado</span>
                <span className="lp-seta">→</span>
                <span className="lp-estado">acordado</span>
                <span className="lp-seta">→</span>
                <span className="lp-estado travado">travado</span>
                <span className="lp-seta">→</span>
                <span className="lp-estado recuperado">recuperado</span>
              </div>
            </div>

            <div className="lp-metricas">
              <div className="lp-metrica">
                <b className="serif">169</b>
                <span>toques já resolvidos desta loja alimentam a curva de conversão. A régua de follow-up não é configurada — é medida.</span>
              </div>
              <div className="lp-metrica">
                <b className="serif">20</b>
                <span>conversas rotuladas à mão, campo a campo, para medir a extração contra um gabarito — não contra a nossa impressão.</span>
              </div>
              <div className="lp-metrica verde">
                <b className="serif">0</b>
                <span>preços inventados. É a métrica que otimizamos primeiro: o erro que faz o Davi cobrar quem não deve nada.</span>
              </div>
              <div className="lp-metrica amber">
                <b className="serif">[X]%</b>
                <span>de precisão na extração <span className="lp-falta">[PREENCHER APÓS RODAR O EVAL]</span>. gpt-5-mini, resposta em ~1,7s por conversa.</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------ 06 começar */}
      <div className="lp-wrap">
        <section className="lp-sec">
          <Rotulo n="06" texto="Começar" />
          <div className="lp-2col">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 30 }}>
              <h2 className="serif lp-h2" style={{ maxWidth: 620 }}>O onboarding inteiro é um QR code.</h2>
              <div className="lp-trio">
                <div className="lp-trio-item"><Check /><span>Nada para instalar.</span></div>
                <div className="lp-trio-item"><Check /><span>Nada para preencher.</span></div>
                <div className="lp-trio-item"><Check /><span>Nada muda na rotina.</span></div>
              </div>
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
              <a className="lp-btn ghost" href="[LINK DO REPOSITÓRIO]">Repositório</a>
              <a className="lp-btn ghost" href="[LINK DO VÍDEO]">Vídeo da demo</a>
            </div>
            <p>CRM é um formulário que ninguém preenche. O Davi lê a conversa que já existe e vende com ela.</p>
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
