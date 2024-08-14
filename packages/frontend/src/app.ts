import { createApp } from "vue";
import PrimeVue from "primevue/config";
import Tooltip from "primevue/tooltip";

import App from "./views/App.vue";
import { CaidoDark } from "@caido/primevue";

import "@fortawesome/fontawesome-free/css/fontawesome.min.css";
import "@fortawesome/fontawesome-free/css/regular.min.css";
import "@fortawesome/fontawesome-free/css/solid.min.css";
import "./styles/style.css";

import {API} from "backend";
import {Caido} from "@caido/sdk-frontend";
import {SDKPlugin} from "./plugins/sdk";
import {createPinia} from "pinia";

export const defineApp = (sdk: Caido<API>) => {

  const app = createApp(App);

  const pinia = createPinia();
  app.use(pinia);

  app.use(PrimeVue, {
    theme: {
      preset: CaidoDark,
      options: {
        prefix: "autorize",
        cssLayer: {
          name: "autorize",
        }
      },
    },
    pt: {
      menubar: {
        root: {
          style: {
            boxShadow: 'var(--autorize-box-shadow-surface)'
          }
        }
      },
      splitterPanel: {
        root: {
          style: {
            overflow: 'auto',
            boxShadow: 'var(--autorize-box-shadow-surface)'
          }
        }
      },
      column: {
        headerCell: {
          style: {
            borderBottomWidth: '0.25rem'
          }
        }
      }
    }
  });

  app.use(SDKPlugin, sdk);

  app.directive("tooltip", Tooltip);
  return app;
}
