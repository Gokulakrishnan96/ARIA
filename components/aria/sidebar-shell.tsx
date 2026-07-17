"use client";

import { Menu } from "@base-ui/react/menu";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ChevronRightIcon,
  GlobeIcon,
  HelpCircleIcon,
  LogOutIcon,
  MessageSquareIcon,
  PanelLeftIcon,
  SearchIcon,
  SettingsIcon,
  XIcon,
} from "lucide-react";
import { useState, type FC, type ReactNode } from "react";

import { cn } from "@/lib/utils";
import { TooltipIconButton } from "@/components/assistant-ui/tooltip-icon-button";
import { AriaLogo } from "@/components/aria/aria-logo";
import {
  SettingsDialog,
  type SettingsTab,
} from "@/components/aria/settings-dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAriaStore } from "@/lib/aria-store";
import { getInitials } from "@/lib/profile";

type SidebarShellProps = {
  children?: ReactNode;
  footer?: ReactNode;
};

export const SidebarShell: FC<SidebarShellProps> = ({ children, footer }) => {
  const open = useAriaStore((s) => s.sidebarOpen);
  const setSidebarOpen = useAriaStore((s) => s.setSidebarOpen);
  const toggleSidebar = useAriaStore((s) => s.toggleSidebar);

  return (
    <>
      <div
        aria-hidden={!open}
        onClick={() => setSidebarOpen(false)}
        className={cn(
          "fixed inset-0 z-30 bg-black/40 transition-opacity md:hidden",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      />
      <aside
        data-open={open}
        className={cn(
          "bg-sidebar text-sidebar-foreground border-sidebar-border z-40 flex h-full shrink-0 flex-col overflow-hidden border transition-[width,transform,opacity] duration-200 ease-in-out",
          "rounded-none border-y-0 border-l-0 sm:rounded-xl md:rounded-2xl sm:border",
          "max-md:fixed max-md:inset-y-0 max-md:left-0 max-md:w-[min(16.5rem,85vw)]",
          open
            ? "md:w-60 max-md:translate-x-0"
            : "md:w-0 md:border-0 md:opacity-0 md:overflow-hidden max-md:-translate-x-full",
        )}
      >
        <div className="flex h-11 shrink-0 items-center justify-between gap-1.5 px-2.5">
          <Link
            href="/"
            className="flex min-w-0 items-center gap-1.5 px-1 transition-opacity hover:opacity-80"
          >
            <AriaLogo className="size-4.5 opacity-90" />
            <span className="truncate text-[13px] font-medium tracking-tight">
              ARIA
            </span>
          </Link>
          <div className="flex items-center">
            <TooltipIconButton
              tooltip="Search"
              side="bottom"
              variant="ghost"
              size="icon"
              className="size-7 rounded-lg"
            >
              <SearchIcon className="size-3.5 opacity-70" />
            </TooltipIconButton>
            <TooltipIconButton
              tooltip="Close sidebar"
              side="bottom"
              variant="ghost"
              size="icon"
              className="size-7 rounded-lg"
              onClick={toggleSidebar}
            >
              <PanelLeftIcon className="hidden size-3.5 opacity-70 md:block" />
              <XIcon className="size-3.5 opacity-70 md:hidden" />
            </TooltipIconButton>
          </div>
        </div>

        <SidebarNav />

        {children}

        {footer ?? <SidebarProfileFooter />}
      </aside>
    </>
  );
};

const navItems = [{ href: "/", label: "Chat", icon: MessageSquareIcon }];

export const SidebarNav: FC = () => {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-0.5 px-2 pb-1.5">
      {navItems.map(({ href, label, icon: Icon }) => {
        const isActive = pathname === "/";

        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-2 rounded-lg px-2 py-1.5 text-[13px] transition-colors",
              isActive
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-foreground",
            )}
          >
            <Icon className="size-3.5 shrink-0 opacity-80" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
};

export const SidebarProfileFooter: FC = () => {
  const profile = useAriaStore((s) => s.profile);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settingsTab, setSettingsTab] = useState<SettingsTab>("general");

  const openSettings = (tab: SettingsTab = "general") => {
    setSettingsTab(tab);
    setSettingsOpen(true);
  };

  return (
    <div className="border-sidebar-border mt-auto border-t p-1.5">
      <Menu.Root>
        <Menu.Trigger
          render={
            <button
              type="button"
              className="hover:bg-sidebar-accent/60 flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
            />
          }
        >
          <Avatar size="sm" className="size-6">
            <AvatarFallback className="bg-muted text-muted-foreground text-[10px] font-medium">
              {getInitials(profile.name)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13px] font-medium leading-tight">
              {profile.name}
            </p>
          </div>
        </Menu.Trigger>
        <Menu.Portal>
          <Menu.Positioner
            side="top"
            align="start"
            sideOffset={8}
            className="isolate z-50 outline-none"
          >
            <Menu.Popup className="bg-popover text-popover-foreground border-border/50 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95 w-[min(15rem,calc(100vw-1.5rem))] origin-(--transform-origin) overflow-hidden rounded-xl border p-1 shadow-lg">
              <div className="text-muted-foreground px-2.5 pb-1.5 pt-1 text-[11px]">
                {profile.email}
              </div>
              <ProfileMenuItem
                icon={SettingsIcon}
                label="Settings"
                onClick={() => openSettings("general")}
              />
              <ProfileMenuItem icon={GlobeIcon} label="Language" trailing />
              <ProfileMenuItem icon={HelpCircleIcon} label="Get help" />
              <Menu.Separator className="bg-border/50 my-1 h-px" />
              <ProfileMenuItem icon={LogOutIcon} label="Log out" />
            </Menu.Popup>
          </Menu.Positioner>
        </Menu.Portal>
      </Menu.Root>

      <SettingsDialog
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        initialTab={settingsTab}
      />
    </div>
  );
};

const menuItemClass =
  "flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-[13px] outline-none transition-colors data-highlighted:bg-accent data-highlighted:text-accent-foreground";

const ProfileMenuItem: FC<{
  icon: FC<{ className?: string }>;
  label: string;
  trailing?: boolean;
  onClick?: () => void;
}> = ({ icon: Icon, label, trailing, onClick }) => {
  return (
    <Menu.Item className={menuItemClass} onClick={onClick}>
      <Icon className="size-3.5 shrink-0 opacity-70" />
      <span className="flex-1">{label}</span>
      {trailing && (
        <ChevronRightIcon className="text-muted-foreground size-3.5 opacity-60" />
      )}
    </Menu.Item>
  );
};
