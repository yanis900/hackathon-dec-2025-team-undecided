import type { App } from "@slack/bolt";

import shortcuts from "./shortcuts/index.js";
import views from "./views/index.js";
import options from "./options/index.js";

const registerListeners = (app: App) => {
  shortcuts.register(app);
  views.register(app);
  options.register(app);
};

export default registerListeners;
