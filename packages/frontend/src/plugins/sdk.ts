import type { Caido } from "@caido/sdk-frontend";
import type { API } from "backend";
import { type InjectionKey, type Plugin, inject } from "vue";

type CaidoSDK = Caido<API>;

const KEY: InjectionKey<CaidoSDK> = Symbol("CaidoSDK");

export const SDKPlugin: Plugin = (app, sdk: CaidoSDK) => {
	app.provide(KEY, sdk);
};

export const useSDK = () => {
	return inject(KEY) as CaidoSDK;
};
