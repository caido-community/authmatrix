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
        const roles = await sdk.backend.getRoles();
        context.state = { type: "Success", roles };
        break;
      }
      case "Loading":
        break;
    }
  };

  const getState = () => context.state;

  return {
    getState,
    initialize,
  };
};
