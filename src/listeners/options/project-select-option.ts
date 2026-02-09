import type {
  AllMiddlewareArgs,
  SlackOptionsMiddlewareArgs,
} from "@slack/bolt";
import { fetchJiraProjects } from "../../handlers/get-jira-projects.js";

const projectSelectOption = async ({
  ack,
  client,
  body,
  logger,
  options,
}: AllMiddlewareArgs & SlackOptionsMiddlewareArgs) => {
  const query = options.value?.toLowerCase() ?? "";

  try {
    const res = await client.users.info({ user: body.user.id });
    const email = res.user?.profile?.email;
    logger.info(
      `Fetching Jira projects for user ${email} with query "${query}"`,
    );
    const projects = await fetchJiraProjects(email);

    const filtered = projects
      .filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.key.toLowerCase().includes(query),
      )
      .slice(0, 100); // max 100 options per Slack

    await ack({
      options: filtered.map((p) => ({
        text: {
          type: "plain_text",
          text: `${p.name} (${p.key})`,
        },
        value: p.key,
      })) as any,
    });
  } catch (error) {
    logger.error("Error fetching Jira projects:", error);
  }
};

export { projectSelectOption };
