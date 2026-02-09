import axios from "axios";
import { CreateJiraTicketPayload, CreateJiraTicketResponse } from "../../types/index.js";


export const createJiraTicket = async (
  payload: CreateJiraTicketPayload,
  email?: string,
): Promise<CreateJiraTicketResponse> => {
  const authHeader = Buffer.from(
    `${email || process.env.JIRA_EMAIL}:${process.env.JIRA_API_TOKEN}`,
  ).toString("base64");

  const response = await axios.post<CreateJiraTicketResponse>(
    `${process.env.JIRA_BASE_URL}/rest/api/3/issue`,
    payload,
    {
      headers: {
        Authorization: `Basic ${authHeader}`,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    },
  );

  return response.data;
};
