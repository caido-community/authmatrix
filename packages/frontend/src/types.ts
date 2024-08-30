import type { Template, Settings, AnalysisResult } from "shared";
import type { Role, User } from "shared";
import type { Caido } from "@caido/sdk-frontend";
import type { API } from "backend";

export type CaidoSDK = Caido<API>;

export type TemplateState =
	| { type: "Idle" }
	| { type: "Loading" }
	| { type: "Error" }
	| {
    type: "Success";
    templates: Template[],
    results: AnalysisResult[],
    selectionState:
      | { type: "None" }
      | { type: "Loading", templateId: string, userId: string | undefined }
      | { type: "Error", templateId: string, userId: string | undefined }
      | {
        type: "Success",
        templateId: string,
        userId: string | undefined,
        request: {
          id: string,
          raw: string,
        }
      }
    analysisState:
      | { type: "Idle" }
      | { type: "Analyzing" }
  };

export type RoleState =
	| { type: "Idle" }
	| { type: "Loading" }
	| { type: "Error" }
	| { type: "Success"; roles: Role[] };

export type UserState =
	| { type: "Idle" }
	| { type: "Loading" }
	| { type: "Error" }
	| { type: "Success"; users: User[] };

export type SettingsState =
  | { type: "Idle" }
  | { type: "Loading" }
  | { type: "Error" }
  | { type: "Success"; settings: Settings };
