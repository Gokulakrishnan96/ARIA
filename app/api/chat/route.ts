import { google } from "@ai-sdk/google";
import { openai } from "@ai-sdk/openai";
import { frontendTools } from "@assistant-ui/react-ai-sdk";
import {
  streamText,
  convertToModelMessages,
  type ToolSet,
  type UIMessage,
  type JSONSchema7,
} from "ai";

import {
  DEFAULT_MODEL_ID,
  FREE_TIER_SEARCH_MODEL,
  getModel,
  isValidModelId,
} from "@/lib/models";
import { ARIA_SYSTEM_PROMPT } from "@/lib/aria-system-prompt";
import { WEB_SEARCH_SYSTEM } from "@/lib/web-search-prompt";
import {
  formatResearchForSystem,
  gatherWebResearch,
  getLastUserQuery,
  getSearchContextHint,
} from "@/lib/web-search";

function getLanguageModel(modelId: string, provider: "google" | "openai") {
  if (provider === "google") {
    return google(modelId);
  }
  return openai(modelId);
}

function buildWebSearchTools(provider: "google" | "openai"): ToolSet {
  if (provider === "google") {
    return {
      google_search: google.tools.googleSearch({
        searchTypes: { webSearch: {} },
      }),
    };
  }

  return {
    web_search: openai.tools.webSearch({
      searchContextSize: "high",
    }),
  };
}

export async function POST(req: Request) {
  try {
    const {
      messages,
      system,
      tools,
      model,
      deepResearch,
      webSearch,
    }: {
      messages: UIMessage[];
      system?: string;
      tools?: Record<string, { description?: string; parameters: JSONSchema7 }>;
      model?: string;
      deepResearch?: boolean;
      webSearch?: boolean;
    } = await req.json();

    if (!Array.isArray(messages)) {
      return Response.json(
        { error: "Request body must include a messages array." },
        { status: 400 },
      );
    }

    const modelKey =
      model && isValidModelId(model) ? model : DEFAULT_MODEL_ID;
    const ariaModel = getModel(modelKey);

    if (ariaModel.provider === "google" && !process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
      return Response.json(
        { error: "Missing GOOGLE_GENERATIVE_AI_API_KEY in .env.local" },
        { status: 500 },
      );
    }

    if (ariaModel.provider === "openai" && !process.env.OPENAI_API_KEY) {
      return Response.json(
        { error: "Missing OPENAI_API_KEY in .env.local" },
        { status: 500 },
      );
    }

    const useDeepResearch = Boolean(deepResearch);
    const useWebSearch = Boolean(webSearch) || useDeepResearch;

    // Free tier: keep Search on Gemini 3.1 Flash Lite (500 RPD).
    const answerModelId =
      useWebSearch && ariaModel.provider === "google"
        ? FREE_TIER_SEARCH_MODEL
        : ariaModel.modelId;

    let researchBlock: string | undefined;
    if (useWebSearch) {
      const query = getLastUserQuery(messages);
      if (query) {
        const packet = await gatherWebResearch({
          provider: ariaModel.provider,
          modelId: FREE_TIER_SEARCH_MODEL,
          query,
          conversationHint: getSearchContextHint(messages),
        });
        if (packet && (packet.findings || packet.sources.length > 0)) {
          researchBlock = formatResearchForSystem(packet);
        }
      }
    }

    const systemPrompt = [
      useDeepResearch ? ARIA_SYSTEM_PROMPT : undefined,
      useWebSearch ? WEB_SEARCH_SYSTEM : undefined,
      researchBlock,
      useWebSearch
        ? researchBlock
          ? "Web Search already ran. Answer ONLY from the verified web research above. Do not call tools. If research conflicts with memory, research wins."
          : "Web Search is on. You MUST use the google_search tool before answering. Never invent founders or company leadership from memory."
        : undefined,
      system?.trim(),
    ]
      .filter(Boolean)
      .join("\n\n");

    // If research already grounded the answer, skip a second google_search call
    // (free-tier Search grounding quota is tighter than model RPD).
    const requestTools = researchBlock
      ? {}
      : useWebSearch
        ? buildWebSearchTools(ariaModel.provider)
        : frontendTools(tools ?? {});

    const result = streamText({
      model: getLanguageModel(answerModelId, ariaModel.provider),
      ...(systemPrompt ? { system: systemPrompt } : {}),
      messages: await convertToModelMessages(messages),
      maxRetries: 1,
      ...(Object.keys(requestTools).length > 0 ? { tools: requestTools } : {}),
    });

    return result.toUIMessageStreamResponse({
      sendSources: useWebSearch,
      onError: (error) => {
        const message =
          error instanceof Error ? error.message : "An error occurred.";
        if (message.includes("quota") || message.includes("RESOURCE_EXHAUSTED")) {
          return `Gemini free-tier limit hit (${answerModelId}). Wait ~1 minute for RPM to reset, keep using Aria Nano, or click “Set up billing” at https://ai.dev/rate-limit for higher Search limits.`;
        }
        if (
          message.includes("no longer available") ||
          message.includes("NOT_FOUND") ||
          message.includes("is not found")
        ) {
          return `Model ${answerModelId} is unavailable. Switch to Aria Nano and try again.`;
        }
        if (
          useWebSearch &&
          (message.includes("google_search") ||
            message.includes("Google Search") ||
            message.includes("Search Grounding"))
        ) {
          return `Web search failed: ${message}`;
        }
        return message;
      },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to start chat.";
    return Response.json({ error: message }, { status: 500 });
  }
}
