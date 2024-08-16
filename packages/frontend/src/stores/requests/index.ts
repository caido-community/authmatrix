import { defineStore } from "pinia";
import { reactive } from "vue";
import type { Context } from "./types";
import { useInitialize } from "./useInitialize";
import { useRequests } from "./useRequests";

export const useRequestStore = defineStore("stores.requests", () => {
	const context: Context = reactive({
		state: { type: "Idle" },
	});

	return {
		...useInitialize(context),
		...useRequests(context),
	};
});
