export type AriaProvider = "google" | "openai";

export type AriaModel = {
  id: string;
  name: string;
  description: string;
  provider: AriaProvider;
  /** Provider-specific model id */
  modelId: string;
};

export const ARIA_MODELS: AriaModel[] = [
  {
    id: "aria-nano",
    name: "Aria Nano",
    description: "Fastest, great for everyday questions",
    provider: "google",
    modelId: "gemini-3.1-flash-lite-preview",
  },
  {
    id: "aria-mini",
    name: "Aria Mini",
    description: "Balanced speed and reasoning",
    provider: "google",
    // Separate quota pool from flash-latest / pro-latest
    modelId: "gemini-3-flash-preview",
  },
  {
    id: "aria-max",
    name: "Aria Max",
    description: "Most capable, deepest reasoning",
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
