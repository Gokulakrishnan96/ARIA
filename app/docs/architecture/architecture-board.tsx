"use client";

import Link from "next/link";
import { AppWindow, BookOpen, Layers } from "lucide-react";
import { AriaLogo } from "@/components/aria/aria-logo";
import { cn } from "@/lib/utils";

function GitHubIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
      className={className}
    >
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.44 9.8 8.21 11.39.6.11.82-.26.82-.58 0-.28-.01-1.04-.02-2.04-3.34.73-4.04-1.61-4.04-1.61-.55-1.39-1.33-1.76-1.33-1.76-1.09-.74.08-.73.08-.73 1.2.09 1.84 1.24 1.84 1.24 1.07 1.83 2.8 1.3 3.49 1 .11-.78.42-1.3.76-1.6-2.66-.3-5.46-1.33-5.46-5.93 0-1.31.47-2.38 1.24-3.22-.12-.3-.54-1.52.12-3.18 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 0 1 3-.4c1.02 0 2.05.14 3.01.4 2.29-1.55 3.3-1.23 3.3-1.23.66 1.66.24 2.88.12 3.18.77.84 1.24 1.91 1.24 3.22 0 4.61-2.8 5.62-5.47 5.92.43.37.81 1.1.81 2.22 0 1.6-.01 2.89-.01 3.29 0 .32.22.7.82.58A12.01 12.01 0 0 0 24 12c0-6.63-5.37-12-12-12Z" />
    </svg>
  );
}

type NodeStatus = "live" | "partial" | "planned";

function StatusDot({ status }: { status: NodeStatus }) {
  return (
    <span
      className={cn(
        "inline-block h-1.5 w-1.5 shrink-0 rounded-full",
        status === "live" && "bg-[#18E299]",
        status === "partial" && "bg-amber-400",
        status === "planned" && "bg-[#555]",
      )}
      title={status}
    />
  );
}

function Box({
  title,
  subtitle,
  status,
  accent,
  className,
}: {
  title: string;
  subtitle?: string;
  status: NodeStatus;
  accent?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border px-4 py-3.5",
        accent
          ? "border-[#18E299]/35 bg-[#18E299]/[0.07]"
          : "border-[#2a2a2a] bg-[#141414]",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <p
          className={cn(
            "text-[13.5px] font-semibold leading-snug",
            accent ? "text-[#18E299]" : "text-white",
          )}
        >
          {title}
        </p>
        <StatusDot status={status} />
      </div>
      {subtitle ? (
        <p className="mt-1.5 text-[12.5px] leading-relaxed text-[#888]">
          {subtitle}
        </p>
      ) : null}
    </div>
  );
}

function LayerLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.1em] text-[#666]">
      {children}
    </p>
  );
}

function ArrowDown() {
  return (
    <div className="flex justify-center py-2" aria-hidden>
      <div className="flex flex-col items-center text-[#444]">
        <div className="h-3 w-px bg-[#333]" />
        <span className="text-[10px] leading-none">↓</span>
      </div>
    </div>
  );
}

function GateChip({ label }: { label: string }) {
  return (
    <span className="rounded-lg border border-[#2a2a2a] bg-[#0d0d0d] px-2.5 py-1.5 text-[12px] text-[#a3a3a3]">
      {label}
    </span>
  );
}

export function ArchitectureBoard() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#c4c4c4]">
      {/* Mintlify top bar */}
      <header className="sticky top-0 z-50 border-b border-[#1f1f1f] bg-[#0a0a0a]/95 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-[1400px] items-center justify-between px-4 sm:px-6">
          <Link href="/docs" className="flex items-center gap-2.5">
            <AriaLogo className="h-6 w-auto text-white" />
            <span className="text-sm font-semibold text-white">Aria Docs</span>
            <span className="hidden rounded-full border border-[#2a2a2a] bg-[#141414] px-2 py-0.5 text-[10px] font-medium text-[#888] sm:inline">
              Internal
            </span>
          </Link>
          <nav className="flex items-center gap-1">
            <Link
              href="/docs"
              title="Documentation"
              aria-label="Documentation"
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-[#a3a3a3] transition hover:bg-white/[0.06] hover:text-white"
            >
              <BookOpen className="h-[18px] w-[18px]" strokeWidth={1.75} />
            </Link>
            <Link
              href="/docs/architecture"
              title="Architecture"
              aria-label="Architecture"
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-[#18E299]/10 text-[#18E299] transition hover:bg-[#18E299]/15"
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
              <GitHubIcon className="h-[18px] w-[18px]" />
            </a>
          </nav>
        </div>
      </header>

      <div className="mx-auto flex max-w-[1400px]">
        {/* Sidebar */}
        <aside className="sticky top-14 hidden h-[calc(100vh-3.5rem)] w-[240px] shrink-0 overflow-y-auto border-r border-[#1f1f1f] px-4 py-6 lg:block">
          <p className="mb-2 px-2.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#666]">
            Architecture
          </p>
          <nav className="space-y-0.5">
            {[
              ["spine", "Platform spine"],
              ["surfaces", "Consumption surfaces"],
              ["commercial", "Commercial depth"],
              ["aria", "Aria runtime"],
              ["request", "Request path"],
              ["governance", "Governance"],
              ["build", "Build order"],
            ].map(([id, label]) => (
              <a
                key={id}
                href={`#${id}`}
                className="block rounded-lg px-2.5 py-1.5 text-[13.5px] text-[#a3a3a3] transition hover:bg-white/[0.04] hover:text-white"
              >
                {label}
              </a>
            ))}
          </nav>
          <div className="mt-8 border-t border-[#1f1f1f] pt-4">
            <Link
              href="/docs"
              className="block rounded-lg px-2.5 py-2 text-[13px] text-[#888] transition hover:text-white"
            >
              ← All documentation
            </Link>
          </div>
        </aside>

        <main className="min-w-0 flex-1 px-4 py-10 sm:px-8 lg:px-12">
          <article className="mx-auto max-w-[760px]">
            <div className="mb-3 flex items-center gap-2 text-[13px] text-[#666]">
              <span>Internal documentation</span>
              <span aria-hidden>·</span>
              <span>Architecture</span>
            </div>
            <h1 className="text-4xl font-semibold tracking-tight text-white">
              Full architecture
            </h1>
            <p className="mt-4 text-[16px] leading-7 text-[#a3a3a3]">
              One spine from partner signal to sellable intelligence. Aria is
              the <span className="text-white">AI Query Engine</span> — not the
              data plane. Every surface shares consent, k-floor, and
              audit-and-metering gates.
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-4 text-[12px] text-[#888]">
              <span className="inline-flex items-center gap-1.5">
                <StatusDot status="live" /> Live in Aria
              </span>
              <span className="inline-flex items-center gap-1.5">
                <StatusDot status="partial" /> Partial
              </span>
              <span className="inline-flex items-center gap-1.5">
                <StatusDot status="planned" /> Roadmap
              </span>
            </div>

            {/* 01 */}
            <section id="spine" className="scroll-mt-24 mt-14">
              <LayerLabel>01 · Platform spine</LayerLabel>
              <div className="rounded-xl border border-[#2a2a2a] bg-[#0d0d0d] p-5">
                <Box
                  title="Partner Apps"
                  subtitle="Telco · wallet · bank — consented behavioural signal (~384M MTU footprint)"
                  status="planned"
                />
                <ArrowDown />
                <Box
                  title="Event Pipeline"
                  subtitle="Ingest, normalize, dual-write — operational store ≠ intelligence store"
                  status="planned"
                />
                <ArrowDown />
                <Box
                  title="Consent Layer"
                  subtitle="Every downstream use gated by partner / user consent terms"
                  status="planned"
                />
                <ArrowDown />
                <Box
                  title="Classification Engine"
                  subtitle="Labels, segments, taxonomy — quality proven by eval harness"
                  status="planned"
                />
                <ArrowDown />
                <Box
                  title="Governed Data Lake"
                  subtitle="k-floor aggregates · single source of truth · raw signal never egresses from deepest surfaces"
                  status="planned"
                  accent
                />
              </div>
            </section>

            {/* 02 */}
            <section id="surfaces" className="scroll-mt-24 mt-14">
              <LayerLabel>02 · Consumption surfaces</LayerLabel>
              <p className="mb-4 text-[14px] leading-relaxed text-[#888]">
                Four ways to consume the lake. Same gates at every boundary.
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                <Box
                  title="Intelligence APIs"
                  subtitle="Governed datasets, indices, structured intelligence into partner pipelines"
                  status="planned"
                />
                <Box
                  title="AI Query Engine — Aria"
                  subtitle="Metered Q&A, Deep Research briefs, credits · audit log = billing ledger"
                  status="partial"
                  accent
                />
                <Box
                  title="Customer Models"
                  subtitle="Build on top / BYOD — their data × our market backdrop"
                  status="planned"
                />
                <Box
                  title="Execution Environment"
                  subtitle="Run on our infra — model comes to data; raw signal stays inside"
                  status="planned"
                />
              </div>
            </section>

            {/* 03 */}
            <section id="commercial" className="scroll-mt-24 mt-14">
              <LayerLabel>03 · Commercial depth</LayerLabel>
              <div className="overflow-x-auto rounded-xl border border-[#2a2a2a]">
                <table className="w-full min-w-[640px] border-collapse text-left text-[13px]">
                  <thead>
                    <tr className="border-b border-[#2a2a2a] bg-[#141414]">
                      {["Depth", "Surface", "Maps to", "Buyer gets"].map(
                        (h) => (
                          <th
                            key={h}
                            className="px-4 py-3 font-medium text-[#e8e8e8]"
                          >
                            {h}
                          </th>
                        ),
                      )}
                    </tr>
                  </thead>
                  <tbody className="text-[#a3a3a3]">
                    {[
                      ["1", "Credits", "AI Query Engine", "Metered briefs & answers"],
                      [
                        "2",
                        "Build on top",
                        "Customer Models",
                        "Intelligence as substrate",
                      ],
                      [
                        "3",
                        "Bring your own data",
                        "Customer Models",
                        "Theirs × our backdrop",
                      ],
                      [
                        "4",
                        "Data & intelligence APIs",
                        "Intelligence APIs",
                        "Pull into their stack",
                      ],
                      [
                        "5",
                        "Run on our infra",
                        "Execution Environment",
                        "Output only; no raw egress",
                      ],
                    ].map((row) => (
                      <tr
                        key={row[0]}
                        className="border-b border-[#1f1f1f] last:border-b-0"
                      >
                        {row.map((cell, i) => (
                          <td
                            key={i}
                            className={cn(
                              "px-4 py-3",
                              i === 1 && "font-medium text-[#e8e8e8]",
                            )}
                          >
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {/* 04 */}
            <section id="aria" className="scroll-mt-24 mt-14">
              <LayerLabel>04 · Aria — AI Query Engine (today)</LayerLabel>
              <div className="rounded-xl border border-[#2a2a2a] bg-[#0d0d0d] p-5">
                <div className="grid gap-3 sm:grid-cols-3">
                  <Box
                    title="Client"
                    subtitle="AppShell · Thread · Composer · Zustand · localStorage"
                    status="live"
                  />
                  <Box
                    title="API"
                    subtitle="POST /api/chat — sole model write path"
                    status="live"
                  />
                  <Box
                    title="Models"
                    subtitle="Nano / Mini / Max → Gemini (swappable)"
                    status="live"
                  />
                </div>
                <ArrowDown />
                <div className="grid gap-3 sm:grid-cols-2">
                  <Box
                    title="Independent web research"
                    subtitle="Normalize → DDG/Bing → fetch → ground · empty → 503"
                    status="live"
                  />
                  <Box
                    title="Deep Research contract"
                    subtitle="Fixed brief sections · uncertainty mandatory · sources"
                    status="live"
                  />
                </div>
                <ArrowDown />
                <div className="grid gap-3 sm:grid-cols-3">
                  <Box
                    title="Stream response"
                    subtitle="UI message parts + sources"
                    status="live"
                  />
                  <Box
                    title="Export"
                    subtitle="PDF · DOCX · PPTX · XLSX · CSV · JSON"
                    status="live"
                  />
                  <Box
                    title="Credits / audit ledger"
                    subtitle="Not built — design with event schema first"
                    status="planned"
                  />
                </div>
              </div>
            </section>

            {/* 05 */}
            <section id="request" className="scroll-mt-24 mt-14">
              <LayerLabel>05 · Request path</LayerLabel>
              <div className="overflow-x-auto rounded-xl border border-[#2a2a2a] bg-[#0d0d0d] p-5">
                <div className="flex min-w-max items-stretch gap-2">
                  {[
                    { t: "Composer", s: "Flags from store" },
                    { t: "Transport", s: "model · search · deep" },
                    { t: "/api/chat", s: "Validate + route" },
                    { t: "Research", s: "If search on" },
                    { t: "streamText", s: "Answer model" },
                    { t: "UI stream", s: "Brief / markdown" },
                  ].map((step, i) => (
                    <div key={step.t} className="flex items-center gap-2">
                      {i > 0 ? (
                        <span className="text-[#444]" aria-hidden>
                          →
                        </span>
                      ) : null}
                      <div className="w-[118px] rounded-xl border border-[#2a2a2a] bg-[#141414] px-3 py-3 text-center">
                        <p className="text-[12.5px] font-semibold text-white">
                          {step.t}
                        </p>
                        <p className="mt-1 text-[10.5px] text-[#737373]">
                          {step.s}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* 06 */}
            <section id="governance" className="scroll-mt-24 mt-14">
              <LayerLabel>06 · Governance spine</LayerLabel>
              <div className="rounded-xl border border-[#2a2a2a] bg-[#0d0d0d] p-5">
                <p className="mb-4 text-[14px] leading-relaxed text-[#888]">
                  Non-negotiable across every consumption surface. Governance
                  does not weaken with depth — it makes depth sellable.
                </p>
                <div className="flex flex-wrap gap-2">
                  <GateChip label="Consent" />
                  <GateChip label="k-floor" />
                  <GateChip label="Audit ≡ Metering" />
                  <GateChip label="No raw egress" />
                  <GateChip label="Dual-write boundary" />
                </div>
              </div>
            </section>

            {/* 07 */}
            <section id="build" className="scroll-mt-24 mt-14 mb-8">
              <LayerLabel>07 · Build order</LayerLabel>
              <div className="grid gap-2">
                {[
                  {
                    p: "P0",
                    items:
                      "Event pipeline · Methodology surface · Dual-write schema",
                  },
                  {
                    p: "P1",
                    items:
                      "Metering + credits · Classification evals · Licensed feeds",
                  },
                  {
                    p: "P2",
                    items:
                      "Persistent connected data · Tenant-isolated execution",
                  },
                ].map((row) => (
                  <div
                    key={row.p}
                    className="flex items-baseline gap-4 rounded-xl border border-[#2a2a2a] bg-[#141414] px-4 py-3"
                  >
                    <span className="w-8 shrink-0 text-[12px] font-semibold text-[#18E299]">
                      {row.p}
                    </span>
                    <span className="text-[13px] text-[#a3a3a3]">{row.items}</span>
                  </div>
                ))}
              </div>

              <div className="mt-6 rounded-xl border border-[#18E299]/25 bg-[#18E299]/[0.06] px-4 py-3.5 text-[14px] leading-relaxed text-[#b7e8d3]">
                Design the{" "}
                <span className="font-semibold text-[#18E299]">
                  audit event schema
                </span>{" "}
                once. Reuse it for credibility, compliance, and billing — never
                a second metering path for APIs later.
              </div>
            </section>
          </article>
        </main>
      </div>
    </div>
  );
}
