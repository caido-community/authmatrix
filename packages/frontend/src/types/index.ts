import { Caido } from "@caido/sdk-frontend";
import { API } from "backend";

export * from "./analysis";
export * from "./roles";
export * from "./settings";
export * from "./users";
export * from "./templates";

export type CaidoSDK = Caido<API>;
