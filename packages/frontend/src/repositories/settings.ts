import type { SettingsDTO } from "shared";

import { useSDK } from "@/plugins/sdk";

export const useSettingsRepository = () => {
  const sdk = useSDK();
  const getSettings = async () => {
    try {
      const settings = await sdk.backend.getSettings();
      return {
        type: "Ok" as const,
        settings,
      };
    } catch {
      return {
        type: "Err" as const,
        error: "Failed to get settings",
      };
    }
  };

  const updateSettings = async (newSettings: SettingsDTO) => {
    try {
      const settings = await sdk.backend.updateSettings(newSettings);
      return {
        type: "Ok" as const,
        settings,
      };
    } catch {
      return {
        type: "Err" as const,
        error: "Failed to update settings",
      };
    }
  };

  return {
    getSettings,
    updateSettings,
  };
};
