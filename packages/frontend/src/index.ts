import type { Caido } from "@caido/sdk-frontend";
import type { API } from "starterkit-plugin-backend";

import "./styles/style.css";
import {createApp} from "vue";

import App from "./views/App.vue";

type CaidoSDK = Caido<API>;

export const init = (sdk: CaidoSDK) => {

  const app = createApp(App);
  const root = document.createElement("div");
  app.mount(root);

  sdk.navigation.addPage("/autorize", {
    body: root
  });
}
