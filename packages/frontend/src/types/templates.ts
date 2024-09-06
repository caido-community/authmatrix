import type { Caido } from "@caido/sdk-frontend";
import type { API } from "backend";
import type { Template } from "shared";

export type CaidoSDK = Caido<API>;

export type TemplateState =
  | { type: "Idle" }
  | { type: "Loading" }
  | { type: "Error"; error: string }
  | { type: "Success"; templates: Template[] };
