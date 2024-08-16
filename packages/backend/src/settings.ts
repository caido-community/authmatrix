import type { SDK } from "caido:plugin";
import type {Settings} from "shared";

const settings: Settings = {
  autoCaptureRequests: true,
  autoRunAnalysis: false,
};

export const getSettings = () => {
  return settings;
}

export const updateSettings = (_sdk: SDK, newSettings: Settings) => {
  Object.assign(settings, newSettings);
  return settings;
}
