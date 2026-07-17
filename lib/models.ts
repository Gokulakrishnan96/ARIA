export type AriaProvider = "google" | "openai";

export type AriaModel = {
  id: string;
  name: string;
  description: string;
  provider: AriaProvider;
  /** Provider-specific model id */
  modelId: string;
};

/**
 * Free-tier friendly Gemini models (see https://ai.dev/rate-limit).
 * Gemini 3.1 Flash Lite has the highest free RPD (500) — default everything there.
 */
export const FREE_TIER_SEARCH_MODEL = "gemini-3.1-flash-lite-preview";

export const ARIA_MODELS: AriaModel[] = [
  {
    id: "aria-nano",
    name: "Aria Nano",
    description: "Gemini 3.1 Flash Lite — best free-tier search",
    provider: "google",
    modelId: FREE_TIER_SEARCH_MODEL,
  },
  {
    id: "aria-mini",
    name: "Aria Mini",
    description: "Gemini 3 Flash — balanced (free tier)",
    provider: "google",
    modelId: "gemini-3-flash-preview",
  },
  {
    id: "aria-max",
    name: "Aria Max",
    description: "Gemini 3.1 Pro — deepest reasoning (free tier)",
    provider: "google",
    modelId: "gemini-3.1-pro-preview",
  },
];

export const DEFAULT_MODEL_ID = ARIA_MODELS[0].id;

const LEGACY_MODEL_IDS: Record<string, string> = {
  "gpt-5.4-nano": "aria-nano",
  "gpt-5.4-mini": "aria-mini",
  "gpt-5.4": "aria-max",
};

export const resolveModelId = (id: string): string =>
  LEGACY_MODEL_IDS[id] ?? id;

export const isValidModelId = (id: string): boolean =>
  ARIA_MODELS.some((m) => m.id === resolveModelId(id));

export const getModel = (id: string): AriaModel =>
  ARIA_MODELS.find((m) => m.id === resolveModelId(id)) ?? ARIA_MODELS[0];
