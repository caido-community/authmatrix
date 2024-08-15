import {defineStore} from "pinia";
import {reactive} from "vue";
import {useInitialize} from "./useInitialize";
import {useUsers} from "./useUsers";
import {Context} from "./types";

export const useUserStore = defineStore("stores.users", () => {
  const context: Context = reactive({
    state: { type: "Idle" },
    selection: null
  });

  return {
    ...useInitialize(context),
    ...useUsers(context)
  };
});
