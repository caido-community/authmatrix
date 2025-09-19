import type { Caido } from "@caido/sdk-frontend";
import type { API, BackendEvents } from "backend";

export * from "./analysis";
export * from "./roles";
export * from "./settings";
export * from "./substitutions";
export * from "./users";
export * from "./templates";

export type CaidoSDK = Caido<API, BackendEvents>;
