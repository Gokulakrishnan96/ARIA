import { type UIMessage } from "ai";

import { independentWebResearch } from "@/lib/independent-web-search";

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

/**
 * Live web research that does not depend on Gemini Google Search grounding quota.
 */
export async function gatherWebResearch(options: {
  provider: "google" | "openai";
  modelId: string;
  query: string;
  conversationHint: string;
}): Promise<WebResearchPacket | null> {
  const { query, conversationHint } = options;
  void options.provider;
  void options.modelId;

  try {
    const packet = await independentWebResearch(query, conversationHint);
    if (!packet) return null;
    if (!packet.findings && packet.sources.length === 0) return null;
    return packet;
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
      : "No structured source URLs returned.";

  return [
    "## Verified web research (authoritative — from live web pages)",
    "Answer using ONLY the findings below. If they conflict with your training data, the findings win.",
    "Do not invent additional founders, executives, or facts that are absent here.",
    "Quote names and roles exactly as they appear in the extracts.",
    "",
    "### Findings",
    packet.findings || "(no findings)",
    "",
    "### Sources",
    sourceLines,
  ].join("\n");
}
