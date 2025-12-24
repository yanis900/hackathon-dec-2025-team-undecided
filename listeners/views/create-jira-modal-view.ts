import type { AllMiddlewareArgs, SlackViewMiddlewareArgs } from "@slack/bolt";
import { createJiraTicket } from "../../handlers/create-jira-ticket.js";
import { createOpenaiResponse } from "../../handlers/create-openai-response.js";
import { toADF } from "../../helpers/toAdf.js";

const createJiraModalView = async ({
  ack,
  client,
  logger,
  view,
}: AllMiddlewareArgs & SlackViewMiddlewareArgs) => {
  await ack();

  try {
    const metadata = JSON.parse(view.private_metadata);
    const { channel, threadTs } = metadata;
    const replies = await client.conversations.replies({
      channel,
      ts: threadTs,
      limit: 100,
    });

    const threadMessages = (replies.messages ?? [])
      .map((m) => m.text)
      .filter((text): text is string => !!text);

    const selectedProjectKey =
      view.state.values.project_block.project_select.selected_option?.value;

    console.log("Selected Project Key:", selectedProjectKey);

    if (!selectedProjectKey || !threadMessages) {
      throw new Error("Missing required fields");
    }

    const jiraPayload = await createOpenaiResponse({
      projectKey: selectedProjectKey,
      threadMessages,
    });

    console.log("Initial Jira Payload:", JSON.stringify(jiraPayload, null, 2));

    if (typeof jiraPayload.fields.description === "string") {
      jiraPayload.fields.description = toADF(jiraPayload.fields.description);
    }

    // console.log("Jira Payload:", JSON.stringify(jiraPayload, null, 2));
    const issue = await createJiraTicket(jiraPayload);

    await client.chat.postMessage({
      channel,
      thread_ts: threadTs,
      text: `🎫 Jira ticket created: <${process.env.JIRA_BASE_URL}/browse/${issue.key}|${issue.key}: ${jiraPayload.fields.summary}>`,
    });
  } catch (error) {
    logger.error("Failed to submit Jira modal", error);
  }
};

export { createJiraModalView };
