import type { SDK } from "caido:plugin";
import type { SettingsDTO } from "shared";

import { SettingsStore } from "../stores/settings";

export const getSettings = () => {
  const store = SettingsStore.get();
  return store.getSettings();
};

export const updateSettings = (_sdk: SDK, newSettings: SettingsDTO) => {
  const store = SettingsStore.get();
  return store.updateSettings(newSettings);
};
