"use client";

import Link from "next/link";
import { AppWindow, Github, Layers } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { AriaLogo } from "@/components/aria/aria-logo";
import { cn } from "@/lib/utils";

type NavItem = { id: string; label: string };
type NavGroup = { title: string; items: NavItem[] };

const NAV: NavGroup[] = [
  {
    title: "Get started",
    items: [
      { id: "overview", label: "Introduction" },
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
    title: "API",
    items: [
      { id: "api", label: "Chat API" },
      { id: "contracts", label: "Contracts" },
    ],
  },
  {
    title: "Roadmap",
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
  children,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section
      id={id}
      className="scroll-mt-24 border-b border-[#1f1f1f] py-12 last:border-b-0"
    >
      <h2 className="text-[1.75rem] font-semibold tracking-tight text-white">
        {title}
      </h2>
      <div className="mt-5 space-y-4 text-[15px] leading-7 text-[#c4c4c4]">
        {children}
      </div>
    </section>
  );
}

function H3({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="!mt-8 text-lg font-semibold tracking-tight text-white">
      {children}
    </h3>
  );
}

function P({ children }: { children: React.ReactNode }) {
  return <p>{children}</p>;
}

function Callout({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-[#18E299]/25 bg-[#18E299]/[0.06] px-4 py-3.5">
      <p className="text-sm font-semibold text-[#18E299]">{title}</p>
      <div className="mt-1 text-sm leading-6 text-[#b7e8d3]">{children}</div>
    </div>
  );
}

function Table({
  headers,
  rows,
}: {
  headers: string[];
  rows: React.ReactNode[][];
}) {
  return (
    <div className="overflow-x-auto rounded-xl border border-[#2a2a2a]">
      <table className="w-full min-w-[520px] border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-[#2a2a2a] bg-[#141414]">
            {headers.map((h) => (
              <th key={h} className="px-4 py-3 font-medium text-[#e8e8e8]">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr
              key={i}
              className="border-b border-[#1f1f1f] last:border-b-0 hover:bg-white/[0.02]"
            >
              {row.map((cell, j) => (
                <td key={j} className="px-4 py-3 align-top text-[#a3a3a3]">
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
    <pre className="overflow-x-auto rounded-xl border border-[#2a2a2a] bg-[#0d0d0d] p-4 font-mono text-[12.5px] leading-6 text-[#c4c4c4]">
      <code>{children}</code>
    </pre>
  );
}

function FlowNode({
  label,
  accent,
  sub,
}: {
  label: string;
  accent?: boolean;
  sub?: string;
}) {
  return (
    <div
      className={cn(
        "shrink-0 rounded-lg border px-3 py-2.5 text-center",
        accent
          ? "border-[#18E299]/40 bg-[#18E299]/10"
          : "border-[#2a2a2a] bg-[#141414]",
      )}
    >
      <p
        className={cn(
          "text-[12.5px] font-medium",
          accent ? "text-[#18E299]" : "text-[#e8e8e8]",
        )}
      >
        {label}
      </p>
      {sub ? (
        <p className="mt-0.5 text-[10.5px] text-[#737373]">{sub}</p>
      ) : null}
    </div>
  );
}

function BniiPlatformFlow() {
  const spine = [
    "Partner Apps",
    "Event Pipeline",
    "Consent Layer",
    "Classification Engine",
    "Governed Data Lake",
  ];
  const surfaces: { label: string; sub?: string; accent?: boolean }[] = [
    { label: "Intelligence APIs" },
    { label: "AI Query Engine", sub: "Aria", accent: true },
    { label: "Customer Models" },
    { label: "Execution Environment" },
  ];

  return (
    <div className="overflow-x-auto rounded-xl border border-[#2a2a2a] bg-[#0d0d0d] p-5">
      <p className="mb-4 text-[11px] font-medium uppercase tracking-[0.14em] text-[#666]">
        Platform data path
      </p>
      <div className="flex min-w-max items-center gap-1.5">
        {spine.map((label, i) => (
          <div key={label} className="flex items-center gap-1.5">
            {i > 0 ? (
              <span className="text-[#555]" aria-hidden>
                →
              </span>
            ) : null}
            <FlowNode
              label={label}
              accent={label === "Governed Data Lake"}
            />
          </div>
        ))}
      </div>
      <div className="mt-6 grid min-w-[36rem] grid-cols-4 gap-2 border-t border-dashed border-[#2a2a2a] pt-5">
        {surfaces.map((s) => (
          <div key={s.label} className="flex flex-col items-center gap-2">
            <span className="text-[11px] text-[#555]" aria-hidden>
              ↓
            </span>
            <div className="w-full">
              <FlowNode label={s.label} sub={s.sub} accent={s.accent} />
            </div>
          </div>
        ))}
      </div>
      <p className="mt-5 text-[13px] leading-6 text-[#888]">
        Aria sits on the{" "}
        <span className="text-[#c4c4c4]">AI Query Engine</span> surface —
        consuming governed intelligence. Raw signal never reaches the chat
        boundary.
      </p>
    </div>
  );
}

export function DocsShell() {
  const [active, setActive] = useState("overview");
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
    <div className="min-h-screen bg-[#0a0a0a] text-[#c4c4c4]">
      {/* Mintlify-style top bar */}
      <header className="sticky top-0 z-50 border-b border-[#1f1f1f] bg-[#0a0a0a]/95 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-[1400px] items-center justify-between gap-4 px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="rounded-md border border-[#2a2a2a] px-2 py-1 text-xs text-[#a3a3a3] lg:hidden"
              onClick={() => setMobileOpen((v) => !v)}
            >
              Menu
            </button>
            <Link href="/docs" className="flex items-center gap-2.5">
              <AriaLogo className="h-6 w-auto text-white" />
              <span className="text-sm font-semibold text-white">Aria Docs</span>
            </Link>
            <span className="hidden rounded-full border border-[#2a2a2a] bg-[#141414] px-2 py-0.5 text-[10px] font-medium text-[#888] sm:inline">
              Internal
            </span>
          </div>
          <nav className="flex items-center gap-1">
            <Link
              href="/docs/architecture"
              title="Architecture"
              aria-label="Architecture"
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-[#a3a3a3] transition hover:bg-white/[0.06] hover:text-white"
            >
              <Layers className="h-[18px] w-[18px]" strokeWidth={1.75} />
            </Link>
            <Link
              href="/"
              title="Open app"
              aria-label="Open app"
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-[#a3a3a3] transition hover:bg-white/[0.06] hover:text-white"
            >
              <AppWindow className="h-[18px] w-[18px]" strokeWidth={1.75} />
            </Link>
            <a
              href="https://github.com/Gokulakrishnan96/ARIA"
              target="_blank"
              rel="noreferrer"
              title="GitHub"
              aria-label="GitHub"
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-[#a3a3a3] transition hover:bg-white/[0.06] hover:text-white"
            >
              <Github className="h-[18px] w-[18px]" strokeWidth={1.75} />
            </a>
          </nav>
        </div>
      </header>

      <div className="mx-auto flex max-w-[1400px]">
        {/* Mintlify-style sidebar */}
        <aside
          className={cn(
            "fixed inset-y-14 left-0 z-40 w-[260px] overflow-y-auto border-r border-[#1f1f1f] bg-[#0a0a0a] px-4 py-6 lg:sticky lg:top-14 lg:block lg:h-[calc(100vh-3.5rem)]",
            mobileOpen ? "block" : "hidden",
          )}
        >
          <nav className="space-y-6">
            {NAV.map((group) => (
              <div key={group.title}>
                <p className="mb-2 px-2.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#666]">
                  {group.title}
                </p>
                <ul className="space-y-0.5">
                  {group.items.map((item) => (
                    <li key={item.id}>
                      <button
                        type="button"
                        onClick={() => jump(item.id)}
                        className={cn(
                          "w-full rounded-lg px-2.5 py-1.5 text-left text-[13.5px] transition",
                          active === item.id
                            ? "bg-[#18E299]/10 font-medium text-[#18E299]"
                            : "text-[#a3a3a3] hover:bg-white/[0.04] hover:text-white",
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

          <div className="mt-8 border-t border-[#1f1f1f] pt-4">
            <Link
              href="/docs/architecture"
              className="block rounded-lg px-2.5 py-2 text-[13px] text-[#888] transition hover:bg-white/[0.04] hover:text-white"
            >
              Full architecture board →
            </Link>
          </div>
        </aside>

        {/* Content */}
        <main className="min-w-0 flex-1 px-4 py-10 sm:px-8 lg:px-12 lg:py-12">
          <article className="mx-auto max-w-[720px]">
            <div className="mb-3 flex items-center gap-2 text-[13px] text-[#666]">
              <span>Internal documentation</span>
              <span aria-hidden>·</span>
              <span>v0.1</span>
            </div>
            <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-[2.75rem]">
              Aria
            </h1>
            <p className="mt-4 text-[16px] leading-7 text-[#a3a3a3]">
              Research-first intelligence interface. Internal docs for build
              owners — what exists, what must not drift, and what BNII surfaces
              require before the next layer of code.
            </p>

            <div className="mt-6">
              <Callout title="Internal documentation">
                Architecture, contracts, and build priorities for owners.
                Credits, APIs, dual-write schemas, and tenant execution start
                only after this pack is confirmed.
              </Callout>
            </div>

            <div id="overview" className="scroll-mt-24 mt-12 space-y-4">
              <H3>Platform flow</H3>
              <BniiPlatformFlow />
              <p className="text-[13px]">
                <Link
                  href="/docs/architecture"
                  className="font-medium text-[#18E299] hover:underline"
                >
                  Open full architecture →
                </Link>
              </p>

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
            </div>

            <Section id="positioning" title="Product positioning">
              <P>
                The intelligence industry sees the top and middle of markets
                well, and the bottom of emerging markets barely at all.
                Embedded inside partner apps — telco, wallet, bank — we
                generate consented behavioural signal at the point of action.
                BNII turns that position into sellable, market-level
                intelligence. Aria is the human-facing{" "}
                <span className="text-white">AI Query Engine</span> surface on
                the platform data path above.
              </P>
              <H3>Why now</H3>
              <Table
                headers={["Fact", "Implication"]}
                rows={[
                  ["~384M monthly transacting users", "The position is live today"],
                  ["Frontier models are rentable", "Models are no longer the scarce asset"],
                  [
                    "Embedded footprint is hard to copy",
                    "Window is open; compound advantage",
                  ],
                ]}
              />
              <H3>Five commercial surfaces — one asset</H3>
              <Table
                headers={["#", "Surface", "Buyer intent"]}
                rows={[
                  ["1", "Credits", "Metered Q&A / briefs — audit log = billing"],
                  ["2", "Build on top", "Intelligence as substrate for their models"],
                  ["3", "Bring your own data", "Theirs × our market backdrop"],
                  ["4", "Data & intelligence APIs", "Pull indices into pipelines"],
                  [
                    "5",
                    "Run on our infra",
                    "Model to data; raw signal never egresses",
                  ],
                ]}
              />
            </Section>

            <Section id="quickstart" title="Quickstart">
              <P>Node.js 20+ and a Google AI Studio API key.</P>
              <Code>{`npm install
# .env.local
GOOGLE_GENERATIVE_AI_API_KEY=...

npm run dev
# App  → http://localhost:3000
# Docs → http://localhost:3000/docs`}</Code>
            </Section>

            <Section id="architecture" title="Architecture overview">
              <P>
                Platform spine first — Aria is one consumer of the Governed Data
                Lake, not the data plane itself. See{" "}
                <a href="#overview" className="font-medium text-[#18E299] hover:underline">
                  Platform data path
                </a>{" "}
                above, or the{" "}
                <Link
                  href="/docs/architecture"
                  className="font-medium text-[#18E299] hover:underline"
                >
                  full architecture board
                </Link>
                .
              </P>
              <Table
                headers={["Node", "Role"]}
                rows={[
                  ["Partner Apps", "Source of consented behavioural signal"],
                  ["Event Pipeline", "Ingest + dual-write boundary"],
                  ["Consent Layer", "Gate every downstream use"],
                  ["Classification Engine", "Labels, segments, quality evals"],
                  [
                    "Governed Data Lake",
                    "k-floor aggregates; single source of truth",
                  ],
                  ["Intelligence APIs", "Structured pull for partner pipelines"],
                  ["AI Query Engine", "Aria — briefs, credits, metered Q&A"],
                  ["Customer Models", "Build-on-top / BYOD substrate"],
                  [
                    "Execution Environment",
                    "Run-on-infra; model comes to data",
                  ],
                ]}
              />
              <H3>Aria application stack</H3>
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
              <ol className="list-decimal space-y-2 pl-5">
                <li>
                  One write path — all model I/O via{" "}
                  <code className="rounded bg-[#1a1a1a] px-1.5 py-0.5 text-[13px] text-[#18E299]">
                    POST /api/chat
                  </code>
                  .
                </li>
                <li>
                  Search before memory when Search is on — empty research → 503.
                </li>
                <li>
                  Deep Research is a contract — fixed sections, institutional
                  tone.
                </li>
                <li>Secrets stay server-side.</li>
                <li>
                  Auditability first — credits and APIs share one metering
                  ledger.
                </li>
              </ol>
            </Section>

            <Section id="system-map" title="System map">
              <P>
                Aria implements the AI Query Engine box on the platform path.
                Runtime detail below; spine nodes are listed under Architecture
                overview.
              </P>
              <H3>Aria runtime (AI Query Engine)</H3>
              <Code>{`Browser: AppShell · Thread · Composer · Zustand · localStorage
        │ POST /api/chat
        ▼
Server: Model router → Independent web research → streamText → UI stream`}</Code>
            </Section>

            <Section id="data-flow" title="Data flow">
              <ol className="list-decimal space-y-2 pl-5">
                <li>Composer submit → transport reads Zustand flags.</li>
                <li>Server validates messages; resolves Aria model.</li>
                <li>
                  If search or deep research: research packet → system prompt.
                  Empty → 503.
                </li>
                <li>
                  Compose prompt layers →{" "}
                  <code className="rounded bg-[#1a1a1a] px-1.5 py-0.5 text-[13px] text-[#18E299]">
                    streamText
                  </code>{" "}
                  → UI message stream.
                </li>
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
                * Deep Research forces{" "}
                <code className="rounded bg-[#1a1a1a] px-1.5 py-0.5 text-[13px] text-[#18E299]">
                  webSearch: true
                </code>
                . With Google + search, answers use Flash Lite free-tier
                override.
              </P>
            </Section>

            <Section id="trust" title="Trust boundary">
              <Table
                headers={["Zone", "Assets"]}
                rows={[
                  [
                    "Server-only",
                    "API keys · page fetches · model invocation",
                  ],
                  [
                    "Client-only today",
                    "Threads · prefs · mock profile/usage · exports",
                  ],
                ]}
              />
              <H3>BNII invariants</H3>
              <ol className="list-decimal space-y-2 pl-5">
                <li>Consent gates at every surface.</li>
                <li>k-floor before any market-level release.</li>
                <li>Audit log ≡ metering ledger — one system.</li>
                <li>
                  Raw behavioural signal never egresses on deepest surface.
                </li>
                <li>Dual-write: operational store ≠ intelligence store.</li>
              </ol>
            </Section>

            <Section id="chat" title="Chat">
              <P>
                Runtime: assistant-ui + AI SDK transport to{" "}
                <code className="rounded bg-[#1a1a1a] px-1.5 py-0.5 text-[13px] text-[#18E299]">
                  /api/chat
                </code>
                . Composer exposes model, Search, and Deep Research.
              </P>
            </Section>

            <Section id="deep-research" title="Deep Research">
              <P>
                Methodology surface: strict system prompt + forced web research
                + client brief parser. Not a multi-agent graph.
              </P>
              <Table
                headers={["Section", "Purpose"]}
                rows={[
                  ["Title", "Precise scope"],
                  ["Executive Summary", "Core conclusion first"],
                  ["Key Findings", "Standalone decision-ready statements"],
                  [
                    "Detailed Analysis",
                    "Context, drivers, evidence, implications",
                  ],
                  [
                    "Areas of Uncertainty",
                    "Mandatory — contested / unresolved",
                  ],
                  ["Sources", "Numbered links; body citations must match"],
                ]}
              />
              <Callout title="Buyer note">
                Methodology-literate buyers audit discipline, not chat fluency.
                Uncertainty and source rules are load-bearing.
              </Callout>
            </Section>

            <Section id="web-search" title="Web search">
              <P>
                Independent pipeline (not Gemini{" "}
                <code className="rounded bg-[#1a1a1a] px-1.5 py-0.5 text-[13px] text-[#18E299]">
                  google_search
                </code>
                ): normalize → DDG/Bing → fetch pages → findings packet → answer
                only from that packet.
              </P>
            </Section>

            <Section id="models" title="Models">
              <Table
                headers={["UI", "Id", "Provider model"]}
                rows={[
                  ["Aria Nano", "aria-nano", "gemini-3.1-flash-lite-preview"],
                  ["Aria Mini", "aria-mini", "gemini-3-flash-preview"],
                  ["Aria Max", "aria-max", "gemini-3.1-pro-preview"],
                ]}
              />
            </Section>

            <Section id="export" title="Export & share">
              <P>
                Share copies{" "}
                <code className="rounded bg-[#1a1a1a] px-1.5 py-0.5 text-[13px] text-[#18E299]">
                  ?chat=&lt;id&gt;
                </code>{" "}
                — same-browser only. Export: PDF, DOCX, PPTX, XLSX, CSV, JSON.
              </P>
            </Section>

            <Section id="api" title="Chat API">
              <P>
                <code className="rounded bg-[#1a1a1a] px-1.5 py-0.5 text-[13px] text-[#18E299]">
                  POST /api/chat
                </code>{" "}
                — sole backend endpoint.
              </P>
              <Code>{`{
  messages: UIMessage[];
  system?: string;
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

            <Section id="contracts" title="Contracts">
              <Table
                headers={["Variable", "Required"]}
                rows={[
                  ["GOOGLE_GENERATIVE_AI_API_KEY", "Yes (current models)"],
                  ["OPENAI_API_KEY", "Only if provider is openai"],
                ]}
              />
            </Section>

            <Section id="bnii-surfaces" title="BNII surfaces">
              <ol className="list-decimal space-y-3 pl-5">
                <li>
                  <span className="text-white">Credits</span> — audit log is
                  the billing ledger.
                </li>
                <li>
                  <span className="text-white">Build on top</span> —
                  intelligence as substrate.
                </li>
                <li>
                  <span className="text-white">Bring your own data</span> —
                  theirs × our market backdrop.
                </li>
                <li>
                  <span className="text-white">Data & intelligence APIs</span> —
                  governed pull into pipelines.
                </li>
                <li>
                  <span className="text-white">Run on our infra</span> — model
                  to data; no raw egress.
                </li>
              </ol>
            </Section>

            <Section id="priorities" title="Build priorities">
              <Table
                headers={["P", "Workstream", "Why now"]}
                rows={[
                  ["P0", "Event pipeline", "Nothing downstream is credible without it"],
                  ["P0", "Methodology surface", "What buyers audit"],
                  ["P0", "Dual-write schema boundary", "Compliance + coupling risk"],
                  ["P1", "Metering + credit layer", "Audit = billing; one system"],
                  ["P1", "Classification-quality evals", "Survive methodology RFPs"],
                  ["P1", "Licensed feeds", "Source credibility for commercial claims"],
                  ["P2", "Persistent connected data", "BYOD + cross-device + real usage"],
                  ["P2", "Tenant-isolated execution", "Deepest surface without egress"],
                ]}
              />
            </Section>

            <Section id="governance" title="Governance">
              <Table
                headers={["Gate", "Meaning"]}
                rows={[
                  ["Consent", "Signal enters only under partner / user terms"],
                  ["k-floor", "Aggregates release only above minimum cohort size"],
                  ["Audit + meter", "Every query/pull/job is durable + billable"],
                ]}
              />
              <Callout title="Next step">
                Confirm this pack. After sign-off: event schema → methodology
                evals → metering/credits → APIs — not the reverse.
              </Callout>
            </Section>
          </article>
        </main>
      </div>
    </div>
  );
}
