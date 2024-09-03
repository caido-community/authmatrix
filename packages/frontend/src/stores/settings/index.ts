import { defineStore } from "pinia";
import { reactive } from "vue";
import type { Context } from "./types";
import { useInitialize } from "./useInitialize";
import { useSettings } from "./useSettings";

export const useSettingsStore = defineStore("stores.settings", () => {
  const context: Context = reactive({
    state: { type: "Idle" },
  });

  return {
    ...useInitialize(context),
    ...useSettings(context),
  };
});
