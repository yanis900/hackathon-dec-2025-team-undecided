import type {
  AllMiddlewareArgs,
  SlackOptionsMiddlewareArgs,
} from "@slack/bolt";
import { fetchJiraProjects } from "../../handlers/get-jira-projects.js";

const projectSelectOption = async ({
  ack,
  options,
  client,
  body,
  logger
}: AllMiddlewareArgs & SlackOptionsMiddlewareArgs) => {
  const query = options.value?.toLowerCase() ?? "";

  // Fetch the user's email to use as reporter in Jira 
  let email: string | undefined;

  try {
    const result = await client.users.info({
      user: body.user.id,
    });

    email = result.user?.profile?.email;
  } catch (error) {
    logger.error("Error fetching user info:", error);
  }

  if (!email) {
    logger.warn("Falling back to default Jira email");
  }
  // If there is no email, we can use a default one from env
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
};

export { projectSelectOption };
