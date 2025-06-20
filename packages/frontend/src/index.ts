import { defineApp } from "./app";
import type { CaidoSDK } from "./types";

export const init = (sdk: CaidoSDK) => {
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
      const addTemplate = (id: string) => {
        sdk.backend.addTemplateFromContext(id);
        return true;
      };

      let addedCount = 0;

      if (context.type === "RequestRowContext") {
        addedCount = context.requests
          .filter(request => request.id !== undefined)
          .map(request => addTemplate(request.id))
          .length;
      } else if (context.type === "RequestContext" && context.request.id) {
        addedCount = addTemplate(context.request.id) ? 1 : 0;
      }

      if (addedCount > 0) {
        sdk.window.showToast(
          addedCount === 1
            ? "Request sent to Authmatrix"
            : `${addedCount} requests sent to Authmatrix`,
          { variant: "success" }
        );
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

  sdk.navigation.goTo("/authmatrix");
};
