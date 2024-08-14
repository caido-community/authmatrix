import {useSDK} from "@/plugins/sdk";
import {Context} from "./types";
import {User} from "shared";

export const useUsers = (context: Context) => {

  const sdk = useSDK();
  const addUser = async (name: string) => {
    const result = await sdk.backend.addUser(name);

    if (context.state.type === "Success") {
      context.state = {
        type: "Success",
        users: [...context.state.users, result]
      }
    }
  }

  const updateUser = async (id: string, fields: Omit<User, "id">) => {
    const newUser = await sdk.backend.updateUser(id, fields);

    if (newUser) {
      if (context.state.type === "Success") {
        const newUsers = context.state.users.map(role => role.id === newUser.id ? newUser : role);
        context.state = {
          type: "Success",
          users: newUsers
        }
      }
    } else {
      sdk.window.showToast("Failed to update role", {
        variant: "error"
      });
    }
  }

  const deleteUser = async (id: string) => {
    await sdk.backend.deleteUser(id);

    if (context.state.type === "Success") {
      const newUsers = context.state.users.filter(role => role.id !== id);
      context.state = {
        type: "Success",
        users: newUsers
      }
    }
  }

  return {
    addUser,
    updateUser,
    deleteUser
  }
}
