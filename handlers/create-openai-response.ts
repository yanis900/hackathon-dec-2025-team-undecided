import { CreateJiraTicketPayload } from "../types.js";
import { createAzure } from "@ai-sdk/azure";
import { generateText, APICallError } from "ai";
import { sanitise } from "../helpers/sanitise.js";

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
    "priority"?: { "name": string }
  }
}

Rules:
- Return ONLY valid JSON. No markdown, no explanations, no apologies, no extra text.
- The JSON must be strictly valid: use double quotes for all keys and string values, no trailing commas.
- Summary must be concise (max 120 characters) — a one-line title of the issue.
- Description must be a single JSON value that Jira will accept as the description field.
  - Prefer a plain string description that is a clear, structured explanation of the issue or request.
  - Summarize and structure the Slack thread; do NOT repeat the thread verbatim.
  - If you include structured data (e.g. steps, environment), embed it inside that string (using bullets or numbered lists), not as nested objects.
- Use Jira issue types only from this set: "Bug", "Task", "Sub-task", "Story", "Outline use case / epic", "Spike", "Retro task".
- Use Jira priorities only from this set: "Lowest", "Low", "Medium", "High", "Highest".
- If priority is unclear, omit the "priority" field entirely.
- Always use the provided project key: "${params.projectKey}".

Slack thread messages:
"""
${params.threadMessages.join("\n")}
"""

      `,
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
