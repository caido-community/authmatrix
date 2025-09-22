import { defineStore } from "pinia";
import type { SubstitutionDTO } from "shared";

import { useSDK } from "@/plugins/sdk";
import { useSubstitutionRepository } from "@/repositories/substitutions";
import { useSubstitutionStore } from "@/stores/substitutions";

export const useSubstitutionService = defineStore(
  "services.substitutions",
  () => {
    const sdk = useSDK();
    const repository = useSubstitutionRepository();
    const store = useSubstitutionStore();

    const addSubstitution = async (pattern: string, replacement: string) => {
      const result = await repository.addSubstitution(pattern, replacement);

      if (result.type === "Ok") {
        store.send({
          type: "AddSubstitution",
          substitution: result.substitution,
        });
      } else {
        sdk.window.showToast(result.error, {
          variant: "error",
        });
      }
    };

    const updateSubstitution = async (
      id: string,
      fields: Omit<SubstitutionDTO, "id">,
    ) => {
      const result = await repository.updateSubstitution(id, fields);

      if (result.type === "Ok") {
        store.send({
          type: "UpdateSubstitution",
          substitution: result.substitution,
        });
      } else {
        sdk.window.showToast(result.error, {
          variant: "error",
        });
      }
    };

    const deleteSubstitution = async (id: string) => {
      const result = await repository.deleteSubstitution(id);

      if (result.type === "Ok") {
        store.send({ type: "DeleteSubstitution", id });
      } else {
        sdk.window.showToast(result.error, {
          variant: "error",
        });
      }
    };

    const clearSubstitutions = async () => {
      const result = await repository.clearSubstitutions();

      if (result.type === "Ok") {
        store.send({ type: "ClearSubstitutions" });
      } else {
        sdk.window.showToast(result.error, {
          variant: "error",
        });
      }
    };

    const initialize = async () => {
      store.send({ type: "Start" });

      const result = await repository.getSubstitutions();

      if (result.type === "Ok") {
        store.send({ type: "Success", substitutions: result.substitutions });
      } else {
        store.send({ type: "Error", error: result.error });
      }

      sdk.backend.onEvent("substitutions:created", (substitution) => {
        store.send({ type: "AddSubstitution", substitution });
      });

      sdk.backend.onEvent("substitutions:updated", (substitution) => {
        store.send({ type: "UpdateSubstitution", substitution });
      });

      sdk.backend.onEvent("substitutions:deleted", (id) => {
        store.send({ type: "DeleteSubstitution", id });
      });

      sdk.backend.onEvent("substitutions:cleared", () => {
        store.send({ type: "ClearSubstitutions" });
      });

      sdk.backend.onEvent("config:imported", async () => {
        // Reinitialize when configuration is imported
        await initialize();
      });
    };

    const getState = () => store.getState();

    return {
      getState,
      initialize,
      addSubstitution,
      updateSubstitution,
      deleteSubstitution,
      clearSubstitutions,
    };
  },
);
