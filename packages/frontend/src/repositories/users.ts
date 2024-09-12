import { useSDK } from "@/plugins/sdk";
import type { UserDTO } from "shared";

export const useUserRepository = () => {
  const sdk = useSDK();
  const getUsers = async () => {
    try {
      const users = await sdk.backend.getUsers();
      return {
        type: "Ok" as const,
        users,
      };
    } catch {
      return {
        type: "Err" as const,
        error: "Failed to get users",
      };
    }
  };

  const addUser = async (name: string) => {
    try {
      const newUser = await sdk.backend.addUser(name);
      return {
        type: "Ok" as const,
        user: newUser,
      };
    } catch {
      return {
        type: "Err" as const,
        error: "Failed to add user",
      };
    }
  };

  const updateUser = async (id: string, fields: Omit<UserDTO, "id">) => {
    try {
      const newUser = await sdk.backend.updateUser(id, fields);

      if (newUser) {
        return {
          type: "Ok" as const,
          user: newUser,
        };
      }

      return {
        type: "Err" as const,
        error: "UserDTO not found",
      };
    } catch {
      return {
        type: "Err" as const,
        error: "Failed to update user",
      };
    }
  };

  const deleteUser = async (id: string) => {
    try {
      await sdk.backend.deleteUser(id);
      return {
        type: "Ok" as const,
      };
    } catch {
      return {
        type: "Err" as const,
        error: "Failed to delete user",
      };
    }
  };

  return {
    getUsers,
    addUser,
    updateUser,
    deleteUser,
  };
};
