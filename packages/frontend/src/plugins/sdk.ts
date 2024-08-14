import {Caido} from "@caido/sdk-frontend";
import {API} from "backend";
import {InjectionKey, Plugin, inject} from "vue";

type CaidoSDK = Caido<API>;

const KEY: InjectionKey<CaidoSDK> = Symbol("CaidoSDK");

export const SDKPlugin: Plugin = (app, sdk: CaidoSDK) => {
  app.provide(KEY, sdk);
}

export const useSDK = () => {
  return inject(KEY) as CaidoSDK;
}
