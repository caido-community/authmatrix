import { defineStore } from "pinia";
import { reactive } from "vue";
import type { SettingsState } from "@/types";
import {useSDK} from "@/plugins/sdk";
import {useSettingsRepository} from "@/repositories/settings";

type Context = {
  state: SettingsState;
};

export const useSettingsStore = defineStore("stores.settings", () => {
  const sdk = useSDK();
  const repository = useSettingsRepository();

  const context: Context = reactive({
    state: { type: "Idle" },
  });

  const getState = () => context.state;

  const initialize = async () => {
    switch (context.state.type) {
      case "Idle":
      case "Error":
      case "Success": {
        context.state = { type: "Loading" };
        const result = await repository.getSettings();
        if (result.type === "Ok") {
          context.state = { type: "Success", settings: result.settings };
        } else {
          context.state = { type: "Error", error: result.error };
        }
        break;
      }
      case "Loading":
        break;
    }
  };

  const toggleAutoRunAnalysis = async () => {
    if (context.state.type === "Success") {
      const result = await repository.updateSettings({
        ...context.state.settings,
        autoRunAnalysis: !context.state.settings.autoRunAnalysis,
      });

      if (result.type === "Ok") {
        context.state = {
          ...context.state,
          settings: result.settings,
        }
      } else {
        sdk.window.showToast(result.error, {
          variant: "error",
        });
      }
    }
  };

  const toggleAutoCaptureRequests = async () => {
    if (context.state.type === "Success") {
      const result = await repository.updateSettings({
        ...context.state.settings,
        autoCaptureRequests: !context.state.settings.autoCaptureRequests,
      });

      if (result.type === "Ok") {
        context.state = {
          ...context.state,
          settings: result.settings,
        }
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
    toggleAutoCaptureRequests,
  };
});
