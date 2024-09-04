import { useSDK } from "@/plugins/sdk";

export const useAnalysisRepository = () => {
  const sdk = useSDK();

  const getAnalysisResults = async () => {
    try {
      const results = await sdk.backend.getResults();
      return {
        type: "Ok" as const,
        results,
      };
    } catch {
      return {
        type: "Err" as const,
        error: "Failed to get analysis results",
      };
    }
  };

  const runAnalysis = async () => {
    try {
      await sdk.backend.runAnalysis();
      return {
        type: "Ok" as const,
      };
    } catch {
      return {
        type: "Err" as const,
        error: "Failed to run analysis",
      };
    }
  };

  const getRequestResponse = async (requestId: string) => {
    try {
      const result = await sdk.backend.getRequestResponse(requestId);
      if (result.type === "Ok") {
        return {
          type: "Ok" as const,
          request: result.request,
          response: result.response,
        };
      }

      return {
        type: "Err" as const,
        error: result.message,
      };
    } catch {
      return {
        type: "Err" as const,
        error: "Failed to get request & response",
      };
    }
  };

  return {
    getAnalysisResults,
    runAnalysis,
    getRequestResponse,
  };
};
