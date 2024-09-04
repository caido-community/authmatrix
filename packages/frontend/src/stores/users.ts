import { defineStore } from "pinia";
import { computed, reactive } from "vue";

import type { UserState } from "@/types";
import type { User } from "shared";
import {useSDK} from "@/plugins/sdk";
import {useUserRepository} from "@/repositories/users";

export type Context = {
  state: UserState;
  selection: User | undefined;
};
export const useUserStore = defineStore("stores.users", () => {
  const sdk = useSDK();
  const repository = useUserRepository();

  const context: Context = reactive({
    state: { type: "Idle" },
    selection: undefined,
  });

  const initialize = async () => {
    switch (context.state.type) {
      case "Idle":
      case "Error":
      case "Success": {
        context.state = { type: "Loading" };
        const result = await repository.getUsers();

        if (result.type === "Ok") {
          context.state = { type: "Success", users: result.users };
        } else {
          context.state = { type: "Error", error: result.error };
        }
        break;
      }
      case "Loading":
        break;
    }
  };

  const getState = () => context.state;

  const addUser = async (name: string) => {
    if (context.state.type === "Success") {
      const result = await repository.addUser(name);
      if (result.type === "Ok") {
        context.state = {
          ...context.state,
          users: [...context.state.users, result.user],
        };

        context.selection = result.user;
      } else {
        sdk.window.showToast(result.error, {
          variant: "error",
        });
      }
    }
  };

  const updateUser = async (id: string, fields: Omit<User, "id">) => {

    if (context.state.type === "Success") {
      const result = await repository.updateUser(id, fields);

      if (result.type === "Ok") {
        const newUser = result.user;
        const newUsers = context.state.users.map((role) => {
          return role.id === newUser.id ? newUser : role
        });

        context.state = {
          ...context.state,
          users: newUsers,
        };

        if (context.selection?.id === id) {
          context.selection = newUser;
        }
      } else {
        sdk.window.showToast(result.error, {
          variant: "error",
        });
      }
    }
  };

  const deleteUser = async (id: string) => {
    if (context.state.type === "Success") {
      const result = await repository.deleteUser(id);
      if (result.type === "Ok") {
        const newUsers = context.state.users.filter((role) => role.id !== id);
        context.state = {
          type: "Success",
          users: newUsers,
        };

        if (context.selection?.id === id) {
          context.selection = undefined;
        }
      } else {
        sdk.window.showToast(result.error, {
          variant: "error",
        });
      }
    }
  };

  const userSelection = computed({
    get: () => context.selection,
    set: (newSelection) => {
      context.selection = newSelection;
    },
  });


  return {
    initialize,
    getState,
    addUser,
    updateUser,
    deleteUser,
    userSelection,
  };
});
