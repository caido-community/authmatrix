import { useSDK } from "@/plugins/sdk";
import { useSettingsRepository } from "@/repositories/settings";
import { useSettingsStore } from "@/stores/settings";
import { defineStore } from "pinia";

export const useSettingsService = defineStore("services.settings", () => {
  const sdk = useSDK();
  const repository = useSettingsRepository();
  const store = useSettingsStore();

  const getState = () => store.getState();

  const initialize = async () => {
    store.send({ type: "Start" });

    const result = await repository.getSettings();

    if (result.type === "Ok") {
      store.send({ type: "Success", settings: result.settings });
    } else {
      store.send({ type: "Error", error: result.error });
    }
  };

  const toggleAutoRunAnalysis = async () => {
    const currState = store.getState();
    if (currState.type === "Success") {
      const result = await repository.updateSettings({
        ...currState.settings,
        autoRunAnalysis: !currState.settings.autoRunAnalysis,
      });

      if (result.type === "Ok") {
        store.send({ type: "UpdateSettings", settings: result.settings });
      } else {
        sdk.window.showToast(result.error, {
          variant: "error",
        });
      }
    }
  };

  const setAutoCaptureRequests = async (value: "off" | "all" | "inScope") => {
    const currState = store.getState();
    if (currState.type === "Success") {
      const result = await repository.updateSettings({
        ...currState.settings,
        autoCaptureRequests: value,
      });

      if (result.type === "Ok") {
        store.send({ type: "UpdateSettings", settings: result.settings });
      } else {
        sdk.window.showToast(result.error, {
          variant: "error",
        });
      }
    }
  };

  return {
    getState,
    initialize,
    toggleAutoRunAnalysis,
    setAutoCaptureRequests,
  };
});
