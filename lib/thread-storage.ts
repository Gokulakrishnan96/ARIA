import type { AsyncStorageLike } from "@assistant-ui/core/react";

const memoryStore = new Map<string, string>();

/** Async storage that uses `localStorage` in the browser (in-memory on the server). */
export const threadStorage: AsyncStorageLike = {
  getItem: async (key) => {
    if (typeof window === "undefined") return memoryStore.get(key) ?? null;
    return window.localStorage.getItem(key);
  },
  setItem: async (key, value) => {
    if (typeof window === "undefined") {
      memoryStore.set(key, value);
      return;
    }
    window.localStorage.setItem(key, value);
  },
  removeItem: async (key) => {
    if (typeof window === "undefined") {
      memoryStore.delete(key);
      return;
    }
    window.localStorage.removeItem(key);
  },
};
