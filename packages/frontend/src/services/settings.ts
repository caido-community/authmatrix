import {useSDK} from "@/plugins/sdk";
import {useSettingsRepository} from "@/repositories/settings";
import {useSettingsStore} from "@/stores/settings";

export const useSettingsService = () => {
  const sdk = useSDK();
  const repository = useSettingsRepository();
  const store = useSettingsStore();

  const getState = () => store.getState();

  const initialize = async () => {
    store.send({type: "Start"});

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

  const toggleAutoCaptureRequests = async () => {
    const currState = store.getState();
    if (currState.type === "Success") {
      const result = await repository.updateSettings({
        ...currState.settings,
        autoCaptureRequests: !currState.settings.autoCaptureRequests,
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
    toggleAutoCaptureRequests,
  };
};
