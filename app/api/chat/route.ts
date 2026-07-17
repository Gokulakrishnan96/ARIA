import { google } from "@ai-sdk/google";
import { openai } from "@ai-sdk/openai";
import { frontendTools } from "@assistant-ui/react-ai-sdk";
import {
  streamText,
  convertToModelMessages,
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

    // Free tier: answer with Flash Lite when Search is on.
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
        } else {
          // Never allow memory answers when Search is on but research failed.
          return Response.json(
            {
              error:
                "Web search could not retrieve live sources right now. Please try again in a moment.",
            },
            { status: 503 },
          );
        }
      }
    }

    const systemPrompt = [
      useDeepResearch ? ARIA_SYSTEM_PROMPT : undefined,
      useWebSearch ? WEB_SEARCH_SYSTEM : undefined,
      researchBlock,
      useWebSearch
        ? "Web Search already ran against live pages. Answer ONLY from the verified web research above. Do not use memory. Do not invent people or roles. Include a short Sources list with the URLs provided."
        : undefined,
      system?.trim(),
    ]
      .filter(Boolean)
      .join("\n\n");

    // No Gemini google_search tool — independent search already grounded the answer.
    // This avoids free-tier Search grounding quota exhaustion and memory fallbacks.
    const result = streamText({
      model: getLanguageModel(answerModelId, ariaModel.provider),
      ...(systemPrompt ? { system: systemPrompt } : {}),
      messages: await convertToModelMessages(messages),
      maxRetries: 1,
      ...(!useWebSearch
        ? { tools: frontendTools(tools ?? {}) }
        : {}),
    });

    return result.toUIMessageStreamResponse({
      sendSources: useWebSearch,
      onError: (error) => {
        const message =
          error instanceof Error ? error.message : "An error occurred.";
        if (message.includes("quota") || message.includes("RESOURCE_EXHAUSTED")) {
          return `Gemini free-tier limit hit (${answerModelId}). Wait ~1 minute, keep using Aria Nano, or set up billing at https://ai.dev/rate-limit`;
        }
        if (
          message.includes("no longer available") ||
          message.includes("NOT_FOUND") ||
          message.includes("is not found")
        ) {
          return `Model ${answerModelId} is unavailable. Switch to Aria Nano and try again.`;
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
