import type { Settings } from "shared";

export class SettingsStore {
  private static _store?: SettingsStore;

  private settings: Settings;

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

  updateSettings(newSettings: Settings) {
    this.settings = { ...newSettings };
    return this.settings;
  }
}
