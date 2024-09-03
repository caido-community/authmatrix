import { useSDK } from "@/plugins/sdk";
import type { Context } from "./types";

export const useInitialize = (context: Context) => {
  const sdk = useSDK();

  const initialize = async () => {
    switch (context.state.type) {
      case "Idle":
      case "Error":
      case "Success": {
        context.state = { type: "Loading" };
        const [templates, results] = await Promise.all([
          sdk.backend.getTemplates(),
          sdk.backend.getResults(),
        ]);

        context.state = {
          type: "Success",
          templates,
          results,
          selectionState: {
            type: "None",
          },
          analysisState: { type: "Idle" },
        };

        const firstTemplate = templates[0];
        if (firstTemplate) {
          context.state = {
            ...context.state,
            selectionState: {
              type: "Loading",
              templateId: firstTemplate.id,
              userId: undefined,
            },
          };

          try {
            const result = await sdk.backend.getRequest(
              firstTemplate.requestId,
            );
            context.state = {
              ...context.state,
              selectionState: {
                type: "Success",
                templateId: firstTemplate.id,
                userId: undefined,
                request: result,
              },
            };
          } catch {
            context.state = {
              ...context.state,
              selectionState: {
                type: "Error",
                templateId: firstTemplate.id,
                userId: undefined,
              },
            };
          }
        }

        break;
      }
      case "Loading":
        break;
    }

    sdk.backend.onEvent("templates:created", (request) => {
      if (context.state.type === "Success") {
        if (context.state.templates.some((r) => r.id === request.id)) {
          return;
        }

        context.state = {
          ...context.state,
          templates: [...context.state.templates, request],
        };
      }
    });
  };

  const getState = () => context.state;

  return {
    getState,
    initialize,
  };
};
