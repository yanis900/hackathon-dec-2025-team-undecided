import type { App } from '@slack/bolt';
import { sampleViewCallback } from './sample-view.js';
import { createJiraModalView } from './create-jira-modal-view.js';

const register = (app: App) => {
  app.view('sample_view_id', sampleViewCallback);
  app.view('create_jira_modal', createJiraModalView);
};

export default { register };
