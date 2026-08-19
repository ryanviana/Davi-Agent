# Davi — OpenAI Hackathon Brasil · Notas de Submissão

[🇬🇧 English](SUBMISSION.md) · 🇧🇷 **Português**

**Trilha:** Pequenos Negócios
**Evento:** OpenAI Hackathon · Brasil — São Paulo, 19 de agosto de 2026
**Demo ao vivo:** https://hackathon-open-ai.vercel.app
**Repositório:** https://github.com/ryanviana/Davi-Agent

---

## Aderência à trilha

> _"Crie soluções que ajudem pequenos negócios a simplificar suas operações do dia a dia, sem
> depender de várias plataformas desconectadas ou processos manuais."_

O Davi é precisamente a des-plataformização de uma operação: em vez de acrescentar um CRM, uma
ferramenta de follow-up e um sistema de agendamento a um negócio que nunca vai abrir nenhum dos
três, ele coloca a inteligência dos três dentro da única superfície em que o negócio já vive.
Nenhuma plataforma nova. Nenhuma rolagem manual de histórico.

## Contra a lista de proibidos

| Proibido | Davi |
|---|---|
| ❌ Aplicação básica de RAG | Não é recuperação — é extração estruturada para um modelo de domínio tipado, e então um agente com limites agindo sobre ele |
| ❌ Chatbot genérico de "IA para Educação" | Não é chatbot. O Davi inicia, decide e age sobre um registro; a dona não fica dando prompt |
| ❌ Aplicação em Streamlit | React 19 / TypeScript / Vite, interface feita à mão, zero frameworks de UI |
| ❌ **Dashboard como funcionalidade principal** | Explicitamente o oposto — a decisão central de design é que o Davi é um **contato, não um dashboard.** Não existe dashboard no produto |
| ❌ Analisadores de imagem/personalidade, aconselhamento médico, triagem de candidatos, nutrição, esportes | Nenhum se aplica |

---

## Critérios de avaliação — Rodada 1

**Versão Funcional /10** — A experiência completa do produto roda de ponta a ponta e é
clicável: pareamento → consentimento → varredura do histórico → o card quantificado do dinheiro
→ autorização → contato autônomo → relato de receita ao vivo. Os R$ 11.482 e as contagens de
oportunidade são genuinamente calculados a partir da base em tempo de execução
(`TOTAL_PARADO` em `src/store.ts`). A geração de mensagens do agente é roteirizada — declarado
abertamente no README, na demo, e mapeado componente a componente em
[ARQUITETURA.md](ARQUITETURA.md#protótipo--alvo).

**Execução de Engenharia /10** — ~1.550 linhas, 4 dependências de runtime, sem framework de UI,
sem biblioteca de ícones, conjunto de ícones SVG feito à mão e um clone pixel a pixel do
WhatsApp Web incluindo pareamento por QR com expiração, estados de tick de leitura, indicadores
de "digitando", ondas de áudio com transcrição, divisores de dia e marcadores de intervalo. Uma
store Zustand move uma máquina de estados de dois níveis (`Fase` × `DaviFase`). TypeScript
estrito em todo lugar.

**Ambição Técnica /10** — O sistema projetado é um agente autônomo de receita, com
consentimento, operando sobre o relacionamento vivo de clientes de um pequeno negócio: extração
estruturada de intenção comercial a partir de conversas não estruturadas de vários meses,
incluindo áudio; uma camada de política aplicada fora do modelo; um juiz de guardrail
adversarial em contexto separado; e um loop de aprendizado sobre conversão por
`motivo × angulo`. Ver [ARQUITETURA.md](ARQUITETURA.md).

**Inovação /10** — Duas ideias que não vimos combinadas: (1) **justificativa por ação como
interface** — toda mensagem autônoma exibe seu motivo para a dona no momento do envio, que é o
que torna tolerável delegar o relacionamento com clientes; (2) **o agente como contato, e não
como aplicação** — o plano de controle é uma conversa, então o custo de onboarding é zero.

**Utilidade e Clareza /10** — O caso de uso é legível em uma frase e o valor é um número em
reais na tela dentro de 50 segundos do começo da demo. O usuário-alvo é concreto: pequenos
negócios brasileiros de beleza e serviços, tickets de R$ 70 a R$ 1.050, onde recuperar três
agendamentos por semana já é material.

---

## O que foi construído durante o evento

- Todo o conceito de produto, a narrativa e o modelo de domínio
- `src/types.ts` — o modelo `Estado` / `Motivo` / `Compromisso` / `Toque`, que serve também como schema de extração
- Um cliente WhatsApp Web pixel a pixel feito à mão: pareamento por QR com expiração, layout de três painéis, busca e filtros, balões com estados de tick, balões de áudio com ondas e transcrição, divisores de dia, indicadores de digitação, toasts
- A base de demonstração: 33 conversas, ~134 mensagens, 22 compromissos tipados, 5 áudios, escrita para refletir o registro real do WhatsApp brasileiro
- Toda a máquina de estados e a orquestração da demo em `src/store.ts`
- A arquitetura alvo e toda a documentação em `docs/`, em inglês e português

Tudo neste repositório foi criado durante o hackathon. Commit inicial único; nenhum trabalho
anterior está sendo apresentado como novo.

---

## Checklist antes de enviar

- [ ] Repositório está **público**
- [x] Link da demo está acessível — https://hackathon-open-ai.vercel.app
- [ ] Vídeo de ~1 minuto gravado — roteiro em [DEMO.pt-BR.md](DEMO.pt-BR.md#roteiro-do-vídeo-de-1-minuto)
- [ ] O vídeo identifica claramente o que a equipe construiu durante o evento
- [ ] Todos os integrantes adicionados à página de submissão
- [ ] Enviado em https://cerebralvalley.ai/e/openai-hackathon-brasil/hackathon/submit
