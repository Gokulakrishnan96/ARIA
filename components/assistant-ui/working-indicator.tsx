"use client";

import { useAuiState } from "@assistant-ui/react";
import { useEffect, useState, type FC } from "react";

import { cn } from "@/lib/utils";

type StatusPhase = {
  id: string;
  label: string;
};

const THINKING: StatusPhase = {
  id: "thinking",
  label: "Thinking",
};

const GETTING_SOURCES: StatusPhase = {
  id: "sources",
  label: "Getting sources",
};

const PREPARING: StatusPhase = {
  id: "preparing",
  label: "Preparing answer",
};

const IDLE_CYCLE: StatusPhase[] = [THINKING, GETTING_SOURCES, PREPARING];

function useWorkingPhase(): StatusPhase {
  const derived = useAuiState((s) => {
    const parts = s.message.parts ?? [];
    const toolRunning = parts.some(
      (p) => p.type === "tool-call" && p.status?.type === "running",
    );
    const hasTools = parts.some((p) => p.type === "tool-call");
    const reasoningRunning = parts.some(
      (p) => p.type === "reasoning" && p.status?.type === "running",
    );

    if (toolRunning || hasTools) return "sources" as const;
    if (reasoningRunning) return "thinking" as const;
    return "cycle" as const;
  });

  const [cycleIndex, setCycleIndex] = useState(0);

  useEffect(() => {
    if (derived !== "cycle") return;
    const id = window.setInterval(() => {
      setCycleIndex((i) => (i + 1) % IDLE_CYCLE.length);
    }, 2200);
    return () => window.clearInterval(id);
  }, [derived]);

  if (derived === "sources") return GETTING_SOURCES;
  if (derived === "thinking") return THINKING;
  return IDLE_CYCLE[cycleIndex] ?? THINKING;
}

export const AssistantWorkingIndicator: FC<{ className?: string }> = ({
  className,
}) => {
  const phase = useWorkingPhase();
  const { label, id } = phase;

  return (
    <div
      data-slot="aui_assistant-working-indicator"
      role="status"
      aria-live="polite"
      aria-label={label}
      className={cn(
        "text-muted-foreground py-0.5 text-[13px]",
        className,
      )}
    >
      <span
        key={id}
        className="relative inline-block animate-in fade-in duration-300 leading-none"
      >
        <span>{label}</span>
        <span
          aria-hidden
          className="shimmer pointer-events-none absolute inset-0 motion-reduce:animate-none"
        >
          {label}
        </span>
      </span>
    </div>
  );
};
