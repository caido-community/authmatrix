import { useSDK } from "@/plugins/sdk";
import type { Context } from "./types";
import {TemplateVariant} from "@/types";

export const useInitialize = (context: Context) => {
	const sdk = useSDK();

	const initialize = async () => {
		switch (context.state.type) {
			case "Idle":
			case "Error":
			case "Success": {
				context.state = { type: "Loading" };
				const templates = await sdk.backend.getTemplates();

        const firstTemplate = templates[0];
        const selection: TemplateVariant | undefined = firstTemplate
          ? { templateId: firstTemplate.id, userId: undefined }
          : undefined;

				context.state = { type: "Success", templates, selection, analysisState: { type: "Idle" } };
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
