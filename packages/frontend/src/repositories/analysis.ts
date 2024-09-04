import {useSDK} from "@/plugins/sdk"

export const useAnalysisRepository = () => {
  const sdk = useSDK();

  const getAnalysisResults = async () => {
    try {
      const results = await sdk.backend.getResults();
      return {
        type: "Ok" as const,
        results
      }
    } catch {
      return {
        type: "Err" as const,
        error: "Failed to get analysis results"
      }
    }
  }

  const runAnalysis = async () => {
    try {
      await sdk.backend.runAnalysis();
      return {
        type: "Ok" as const
      }
    } catch {
      return {
        type: "Err" as const,
        error: "Failed to run analysis"
      }
    }
  }

  return {
    getAnalysisResults,
    runAnalysis
  }
}
