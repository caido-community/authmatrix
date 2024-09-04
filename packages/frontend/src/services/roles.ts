import { useSDK } from "@/plugins/sdk";
import { useRoleRepository } from "@/repositories/roles";
import { useRoleStore } from "@/stores/roles";
import { defineStore } from "pinia";
import type { Role } from "shared";

export const useRoleService = defineStore("services.roles", () => {
  const sdk = useSDK();
  const repository = useRoleRepository();
  const store = useRoleStore();

  const initialize = async () => {
    store.send({ type: "Start" });
    const result = await repository.getRoles();

    if (result.type === "Ok") {
      store.send({ type: "Success", roles: result.roles });
    } else {
      store.send({ type: "Error", error: result.error });
    }
  };

  const addRole = async (name: string) => {
    const result = await repository.addRole(name);
    if (result.type === "Ok") {
      store.send({ type: "AddRole", role: result.role });
    } else {
      sdk.window.showToast(result.error, {
        variant: "error",
      });
    }
  };

  const updateRole = async (id: string, fields: Omit<Role, "id">) => {
    const result = await repository.updateRole(id, fields);

    if (result.type === "Ok") {
      store.send({ type: "UpdateRole", role: result.role });
    } else {
      sdk.window.showToast(result.error, {
        variant: "error",
      });
    }
  };

  const deleteRole = async (id: string) => {
    const result = await repository.deleteRole(id);

    if (result.type === "Ok") {
      store.send({ type: "DeleteRole", id });
    } else {
      sdk.window.showToast(result.error, {
        variant: "error",
      });
    }
  };

  const getState = () => store.getState();

  return {
    initialize,
    getState,
    addRole,
    updateRole,
    deleteRole,
  };
});
