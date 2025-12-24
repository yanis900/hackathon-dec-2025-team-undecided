import OpenAI from "openai";
import { CreateJiraTicketPayload } from "../types.js";

const openai = new OpenAI();

export const createOpenaiResponse = async ({
  projectKey,
  threadMessages,
}: {
  projectKey: string;
  threadMessages: string[];
}): Promise<CreateJiraTicketPayload> => {
  const prompt = `
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
- Use the provided project key: "${projectKey}".

Slack thread messages:
"""
${threadMessages.join("\n")}
"""
`;

  console.log(JSON.stringify(threadMessages, null, 2));
  console.log("Fetching OpenAI response...");
  const response = await openai.responses.create({
    model: "gpt-5-nano",
    input: prompt,
  });

  return JSON.parse(response.output_text);
};
