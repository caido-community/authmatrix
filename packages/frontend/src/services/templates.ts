import { useSDK } from "@/plugins/sdk";
import { useTemplateRepository } from "@/repositories/template";
import { useAnalysisStore } from "@/stores/analysis";
import { useTemplateStore } from "@/stores/templates";
import { defineStore } from "pinia";
import type { Template } from "shared";

export const useTemplateService = defineStore("services.templates", () => {
  const sdk = useSDK();
  const repository = useTemplateRepository();
  const store = useTemplateStore();

  const toggleTemplateRole = async (templateId: string, roleId: string) => {
    const result = await repository.toggleTemplateRole(templateId, roleId);

    if (result.type === "Ok") {
      store.send({ type: "UpdateTemplate", template: result.template });
    } else {
      sdk.window.showToast(result.error, {
        variant: "error",
      });
    }
  };

  const toggleTemplateUser = async (templateId: string, userId: string) => {
    const result = await repository.toggleTemplateUser(templateId, userId);

    if (result.type === "Ok") {
      store.send({ type: "UpdateTemplate", template: result.template });
    } else {
      sdk.window.showToast(result.error, {
        variant: "error",
      });
    }
  };

  const addTemplate = async () => {
    const result = await repository.addTemplate();

    if (result.type === "Ok") {
      store.send({ type: "AddTemplate", template: result.template });
    } else {
      sdk.window.showToast(result.error, {
        variant: "error",
      });
    }
  };

  const updateTemplate = async (id: string, fields: Omit<Template, "id">) => {
    const result = await repository.updateTemplate(id, fields);

    if (result.type === "Ok") {
      store.send({ type: "UpdateTemplate", template: result.template });
    } else {
      sdk.window.showToast(result.error, {
        variant: "error",
      });
    }
  };

  const analysisStore = useAnalysisStore();
  const deleteTemplate = async (id: string) => {
    const result = await repository.deleteTemplate(id);

    if (result.type === "Ok") {
      store.send({ type: "DeleteTemplate", id });
      const analysisState = analysisStore.selectionState.getState();

      if (analysisState.type !== "None" && analysisState.templateId === id) {
        analysisStore.selectionState.send({ type: "Reset" });
      }
    } else {
      sdk.window.showToast(result.error, {
        variant: "error",
      });
    }
  };

  const initialize = async () => {
    store.send({ type: "Start" });

    const result = await repository.getTemplates();

    if (result.type === "Ok") {
      store.send({ type: "Success", templates: result.templates });
    } else {
      store.send({ type: "Error", error: result.error });
    }

    sdk.backend.onEvent("templates:created", (template) => {
      store.send({ type: "AddTemplate", template });
    });

    sdk.backend.onEvent("templates:updated", (template) => {
      store.send({ type: "UpdateTemplate", template });
    });
  };

  const getState = () => store.getState();

  return {
    getState,
    initialize,
    toggleTemplateRole,
    toggleTemplateUser,
    addTemplate,
    updateTemplate,
    deleteTemplate,
  };
});
