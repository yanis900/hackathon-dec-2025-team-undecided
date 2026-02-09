import type { App } from "@slack/bolt";
import { createJiraModalView } from "./create-jira-modal-view.js";

const register = (app: App) => {
  app.view("create_jira_modal", createJiraModalView);
};

export default { register };
