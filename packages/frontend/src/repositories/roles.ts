import { useSDK } from "@/plugins/sdk";
import type { Role } from "shared";

export const useRoleRepository = () => {
  const sdk = useSDK();
  const getRoles = async () => {
    try {
      const roles = await sdk.backend.getRoles();
      return {
        type: "Ok" as const,
        roles,
      };
    } catch {
      return {
        type: "Err" as const,
        error: "Failed to get roles",
      };
    }
  };

  const addRole = async (name: string) => {
    try {
      const newRole = await sdk.backend.addRole(name);
      return {
        type: "Ok" as const,
        role: newRole,
      };
    } catch {
      return {
        type: "Err" as const,
        error: "Failed to add role",
      };
    }
  };

  const updateRole = async (id: string, fields: Omit<Role, "id">) => {
    try {
      const newRole = await sdk.backend.updateRole(id, fields);

      if (newRole) {
        return {
          type: "Ok" as const,
          role: newRole,
        };
      }

      return {
        type: "Err" as const,
        error: "Role not found",
      };
    } catch {
      return {
        type: "Err" as const,
        error: "Failed to update role",
      };
    }
  };

  const deleteRole = async (id: string) => {
    try {
      await sdk.backend.deleteRole(id);
      return {
        type: "Ok" as const,
      };
    } catch {
      return {
        type: "Err" as const,
        error: "Failed to delete role",
      };
    }
  };

  return {
    getRoles,
    addRole,
    updateRole,
    deleteRole,
  };
};
