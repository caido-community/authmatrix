import {useSDK} from "@/plugins/sdk";
import {Context} from "./types";
import {Role} from "shared";

export const useRoles = (context: Context) => {

  const sdk = useSDK();
  const addRole = async (name: string) => {
    const result = await sdk.backend.addRole(name);

    if (context.state.type === "Success") {
      context.state = {
        type: "Success",
        roles: [...context.state.roles, result]
      }
    }
  }

  const updateRole = async (id: string, fields: Omit<Role, "id">) => {
    const newRole = await sdk.backend.updateRole(id, fields);

    if (newRole) {
      if (context.state.type === "Success") {
        const newRoles = context.state.roles.map(role => role.id === newRole.id ? newRole : role);
        context.state = {
          type: "Success",
          roles: newRoles
        }
      }
    } else {
      sdk.window.showToast("Failed to update role", {
        variant: "error"
      });
    }
  }

  const deleteRole = async (id: string) => {
    await sdk.backend.deleteRole(id);

    if (context.state.type === "Success") {
      const newRoles = context.state.roles.filter(role => role.id !== id);
      context.state = {
        type: "Success",
        roles: newRoles
      }
    }
  }

  return {
    addRole,
    updateRole,
    deleteRole
  }
}
