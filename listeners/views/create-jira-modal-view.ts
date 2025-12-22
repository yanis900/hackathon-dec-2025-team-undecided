import { AllMiddlewareArgs, SlackViewMiddlewareArgs } from "@slack/bolt";
import { createJiraTicket } from "../../handlers/create-jira-ticket.js";

const createJiraModalView = async ({
  ack,
  client,
  logger,
  view,
}: AllMiddlewareArgs & SlackViewMiddlewareArgs) => {
  await ack();

  try {
    const metadata = JSON.parse(view.private_metadata);
    const channel = metadata.channel;
    const threadTs = metadata.threadTs;

    const selectedProjectKey =
      view.state.values.project_block.project_select.selected_option?.value;

    if (!selectedProjectKey) {
      throw new Error("Missing required fields");
    }

    //  const issue = await createJiraTicket({
    //   fields: {
    //     project: { key: "PII" },
    //     summary: "Improve login error handling",
    //     issuetype: { name: "Bug" },
    //     priority: { name: "High" },
    //   },
    // });

    await client.chat.postMessage({
      channel,
      thread_ts: threadTs,
      text: `🎫 Jira ticket created: *PII: Improve login error handling*`,
    });

  } catch (error) {
    logger.error("Failed to submit Jira modal", error);
  }
};

export { createJiraModalView };
