import type { SDK } from "caido:plugin";
import type { SubstitutionDTO } from "shared";

import { withProject } from "../db/utils";
import {
  clearAllSubstitutions,
  createSubstitution,
  removeSubstitution,
  updateSubstitution,
} from "../repositories/substitutions";
import { SubstitutionStore } from "../stores/substitutions";
import type { BackendEvents } from "../types";
import { generateID } from "../utils";

export const getSubstitutions = (_sdk: SDK): SubstitutionDTO[] => {
  const store = SubstitutionStore.get();
  return store.getSubstitutions();
};

export const addSubstitution = async (
  sdk: SDK<never, BackendEvents>,
  pattern: string,
  replacement: string,
) => {
  const project = await sdk.projects.getCurrent();
  if (!project) return;

  const newSubstitution: SubstitutionDTO = {
    id: generateID(),
    pattern,
    replacement,
  };

  const store = SubstitutionStore.get();
  store.addSubstitution(newSubstitution);

  await withProject(sdk, async (projectId) => {
    await createSubstitution(sdk, projectId, newSubstitution);
    sdk.api.send("substitutions:created", newSubstitution);
  });

  return newSubstitution;
};

export const updateSubstitutionFields = async (
  sdk: SDK<never, BackendEvents>,
  id: string,
  fields: Omit<SubstitutionDTO, "id">,
) => {
  const store = SubstitutionStore.get();
  const newSubstitution = store.updateSubstitution(id, fields);

  await withProject(sdk, async (projectId) => {
    await updateSubstitution(sdk, projectId, id, fields);
    sdk.api.send("substitutions:updated", newSubstitution);
  });

  return newSubstitution;
};

export const deleteSubstitution = async (
  sdk: SDK<never, BackendEvents>,
  id: string,
) => {
  const store = SubstitutionStore.get();
  store.deleteSubstitution(id);

  await withProject(sdk, async (projectId) => {
    await removeSubstitution(sdk, projectId, id);
    sdk.api.send("substitutions:deleted", id);
  });
};

export const clearSubstitutions = async (sdk: SDK<never, BackendEvents>) => {
  const store = SubstitutionStore.get();
  store.clear();

  await withProject(sdk, async (projectId) => {
    await clearAllSubstitutions(sdk, projectId);
    sdk.api.send("substitutions:cleared");
  });
};
