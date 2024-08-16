import type { BaseRequest } from "shared";

export type RequestState =
	| { type: "Idle" }
	| { type: "Loading" }
	| { type: "Error" }
	| { type: "Success"; requests: BaseRequest[] };
