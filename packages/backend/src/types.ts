import {DefineEvents} from "caido:plugin";
import {AnalysisResult, Template} from "shared";

export type BackendEvents = DefineEvents<{
  "templates:created": (template: Template) => void;
  "results:created": (result: AnalysisResult) => void;
}>;
