import { defineStore } from "pinia";
import { reactive } from "vue";
import type { Context } from "./types";
import { useInitialize } from "./useInitialize";
import { useRoles } from "./useRoles";

export const useRoleStore = defineStore("stores.roles", () => {
	const context: Context = reactive({
		state: { type: "Idle" },
	});

	return {
		...useInitialize(context),
		...useRoles(context),
	};
});
