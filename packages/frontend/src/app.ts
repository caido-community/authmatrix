import { Classic } from "@caido/primevue";
import { createPinia } from "pinia";
import PrimeVue from "primevue/config";
import Tooltip from "primevue/tooltip";
import { createApp } from "vue";

import { SDKPlugin } from "./plugins/sdk";
import "./styles/style.css";
import type { CaidoSDK } from "./types";
import App from "./views/App.vue";

export const defineApp = (sdk: CaidoSDK) => {
  const app = createApp(App);

  const pinia = createPinia();
  app.use(pinia);

  app.use(PrimeVue, {
    unstyled: true,
    pt: Classic,
  });

  app.directive("tooltip", Tooltip);

  app.use(SDKPlugin, sdk);

  return app;
};
