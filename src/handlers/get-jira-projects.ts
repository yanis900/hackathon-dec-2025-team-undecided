import axios from "axios";
import { JiraProject } from "../../types/index.js";

export const fetchJiraProjects = async (
  email?: string,
): Promise<JiraProject[]> => {
  const authHeader = Buffer.from(
    `${email || process.env.JIRA_EMAIL}:${process.env.JIRA_API_TOKEN}`,
  ).toString("base64");

  const allProjects: JiraProject[] = [];
  let startAt = 0;
  const maxResults = 50;
  let isLast = false;

  while (!isLast) {
    const response = await axios.get(
      "https://eurostar.atlassian.net/rest/api/3/project/search",
      {
        headers: {
          Authorization: `Basic ${authHeader}`,
          Accept: "application/json",
        },
        params: {
          startAt,
          maxResults,
        },
      },
    );

    const { values, isLast: last } = response.data;

    allProjects.push(...values);
    isLast = last;
    startAt += maxResults;
  }

  return allProjects;
};
