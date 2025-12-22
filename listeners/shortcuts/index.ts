import type { App } from "@slack/bolt";
import { sampleShortcutCallback } from "./sample-shortcut.js";
import { createJiraFromThreadAction } from "./create-jira-from-thread-action.js";

const register = (app: App) => {
  app.shortcut("sample_shortcut_id", sampleShortcutCallback);
  app.shortcut("create_jira_from_thread", createJiraFromThreadAction);
};

export default { register };
