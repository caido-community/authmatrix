import {createApp} from "vue";
import PrimeVue from "primevue/config";
import Tooltip from "primevue/tooltip";

import App from "./views/App.vue";
import { CaidoDark } from "@caido/primevue";

import "@fortawesome/fontawesome-free/css/fontawesome.min.css";
import "@fortawesome/fontawesome-free/css/regular.min.css";
import "@fortawesome/fontawesome-free/css/solid.min.css";
import "./styles/style.css";

export const defineApp = () => {

  const app = createApp(App);
  app.directive("tooltip", Tooltip);

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

  return app;
}
