"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";

type NavItem = { id: string; label: string };
type NavGroup = { title: string; items: NavItem[] };

const NAV: NavGroup[] = [
  {
    title: "Start here",
    items: [
      { id: "introduction", label: "Introduction" },
      { id: "positioning", label: "Product positioning" },
      { id: "quickstart", label: "Quickstart" },
    ],
  },
  {
    title: "Architecture",
    items: [
      { id: "architecture", label: "Overview" },
      { id: "system-map", label: "System map" },
      { id: "data-flow", label: "Data flow" },
      { id: "trust", label: "Trust boundary" },
    ],
  },
  {
    title: "Capabilities",
    items: [
      { id: "chat", label: "Chat" },
      { id: "deep-research", label: "Deep Research" },
      { id: "web-search", label: "Web search" },
      { id: "models", label: "Models" },
      { id: "export", label: "Export & share" },
    ],
  },
  {
    title: "API & contracts",
    items: [
      { id: "api", label: "Chat API" },
      { id: "contracts", label: "Contracts" },
    ],
  },
  {
    title: "Platform roadmap",
    items: [
      { id: "bnii-surfaces", label: "BNII surfaces" },
      { id: "priorities", label: "Build priorities" },
      { id: "governance", label: "Governance" },
    ],
  },
];

function Section({
  id,
  title,
  eyebrow,
  children,
}: {
  id: string;
  title: string;
  eyebrow?: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-24 border-b border-white/8 pb-16 pt-10 last:border-b-0">
      {eyebrow ? (
        <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.18em] text-neutral-500">
          {eyebrow}
        </p>
      ) : null}
      <h2 className="text-2xl font-semibold tracking-tight text-neutral-50 sm:text-3xl">
        {title}
      </h2>
      <div className="mt-6 space-y-4 text-[15px] leading-7 text-neutral-300">{children}</div>
    </section>
  );
}

function H3({ children }: { children: React.ReactNode }) {
  return <h3 className="!mt-8 text-lg font-medium text-neutral-100">{children}</h3>;
}

function P({ children }: { children: React.ReactNode }) {
  return <p className="text-neutral-300">{children}</p>;
}

function Table({
  headers,
  rows,
}: {
  headers: string[];
  rows: React.ReactNode[][];
}) {
  return (
    <div className="overflow-x-auto rounded-xl border border-white/10 bg-[#0c0c0c]">
      <table className="w-full min-w-[560px] border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-white/10 bg-white/[0.03]">
            {headers.map((h) => (
              <th
                key={h}
                className="px-4 py-3 font-medium text-neutral-200"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-b border-white/6 last:border-b-0">
              {row.map((cell, j) => (
                <td key={j} className="px-4 py-3 align-top text-neutral-400">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Code({ children }: { children: React.ReactNode }) {
  return (
    <pre className="overflow-x-auto rounded-xl border border-white/10 bg-[#080808] p-4 font-mono text-[12.5px] leading-6 text-neutral-300">
      <code>{children}</code>
    </pre>
  );
}

function Callout({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-amber-500/25 bg-amber-500/[0.06] px-4 py-3 text-sm text-amber-100/90">
      <p className="font-medium text-amber-200">{title}</p>
      <div className="mt-1 text-amber-100/75">{children}</div>
    </div>
  );
}

function Diagram({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-white/10 bg-[radial-gradient(ellipse_at_top,_rgba(255,255,255,0.04),_transparent_55%),#080808] p-5 font-mono text-[11.5px] leading-5 text-neutral-400 sm:text-[12.5px] sm:leading-6">
      {children}
    </div>
  );
}

export function DocsShell() {
  const [active, setActive] = useState("introduction");
  const [mobileOpen, setMobileOpen] = useState(false);

  const flatIds = useMemo(
    () => NAV.flatMap((g) => g.items.map((i) => i.id)),
    [],
  );

  useEffect(() => {
    const onScroll = () => {
      let current = flatIds[0];
      for (const id of flatIds) {
        const el = document.getElementById(id);
        if (!el) continue;
        if (el.getBoundingClientRect().top <= 120) current = id;
      }
      setActive(current);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [flatIds]);

  const jump = (id: string) => {
    setMobileOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-[#050505] text-neutral-200">
      {/* Top bar */}
      <header className="sticky top-0 z-40 border-b border-white/8 bg-[#050505]/90 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-[1400px] items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="rounded-md border border-white/10 px-2 py-1 text-xs text-neutral-300 lg:hidden"
              onClick={() => setMobileOpen((v) => !v)}
            >
              Menu
            </button>
            <Link href="/docs" className="flex items-center gap-2">
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-white text-[11px] font-bold text-black">
                A
              </span>
              <span className="text-sm font-semibold tracking-tight text-white">
                Aria Docs
              </span>
            </Link>
            <span className="hidden rounded-full border border-white/10 px-2 py-0.5 font-mono text-[10px] text-neutral-500 sm:inline">
              v0.1 · internal
            </span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <Link
              href="/"
              className="text-neutral-400 transition hover:text-white"
            >
              Open app
            </Link>
            <a
              href="https://github.com/Gokulakrishnan96/ARIA"
              target="_blank"
              rel="noreferrer"
              className="hidden text-neutral-400 transition hover:text-white sm:inline"
            >
              GitHub
            </a>
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-[1400px]">
        {/* Sidebar */}
        <aside
          className={cn(
            "fixed inset-y-14 left-0 z-30 w-72 overflow-y-auto border-r border-white/8 bg-[#050505] p-5 transition lg:static lg:block lg:h-[calc(100vh-3.5rem)] lg:sticky lg:top-14",
            mobileOpen ? "block" : "hidden",
          )}
        >
          <nav className="space-y-6">
            {NAV.map((group) => (
              <div key={group.title}>
                <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.16em] text-neutral-600">
                  {group.title}
                </p>
                <ul className="space-y-0.5">
                  {group.items.map((item) => (
                    <li key={item.id}>
                      <button
                        type="button"
                        onClick={() => jump(item.id)}
                        className={cn(
                          "w-full rounded-md px-2.5 py-1.5 text-left text-[13px] transition",
                          active === item.id
                            ? "bg-white/8 text-white"
                            : "text-neutral-400 hover:bg-white/[0.04] hover:text-neutral-200",
                        )}
                      >
                        {item.label}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </aside>

        {/* Content */}
        <main className="min-w-0 flex-1 px-4 py-8 sm:px-8 lg:px-12 lg:py-10">
          <div className="mb-10 max-w-3xl">
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-neutral-500">
              Canonical architecture documentation
            </p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
              Aria
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-neutral-400">
              Research-first intelligence interface. Documented for build
              owners — what exists, what must not drift, and what BNII surfaces
              require before we write the next layer of code.
            </p>
            <Callout title="Review gate">
              Documentation only. Credits, APIs, dual-write schemas, and
              tenant execution start after this pack is confirmed.
            </Callout>
          </div>

          <div className="max-w-3xl">
            <Section id="introduction" title="Introduction" eyebrow="Start here">
              <P>
                Aria is the research-first intelligence interface for
                decision-makers. Today it is a production-grade chat and
                deep-research product. Tomorrow it is the primary consumption
                surface for BNII — behavioural network intelligence from
                consented, in-market consumer signal across emerging markets.
              </P>
              <H3>One-line thesis</H3>
              <P>
                Anyone can rent a frontier model. No one can rent the position
                it reasons from.
              </P>
              <H3>What exists now</H3>
              <Table
                headers={["Layer", "Status"]}
                rows={[
                  ["Chat + streaming", "Live"],
                  ["Deep Research briefs", "Live (prompt contract + UI parser)"],
                  ["Independent web research", "Live"],
                  ["Multi-model routing", "Live (Nano / Mini / Max)"],
                  ["Export formats", "Live (client-side)"],
                  ["Thread history & share", "Live (browser-local)"],
                  ["Auth, credits, metering", "Not built"],
                  ["Governed intelligence APIs", "Not built"],
                  ["BYOD / run-on-infra", "Not built"],
                ]}
              />
            </Section>

            <Section id="positioning" title="Product positioning" eyebrow="Start here">
              <P>
                The intelligence industry sees the top and middle of markets
                well, and the bottom of emerging markets barely at all.
                Embedded inside partner apps — telco, wallet, bank — we
                generate consented behavioural signal at the point of action.
                BNII turns that position into sellable, market-level
                intelligence. Aria is the human-facing answer surface.
              </P>
              <Diagram>
                {`Partner apps → consented events → BNII intelligence layer → Aria`}
              </Diagram>
              <H3>Why now</H3>
              <Table
                headers={["Fact", "Implication"]}
                rows={[
                  [
                    "~384M monthly transacting users",
                    "The position is live today",
                  ],
                  [
                    "Frontier models are rentable",
                    "Models are no longer the scarce asset",
                  ],
                  [
                    "Embedded footprint is hard to copy",
                    "Window is open; compound advantage",
                  ],
                ]}
              />
              <H3>Five commercial surfaces — one asset</H3>
              <P>
                Every surface sits behind the same consent gates, k-floor, and
                audit-and-metering ledger. Governance does not weaken with
                depth — it makes depth sellable.
              </P>
              <Table
                headers={["#", "Surface", "Buyer intent"]}
                rows={[
                  ["1", "Credits", "Metered Q&A / briefs — audit log = billing"],
                  ["2", "Build on top", "Intelligence as substrate for their models"],
                  ["3", "Bring your own data", "Theirs × our market backdrop"],
                  ["4", "Data & intelligence APIs", "Pull indices into pipelines"],
                  ["5", "Run on our infra", "Model to data; raw signal never egresses"],
                ]}
              />
            </Section>

            <Section id="quickstart" title="Quickstart" eyebrow="Start here">
              <P>Node.js 20+ and a Google AI Studio API key.</P>
              <Code>{`npm install
# .env.local
GOOGLE_GENERATIVE_AI_API_KEY=...

npm run dev
# App  → http://localhost:3000
# Docs → http://localhost:3000/docs`}</Code>
            </Section>

            <Section id="architecture" title="Architecture overview" eyebrow="Architecture">
              <Table
                headers={["Layer", "Choice"]}
                rows={[
                  ["Framework", "Next.js 16 App Router"],
                  ["UI", "React 19 · Tailwind 4 · Base UI · shadcn"],
                  ["Chat runtime", "assistant-ui + Vercel AI SDK"],
                  ["Models", "@ai-sdk/google (primary)"],
                  ["Client state", "Zustand + localStorage threads"],
                ]}
              />
              <H3>Design principles</H3>
              <ol className="list-decimal space-y-2 pl-5 text-neutral-300">
                <li>One write path for answers — all model I/O via <code className="text-neutral-100">POST /api/chat</code>.</li>
                <li>Search before memory when Search is on — empty research → 503, never silent fallback.</li>
                <li>Deep Research is a contract, not a vibe — fixed sections, institutional tone.</li>
                <li>Secrets stay server-side.</li>
                <li>Auditability first — future credits and APIs share one metering ledger.</li>
              </ol>
            </Section>

            <Section id="system-map" title="System map" eyebrow="Architecture">
              <Diagram>
                <pre className="whitespace-pre text-neutral-400">{`
┌──────────────────────── Browser ────────────────────────┐
│  AppShell · Sidebar · TopBar · Thread · Composer        │
│  Zustand prefs · localStorage threads (?chat=)          │
└───────────────────────┬─────────────────────────────────┘
                        │ POST /api/chat
                        ▼
┌──────────────────── Next.js server ─────────────────────┐
│  Model router  →  Independent web research  →  streamText │
│  Nano/Mini/Max     DDG/Bing + page fetch      UI stream │
└─────────────────────────────────────────────────────────┘
`.trim()}</pre>
              </Diagram>
              <P>
                Deliberately absent today: auth, credits ledger, dual-write
                event pipeline, licensed feeds, tenant-isolated execution,
                persistent connected-customer data. These are platform work —
                not client hacks.
              </P>
            </Section>

            <Section id="data-flow" title="Data flow" eyebrow="Architecture">
              <ol className="list-decimal space-y-2 pl-5">
                <li>Composer submit → transport reads Zustand flags.</li>
                <li>Server validates messages; resolves Aria model.</li>
                <li>If search or deep research: independent research packet → system prompt. Empty → 503.</li>
                <li>Compose prompt layers → <code className="text-neutral-100">streamText</code> → UI message stream.</li>
                <li>Deep Research answers parse into institutional brief UI.</li>
              </ol>
              <H3>Mode matrix</H3>
              <Table
                headers={["deepResearch", "webSearch", "Behaviour"]}
                rows={[
                  ["false", "false", "Plain chat; frontend tools allowed"],
                  ["false", "true", "Search → grounded answer"],
                  ["true", "true*", "Search + Deep Research brief contract"],
                ]}
              />
              <P>
                * Enabling Deep Research also forces <code className="text-neutral-100">webSearch: true</code> in the store.
                With Google + search, answers use Flash Lite free-tier override regardless of Mini/Max selection.
              </P>
            </Section>

            <Section id="trust" title="Trust boundary" eyebrow="Architecture">
              <Table
                headers={["Zone", "Assets"]}
                rows={[
                  ["Server-only", "API keys · page fetches · model invocation"],
                  ["Client-only today", "Threads · prefs · mock profile/usage · exports"],
                ]}
              />
              <H3>BNII invariants (non-negotiable)</H3>
              <ol className="list-decimal space-y-2 pl-5">
                <li>Consent gates at every surface.</li>
                <li>k-floor before any market-level release.</li>
                <li>Audit log ≡ metering ledger — one system.</li>
                <li>Raw behavioural signal never egresses on deepest surface.</li>
                <li>Dual-write: operational store ≠ intelligence store.</li>
              </ol>
            </Section>

            <Section id="chat" title="Chat" eyebrow="Capabilities">
              <P>
                Runtime: assistant-ui + AI SDK transport to <code className="text-neutral-100">/api/chat</code>,
                with remote thread list for Recents and URL sync. Composer exposes
                model, Search, and Deep Research. Quota errors are rewritten into
                readable free-tier guidance.
              </P>
            </Section>

            <Section id="deep-research" title="Deep Research" eyebrow="Capabilities">
              <P>
                A methodology surface: strict system prompt + forced web research +
                client brief parser. Not a multi-agent graph.
              </P>
              <Table
                headers={["Section", "Purpose"]}
                rows={[
                  ["Title", "Precise scope"],
                  ["Executive Summary", "Core conclusion first"],
                  ["Key Findings", "Standalone decision-ready statements"],
                  ["Detailed Analysis", "Context, drivers, evidence, implications"],
                  ["Areas of Uncertainty", "Mandatory — contested / unresolved"],
                  ["Sources", "Numbered links; body citations must match"],
                ]}
              />
              <Callout title="Buyer note">
                Methodology-literate buyers audit discipline, not chat fluency.
                Uncertainty and source rules are load-bearing — do not soften them.
              </Callout>
            </Section>

            <Section id="web-search" title="Web search" eyebrow="Capabilities">
              <P>
                Aria does <strong className="font-medium text-neutral-100">not</strong> currently
                use Gemini <code className="text-neutral-100">google_search</code> grounding.
                Independent pipeline: normalize → DDG/Bing → fetch pages → findings
                packet → answer only from that packet.
              </P>
              <Diagram>
                {`query → normalize → search HTML → score URLs → fetch pages → findings + sources → system prompt`}
              </Diagram>
              <P>
                Production credibility eventually requires licensed feeds; scrapers
                remain enrichment, not source of truth for commercial claims.
              </P>
            </Section>

            <Section id="models" title="Models" eyebrow="Capabilities">
              <Table
                headers={["UI", "Id", "Provider model"]}
                rows={[
                  ["Aria Nano", "aria-nano", "gemini-3.1-flash-lite-preview"],
                  ["Aria Mini", "aria-mini", "gemini-3-flash-preview"],
                  ["Aria Max", "aria-max", "gemini-3.1-pro-preview"],
                ]}
              />
            </Section>

            <Section id="export" title="Export & share" eyebrow="Capabilities">
              <P>
                Share copies <code className="text-neutral-100">?chat=&lt;id&gt;</code> — same-browser only.
                Export: PDF, DOCX, PPTX, XLSX, CSV, JSON (client-side). Cross-device
                share needs persistent message storage designed with the metering ledger.
              </P>
            </Section>

            <Section id="api" title="Chat API" eyebrow="API & contracts">
              <P>
                <code className="text-neutral-100">POST /api/chat</code> — sole backend endpoint.
              </P>
              <Code>{`{
  messages: UIMessage[];          // required
  system?: string;
  tools?: Record<string, { description?: string; parameters: JSONSchema7 }>;
  model?: "aria-nano" | "aria-mini" | "aria-max";
  deepResearch?: boolean;
  webSearch?: boolean;
}`}</Code>
              <Table
                headers={["Status", "When"]}
                rows={[
                  ["200 stream", "UI message stream"],
                  ["400", "Invalid messages"],
                  ["500", "Missing key / unexpected error"],
                  ["503", "Search on, research empty"],
                ]}
              />
            </Section>

            <Section id="contracts" title="Contracts" eyebrow="API & contracts">
              <Table
                headers={["Variable", "Required"]}
                rows={[
                  ["GOOGLE_GENERATIVE_AI_API_KEY", "Yes (current models)"],
                  ["OPENAI_API_KEY", "Only if provider is openai"],
                ]}
              />
              <P>
                Persistence: <code className="text-neutral-100">aria-ui-v3</code> (prefs),{" "}
                <code className="text-neutral-100">aria:threads</code> (recents). Brief heading
                labels are a stable contract for the parser. Future audit event
                schema becomes a public contract for billing and compliance.
              </P>
            </Section>

            <Section id="bnii-surfaces" title="BNII surfaces" eyebrow="Platform roadmap">
              <ol className="list-decimal space-y-3 pl-5">
                <li>
                  <strong className="text-neutral-100">Credits</strong> — metered pools;
                  audit log is the billing ledger. Build as one system.
                </li>
                <li>
                  <strong className="text-neutral-100">Build on top</strong> — intelligence
                  as substrate for customer models.
                </li>
                <li>
                  <strong className="text-neutral-100">Bring your own data</strong> — theirs
                  × our market backdrop.
                </li>
                <li>
                  <strong className="text-neutral-100">Data & intelligence APIs</strong> —
                  governed datasets and indices into their pipelines.
                </li>
                <li>
                  <strong className="text-neutral-100">Run on our infra</strong> — model
                  comes to data; raw signal never egresses.
                </li>
              </ol>
            </Section>

            <Section id="priorities" title="Build priorities" eyebrow="Platform roadmap">
              <Table
                headers={["P", "Workstream", "Why now"]}
                rows={[
                  ["P0", "Event pipeline", "Nothing downstream is credible without it"],
                  ["P0", "Methodology surface", "What buyers audit"],
                  ["P0", "Dual-write schema boundary", "Compliance + irreversible coupling risk"],
                  ["P1", "Metering + credit layer", "Audit = billing; one system"],
                  ["P1", "Classification-quality evals", "Survive methodology RFPs"],
                  ["P1", "Licensed feeds", "Source credibility for commercial claims"],
                  ["P2", "Persistent connected data", "BYOD + cross-device + real usage"],
                  ["P2", "Tenant-isolated execution", "Deepest surface without egress"],
                ]}
              />
              <H3>Pressure tests (where I disagree with soft sequencing)</H3>
              <ol className="list-decimal space-y-3 pl-5">
                <li>
                  <strong className="text-neutral-100">Credits before APIs</strong> — design
                  the audit event schema first; meter chat immediately; reuse the
                  same meter on APIs. Never invent a second billing path.
                </li>
                <li>
                  <strong className="text-neutral-100">Scrapers ≠ truth</strong> —
                  fine for Aria v0; licensed feeds + partner signal must dominate
                  commercial claims.
                </li>
                <li>
                  <strong className="text-neutral-100">Prompt before agent graphs</strong> —
                  keep the Deep Research contract until evals prove failure modes.
                  Multi-agent without evals is un-auditable theatre.
                </li>
                <li>
                  <strong className="text-neutral-100">k-floor at release boundary</strong> —
                  enforce when datasets/indices publish, not only in the chat UI.
                  Chat is one consumer.
                </li>
              </ol>
            </Section>

            <Section id="governance" title="Governance" eyebrow="Platform roadmap">
              <Table
                headers={["Gate", "Meaning"]}
                rows={[
                  ["Consent", "Signal enters only under partner / user terms"],
                  ["k-floor", "Aggregates release only above minimum cohort size"],
                  ["Audit + meter", "Every query/pull/job is durable + billable"],
                ]}
              />
              <P>
                Aria does not implement these gates yet. This documentation states
                them so implementation cannot invent per-feature exceptions later.
              </P>
              <div className="mt-10 rounded-xl border border-white/10 bg-white/[0.03] p-5">
                <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-neutral-500">
                  Next step
                </p>
                <p className="mt-2 text-neutral-200">
                  Review this pack. Confirm or mark disagreements. After sign-off
                  we implement in order: event schema → methodology evals →
                  metering/credits → APIs — not the reverse.
                </p>
              </div>
            </Section>
          </div>
        </main>
      </div>
    </div>
  );
}
