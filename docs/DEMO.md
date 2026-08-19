# Davi — Demo Script

🇬🇧 **English** · [🇧🇷 Português](DEMO.pt-BR.md)

`npm install && npm run dev` → http://localhost:5173

**Total runtime: ~3 minutes.** The scripted recovery run takes ~18 seconds once authorized.

---

## Live demo — 3 minutes

| Time | On screen | Say |
|---|---|---|
| **0:00** | QR pairing screen | "This is Studio Lumi, a salon in São Paulo. Everything they sell, they sell on WhatsApp. I'm going to pair an employee to their inbox." _(click to pair)_ |
| **0:15** | Inbox loads, threads streaming in | "Here's the real inbox. 33 conversations. Davi is the pinned contact at the top." |
| **0:25** | Open Davi's chat | "He introduces himself and asks permission before doing anything: _'let me read everything that's stuck back there? I won't message anyone without your OK.'_" |
| **0:35** | Click **"Pode ler"** → scan animates | "He reads the entire history. Voice notes included — this inbox has five of them, up to 52 seconds, with deals inside." |
| **0:50** | 💰 **"ACHEI R$ 11.482 parados"** | "**Eleven thousand four hundred and eighty-two reais** already sitting in this inbox. 22 customers. That number isn't a guess — it's the sum of what was actually promised, extracted from the chat logs." |
| **1:05** | Open **Fernanda Klein** | "Look at this one. She prepaid a 10-session laser package, used 6, asked to reschedule — **four months ago** — and vanished. R$ 420 of already-collected money with service still owed. Nobody scrolls back four months." |
| **1:25** | Scroll to her message from 42 min ago | "_'sumi né kkkk ainda tenho sessão sobrando?'_ — 'I disappeared huh, do I still have sessions left?' She's asking. Nobody's answered." |
| **1:40** | Back to Davi, click **"Pode buscar"** | "Second consent gate. He found the money; now he asks permission to go get it." |
| **1:45–2:15** | The run: messages send, replies land, 💚 toasts fire | "Watch the gray line under each message — that's *why* he sent it. _'stopped at session 6 of 10 · R$ 420 already paid.'_ Every autonomous action shows its reasoning, live, to the owner. That's what makes someone hand over their customer relationships." |
| **2:15** | Fernanda replies, upsell lands, +R$ 510 | "She rebooked — and took a combo she wasn't asked about before. R$ 860 recovered in the time we've been talking." |
| **2:30** | Header: "R$ 860 recuperados hoje" | **The close.** "Big companies have a CRM, lead scoring, and an SDR team making sure no deal dies quietly. A salon has one person and a thumb. Davi is that whole stack, as one contact in the chat list. **Same intelligence, no stack.** That's David versus Goliath." |

**Fallback:** if the intro drags, `pular()` in `src/store.ts` jumps straight to the loaded inbox.

---

## 1-minute video shot list

| Sec | Shot |
|---|---|
| 0–5 | QR screen → pair. VO: "Small businesses in Brazil sell entirely on WhatsApp." |
| 5–12 | Inbox fills with 33 threads. VO: "And deals die in the scrollback." |
| 12–20 | Davi asks permission → **"Pode ler"** → scan. VO: "Davi asks before he reads." |
| 20–30 | 💰 **ACHEI R$ 11.482**. Hold the number. VO: "Eleven thousand reais already sitting in this inbox." |
| 30–40 | Fernanda's thread — the 4-month gap, then "sumi né kkkk". VO: "She prepaid, used 6 of 10 sessions, vanished four months ago." |
| 40–50 | **"Pode buscar"** → messages send. **Zoom on the `porque` line.** VO: "Every message shows its reason." |
| 50–58 | Replies land, toasts fire, R$ 860. |
| 58–60 | Title card: **Davi — same intelligence, no stack.** |

---

## Anticipated Q&A

**"Is the AI real, or is this scripted?"**
Straight answer: the experience is fully built and interactive; the agent's outputs in this
run are authored, replayed on timers. The R$ 11.482 and the opportunity counts *are* computed
live from the dataset. What we built today is the complete product surface plus the domain
model — `src/types.ts` — which is the exact Structured Outputs schema the extraction step
emits. [ARCHITECTURE.md](ARCHITECTURE.md#prototype--target) maps every scripted behavior to
the component that produces it for real. The demo is the acceptance test for the pipeline.

**"How is this not spam?"**
Three structural answers. Two consent gates before anything sends. Policy enforced
server-side — quiet hours, max touches per contact, do-not-contact — outside the model, so it
can't be prompted away. And Davi only contacts people who **already started a conversation and
already wanted something**; there's no list, no cold outreach.

**"What if it offers a price or a slot that doesn't exist?"**
That's the failure mode that kills this product, so it's handled deterministically, not by
prompting. Availability is read-through from the calendar and fails closed. Discounts are
bounded by a ceiling the owner sets, enforced outside the model. And the guardrail judge runs
in a separate context on a different model — it never sees the drafting prompt, so it can't
be talked into the drafter's mistake.

**"Why not a dashboard?"**
Because a salon owner will not open a dashboard. They have one surface, it's already open,
and it's where their customers are. Making Davi a contact instead of an app is the difference
between a tool that gets adopted and one that gets a free trial and dies. It's also why the
control plane is natural language — _"pausa a Bruna"_ — instead of a settings page.

**"Why is the code in Portuguese?"**
`travado`, `sumico_pos_acordo`, `pacote_parado` — these aren't translations of CRM stages,
they're the specific ways deals die in this market. Naming them in the language of the
business is most of the product thinking. See [DOMAIN.md](DOMAIN.md).
