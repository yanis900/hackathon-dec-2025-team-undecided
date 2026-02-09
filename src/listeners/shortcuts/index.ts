import type { App } from '@slack/bolt';
import { createJiraFromThreadShortcut } from './create-jira-from-thread-shortcut.js';

const register = (app: App) => {
  app.shortcut('create_jira_from_thread', createJiraFromThreadShortcut);
};

export default { register };
