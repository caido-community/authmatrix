import { defineStore } from "pinia";
import { reactive } from "vue";
import type { Context } from "./types";
import { useInitialize } from "./useInitialize";
import { useRequests } from "./useRequests";
import {useAnalyze} from "./useAnalyze";

export const useRequestStore = defineStore("stores.requests", () => {
	const context: Context = reactive({
		state: { type: "Idle" },
	});

	return {
		...useInitialize(context),
		...useRequests(context),
    ...useAnalyze(context),
	};
});
