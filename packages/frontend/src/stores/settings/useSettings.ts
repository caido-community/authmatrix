import { useSDK } from "@/plugins/sdk";
import type { Context } from "./types";

export const useSettings = (context: Context) => {
  const sdk = useSDK();

  const toggleAutoRunAnalysis = async () => {
    if (context.state.type === "Success") {
      const newSettings = await sdk.backend.updateSettings({
        ...context.state.settings,
        autoRunAnalysis: !context.state.settings.autoRunAnalysis,
      });

      context.state = {
        type: "Success",
        settings: newSettings,
      };
    }
  };

  const toggleAutoCaptureRequests = async () => {
    if (context.state.type === "Success") {
      const newSettings = await sdk.backend.updateSettings({
        ...context.state.settings,
        autoCaptureRequests: !context.state.settings.autoCaptureRequests,
      });

      context.state = {
        type: "Success",
        settings: newSettings,
      };
    }
  };

  return {
    toggleAutoRunAnalysis,
    toggleAutoCaptureRequests,
  };
};
