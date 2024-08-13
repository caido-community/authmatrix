import {createApp} from "vue";
import PrimeVue from "primevue/config";

import App from "./views/App.vue";
import { CaidoDark } from "@caido/primevue";

import "./styles/style.css";

export const defineApp = () => {

  const app = createApp(App);

  app.use(PrimeVue, {
    theme: {
      preset: CaidoDark,
      options: {
        prefix: "autorize"
      }
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
      }
    }
  });

  return app;
}
