import type {
  AllMiddlewareArgs,
  SlackOptionsMiddlewareArgs,
} from "@slack/bolt";
import { fetchJiraProjects } from "../../handlers/get-jira-projects.js";

const projectSelectOption = async ({
  ack,
  options,
}: AllMiddlewareArgs & SlackOptionsMiddlewareArgs) => {
  const query = options.value?.toLowerCase() ?? "";
  const projects = await fetchJiraProjects();

  const filtered = projects
    .filter(
      (p) =>
        p.name.toLowerCase().includes(query) ||
        p.key.toLowerCase().includes(query)
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
