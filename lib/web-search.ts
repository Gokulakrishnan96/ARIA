import { google } from "@ai-sdk/google";
import { openai } from "@ai-sdk/openai";
import { generateText, type UIMessage } from "ai";

export type WebResearchPacket = {
  findings: string;
  sources: { title: string; url: string }[];
};

/** Prefer cheap Flash-Lite models for the research pass to spare chat-model quota. */
const GOOGLE_RESEARCH_MODELS = [
  "gemini-3.1-flash-lite-preview",
  "gemini-flash-lite-latest",
  "gemini-flash-latest",
] as const;

function extractTextFromParts(parts: UIMessage["parts"] | undefined): string {
  if (!parts?.length) return "";
  return parts
    .map((part) => {
      if (part.type === "text" && "text" in part) return part.text;
      return "";
    })
    .filter(Boolean)
    .join("\n")
    .trim();
}

/** Latest user turn text — used as the search query seed. */
export function getLastUserQuery(messages: UIMessage[]): string {
  for (let i = messages.length - 1; i >= 0; i--) {
    const message = messages[i];
    if (message?.role !== "user") continue;
    const text = extractTextFromParts(message.parts);
    if (text) return text;
  }
  return "";
}

/** Short thread context so vague follow-ups like "who is founder" stay grounded. */
export function getSearchContextHint(messages: UIMessage[]): string {
  const snippets: string[] = [];
  for (const message of messages.slice(-6)) {
    const text = extractTextFromParts(message.parts);
    if (!text) continue;
    const role = message.role === "user" ? "User" : "Assistant";
    snippets.push(`${role}: ${text.slice(0, 280)}`);
  }
  return snippets.join("\n");
}

function normalizeSources(
  sources: Awaited<ReturnType<typeof generateText>>["sources"] | unknown,
): { title: string; url: string }[] {
  const out: { title: string; url: string }[] = [];
  const seen = new Set<string>();
  const list = Array.isArray(sources) ? sources : [];

  for (const source of list) {
    if (!source || typeof source !== "object") continue;
    if (!("url" in source) || typeof (source as { url: unknown }).url !== "string") {
      continue;
    }
    const url = (source as { url: string }).url;
    if (!url || seen.has(url)) continue;
    seen.add(url);
    const titleCandidate = (source as { title?: unknown }).title;
    const title =
      typeof titleCandidate === "string" && titleCandidate.trim()
        ? titleCandidate.trim()
        : url;
    out.push({ title, url });
  }

  return out;
}

function isQuotaError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  return (
    message.includes("quota") ||
    message.includes("RESOURCE_EXHAUSTED") ||
    message.includes("rate limit") ||
    message.includes("429")
  );
}

function buildResearchPrompt(query: string, conversationHint: string): string {
  return [
    "Use live web search. Return ONLY facts supported by search results.",
    "Focus on primary sources (official sites, team/about pages, LinkedIn, press).",
    "If the question is about founders/leadership, name each person with their role.",
    "Ignore conflicting prior knowledge — search results win.",
    "",
    conversationHint
      ? `Recent conversation context:\n${conversationHint}\n`
      : "",
    `Question to research:\n${query}`,
  ]
    .filter(Boolean)
    .join("\n");
}

async function researchWithGoogle(
  modelId: string,
  researchPrompt: string,
): Promise<WebResearchPacket> {
  const result = await generateText({
    model: google(modelId),
    system:
      "You are a factual web researcher. You must use Google Search. Never invent people, titles, or company facts.",
    tools: {
      google_search: google.tools.googleSearch({
        searchTypes: { webSearch: {} },
      }),
    },
    prompt: researchPrompt,
    maxRetries: 0,
  });

  return {
    findings: result.text.trim(),
    sources: normalizeSources(result.sources),
  };
}

/**
 * Run a dedicated grounded search pass before the main answer.
 * Tries cheap models first. Returns null if every attempt fails (caller must soft-fall back).
 */
export async function gatherWebResearch(options: {
  provider: "google" | "openai";
  modelId: string;
  query: string;
  conversationHint: string;
}): Promise<WebResearchPacket | null> {
  const { provider, modelId, query, conversationHint } = options;
  const researchPrompt = buildResearchPrompt(query, conversationHint);

  if (provider === "google") {
    const candidates = [
      ...GOOGLE_RESEARCH_MODELS,
      modelId,
    ].filter((id, index, all) => all.indexOf(id) === index);

    for (const candidate of candidates) {
      try {
        const packet = await researchWithGoogle(candidate, researchPrompt);
        if (packet.findings || packet.sources.length > 0) return packet;
      } catch (error) {
        // Try next model on quota / availability errors; bail on unexpected ones
        // only after the loop.
        if (!isQuotaError(error)) {
          const message =
            error instanceof Error ? error.message : String(error);
          if (
            message.includes("no longer available") ||
            message.includes("NOT_FOUND") ||
            message.includes("is not found")
          ) {
            continue;
          }
        }
        continue;
      }
    }
    return null;
  }

  try {
    const result = await generateText({
      model: openai(modelId),
      system:
        "You are a factual web researcher. You must use web search. Never invent people, titles, or company facts.",
      tools: {
        web_search: openai.tools.webSearch({
          searchContextSize: "high",
        }),
      },
      prompt: researchPrompt,
      maxRetries: 0,
    });

    return {
      findings: result.text.trim(),
      sources: normalizeSources(result.sources),
    };
  } catch {
    return null;
  }
}

export function formatResearchForSystem(packet: WebResearchPacket): string {
  const sourceLines =
    packet.sources.length > 0
      ? packet.sources
          .map((s, i) => `${i + 1}. [${s.title}](${s.url})`)
          .join("\n")
      : "No structured source URLs returned — still treat the findings below as search-grounded and do not invent extras.";

  return [
    "## Verified web research (authoritative)",
    "Answer using ONLY the findings below. If they conflict with your training data, the findings win.",
    "Do not invent additional founders, executives, or facts that are absent here.",
    "",
    "### Findings",
    packet.findings || "(no findings)",
    "",
    "### Sources",
    sourceLines,
  ].join("\n");
}
