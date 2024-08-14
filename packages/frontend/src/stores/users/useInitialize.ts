import {useSDK} from "@/plugins/sdk";
import {Context} from "./types";

export const useInitialize = (context: Context) => {

  const sdk = useSDK();

  const initialize = async () => {

    switch (context.state.type) {
        case "Idle":
        case "Error":
        case "Success":
          context.state = { type: "Loading" }
          const users = await sdk.backend.getUsers();
          context.state = { type: "Success", users }
          break
        case "Loading":
          break
    }
  }

  const getState = () => context.state

  return {
    getState,
    initialize
  }
}
