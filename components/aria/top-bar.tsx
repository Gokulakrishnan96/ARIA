"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThreadListPrimitive } from "@assistant-ui/react";
import { ArrowLeftIcon, PanelLeftIcon, SquarePenIcon } from "lucide-react";
import type { FC } from "react";

import { TooltipIconButton } from "@/components/assistant-ui/tooltip-icon-button";
import { AriaLogo } from "@/components/aria/aria-logo";
import { ChatShareMenu } from "@/components/aria/chat-share-menu";
import { useAriaStore } from "@/lib/aria-store";

type AriaTopBarProps = {
  title?: string;
};

export const AriaTopBar: FC<AriaTopBarProps> = ({ title }) => {
  const toggleSidebar = useAriaStore((s) => s.toggleSidebar);
  const sidebarOpen = useAriaStore((s) => s.sidebarOpen);
  const pathname = usePathname();
  const isProfile = pathname.startsWith("/profile");

  return (
    <header className="flex h-11 shrink-0 items-center justify-between gap-2 px-2.5 sm:px-3">
      <div className="flex items-center gap-1">
        {!sidebarOpen && (
          <TooltipIconButton
            tooltip="Show sidebar"
            side="bottom"
            variant="ghost"
            size="icon"
            className="size-7 rounded-lg"
            onClick={toggleSidebar}
          >
            <PanelLeftIcon className="size-3.5 opacity-70" />
          </TooltipIconButton>
        )}
        {sidebarOpen && (
          <TooltipIconButton
            tooltip="Menu"
            side="bottom"
            variant="ghost"
            size="icon"
            className="size-7 rounded-lg md:hidden"
            onClick={toggleSidebar}
          >
            <PanelLeftIcon className="size-3.5 opacity-70" />
          </TooltipIconButton>
        )}
        {isProfile ? (
          <Link
            href="/"
            className="text-muted-foreground hover:text-foreground flex items-center gap-1.5 rounded-lg px-1.5 py-1 text-[13px] transition-colors"
          >
            <ArrowLeftIcon className="size-3.5" />
            <span className="hidden sm:inline">Back to chat</span>
          </Link>
        ) : (
          !sidebarOpen && (
            <div className="hidden items-center gap-1.5 sm:flex">
              <AriaLogo className="size-4 opacity-90" />
              <span className="text-[13px] font-medium tracking-tight">
                ARIA
              </span>
            </div>
          )
        )}
        {title && (
          <h1 className="text-[13px] font-medium tracking-tight">{title}</h1>
        )}
      </div>

      {!isProfile && (
        <div className="pointer-events-none absolute left-1/2 flex -translate-x-1/2 items-center gap-1.5 select-none md:hidden">
          <AriaLogo className="size-4 opacity-90" />
          <span className="text-[13px] font-medium tracking-tight">ARIA</span>
        </div>
      )}

      <div className="flex items-center gap-0.5">
        {!isProfile && (
          <>
            <ChatShareMenu />
            <ThreadListPrimitive.Root>
              <ThreadListPrimitive.New
                render={
                  <TooltipIconButton
                    tooltip="New chat"
                    side="bottom"
                    variant="ghost"
                    size="icon"
                    className="size-7 rounded-lg"
                  />
                }
              >
                <SquarePenIcon className="size-3.5 opacity-70" />
              </ThreadListPrimitive.New>
            </ThreadListPrimitive.Root>
          </>
        )}
      </div>
    </header>
  );
};
