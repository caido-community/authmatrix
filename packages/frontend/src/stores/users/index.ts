import { defineStore } from "pinia";
import { reactive } from "vue";
import type { Context } from "./types";
import { useInitialize } from "./useInitialize";
import { useUsers } from "./useUsers";

export const useUserStore = defineStore("stores.users", () => {
  const context: Context = reactive({
    state: { type: "Idle" },
    selection: null,
  });

  return {
    ...useInitialize(context),
    ...useUsers(context),
  };
});
