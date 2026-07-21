"use client";

import { GlobeIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAriaStore } from "@/lib/aria-store";

export function WebSearchToggle() {
  const enabled = useAriaStore((s) => s.webSearch);
  const toggle = useAriaStore((s) => s.toggleWebSearch);

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      aria-pressed={enabled}
      aria-label={enabled ? "Disable web search" : "Enable web search"}
      onClick={toggle}
      className={cn(
        "h-7 gap-1.5 rounded-full px-2 text-[12px] font-medium transition-colors",
        enabled
          ? "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground"
          : "text-muted-foreground hover:text-foreground",
      )}
    >
      <GlobeIcon className="size-3.5 shrink-0 opacity-80" />
      <span className="hidden sm:inline">
        {enabled ? "Search on" : "Search"}
      </span>
    </Button>
  );
}
