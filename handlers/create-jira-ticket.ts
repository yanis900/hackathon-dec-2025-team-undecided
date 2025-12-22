import axios, { AxiosError } from 'axios';

interface CreateJiraTicketResponse {
  id: string;
  key: string;
  self: string;
}

interface CreateJiraTicketPayload {
  fields: {
    project: {
      key: string;
    };
    summary: string;
    description?: unknown;
    issuetype: {
      name: string;
    };
    priority?: {
      name: string;
    };
  };
}

export const createJiraTicket = async (
  payload: CreateJiraTicketPayload
): Promise<CreateJiraTicketResponse> => {
  const authHeader = Buffer.from(
    `${process.env.JIRA_EMAIL}:${process.env.JIRA_API_TOKEN}`
  ).toString('base64');

  const response = await axios.post<CreateJiraTicketResponse>(
    `${process.env.JIRA_BASE_URL}/rest/api/3/issue`,
    payload,
    {
      headers: {
        Authorization: `Basic ${authHeader}`,
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    }
  );

  return response.data;
};
