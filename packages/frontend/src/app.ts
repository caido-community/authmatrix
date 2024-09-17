import { ClassicTheme, ClassicThemePassthrough } from "@caido/primevue";
import PrimeVue from "primevue/config";
import Tooltip from "primevue/tooltip";
import { createApp } from "vue";

import App from "./views/App.vue";

import "@fortawesome/fontawesome-free/css/fontawesome.min.css";
import "@fortawesome/fontawesome-free/css/regular.min.css";
import "@fortawesome/fontawesome-free/css/solid.min.css";
import "./styles/style.css";

import { createPinia } from "pinia";
import { SDKPlugin } from "./plugins/sdk";
import type { CaidoSDK } from "./types";

export const defineApp = (sdk: CaidoSDK) => {
  const app = createApp(App);

  const pinia = createPinia();
  app.use(pinia);

  app.use(PrimeVue, {
    theme: {
      preset: ClassicTheme,
      options: {
        /**
         * The selector to use to determine if the user has selected dark mode.
         * This selector is present in the HTML of the core Caido app, not the plugin.
         */
        darkModeSelector: "[data-mode=dark]",
      }
    },
    pt: {
      ...ClassicThemePassthrough,
    },
  });

  app.directive("tooltip", Tooltip);

  app.use(SDKPlugin, sdk);

  return app;
};
