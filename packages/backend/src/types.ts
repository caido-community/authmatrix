import type { DefineEvents } from "caido:plugin";
import type { AnalysisRequestDTO, SubstitutionDTO, TemplateDTO } from "shared";

export type BackendEvents = DefineEvents<{
  "templates:created": (template: TemplateDTO) => void;
  "templates:updated": (template: TemplateDTO) => void;
  "templates:cleared": () => void;
  "substitutions:created": (substitution: SubstitutionDTO) => void;
  "substitutions:updated": (substitution: SubstitutionDTO) => void;
  "substitutions:deleted": (id: string) => void;
  "substitutions:cleared": () => void;
  "users:updated": () => void;
  "roles:updated": () => void;
  "settings:updated": () => void;
  "config:imported": () => void;
  "results:created": (result: AnalysisRequestDTO) => void;
  "results:clear": () => void;
  "cursor:mark": (templateId: string, isScanning: boolean) => void;
  "cursor:clear": () => void;
  "project:changed": (projectId: string | undefined) => void;
}>;
