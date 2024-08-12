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
  });

  return app;
}
