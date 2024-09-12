import type { SettingsDTO } from "shared";

export class SettingsStore {
  private static _store?: SettingsStore;

  private settings: SettingsDTO;

  private constructor() {
    this.settings = {
      autoCaptureRequests: true,
      autoRunAnalysis: false,
    };
  }

  static get(): SettingsStore {
    if (!SettingsStore._store) {
      SettingsStore._store = new SettingsStore();
    }

    return SettingsStore._store;
  }

  getSettings() {
    return { ...this.settings };
  }

  updateSettings(newSettings: SettingsDTO) {
    this.settings = { ...newSettings };
    return this.settings;
  }
}
