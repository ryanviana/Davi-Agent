# Davi — OpenAI Hackathon Brasil · Submission Notes

🇬🇧 **English** · [🇧🇷 Português](SUBMISSAO.md)

**Track:** Pequenos Negócios (Small Businesses)
**Event:** OpenAI Hackathon · Brasil — São Paulo, 19 Aug 2026

---

## Track fit

> _"Crie soluções que ajudem pequenos negócios a simplificar suas operações do dia a dia, sem
> depender de várias plataformas desconectadas ou processos manuais."_

Davi is precisely the un-platforming of an operation: instead of adding a CRM, a follow-up
tool, and a booking system to a business that will never open them, it puts the intelligence
of all three inside the one surface the business already lives in. No new platform. No manual
scrollback.

## Against the prohibited list

| Prohibited | Davi |
|---|---|
| ❌ Basic RAG app | Not retrieval — structured extraction into a typed domain model, then a policy-bounded agent acting on it |
| ❌ Generic "AI for education" chatbot | Not a chatbot. Davi initiates, decides, and acts on a ledger; the owner isn't prompting him |
| ❌ Streamlit app | React 19 / TypeScript / Vite, hand-built UI, zero UI frameworks |
| ❌ **Dashboard as the main feature** | Explicitly the opposite — the core design decision is that Davi is a **contact, not a dashboard.** There is no dashboard in the product |
| ❌ Image / personality analyzers, health advice, candidate screening, nutrition, sports | None apply |

---

## Judging criteria — Round 1

**Versão Funcional /10** — The complete product experience runs end to end and is clickable:
pairing → consent → backlog scan → the quantified money card → authorization → autonomous
outreach → live revenue reporting. The R$ 11.482 figure and opportunity counts are genuinely
computed from the dataset at runtime (`TOTAL_PARADO` in `src/store.ts`). The agent's message
generation is scripted — stated openly in the README, in the demo, and mapped
component-by-component in [ARCHITECTURE.md](ARCHITECTURE.md#prototype--target).

**Execução de Engenharia /10** — ~1,550 lines, 4 runtime dependencies, no UI framework, no
icon library, hand-rolled SVG icon set and a pixel-accurate WhatsApp Web clone including QR
pairing with expiry, read-tick states, typing indicators, audio waveforms with transcription,
day separators, and gap markers. One Zustand store drives a two-level state machine
(`Fase` × `DaviFase`). Strict TypeScript throughout.

**Ambição Técnica /10** — The designed system is a consent-gated autonomous revenue agent
operating on a small business's live customer relationships: structured extraction of
commercial intent from unstructured multi-month chat logs including voice, a policy layer
enforced outside the model, an adversarial guardrail judge in a separate context, and a
learning loop over `motivo × angulo` conversion. See [ARCHITECTURE.md](ARCHITECTURE.md).

**Inovação /10** — Two ideas we haven't seen combined: (1) **rationale-per-action as UI** —
every autonomous message renders its reason to the owner at send time, which is what makes
delegating customer relationships tolerable; (2) **the agent as a contact rather than an
application** — the control plane is a chat thread, so onboarding cost is zero.

**Utilidade e Clareza /10** — The use case is legible in one sentence and the value is a
number in reais on screen within 50 seconds of the demo starting. Target user is concrete:
Brazilian beauty and services SMBs, ticket sizes R$ 70–1.050, where recovering three bookings
a week is material.

---

## What was built during the event

- The entire product concept, narrative, and domain model
- `src/types.ts` — the `Estado` / `Motivo` / `Compromisso` / `Toque` model, which doubles as the extraction schema
- A hand-built, pixel-accurate WhatsApp Web client: QR pairing with expiry, three-pane layout, search and filters, message bubbles with tick states, audio bubbles with waveforms and transcripts, day separators, typing indicators, toasts
- The demo dataset: 33 conversations, ~134 messages, 22 typed commitments, 5 voice notes, authored to reflect real Brazilian WhatsApp register
- The full demo state machine and orchestration in `src/store.ts`
- The target architecture and all documentation in `docs/`

Everything in this repository was created during the hackathon. Single initial commit; no
prior work is being represented as new.

---

## Pre-submit checklist

- [ ] Repository is **public**
- [ ] Demo link is live and reachable (`npm run build` → static `dist/`)
- [ ] ~1-minute demo video recorded — shot list in [DEMO.md](DEMO.md#1-minute-video-shot-list)
- [ ] Video clearly identifies what the team built during the event
- [ ] All team members added to the submission page
- [ ] Submitted at https://cerebralvalley.ai/e/openai-hackathon-brasil/hackathon/submit
