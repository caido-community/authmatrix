import {DefineEvents} from "caido:plugin";
import {BaseRequest} from "shared";

export type BackendEvents = DefineEvents<{
  "requests:created": (request: BaseRequest) => void;
}>;
