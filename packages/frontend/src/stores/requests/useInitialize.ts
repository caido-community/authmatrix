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
				const requests = await sdk.backend.getRequests();
				context.state = { type: "Success", requests, selection: requests[0], analysisState: { type: "Idle" } };
				break;
			}
			case "Loading":
				break;
		}

    sdk.backend.onEvent("requests:created", (request) => {
      if (context.state.type === "Success") {
        if (context.state.requests.some((r) => r.id === request.id)) {
          return;
        }

        context.state = {
          ...context.state,
          requests: [...context.state.requests, request],
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
