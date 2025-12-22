export interface CreateJiraTicketResponse {
  id: string;
  key: string;
  self: string;
}

export interface CreateJiraTicketPayload {
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

export interface JiraProject {
  id: string;
  key: string;
  name: string;
}
