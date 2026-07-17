# ARIA

**ARIA** is a research-first AI assistant built for decision-makers. It combines a modern chat interface with structured research briefs, optional live web search, multi-model routing, and one-click export — designed to feel institutional rather than conversational.

[Repository](https://github.com/Gokulakrishnan96/ARIA)

---

## Overview

ARIA answers questions with rigor: optional Deep Research mode produces institutional-grade reports (title, executive summary, key findings, analysis, uncertainty, and sources), while everyday chat remains fast and direct. A dark, curved UI inspired by leading assistants keeps the experience calm and focused.

### Highlights

| Capability | Description |
|---|---|
| **Deep Research** | Toggleable research engine with structured, cited report output |
| **Web Search** | Gemini Google Search grounding for current, sourced answers |
| **Multi-model** | Aria Nano / Mini / Max — selectable per chat |
| **Chat history** | Persistent Recents with auto-titles from the first message |
| **Share & export** | Copy a shareable chat link; download PDF, DOCX, PPTX, XLSX, CSV, or JSON |
| **Settings** | Profile, appearance, data controls, and default model |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | [Next.js 16](https://nextjs.org) (App Router, Turbopack) |
| UI | React 19, Tailwind CSS 4, [Base UI](https://base-ui.com), [shadcn](https://ui.shadcn.com) |
| Chat runtime | [`@assistant-ui/react`](https://www.assistant-ui.com) + AI SDK |
| Models | [Vercel AI SDK](https://ai-sdk.dev) · `@ai-sdk/google` · `@ai-sdk/openai` |
| State | Zustand (persisted preferences) |
| Markdown | remark-gfm, assistant-ui markdown |
| Export | jsPDF, docx, pptxgenjs, SheetJS (xlsx) |

---

## Features

### Chat experience
- Streaming responses with thinking / status indicators
- Attachment support (files & screenshots)
- Model selector in the composer (Nano · Mini · Max)
- Reasoning / tool-call UI when the model emits them

### Deep Research
Enable **Deep research** in the composer to switch ARIA into an analytical research mode. Outputs follow a fixed brief format:

1. **Title** — precise scope of the report  
2. **Executive Summary** — core conclusion first  
3. **Key Findings** — standalone, decision-ready statements  
4. **Detailed Analysis** — context, drivers, evidence, implications  
5. **Areas of Uncertainty** — contested or unresolved points (mandatory)  
6. **Sources** — numbered markdown links; click **Sources** in the UI to expand

### Web Search
Enable **Search** to ground answers with [Google Search via Gemini](https://ai-sdk.dev/providers/ai-sdk-providers/google). Works alongside Deep Research for cited, up-to-date briefs.

### History & sharing
- Recents sidebar with titles derived from the first user message  
- Threads stored in `localStorage`  
- Share menu copies a `?chat=` URL and keeps the active thread in sync  
- Export the conversation as PDF · DOCX · PPTX · XLSX · CSV · JSON  

### Settings & profile
- General preferences (appearance, language, send shortcut)  
- Account / profile editing  
- Data controls (history, export/delete placeholders)  
- Default model selection  

---

## Getting Started

### Prerequisites

- Node.js 20+  
- A [Google AI Studio](https://aistudio.google.com/apikey) API key (`GOOGLE_GENERATIVE_AI_API_KEY`)  
- Optional: `OPENAI_API_KEY` if you switch Mini/Max back to OpenAI models  

### Install

```bash
git clone https://github.com/Gokulakrishnan96/ARIA.git
cd ARIA
npm install
```

### Environment

Create `.env.local` in the project root (this file is gitignored):

```bash
GOOGLE_GENERATIVE_AI_API_KEY=your_gemini_api_key_here

# Optional — only if using OpenAI-backed models
# OPENAI_API_KEY=your_openai_api_key_here
```

### Develop

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Production

```bash
npm run build
npm start
```

### Lint

```bash
npm run lint
```

---

## Models

Configured in [`lib/models.ts`](lib/models.ts). For local testing, all three tiers currently route through Gemini:

| UI name | Role | Provider model (current) |
|---|---|---|
| **Aria Nano** | Fast everyday answers | `gemini-3.1-flash-lite` |
| **Aria Mini** | Balanced speed & reasoning | `gemini-2.5-flash` |
| **Aria Max** | Highest capability | `gemini-2.5-pro` |

Change `provider` / `modelId` in `lib/models.ts` to restore OpenAI (or other) backends when ready.

---

## Project Structure

```
ARIA/
├── app/
│   ├── api/chat/route.ts      # Streaming chat API (system prompts, tools, models)
│   ├── assistant.tsx          # Runtime, transport, thread URL sync
│   ├── layout.tsx
│   ├── page.tsx
│   ├── profile/               # Profile page
│   └── globals.css
├── components/
│   ├── aria/                  # Shell, sidebar, toggles, research brief, share menu
│   ├── assistant-ui/          # Thread, markdown, reasoning, tools
│   └── ui/                    # Shared primitives (button, dialog, …)
├── lib/
│   ├── aria-system-prompt.ts  # Deep Research instructions
│   ├── aria-store.ts          # UI preferences (Zustand)
│   ├── models.ts              # Model registry
│   ├── export-chat.ts         # PDF / DOCX / PPTX / XLSX / CSV / JSON
│   ├── parse-research-brief.ts
│   └── aria-thread-list-adapter.ts
└── public/
    └── aria-logo.svg
```

---

## API

### `POST /api/chat`

Accepts AI SDK / assistant-ui message payloads plus:

| Field | Type | Purpose |
|---|---|---|
| `model` | string | Aria model id (`aria-nano`, `aria-mini`, `aria-max`) |
| `deepResearch` | boolean | Apply Deep Research system prompt |
| `webSearch` | boolean | Attach Gemini `google_search` tool (Google provider only) |

Responses stream as UI message parts. Quota / model errors are surfaced as readable messages.

---

## Configuration Notes

- **Secrets** — Never commit `.env.local`. Keys stay on the server for API routes.  
- **Thread storage** — Client-side `localStorage` under the `aria:` prefix; titles update after the first completed turn.  
- **Share links** — `/?chat=<threadId>` opens the matching local thread when available in that browser.  

---

## Roadmap Ideas

- Persist message history server-side for cross-device share links  
- Re-enable OpenAI Mini/Max with production keys  
- Account auth and synced settings  
- Server-side PDF/DOCX generation for large exports  

---

## License

Private / unlicensed unless otherwise stated by the repository owner.

---

## Acknowledgments

Built with [Next.js](https://nextjs.org), [assistant-ui](https://www.assistant-ui.com), and the [Vercel AI SDK](https://ai-sdk.dev).
