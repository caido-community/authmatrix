import type { Caido } from "@caido/sdk-frontend";
import type { API } from "starterkit-plugin-backend";

import {defineApp} from "./app";

type CaidoSDK = Caido<API>;

export const init = (sdk: CaidoSDK) => {

  const app = defineApp();

  const root = document.createElement("div");
  Object.assign(root.style, {
    height: "100%",
    width: "100%",
  });

  app.mount(root);

  sdk.navigation.addPage("/autorize", {
    body: root
  });

  sdk.sidebar.registerItem("Autorize", "/autorize");
}
