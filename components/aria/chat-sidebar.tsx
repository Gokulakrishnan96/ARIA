"use client";

import {
  ThreadListItemPrimitive,
  ThreadListPrimitive,
} from "@assistant-ui/react";
import { ListFilterIcon, SquarePenIcon, Trash2Icon } from "lucide-react";
import type { FC } from "react";

import { Button } from "@/components/ui/button";
import { TooltipIconButton } from "@/components/assistant-ui/tooltip-icon-button";
import { SidebarShell } from "@/components/aria/sidebar-shell";

export const ChatSidebar: FC = () => {
  return (
    <SidebarShell>
      <div className="px-2 pb-1.5">
        <ThreadListPrimitive.Root>
          <ThreadListPrimitive.New
            render={
              <Button
                variant="ghost"
                size="sm"
                className="hover:bg-sidebar-accent text-muted-foreground hover:text-foreground h-8 w-full justify-start gap-2 rounded-lg px-2 text-[13px]"
              />
            }
          >
            <SquarePenIcon className="size-3.5 opacity-70" />
            New chat
          </ThreadListPrimitive.New>
        </ThreadListPrimitive.Root>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-1.5 pb-1.5">
        <div className="text-muted-foreground flex items-center justify-between px-2 pb-1.5 pt-1">
          <p className="text-[13px] font-medium">Recents</p>
          <ListFilterIcon className="size-3.5 opacity-50" aria-hidden />
        </div>
        <ThreadListPrimitive.Root className="flex flex-col gap-px">
          <ThreadListPrimitive.Items
            components={{ ThreadListItem: ThreadHistoryItem }}
          />
        </ThreadListPrimitive.Root>
      </div>
    </SidebarShell>
  );
};

const ThreadHistoryItem: FC = () => {
  return (
    <ThreadListItemPrimitive.Root className="group/thread data-active:bg-sidebar-accent data-active:text-sidebar-accent-foreground hover:bg-sidebar-accent/50 flex items-center gap-0.5 rounded-lg pr-0.5 transition-colors">
      <ThreadListItemPrimitive.Trigger className="flex min-w-0 flex-1 items-center px-2 py-1.5 text-left text-[13px] outline-none">
        <span className="truncate">
          <ThreadListItemPrimitive.Title fallback="New chat" />
        </span>
      </ThreadListItemPrimitive.Trigger>
      <ThreadListItemPrimitive.Delete
        render={
          <TooltipIconButton
            tooltip="Delete chat"
            side="bottom"
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-destructive size-6 shrink-0 rounded-md opacity-0 transition-opacity group-hover/thread:opacity-100"
          />
        }
      >
        <Trash2Icon className="size-3" />
      </ThreadListItemPrimitive.Delete>
    </ThreadListItemPrimitive.Root>
  );
};
