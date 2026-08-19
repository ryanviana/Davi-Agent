# Davi — Roteiro da Demo

[🇬🇧 English](DEMO.md) · 🇧🇷 **Português**

`npm install && npm run dev` → http://localhost:5173

**Duração total: ~3 minutos.** A execução roteirizada leva ~18 segundos depois da autorização.

---

## Demo ao vivo — 3 minutos

| Tempo | Na tela | Fale |
|---|---|---|
| **0:00** | Tela de pareamento QR | "Este é o Studio Lumi, um salão em São Paulo. Tudo que eles vendem, vendem pelo WhatsApp. Vou parear um funcionário na caixa de entrada deles." _(clique para parear)_ |
| **0:15** | Caixa de entrada carrega, conversas entrando | "Esta é a caixa de entrada real. 33 conversas. O Davi é o contato fixado no topo." |
| **0:25** | Abrir a conversa do Davi | "Ele se apresenta e pede permissão antes de qualquer coisa: _'deixa eu ler tudo que tá parado aí atrás? Não mando nada pra ninguém sem você deixar.'_" |
| **0:35** | Clicar em **"Pode ler"** → varredura anima | "Ele lê o histórico inteiro. Áudio incluído — essa caixa tem cinco deles, de até 52 segundos, com negócio dentro." |
| **0:50** | 💰 **"ACHEI R$ 11.482 parados"** | "**Onze mil, quatrocentos e oitenta e dois reais** já parados nessa caixa de entrada. 22 clientes. Esse número não é chute — é a soma do que foi de fato prometido, extraído das conversas." |
| **1:05** | Abrir **Fernanda Klein** | "Olha essa. Ela pagou um pacote de 10 sessões de laser, usou 6, pediu para remarcar — **há quatro meses** — e sumiu. R$ 420 de dinheiro já recebido com serviço ainda em aberto. Ninguém rola quatro meses de conversa para trás." |
| **1:25** | Rolar até a mensagem de 42 min atrás | "_'sumi né kkkk ainda tenho sessão sobrando?'_ Ela está perguntando. Ninguém respondeu." |
| **1:40** | Voltar ao Davi, clicar em **"Pode buscar"** | "Segundo portão de consentimento. Ele achou o dinheiro; agora pede permissão para ir buscar." |
| **1:45–2:15** | A execução: mensagens saem, respostas chegam, toasts 💚 | "Repare na linha cinza embaixo de cada mensagem — é o *porquê* de ele ter mandado. _'parou na 6ª de 10 · R$ 420 já pagos.'_ Toda ação autônoma mostra seu raciocínio, ao vivo, para a dona. É isso que faz alguém entregar o relacionamento com os clientes." |
| **2:15** | Fernanda responde, combo entra, +R$ 510 | "Ela remarcou — e ainda levou um combo que nem tinha pedido. R$ 860 recuperados no tempo em que estamos conversando." |
| **2:30** | Cabeçalho: "R$ 860 recuperados hoje" | **O fecho.** "Empresa grande tem CRM, pontuação de lead e um time garantindo que nenhum negócio morra em silêncio. Um salão tem uma pessoa e um polegar. O Davi é essa estrutura inteira, como um contato na lista de conversas. **A mesma inteligência, sem a estrutura.** É Davi contra Golias." |

**Plano B:** se a introdução se arrastar, `pular()` em `src/store.ts` vai direto para a caixa
de entrada carregada.

---

## Roteiro do vídeo de 1 minuto

| Seg | Cena |
|---|---|
| 0–5 | Tela do QR → parear. VO: "Pequeno negócio no Brasil vende inteiramente pelo WhatsApp." |
| 5–12 | Caixa de entrada enche com 33 conversas. VO: "E os negócios morrem no meio do histórico." |
| 12–20 | Davi pede permissão → **"Pode ler"** → varredura. VO: "O Davi pergunta antes de ler." |
| 20–30 | 💰 **ACHEI R$ 11.482**. Segurar o número. VO: "Onze mil reais já parados nessa caixa de entrada." |
| 30–40 | Conversa da Fernanda — o buraco de 4 meses, depois "sumi né kkkk". VO: "Ela pagou adiantado, usou 6 de 10 sessões, sumiu há quatro meses." |
| 40–50 | **"Pode buscar"** → mensagens saem. **Zoom na linha `porque`.** VO: "Toda mensagem mostra o motivo." |
| 50–58 | Respostas chegam, toasts, R$ 860. |
| 58–60 | Cartela: **Davi — a mesma inteligência, sem a estrutura.** |

---

## Perguntas esperadas

**"A IA é real ou isso é roteirizado?"**
Resposta direta: a experiência está totalmente construída e é interativa; as saídas do agente
nesta execução são escritas à mão, reproduzidas em temporizadores. Os R$ 11.482 e as contagens
de oportunidade *são* calculados ao vivo a partir da base. O que construímos hoje é a
superfície completa do produto mais o modelo de domínio — `src/types.ts` — que é exatamente o
schema de Structured Outputs que a etapa de extração emite.
[ARQUITETURA.md](ARQUITETURA.md#protótipo--alvo) mapeia cada comportamento roteirizado ao
componente que o produz de verdade. A demo é o teste de aceitação do pipeline.

**"Como isso não vira spam?"**
Três respostas estruturais. Dois portões de consentimento antes de qualquer envio. Política
aplicada no servidor — horário de silêncio, máximo de toques por contato, lista de bloqueio —
fora do modelo, então não dá para contornar por prompt. E o Davi só fala com quem **já iniciou
uma conversa e já queria alguma coisa**; não existe lista, não existe abordagem fria.

**"E se ele oferecer um preço ou horário que não existe?"**
Esse é o modo de falha que mata o produto, então é tratado de forma determinística, não por
prompt. Disponibilidade é lida direto da agenda e falha fechando. Desconto é limitado por um
teto que a dona define, aplicado fora do modelo. E o juiz do guardrail roda em contexto
separado, em outro modelo — ele nunca vê o prompt de redação, então não pode ser convencido do
erro do redator.

**"Por que não um dashboard?"**
Porque dona de salão não abre dashboard. Ela tem uma superfície, ela já está aberta, e é onde
os clientes dela estão. Fazer o Davi ser um contato em vez de um app é a diferença entre uma
ferramenta que é adotada e uma que ganha um teste grátis e morre. É também por isso que o plano
de controle é linguagem natural — _"pausa a Bruna"_ — e não uma tela de configurações.

**"Por que o código está em português?"**
`travado`, `sumico_pos_acordo`, `pacote_parado` — não são traduções de estágios de CRM, são as
formas específicas pelas quais os negócios morrem neste mercado. Nomear na língua do negócio é
a maior parte do raciocínio de produto. Ver [DOMINIO.md](DOMINIO.md).
