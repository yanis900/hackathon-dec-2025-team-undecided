import { CreateJiraTicketPayload } from "../types.js";
import { createAzure } from "@ai-sdk/azure";
import { generateText, APICallError } from "ai";

type CreateOpenaiResponseParams = {
  projectKey: string;
  threadMessages: string[];
};

export const createOpenaiResponse = async (
  params: CreateOpenaiResponseParams,
): Promise<CreateJiraTicketPayload> => {
  const apiKey = process.env.OPENAI_API_SECRET;
  const resourceName = process.env.OPENAI_API_RESOURCE_NAME;

  if (!apiKey || !resourceName) {
    throw new Error("Missing Azure OpenAI configuration");
  }

  const openai = createAzure({
    resourceName,
    apiKey,
  });

  try {
    const response = await generateText({
      model: openai("gpt-4o"),
      prompt: `
      You are an assistant that converts Slack thread discussions into Jira issue fields.
      Generate a Jira issue payload that matches EXACTLY this TypeScript shape:
      
      {
        "fields": {
          "project": { "key": string },
          "summary": string,
          "description"?: unknown,
          "issuetype": { "name": string },
          "priority"?: { "name": string },
        }
      }

      Rules:
      - Return ONLY valid JSON.
      - Summary must be concise (max 120 characters) — a one-line title of the issue.
      - Description must be a clear, structured explanation of the issue or request — do NOT repeat the thread verbatim.
      - Use Jira issue types: Bug, Task, Sub-task, Story, Outline use case / epic, Spike, Retro task.
      - Use Jira priorities: Lowest, Low, Medium, High, Highest.
      - If priority is unclear, omit it.
      - Use the provided project key: "${params.projectKey}".

      Slack thread messages:
      """
      ${params.threadMessages.join("\n")}
      """
      `,
      temperature: 0.7,
      maxRetries: 2,
    });
    return JSON.parse(response.text);
  } catch (error) {
    if (APICallError.isInstance(error)) {
      throw new Error(`OpenAI API Error: ${error.message}`);
    }
    throw error;
  }
};
