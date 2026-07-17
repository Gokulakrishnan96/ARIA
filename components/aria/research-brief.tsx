"use client";

import { useAuiState } from "@assistant-ui/react";
import { ChevronDownIcon, ExternalLinkIcon, LinkIcon } from "lucide-react";
import { memo, useMemo, type FC, type ReactNode } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { MarkdownText } from "@/components/assistant-ui/markdown-text";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  parseResearchBrief,
  parseSourceLinks,
} from "@/lib/parse-research-brief";
import { cn } from "@/lib/utils";

const ResearchBriefImpl: FC = () => {
  const text = useAuiState((s) =>
    s.part.type === "text" ? s.part.text : "",
  );
  const isRunning = useAuiState((s) => s.message.status?.type === "running");

  const brief = useMemo(() => parseResearchBrief(text), [text]);
  const sources = useMemo(
    () => parseSourceLinks(brief.sources),
    [brief.sources],
  );

  if (!brief.isBrief) {
    return <MarkdownText />;
  }

  const title = brief.title || brief.headline;
  const analysisBody =
    brief.detailedAnalysis || brief.analysis || brief.executiveSummary;
  const linkCount = sources.filter((s) => s.url).length;
  const hasSourcesBody = brief.sources.length > 0;
  const showSources =
    hasSourcesBody || (!isRunning && Boolean(title || analysisBody));

  return (
    <div data-slot="aria-research-brief" className="space-y-5">
      {title ? (
        <h2 className="text-foreground text-[15px] font-semibold leading-snug tracking-tight sm:text-base">
          {title}
        </h2>
      ) : null}

      {brief.executiveSummary ? (
        <BriefSection label="Executive Summary">
          <MarkdownBody>{brief.executiveSummary}</MarkdownBody>
        </BriefSection>
      ) : null}

      {brief.keyFindings ? (
        <BriefSection label="Key Findings">
          <MarkdownBody>{brief.keyFindings}</MarkdownBody>
        </BriefSection>
      ) : null}

      {brief.detailedAnalysis ? (
        <BriefSection label="Detailed Analysis">
          <MarkdownBody>{brief.detailedAnalysis}</MarkdownBody>
        </BriefSection>
      ) : brief.analysis ? (
        <BriefSection label="Analysis">
          <MarkdownBody>{brief.analysis}</MarkdownBody>
        </BriefSection>
      ) : null}

      {brief.areasOfUncertainty ? (
        <BriefSection label="Areas of Uncertainty">
          <MarkdownBody>{brief.areasOfUncertainty}</MarkdownBody>
        </BriefSection>
      ) : null}

      {showSources ? (
        <SourcesDisclosure
          sources={sources}
          linkCount={linkCount}
          fallbackText={brief.sources}
        />
      ) : null}
    </div>
  );
};

const BriefSection: FC<{ label: string; children: ReactNode }> = ({
  label,
  children,
}) => (
  <section className="space-y-2">
    <h3 className="text-muted-foreground text-[11px] font-medium tracking-wide uppercase">
      {label}
    </h3>
    {children}
  </section>
);

const MarkdownBody: FC<{ children: string }> = ({ children }) => (
  <div className="aui-md text-foreground/90 space-y-3 text-[13px] leading-relaxed sm:text-sm">
    <ReactMarkdown remarkPlugins={[remarkGfm]}>{children}</ReactMarkdown>
  </div>
);

type SourcesDisclosureProps = {
  sources: ReturnType<typeof parseSourceLinks>;
  linkCount: number;
  fallbackText: string;
};

const SourcesDisclosure: FC<SourcesDisclosureProps> = ({
  sources,
  linkCount,
  fallbackText,
}) => {
  const label = linkCount > 0 ? `Sources · ${linkCount}` : "Sources";

  return (
    <Collapsible
      defaultOpen={false}
      className="group/sources border-border/40 mt-1 border-t pt-3"
    >
      <CollapsibleTrigger
        className={cn(
          "group/sources-trigger text-muted-foreground hover:text-foreground flex origin-left items-center gap-1.5 py-1 text-[13px] transition-[color,scale] outline-none active:scale-[0.98]",
        )}
      >
        <LinkIcon className="size-3.5 shrink-0 opacity-70" aria-hidden />
        <span className="font-medium">{label}</span>
        <ChevronDownIcon
          className={cn(
            "size-3.5 shrink-0 opacity-60 transition-transform duration-200",
            "group-data-panel-open/sources-trigger:rotate-180",
          )}
          aria-hidden
        />
      </CollapsibleTrigger>

      <CollapsibleContent className="overflow-hidden data-closed:animate-collapsible-up data-open:animate-collapsible-down">
        <div className="pt-2 pb-1">
          {sources.length === 0 ? (
            <p className="text-muted-foreground text-[13px] leading-relaxed">
              {fallbackText ||
                "No external sources used — based on general knowledge."}
            </p>
          ) : (
            <ol className="flex flex-col gap-1.5">
              {sources.map((source, index) => (
                <li key={`${source.raw}-${index}`}>
                  {source.url ? (
                    <a
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-foreground/85 hover:text-foreground group/link flex items-start gap-2 rounded-md px-1.5 py-1.5 text-[13px] leading-snug transition-colors hover:bg-white/5"
                    >
                      <span className="text-muted-foreground mt-0.5 w-4 shrink-0 tabular-nums text-xs">
                        {index + 1}.
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-medium">
                          {source.title}
                        </span>
                        <span className="text-muted-foreground mt-0.5 block truncate text-[11px]">
                          {source.url.replace(/^https?:\/\//, "")}
                        </span>
                      </span>
                      <ExternalLinkIcon className="text-muted-foreground mt-0.5 size-3 shrink-0 opacity-0 transition-opacity group-hover/link:opacity-70" />
                    </a>
                  ) : (
                    <div className="text-muted-foreground flex items-start gap-2 px-1.5 py-1.5 text-[13px] leading-snug">
                      <span className="mt-0.5 w-4 shrink-0 tabular-nums text-xs">
                        {index + 1}.
                      </span>
                      <span>{source.title}</span>
                    </div>
                  )}
                </li>
              ))}
            </ol>
          )}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};

export const ResearchBrief = memo(ResearchBriefImpl);
