import type { BaseRequest, Settings } from "shared";
import type { Role, User } from "shared";
import type { Caido } from "@caido/sdk-frontend";
import type { API } from "backend";

export type CaidoSDK = Caido<API>;

export type RequestState =
	| { type: "Idle" }
	| { type: "Loading" }
	| { type: "Error" }
	| {
    type: "Success";
    requests: BaseRequest[],
    selection: BaseRequest | undefined,
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
