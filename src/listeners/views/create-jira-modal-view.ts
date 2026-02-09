import type { AllMiddlewareArgs, SlackViewMiddlewareArgs } from "@slack/bolt";
import { createJiraTicket } from "../../handlers/create-jira-ticket.js";
import { createOpenaiResponse } from "../../handlers/create-openai-response.js";
import { toADF } from "../../helpers/toAdf.js";

const createJiraModalView = async ({
  ack,
  client,
  logger,
  body,
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

    logger.info("Selected Project Key:", selectedProjectKey);

    if (!selectedProjectKey || !threadMessages) {
      throw new Error("Missing required fields");
    }

    const jiraPayload = await createOpenaiResponse({
      projectKey: selectedProjectKey,
      threadMessages,
    });

    if (typeof jiraPayload.fields.description === "string") {
      jiraPayload.fields.description = toADF(jiraPayload.fields.description);
    }

    logger.info("Generated Jira Payload:", jiraPayload);

    const res = await client.users.info({ user: body.user.id });
    const email = res.user?.profile?.email;

    // const issue = await createJiraTicket(jiraPayload, email);

    // await client.chat.postMessage({
    //   channel,
    //   thread_ts: threadTs,
    //   text: `🎫 Jira ticket created: <${process.env.JIRA_BASE_URL}/browse/${issue.key}|${issue.key}: ${jiraPayload.fields.summary}>`,
    // });
  } catch (error) {
    logger.error("Failed to submit Jira modal", error);
  }
};

export { createJiraModalView };
