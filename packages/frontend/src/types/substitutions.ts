import type { SubstitutionDTO } from "shared";

export type SubstitutionState =
  | { type: "Idle" }
  | { type: "Loading" }
  | { type: "Error"; error: string }
  | { type: "Success"; substitutions: SubstitutionDTO[] };
