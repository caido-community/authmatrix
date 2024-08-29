import {DefineEvents} from "caido:plugin";
import {Template} from "shared";

export type BackendEvents = DefineEvents<{
  "templates:created": (template: Template) => void;
}>;
