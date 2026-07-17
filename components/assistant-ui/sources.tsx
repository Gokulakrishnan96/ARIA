"use client";

import { ChevronDownIcon, ExternalLinkIcon, LinkIcon } from "lucide-react";
import { memo, useMemo, type FC } from "react";
import {
  useAuiState,
  type SourceMessagePartComponent,
} from "@assistant-ui/react";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";

type SourceItem = {
  id: string;
  title: string;
  url?: string;
};

const EMPTY_SOURCES: SourceItem[] = [];

function hostname(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url.replace(/^https?:\/\//, "");
  }
}

const SourcePartImpl: SourceMessagePartComponent = () => null;

/** Individual source parts are aggregated by {@link MessageSources}. */
export const SourcePart = memo(SourcePartImpl) as SourceMessagePartComponent;

export const SourcesGroup: FC<{ sources: SourceItem[] }> = ({ sources }) => {
  const unique = useMemo(() => {
    const seen = new Set<string>();
    return sources.filter((source) => {
      const key = source.url || source.id || source.title;
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [sources]);

  if (unique.length === 0) return null;

  return (
    <Collapsible
      defaultOpen={false}
      className="group/sources border-border/40 mt-2 border-t pt-2"
    >
      <CollapsibleTrigger
        className={cn(
          "group/sources-trigger text-muted-foreground hover:text-foreground flex origin-left items-center gap-1.5 py-1 text-[12px] transition-[color,scale] outline-none active:scale-[0.98]",
        )}
      >
        <ChevronDownIcon
          className={cn(
            "size-3.5 shrink-0 transition-transform",
            "group-data-panel-open/sources-trigger:rotate-180",
          )}
        />
        <LinkIcon className="size-3 shrink-0 opacity-70" />
        <span>Sources · {unique.length}</span>
      </CollapsibleTrigger>
      <CollapsibleContent className="pt-1.5 pb-1">
        <ol className="flex list-none flex-col gap-1.5 ps-0">
          {unique.map((source, index) => (
            <li key={source.id || `${source.url}-${index}`}>
              {source.url ? (
                <a
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group/source hover:bg-muted/40 -mx-1 flex items-start gap-2 rounded-md px-1 py-1 transition-colors"
                >
                  <span className="text-muted-foreground mt-0.5 w-4 shrink-0 text-right text-[11px] tabular-nums">
                    {index + 1}.
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="text-foreground/90 block truncate text-[12px] font-medium">
                      {source.title}
                    </span>
                    <span className="text-muted-foreground flex items-center gap-1 text-[11px]">
                      <ExternalLinkIcon className="size-3 shrink-0 opacity-60" />
                      <span className="truncate">{hostname(source.url)}</span>
                    </span>
                  </span>
                </a>
              ) : (
                <span className="text-muted-foreground flex items-start gap-2 text-[12px]">
                  <span className="mt-0.5 w-4 shrink-0 text-right text-[11px] tabular-nums">
                    {index + 1}.
                  </span>
                  <span>{source.title}</span>
                </span>
              )}
            </li>
          ))}
        </ol>
      </CollapsibleContent>
    </Collapsible>
  );
};

export const MessageSources: FC = () => {
  // Subscribe to the stable parts reference — never return a fresh array from
  // useAuiState (that can retrigger renders every time).
  const parts = useAuiState((s) => s.message?.parts);

  const sources = useMemo(() => {
    if (!parts?.length) return EMPTY_SOURCES;

    const items: SourceItem[] = [];
    const seen = new Set<string>();

    for (const part of parts) {
      if (part.type !== "source") continue;

      const item: SourceItem =
        part.sourceType === "url"
          ? {
              id: part.id,
              title: part.title || hostname(part.url),
              url: part.url,
            }
          : {
              id: part.id,
              title: part.title,
            };

      const key = item.url || item.id;
      if (!key || seen.has(key)) continue;
      seen.add(key);
      items.push(item);
    }

    return items.length === 0 ? EMPTY_SOURCES : items;
  }, [parts]);

  return <SourcesGroup sources={sources} />;
};
