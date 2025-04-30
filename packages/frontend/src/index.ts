import { getRequestResponse } from "backend/src/services/analysis";
import { defineApp } from "./app";
import type { CaidoSDK } from "./types";

export const init = (sdk: CaidoSDK ) => {
  const app = defineApp(sdk);

  const root = document.createElement("div");
  Object.assign(root.style, {
    height: "100%",
    width: "100%",
  });

  app.mount(root);

  sdk.navigation.addPage("/authmatrix", {
    body: root,
  });

  sdk.sidebar.registerItem("Authmatrix", "/authmatrix", {
    icon: "fas fa-user-shield",
  });

  sdk.commands.register("send-to-authmatrix", {
    name: "Send to Authmatrix",
    run: (context) => {
      if (context.type === "RequestRowContext") {
        context.requests.forEach(async (request) => {
          sdk.backend.addTemplateFromContext(request.id);
        });
      } else if (context.type === "RequestContext") {
        sdk.backend.addTemplateFromContext(context.request.id);
      }
    },
  });

  sdk.menu.registerItem({
    type: "RequestRow",
    commandId: "send-to-authmatrix",
    leadingIcon: "fas fa-user-shield",
  });

  sdk.menu.registerItem({
    type: "Request",
    commandId: "send-to-authmatrix",
    leadingIcon: "fas fa-user-shield",
  });
};
