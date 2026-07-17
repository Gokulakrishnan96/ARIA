import { create } from "zustand";
import { persist } from "zustand/middleware";
import { DEFAULT_MODEL_ID, resolveModelId } from "./models";
import { DEFAULT_PROFILE, type UserProfile } from "./profile";

type AriaStore = {
  modelId: string;
  setModelId: (id: string) => void;
  deepResearch: boolean;
  setDeepResearch: (enabled: boolean) => void;
  toggleDeepResearch: () => void;
  webSearch: boolean;
  setWebSearch: (enabled: boolean) => void;
  toggleWebSearch: () => void;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  profile: UserProfile;
  updateProfile: (updates: Partial<UserProfile>) => void;
};

export const useAriaStore = create<AriaStore>()(
  persist(
    (set) => ({
      modelId: DEFAULT_MODEL_ID,
      setModelId: (id) => set({ modelId: resolveModelId(id) }),
      deepResearch: false,
      setDeepResearch: (enabled) => set({ deepResearch: enabled }),
      toggleDeepResearch: () =>
        set((s) => {
          const deepResearch = !s.deepResearch;
          return {
            deepResearch,
            // Deep research requires live sources.
            ...(deepResearch ? { webSearch: true } : {}),
          };
        }),
      webSearch: true,
      setWebSearch: (enabled) => set({ webSearch: enabled }),
      toggleWebSearch: () => set((s) => ({ webSearch: !s.webSearch })),
      sidebarOpen: true,
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
      profile: DEFAULT_PROFILE,
      updateProfile: (updates) =>
        set((s) => ({ profile: { ...s.profile, ...updates } })),
    }),
    {
      // Bump key so Search defaults ON after the web-search reliability fix.
      name: "aria-ui-v2",
      partialize: (s) => ({
        modelId: s.modelId,
        deepResearch: s.deepResearch,
        webSearch: s.webSearch,
        sidebarOpen: s.sidebarOpen,
        profile: s.profile,
      }),
      merge: (persisted, current) => {
        const state = {
          ...current,
          ...(persisted as Partial<AriaStore>),
        };
        return {
          ...state,
          modelId: resolveModelId(state.modelId ?? DEFAULT_MODEL_ID),
          deepResearch: Boolean(state.deepResearch),
          // Default Search ON for new installs; keep an explicit false if the user turned it off.
          webSearch:
            typeof (persisted as Partial<AriaStore> | undefined)?.webSearch ===
            "boolean"
              ? Boolean(state.webSearch)
              : true,
        };
      },
    },
  ),
);
