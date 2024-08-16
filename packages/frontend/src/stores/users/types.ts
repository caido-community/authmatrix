import type { UserState } from "@/types/users";
import type { User } from "shared";

export type Context = {
	state: UserState;
	selection: User | null;
};
