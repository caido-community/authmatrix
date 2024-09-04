import type { AnalysisResult } from "shared";

export type AnalysisJobState = { type: "Idle" } | { type: "Analyzing" };

export type AnalysisResultState =
  | { type: "Idle" }
  | { type: "Loading" }
  | { type: "Error", error: string }
  | { type: "Success", results: AnalysisResult[] };

export type AnalysisSelectionState =
  | { type: "None" }
  | { type: "Loading"; templateId: string, userId: string | undefined }
  | { type: "Error"; templateId: string, userId: string | undefined }
  | {
      type: "Success";
      templateId: string;
      userId: string | undefined;
      request: {
        id: string;
        raw: string;
      };
      response?: {
        id: string;
        raw: string;
      }
    };
