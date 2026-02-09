import type { App } from "@slack/bolt";
import { projectSelectOption } from "./project-select-option.js";

const register = (app: App) => {
  app.options("project_select", projectSelectOption);
};

export default { register };
