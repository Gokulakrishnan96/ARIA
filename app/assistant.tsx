"use client";

import { useMemo, useState } from "react";
import {
  AssistantRuntimeProvider,
  pickExternalStoreSharedOptions,
  useAui,
  useAuiState,
  useRemoteThreadListRuntime,
} from "@assistant-ui/react";
import {
  useAISDKRuntime,
  AssistantChatTransport,
} from "@assistant-ui/react-ai-sdk";
import { useChat } from "@ai-sdk/react";
import {
  lastAssistantMessageIsCompleteWithToolCalls,
  type UIMessage,
} from "ai";

import { Thread } from "@/components/assistant-ui/thread";
import { AppShell } from "@/components/aria/app-shell";
import { ChatSidebar } from "@/components/aria/chat-sidebar";
import { AriaTopBar } from "@/components/aria/top-bar";
import { createAriaThreadListAdapter } from "@/lib/aria-thread-list-adapter";
import { useAriaStore } from "@/lib/aria-store";

function useChatThreadRuntime(options: {
  transport: AssistantChatTransport<UIMessage>;
  sendAutomaticallyWhen: typeof lastAssistantMessageIsCompleteWithToolCalls;
}) {
  const { transport, sendAutomaticallyWhen } = options;
  const id = useAuiState((s) => s.threadListItem.id);
  const aui = useAui();

  const chat = useChat({
    id,
    transport,
    sendAutomaticallyWhen,
  });

  const runtime = useAISDKRuntime(chat, {
    ...pickExternalStoreSharedOptions({}),
  });

  transport.setRuntime(runtime);
  transport.__internal_setGetThreadListItem(() =>
    aui.threadListItem.source ? aui.threadListItem() : undefined,
  );

  return runtime;
}

function readChatIdFromUrl() {
  if (typeof window === "undefined") return undefined;
  return new URLSearchParams(window.location.search).get("chat") ?? undefined;
}

export const Assistant = () => {
  const [transport] = useState(
    () =>
      new AssistantChatTransport({
        api: "/api/chat",
        prepareSendMessagesRequest: ({
          id,
          messages,
          trigger,
          messageId,
          requestMetadata,
          body,
        }) => ({
          body: {
            ...body,
            id,
            messages,
            trigger,
            messageId,
            metadata: requestMetadata,
            model: useAriaStore.getState().modelId,
            deepResearch: useAriaStore.getState().deepResearch,
            webSearch: useAriaStore.getState().webSearch,
          },
        }),
      }),
  );

  const adapter = useMemo(() => createAriaThreadListAdapter(), []);
  const [threadId, setThreadId] = useState<string | undefined>(
    readChatIdFromUrl,
  );

  const runtime = useRemoteThreadListRuntime({
    runtimeHook: function RuntimeHook() {
      return useChatThreadRuntime({
        transport,
        sendAutomaticallyWhen: lastAssistantMessageIsCompleteWithToolCalls,
      });
    },
    adapter,
    allowNesting: true,
    threadId,
    onThreadIdChange: (id) => {
      setThreadId(id);
      if (typeof window === "undefined") return;
      const url = new URL(window.location.href);
      if (id) url.searchParams.set("chat", id);
      else url.searchParams.delete("chat");
      window.history.replaceState(null, "", url.toString());
    },
  });

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      <AppShell sidebar={<ChatSidebar />} topBar={<AriaTopBar />}>
        <Thread />
      </AppShell>
    </AssistantRuntimeProvider>
  );
};
