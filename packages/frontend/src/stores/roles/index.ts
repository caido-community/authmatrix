import {defineStore} from "pinia";
import {reactive} from "vue";
import {useInitialize} from "./useInitialize";
import {useRoles} from "./useRoles";
import {Context} from "./types";

export const useRoleStore = defineStore("stores.roles", () => {
  const context: Context = reactive({
    state: { type: "Idle" }
  });

  return {
    ...useInitialize(context),
    ...useRoles(context)
  };
});
