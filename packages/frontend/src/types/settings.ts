import type { Settings } from "shared";

export type SettingsState =
  | { type: "Idle" }
  | { type: "Loading" }
  | { type: "Error", error: string }
  | { type: "Success"; settings: Settings };
