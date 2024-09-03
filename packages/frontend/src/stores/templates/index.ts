import { defineStore } from "pinia";
import { reactive } from "vue";
import type { Context } from "./types";
import { useAnalyze } from "./useAnalysis";
import { useInitialize } from "./useInitialize";
import { useTemplates } from "./useTemplates";

export const useTemplateStore = defineStore("stores.templates", () => {
  const context: Context = reactive({
    state: { type: "Idle" },
  });

  return {
    ...useInitialize(context),
    ...useTemplates(context),
    ...useAnalyze(context),
  };
});
