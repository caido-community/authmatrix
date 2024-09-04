import type { User } from "shared";

export type UserState =
  | { type: "Idle" }
  | { type: "Loading" }
  | { type: "Error"; error: string }
  | { type: "Success"; users: User[]; selectedUserId: string | undefined };
