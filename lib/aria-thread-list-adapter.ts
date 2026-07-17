import type { RemoteThreadListAdapter } from "@assistant-ui/react";
import { createSimpleTitleAdapter } from "@assistant-ui/core/react";
import { createAssistantStream } from "assistant-stream";

import { threadStorage } from "@/lib/thread-storage";

type StoredThread = {
  remoteId: string;
  status: "regular" | "archived";
  title?: string;
  externalId?: string;
  custom?: Record<string, unknown>;
};

const THREADS_KEY = "aria:threads";
const titleGenerator = createSimpleTitleAdapter();

async function loadThreads(): Promise<StoredThread[]> {
  const raw = await threadStorage.getItem(THREADS_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (item): item is StoredThread =>
        typeof item === "object" &&
        item !== null &&
        typeof (item as StoredThread).remoteId === "string" &&
        ((item as StoredThread).status === "regular" ||
          (item as StoredThread).status === "archived"),
    );
  } catch {
    return [];
  }
}

async function saveThreads(threads: StoredThread[]) {
  await threadStorage.setItem(THREADS_KEY, JSON.stringify(threads));
}

/** Persists Recents titles in localStorage (no AI-SDK history adapter). */
export function createAriaThreadListAdapter(): RemoteThreadListAdapter {
  return {
    async list() {
      return {
        threads: (await loadThreads()).map((t) => ({
          remoteId: t.remoteId,
          externalId: t.externalId,
          status: t.status,
          title: t.title,
          custom: t.custom,
        })),
      };
    },

    async initialize(threadId) {
      const threads = await loadThreads();
      if (!threads.some((t) => t.remoteId === threadId)) {
        threads.unshift({ remoteId: threadId, status: "regular" });
        await saveThreads(threads);
      }
      return { remoteId: threadId, externalId: undefined };
    },

    async rename(remoteId, newTitle) {
      const threads = await loadThreads();
      const thread = threads.find((t) => t.remoteId === remoteId);
      if (thread) {
        thread.title = newTitle;
        await saveThreads(threads);
      }
    },

    async updateCustom(remoteId, custom) {
      const threads = await loadThreads();
      const thread = threads.find((t) => t.remoteId === remoteId);
      if (thread) {
        thread.custom = custom;
        await saveThreads(threads);
      }
    },

    async archive(remoteId) {
      const threads = await loadThreads();
      const thread = threads.find((t) => t.remoteId === remoteId);
      if (thread) {
        thread.status = "archived";
        await saveThreads(threads);
      }
    },

    async unarchive(remoteId) {
      const threads = await loadThreads();
      const thread = threads.find((t) => t.remoteId === remoteId);
      if (thread) {
        thread.status = "regular";
        await saveThreads(threads);
      }
    },

    async delete(remoteId) {
      await saveThreads(
        (await loadThreads()).filter((t) => t.remoteId !== remoteId),
      );
    },

    async fetch(threadId) {
      const thread = (await loadThreads()).find((t) => t.remoteId === threadId);
      if (!thread) {
        throw new Error(`Thread "${threadId}" not found.`);
      }
      return {
        remoteId: thread.remoteId,
        externalId: thread.externalId,
        status: thread.status,
        title: thread.title,
        custom: thread.custom,
      };
    },

    async generateTitle(remoteId, messages) {
      const title = await titleGenerator.generateTitle(messages);
      const threads = await loadThreads();
      const thread = threads.find((t) => t.remoteId === remoteId);
      if (thread) {
        thread.title = title;
        await saveThreads(threads);
      }
      return createAssistantStream((controller) => {
        controller.appendText(title);
      });
    },
  };
}
