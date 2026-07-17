"use client";

import { Menu } from "@base-ui/react/menu";
import { CheckIcon, ChevronDownIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ARIA_MODELS, getModel } from "@/lib/models";
import { useAriaStore } from "@/lib/aria-store";

export function ModelSelector() {
  const modelId = useAriaStore((s) => s.modelId);
  const setModelId = useAriaStore((s) => s.setModelId);
  const active = getModel(modelId);

  return (
    <Menu.Root>
      <Menu.Trigger
        render={
          <Button
            variant="ghost"
            size="sm"
            className="aria-model-trigger text-muted-foreground hover:text-foreground h-7 gap-1 rounded-full px-2 text-[12px] font-medium"
            aria-label="Change model"
          />
        }
      >
        <span className="max-w-[5.5rem] truncate sm:max-w-[8rem]">
          {active.name}
        </span>
        <ChevronDownIcon className="size-3 shrink-0 opacity-60" />
      </Menu.Trigger>
      <Menu.Portal>
        <Menu.Positioner
          side="top"
          align="end"
          sideOffset={8}
          className="isolate z-50 outline-none"
        >
          <Menu.Popup className="bg-popover text-popover-foreground border-border/50 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95 z-50 min-w-52 origin-(--transform-origin) overflow-hidden rounded-xl border p-1 shadow-lg">
            {ARIA_MODELS.map((model) => {
              const isActive = model.id === modelId;
              return (
                <Menu.Item
                  key={model.id}
                  onClick={() => setModelId(model.id)}
                  className={cn(
                    "group flex cursor-pointer items-start gap-2 rounded-lg px-2.5 py-1.5 text-[13px] outline-none select-none",
                    "data-highlighted:bg-accent data-highlighted:text-accent-foreground",
                  )}
                >
                  <div className="flex min-w-0 flex-1 flex-col">
                    <span className="font-medium">{model.name}</span>
                    <span className="text-muted-foreground text-[11px]">
                      {model.description}
                    </span>
                  </div>
                  <CheckIcon
                    className={cn(
                      "text-foreground mt-0.5 size-3.5 shrink-0",
                      isActive ? "opacity-80" : "opacity-0",
                    )}
                  />
                </Menu.Item>
              );
            })}
          </Menu.Popup>
        </Menu.Positioner>
      </Menu.Portal>
    </Menu.Root>
  );
}
