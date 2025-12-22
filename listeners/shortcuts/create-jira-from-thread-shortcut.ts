import type {
  AllMiddlewareArgs,
  SlackShortcutMiddlewareArgs,
} from "@slack/bolt";
import { createJiraTicket } from "../../handlers/create-jira-ticket.js";
import axios from "axios";

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

    interface JiraProject {
      id: string;
      key: string;
      name: string;
    }

    // Dummy projects for testing
    const dummyProjects: JiraProject[] = [
      { id: "1", key: "PROJ1", name: "Website Redesign" },
      { id: "2", key: "PROJ2", name: "Mobile App" },
      { id: "3", key: "PROJ3", name: "Internal Tools" },
      { id: "4", key: "PROJ4", name: "Customer Support" },
      { id: "5", key: "PROJ5", name: "Marketing Campaign" },
    ];

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
              options: dummyProjects.map((project) => ({
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

    // TODO: LLM to summarize the thread and extract relevant details

    // const issue = await createJiraTicket({
    //   fields: {
    //     project: { key: "PII" },
    //     summary: "Improve login error handling",
    //     issuetype: { name: "Bug" },
    //     priority: { name: "High" },
    //   },
    // });

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
