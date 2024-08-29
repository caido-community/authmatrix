import { defineStore } from "pinia";
import { reactive } from "vue";
import type { Context } from "./types";
import { useInitialize } from "./useInitialize";
import { useTemplates } from "./useTemplates";
import {useAnalyze} from "./useAnalyze";

export const useTemplateStore = defineStore("stores.templates", () => {
	const context: Context = reactive({
		state: { type: "Idle" },
    selection: undefined
	});

	return {
		...useInitialize(context),
		...useTemplates(context),
    ...useAnalyze(context),
	};
});
