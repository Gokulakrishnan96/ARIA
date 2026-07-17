import { google } from "@ai-sdk/google";
import { openai } from "@ai-sdk/openai";
import { generateText, type UIMessage } from "ai";

import { FREE_TIER_SEARCH_MODEL } from "@/lib/models";

export type WebResearchPacket = {
  findings: string;
  sources: { title: string; url: string }[];
};

/** Only Flash Lite for research — highest free-tier daily quota (500 RPD). */
const GOOGLE_RESEARCH_MODELS = [FREE_TIER_SEARCH_MODEL] as const;

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

function isRetryableModelError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  return (
    message.includes("quota") ||
    message.includes("RESOURCE_EXHAUSTED") ||
    message.includes("rate limit") ||
    message.includes("429") ||
    message.includes("no longer available") ||
    message.includes("NOT_FOUND") ||
    message.includes("is not found")
  );
}

function buildResearchPrompt(query: string, conversationHint: string): string {
  return [
    "Use Google Search. Return ONLY facts from search results.",
    "For founder/leadership questions: list each person and their exact role.",
    "Prefer official company team/about pages and LinkedIn.",
    "If prior knowledge conflicts with search, search wins.",
    "End with markdown source links.",
    "",
    conversationHint
      ? `Recent conversation context:\n${conversationHint}\n`
      : "",
    `Question:\n${query}`,
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
      "You are a factual web researcher with Google Search. Never invent people, titles, or company facts. Search first, then answer from results only.",
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
 * Grounded search pass on Gemini 3.1 Flash Lite (free-tier friendly).
 * Returns null if unavailable — caller continues with live google_search tools.
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
    const candidates = [...GOOGLE_RESEARCH_MODELS, modelId].filter(
      (id, index, all) => all.indexOf(id) === index,
    );

    for (const candidate of candidates) {
      try {
        const packet = await researchWithGoogle(candidate, researchPrompt);
        if (packet.findings || packet.sources.length > 0) return packet;
      } catch (error) {
        if (isRetryableModelError(error)) continue;
        continue;
      }
    }
    return null;
  }

  try {
    const result = await generateText({
      model: openai(modelId),
      system:
        "You are a factual web researcher. Use web search. Never invent people, titles, or company facts.",
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
