import { google } from "@ai-sdk/google";
import { openai } from "@ai-sdk/openai";
import { generateText, type UIMessage } from "ai";

export type WebResearchPacket = {
  findings: string;
  sources: { title: string; url: string }[];
};

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
  sources: Awaited<ReturnType<typeof generateText>>["sources"],
): { title: string; url: string }[] {
  const out: { title: string; url: string }[] = [];
  const seen = new Set<string>();

  for (const source of sources ?? []) {
    if (!source || typeof source !== "object") continue;
    if (!("url" in source) || typeof source.url !== "string") continue;
    const url = source.url;
    if (!url || seen.has(url)) continue;
    seen.add(url);
    const title =
      "title" in source && typeof source.title === "string" && source.title.trim()
        ? source.title.trim()
        : url;
    out.push({ title, url });
  }

  return out;
}

/**
 * Run a dedicated grounded search pass before the main answer.
 * This prevents the chat model from answering founders/company facts from memory.
 */
export async function gatherWebResearch(options: {
  provider: "google" | "openai";
  modelId: string;
  query: string;
  conversationHint: string;
}): Promise<WebResearchPacket> {
  const { provider, modelId, query, conversationHint } = options;

  const researchPrompt = [
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

  if (provider === "google") {
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
      maxRetries: 1,
    });

    return {
      findings: result.text.trim(),
      sources: normalizeSources(result.sources),
    };
  }

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
    maxRetries: 1,
  });

  return {
    findings: result.text.trim(),
    sources: normalizeSources(result.sources),
  };
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
