import { defineStore } from "pinia";
import { reactive } from "vue";
import type { RoleState } from "@/types";
import { useRoleRepository } from "@/repositories/roles";
import { Role } from "shared";
import { useSDK } from "@/plugins/sdk";

type Context = {
  state: RoleState;
};

export const useRoleStore = defineStore("stores.roles", () => {
  const sdk = useSDK();
  const repository = useRoleRepository();
  const context: Context = reactive({
    state: { type: "Idle" },
  });

  const getState = () => context.state;

  const initialize = async () => {
    switch (context.state.type) {
      case "Idle":
      case "Error":
      case "Success": {
        context.state = { type: "Loading" };
        const result = await repository.getRoles();

        if (result.type === "Ok") {
          context.state = { type: "Success", roles: result.roles };
        } else {
          context.state = { type: "Error", error: result.error };
        }
        break;
      }
      case "Loading":
        break;
    }
  };

  const addRole = async (name: string) => {
    if (context.state.type === "Success") {
      const result = await repository.addRole(name);
      if (result.type === "Ok") {
        context.state = {
          ...context.state,
          roles: [...context.state.roles, result.role],
        };
      } else {
        sdk.window.showToast(result.error, {
          variant: "error",
        });
      }
    }
  };

  const updateRole = async (id: string, fields: Omit<Role, "id">) => {
    if (context.state.type === "Success") {
      const result = await repository.updateRole(id, fields);

      if (result.type === "Ok") {
        const newRole = result.role;
        const newRoles = context.state.roles.map((role) => {
          return role.id === newRole.id ? newRole : role
        });

        context.state = {
          ...context.state,
          roles: newRoles,
        };
      } else {
        sdk.window.showToast(result.error, {
          variant: "error",
        });
      }
    }
  };

  const deleteRole = async (id: string) => {

    if (context.state.type === "Success") {
      const result = await repository.deleteRole(id);
      if (result.type === "Ok") {
        const newRoles = context.state.roles.filter((role) => role.id !== id);

        context.state = {
          ...context.state,
          roles: newRoles,
        };
      } else {
        sdk.window.showToast(result.error, {
          variant: "error",
        });
      }
    }
  };



  return {
    getState,
    initialize,
    addRole,
    updateRole,
    deleteRole,
  };
});
