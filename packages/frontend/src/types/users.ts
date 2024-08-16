import type { User } from "shared";

export type UserState =
	| { type: "Idle" }
	| { type: "Loading" }
	| { type: "Error" }
	| { type: "Success"; users: User[] };
