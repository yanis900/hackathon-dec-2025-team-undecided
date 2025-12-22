import type { App } from "@slack/bolt";
import { sampleShortcutCallback } from "./sample-shortcut.js";
import { createJiraFromThreadShortcut } from "./create-jira-from-thread-shortcut.js";

const register = (app: App) => {
  app.shortcut("sample_shortcut_id", sampleShortcutCallback);
  app.shortcut("create_jira_from_thread", createJiraFromThreadShortcut);
};

export default { register };
