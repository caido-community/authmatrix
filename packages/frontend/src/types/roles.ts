import type { Role } from "shared";

export type RoleState =
	| { type: "Idle" }
	| { type: "Loading" }
	| { type: "Error" }
	| { type: "Success"; roles: Role[] };
