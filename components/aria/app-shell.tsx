"use client";

import type { FC, ReactNode } from "react";

import { cn } from "@/lib/utils";

type AppShellProps = {
  sidebar: ReactNode;
  topBar?: ReactNode;
  children: ReactNode;
  className?: string;
};

export const AppShell: FC<AppShellProps> = ({
  sidebar,
  topBar,
  children,
  className,
}) => {
  return (
    <div className="bg-background flex h-dvh w-full overflow-hidden p-0 sm:p-1.5 md:p-2">
      <div className="flex h-full w-full gap-1.5 md:gap-2">
        {sidebar}
        <section
          className={cn(
            "bg-card/30 border-border/40 flex min-w-0 flex-1 flex-col overflow-hidden border-0 sm:rounded-xl sm:border md:rounded-2xl",
            className,
          )}
        >
          {topBar}
          <main className="min-h-0 flex-1 overflow-y-auto">{children}</main>
        </section>
      </div>
    </div>
  );
};
