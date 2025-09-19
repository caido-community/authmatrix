import type { SubstitutionDTO } from "shared";

import { useSDK } from "@/plugins/sdk";

export const useSubstitutionRepository = () => {
  const sdk = useSDK();

  const getSubstitutions = async () => {
    try {
      const substitutions = await sdk.backend.getSubstitutions();
      return {
        type: "Ok" as const,
        substitutions,
      };
    } catch {
      return {
        type: "Err" as const,
        error: "Failed to get substitutions",
      };
    }
  };

  const addSubstitution = async (pattern: string, replacement: string) => {
    try {
      const newSubstitution = await sdk.backend.addSubstitution(
        pattern,
        replacement,
      );
      if (newSubstitution) {
        return {
          type: "Ok" as const,
          substitution: newSubstitution,
        };
      }

      return {
        type: "Err" as const,
        error: "Failed to add substitution",
      };
    } catch {
      return {
        type: "Err" as const,
        error: "Failed to add substitution",
      };
    }
  };

  const updateSubstitution = async (
    id: string,
    fields: Omit<SubstitutionDTO, "id">,
  ) => {
    try {
      const newSubstitution = await sdk.backend.updateSubstitutionFields(
        id,
        fields,
      );
      if (newSubstitution) {
        return {
          type: "Ok" as const,
          substitution: newSubstitution,
        };
      }

      return {
        type: "Err" as const,
        error: "Substitution not found",
      };
    } catch {
      return {
        type: "Err" as const,
        error: "Failed to update substitution",
      };
    }
  };

  const deleteSubstitution = async (id: string) => {
    try {
      await sdk.backend.deleteSubstitution(id);
      return {
        type: "Ok" as const,
      };
    } catch {
      return {
        type: "Err" as const,
        error: "Failed to delete substitution",
      };
    }
  };

  const clearSubstitutions = async () => {
    try {
      await sdk.backend.clearSubstitutions();
      return {
        type: "Ok" as const,
      };
    } catch {
      return {
        type: "Err" as const,
        error: "Failed to clear substitutions",
      };
    }
  };

  return {
    getSubstitutions,
    addSubstitution,
    updateSubstitution,
    deleteSubstitution,
    clearSubstitutions,
  };
};
