import axios from "axios";
import { JiraProject } from "../types.js";

export const fetchJiraProjects = async (): Promise<JiraProject[]> => {
  const authHeader = Buffer.from(
    `${process.env.JIRA_EMAIL}:${process.env.JIRA_API_TOKEN}`
  ).toString("base64");

  const response = await axios.get(
    "https://eurostar.atlassian.net/rest/api/3/project/search",
    {
      headers: {
        Authorization: `Basic ${authHeader}`,
        Accept: "application/json",
      },
    }
  );

  return response.data.values;
};
