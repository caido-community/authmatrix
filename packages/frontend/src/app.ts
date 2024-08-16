import PrimeVue from "primevue/config";
import Tooltip from "primevue/tooltip";
import { createApp } from "vue";

import { CaidoDark } from "@caido/primevue";
import App from "./views/App.vue";

import "@fortawesome/fontawesome-free/css/fontawesome.min.css";
import "@fortawesome/fontawesome-free/css/regular.min.css";
import "@fortawesome/fontawesome-free/css/solid.min.css";
import "./styles/style.css";

import { createPinia } from "pinia";
import { SDKPlugin } from "./plugins/sdk";
import type { CaidoSDK } from "./types/sdk";

export const defineApp = (sdk: CaidoSDK) => {
	const app = createApp(App);

	const pinia = createPinia();
	app.use(pinia);

	app.use(PrimeVue, {
		theme: {
			preset: CaidoDark,
			options: {
				prefix: "autorize",
				cssLayer: {
					name: "autorize",
				},
			},
		},
		pt: {
			menubar: {
				root: {
					style: {
						boxShadow: "var(--autorize-box-shadow-surface)",
					},
				},
			},
			splitterPanel: {
				root: {
					style: {
						overflow: "auto",
						boxShadow: "var(--autorize-box-shadow-surface)",
					},
				},
			},
			column: {
				headerCell: {
					style: {
						borderBottomWidth: "0.25rem",
					},
				},
			},
		},
	});

	app.use(SDKPlugin, sdk);

	app.directive("tooltip", Tooltip);
	return app;
};
