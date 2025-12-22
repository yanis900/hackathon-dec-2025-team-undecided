import type {
  AllMiddlewareArgs,
  SlackShortcutMiddlewareArgs,
} from "@slack/bolt";
import axios from "axios";
import { fetchJiraProjects } from "../../handlers/get-jira-projects.js";

const createJiraFromThreadShortcut = async ({
  ack,
  body,
  client,
  respond,
  logger,
}: AllMiddlewareArgs & SlackShortcutMiddlewareArgs) => {
  try {
    await ack();

    if (body.type !== "message_action") {
      return;
    }

    const channel = body.channel.id;
    const message = body.message;
    const threadTs = message.thread_ts ?? message.ts;

    const replies = await client.conversations.replies({
      channel,
      ts: threadTs,
      limit: 100,
    });

    if (!replies.ok || !replies.messages?.length) {
      await respond({
        text: "Could not read the thread.",
        response_type: "ephemeral",
      });
      return;
    }

    if (replies.messages.length === 1) {
      await respond({
        text: "The thread has only one message. Please add more context before creating a Jira ticket.",
        response_type: "ephemeral",
      });
      return;
    }

    const projects = await fetchJiraProjects();

    console.log("Fetched Jira projects:", projects);

    await client.views.open({
      trigger_id: body.trigger_id,
      view: {
        type: "modal",
        callback_id: "create_jira_modal",
        private_metadata: JSON.stringify({
          channel,
          threadTs,
        }),
        title: {
          type: "plain_text",
          text: "Create Jira ticket",
        },
        submit: {
          type: "plain_text",
          text: "Create",
        },
        blocks: [
          {
            type: "input",
            block_id: "project_block",
            label: {
              type: "plain_text",
              text: "Jira project",
            },
            element: {
              type: "static_select",
              action_id: "project_select",
              options: projects.map((project) => ({
                text: {
                  type: "plain_text",
                  text: `${project.name} (${project.key})`,
                },
                value: project.key,
              })),
            },
          },
        ],
      },
    });

    await respond({
      text: `Found ${replies.messages.length} messages. Creating Jira ticket…`,
      thread_ts: threadTs,
    });

  } catch (error) {
    logger.error("createJiraFromThreadAction failed", error);

    if (axios.isAxiosError(error)) {
      console.error("Jira error:", error.response?.data);
    }

    await respond({
      text: "Failed to create Jira ticket.",
      response_type: "ephemeral",
    });
  }
};

export { createJiraFromThreadShortcut };
