import type { Caido } from "@caido/sdk-frontend";
import type { API } from "starterkit-plugin-backend";
import PrimeVue from "primevue/config";
import { CaidoDark } from "@caido/primevue";

import "./styles/style.css";
import {createApp} from "vue";

import App from "./views/App.vue";

type CaidoSDK = Caido<API>;

export const init = (sdk: CaidoSDK) => {

  const app = createApp(App);
  app.use(PrimeVue, {
    theme: {
      preset: CaidoDark
    },
  });

  const root = document.createElement("div");
  app.mount(root);

  sdk.navigation.addPage("/autorize", {
    body: root
  });

  sdk.sidebar.registerItem("Autorize", "/autorize");
}
