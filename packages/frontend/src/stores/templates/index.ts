import { defineStore } from "pinia";
import { reactive } from "vue";
import type { Context } from "./types";
import { useInitialize } from "./useInitialize";
import { useTemplates } from "./useTemplates";
import {useAnalyze} from "./useAnalysis";

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
