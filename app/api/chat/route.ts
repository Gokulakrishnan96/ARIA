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

import { DEFAULT_MODEL_ID, getModel, isValidModelId } from "@/lib/models";
import { ARIA_SYSTEM_PROMPT } from "@/lib/aria-system-prompt";
import { WEB_SEARCH_SYSTEM } from "@/lib/web-search-prompt";
import {
  formatResearchForSystem,
  gatherWebResearch,
  getLastUserQuery,
  getSearchContextHint,
} from "@/lib/web-search";

function getLanguageModel(modelKey: string) {
  const ariaModel = getModel(modelKey);

  if (ariaModel.provider === "google") {
    return google(ariaModel.modelId);
  }

  return openai(ariaModel.modelId);
}

function buildWebSearchTools(provider: "google" | "openai"): ToolSet {
  if (provider === "google") {
    return {
      google_search: google.tools.googleSearch({
        searchTypes: { webSearch: {} },
      }),
      url_context: google.tools.urlContext({}),
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
    // Deep research always needs live sources.
    const useWebSearch = Boolean(webSearch) || useDeepResearch;

    let researchBlock: string | undefined;
    if (useWebSearch) {
      const query = getLastUserQuery(messages);
      if (query) {
        try {
          const packet = await gatherWebResearch({
            provider: ariaModel.provider,
            modelId: ariaModel.modelId,
            query,
            conversationHint: getSearchContextHint(messages),
          });
          if (packet.findings || packet.sources.length > 0) {
            researchBlock = formatResearchForSystem(packet);
          }
        } catch (error) {
          const message =
            error instanceof Error ? error.message : "Web search failed.";
          if (message.includes("quota") || message.includes("RESOURCE_EXHAUSTED")) {
            return Response.json(
              {
                error: `Web search quota exceeded for ${ariaModel.modelId}. Try again later or switch models.`,
              },
              { status: 429 },
            );
          }
          return Response.json(
            { error: `Web search failed: ${message}` },
            { status: 502 },
          );
        }
      }
    }

    const systemPrompt = [
      useDeepResearch ? ARIA_SYSTEM_PROMPT : undefined,
      useWebSearch ? WEB_SEARCH_SYSTEM : undefined,
      researchBlock,
      useDeepResearch && useWebSearch
        ? "Deep Research is active with web search. Every material claim must be grounded in the verified web research above — never fall back to unsourced general knowledge for people, companies, or current facts."
        : undefined,
      system?.trim(),
    ]
      .filter(Boolean)
      .join("\n\n");

    // When web search is on, only attach provider search tools.
    // Mixing client function tools with Google Search is unsupported on Gemini 2.x
    // and can prevent grounding from running.
    const requestTools = {
      ...(useWebSearch
        ? buildWebSearchTools(ariaModel.provider)
        : frontendTools(tools ?? {})),
    };

    const result = streamText({
      model: getLanguageModel(modelKey),
      ...(systemPrompt ? { system: systemPrompt } : {}),
      messages: await convertToModelMessages(messages),
      maxRetries: 1,
      tools: requestTools,
    });

    return result.toUIMessageStreamResponse({
      sendSources: useWebSearch,
      onError: (error) => {
        const message =
          error instanceof Error ? error.message : "An error occurred.";
        if (message.includes("quota") || message.includes("RESOURCE_EXHAUSTED")) {
          return `Gemini quota exceeded for ${ariaModel.modelId}. Try again later, enable billing, or switch to another model.`;
        }
        if (
          message.includes("no longer available") ||
          message.includes("NOT_FOUND") ||
          message.includes("is not found")
        ) {
          return `Model ${ariaModel.modelId} is unavailable. Switch to another Aria model and try again.`;
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
