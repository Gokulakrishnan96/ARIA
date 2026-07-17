import { google } from "@ai-sdk/google";
import { openai } from "@ai-sdk/openai";
import { frontendTools } from "@assistant-ui/react-ai-sdk";
import {
  streamText,
  convertToModelMessages,
  type UIMessage,
  type JSONSchema7,
} from "ai";

import { DEFAULT_MODEL_ID, getModel, isValidModelId } from "@/lib/models";
import { ARIA_SYSTEM_PROMPT } from "@/lib/aria-system-prompt";

const WEB_SEARCH_SYSTEM = `You have access to Google Search. Use it when the question needs current, factual, or cited information. Prefer recent primary sources and include titles with URLs when listing sources.`;

function getLanguageModel(modelKey: string) {
  const ariaModel = getModel(modelKey);

  if (ariaModel.provider === "google") {
    return google(ariaModel.modelId);
  }

  return openai(ariaModel.modelId);
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

    const useDeepResearch = Boolean(deepResearch);
    const useWebSearch =
      Boolean(webSearch) && ariaModel.provider === "google";

    const systemPrompt = [
      useDeepResearch ? ARIA_SYSTEM_PROMPT : undefined,
      useWebSearch ? WEB_SEARCH_SYSTEM : undefined,
      system?.trim(),
    ]
      .filter(Boolean)
      .join("\n\n");

    const result = streamText({
      model: getLanguageModel(modelKey),
      ...(systemPrompt ? { system: systemPrompt } : {}),
      messages: await convertToModelMessages(messages),
      maxRetries: 1,
      tools: {
        ...frontendTools(tools ?? {}),
        ...(useWebSearch
          ? { google_search: google.tools.googleSearch({}) }
          : {}),
      },
    });

    return result.toUIMessageStreamResponse({
      onError: (error) => {
        const message =
          error instanceof Error ? error.message : "An error occurred.";
        if (message.includes("quota") || message.includes("RESOURCE_EXHAUSTED")) {
          return `Gemini quota exceeded for ${ariaModel.modelId}. Try again later, enable billing, or switch to another model.`;
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
