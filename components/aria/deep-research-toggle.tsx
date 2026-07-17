"use client";

import { TelescopeIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAriaStore } from "@/lib/aria-store";

export function DeepResearchToggle() {
  const enabled = useAriaStore((s) => s.deepResearch);
  const toggle = useAriaStore((s) => s.toggleDeepResearch);

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      aria-pressed={enabled}
      aria-label={
        enabled ? "Disable deep research" : "Enable deep research"
      }
      onClick={toggle}
      className={cn(
        "h-7 gap-1.5 rounded-full px-2 text-[12px] font-medium transition-colors",
        enabled
          ? "bg-primary/15 text-primary hover:bg-primary/20 hover:text-primary"
          : "text-muted-foreground hover:text-foreground",
      )}
    >
      <TelescopeIcon className="size-3.5 shrink-0 opacity-80" />
      <span className="hidden sm:inline">Deep research</span>
    </Button>
  );
}
