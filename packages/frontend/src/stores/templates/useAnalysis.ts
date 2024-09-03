import { useSDK } from "@/plugins/sdk";
import type { Context } from "./types";

export const useAnalyze = (context: Context) => {
  const sdk = useSDK();
  const runAnalysis = async () => {
    if (context.state.type === "Success") {
      context.state = {
        ...context.state,
        analysisState: { type: "Analyzing" },
      };
      await sdk.backend.runAnalysis();

      context.state = {
        ...context.state,
        analysisState: { type: "Idle" },
      };
    }
  };

  return { runAnalysis };
};
