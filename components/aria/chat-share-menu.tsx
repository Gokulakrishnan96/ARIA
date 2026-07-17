"use client";

import { Menu } from "@base-ui/react/menu";
import {
  useAui,
  useAuiState,
  type ThreadMessage,
} from "@assistant-ui/react";
import {
  CheckIcon,
  DownloadIcon,
  FileSpreadsheetIcon,
  FileTextIcon,
  LinkIcon,
} from "lucide-react";
import { useState, type FC, type SVGProps } from "react";

import { TooltipIconButton } from "@/components/assistant-ui/tooltip-icon-button";
import {
  downloadChat,
  threadMessagesToExport,
  type DownloadFormat,
} from "@/lib/export-chat";
import { cn } from "@/lib/utils";

const DOWNLOAD_OPTIONS: {
  format: DownloadFormat;
  label: string;
  icon: typeof FileTextIcon;
}[] = [
  { format: "pdf", label: "PDF", icon: FileTextIcon },
  { format: "docx", label: "DOCX", icon: FileTextIcon },
  { format: "pptx", label: "PPTX", icon: FileTextIcon },
  { format: "xlsx", label: "XLSX", icon: FileSpreadsheetIcon },
  { format: "csv", label: "CSV", icon: FileSpreadsheetIcon },
  { format: "json", label: "JSON", icon: FileTextIcon },
];

const ShareAltIcon: FC<SVGProps<SVGSVGElement>> = (props) => (
  <svg viewBox="0 0 21 21" fill="none" aria-hidden {...props}>
    <g
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      transform="translate(4 2)"
    >
      <path d="m8.5 2.5-1.978-2-2.022 2" />
      <path d="m6.5.5v9" />
      <path d="m3.5 4.5h-1c-1.1045695 0-2 .8954305-2 2v7c0 1.1045695.8954305 2 2 2h8c1.1045695 0 2-.8954305 2-2v-7c0-1.1045695-.8954305-2-2-2h-1" />
    </g>
  </svg>
);

function getShareUrl(threadId: string | undefined) {
  if (typeof window === "undefined") return "";
  const url = new URL(window.location.href);
  url.searchParams.delete("share");
  if (threadId) url.searchParams.set("chat", threadId);
  else url.searchParams.delete("chat");
  return url.toString();
}

export const ChatShareMenu: FC = () => {
  const aui = useAui();
  const title = useAuiState(
    (s) => s.threadListItem.title ?? "ARIA chat",
  );
  const remoteId = useAuiState((s) => s.threadListItem.remoteId);
  const localId = useAuiState((s) => s.threadListItem.id);
  const isEmpty = useAuiState((s) => s.thread.messages.length === 0);
  const [copied, setCopied] = useState(false);
  const [busy, setBusy] = useState<DownloadFormat | null>(null);

  const shareId = remoteId ?? localId;

  const getPayload = () => {
    const messages = aui.thread().getState().messages as readonly ThreadMessage[];
    return threadMessagesToExport(messages, title);
  };

  const handleShare = async () => {
    const url = getShareUrl(shareId);
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt("Copy this link", url);
    }
  };

  const handleDownload = async (format: DownloadFormat) => {
    if (isEmpty || busy) return;
    setBusy(format);
    try {
      await downloadChat(format, getPayload());
    } finally {
      setBusy(null);
    }
  };

  return (
    <Menu.Root>
      <Menu.Trigger
        render={
          <TooltipIconButton
            tooltip="Share & download"
            side="bottom"
            variant="ghost"
            size="icon"
            className="size-7 rounded-lg"
          />
        }
      >
        <ShareAltIcon className="size-4 opacity-70" />
      </Menu.Trigger>
      <Menu.Portal>
        <Menu.Positioner
          side="bottom"
          align="end"
          sideOffset={8}
          className="isolate z-50 outline-none"
        >
          <Menu.Popup className="bg-popover text-popover-foreground border-border/50 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95 z-50 w-[min(16.5rem,calc(100vw-1.5rem))] origin-(--transform-origin) overflow-hidden rounded-xl border p-1 shadow-lg">
            <Menu.Item
              onClick={handleShare}
              className={cn(
                "flex cursor-pointer items-center gap-2 rounded-lg px-2.5 py-2 text-[13px] outline-none select-none",
                "data-highlighted:bg-accent data-highlighted:text-accent-foreground",
              )}
            >
              {copied ? (
                <CheckIcon className="size-3.5 shrink-0 text-emerald-500" />
              ) : (
                <LinkIcon className="size-3.5 shrink-0 opacity-70" />
              )}
              <span className="flex-1">
                {copied ? "Link copied" : "Share chat by link"}
              </span>
            </Menu.Item>

            <Menu.Separator className="bg-border/60 my-1 h-px" />

            <div className="text-muted-foreground px-2.5 pt-1.5 pb-1 text-[11px] font-medium tracking-wide uppercase">
              Download as
            </div>
            <div className="grid grid-cols-3 gap-0.5 px-1 pb-1">
              {DOWNLOAD_OPTIONS.map(({ format, label, icon: Icon }) => (
                <Menu.Item
                  key={format}
                  disabled={isEmpty || busy !== null}
                  onClick={() => handleDownload(format)}
                  className={cn(
                    "flex cursor-pointer flex-col items-center gap-1 rounded-lg px-2 py-2 text-[12px] outline-none select-none",
                    "data-highlighted:bg-accent data-highlighted:text-accent-foreground",
                    "data-disabled:pointer-events-none data-disabled:opacity-40",
                  )}
                >
                  {busy === format ? (
                    <DownloadIcon className="size-3.5 animate-pulse opacity-70" />
                  ) : (
                    <Icon className="size-3.5 opacity-70" />
                  )}
                  <span>{label}</span>
                </Menu.Item>
              ))}
            </div>
          </Menu.Popup>
        </Menu.Positioner>
      </Menu.Portal>
    </Menu.Root>
  );
};
