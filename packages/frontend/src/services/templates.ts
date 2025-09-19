import type { RequestSpec } from "caido:utils";
import { defineStore } from "pinia";
import type { TemplateDTO } from "shared";

import { useSDK } from "@/plugins/sdk";
import { useTemplateRepository } from "@/repositories/templates";
import { useAnalysisStore } from "@/stores/analysis";
import { useTemplateStore } from "@/stores/templates";

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

  const updateTemplate = async (
    id: string,
    fields: Omit<TemplateDTO, "id">,
  ) => {
    const result = await repository.updateTemplate(id, fields);

    if (result.type === "Ok") {
      store.send({ type: "UpdateTemplate", template: result.template });
    } else {
      sdk.window.showToast(result.error, {
        variant: "error",
      });
    }
  };

  const importFromSwagger = async (json: string, overrideHost?: string) => {
    const result = await repository.importFromSwagger(json, overrideHost);

    if (result.type === "Ok") {
      if (result.created > 0) {
        sdk.window.showToast(`Imported ${result.created} templates`, {
          variant: "success",
        });
      } else {
        sdk.window.showToast("No templates found in spec", {
          variant: "info",
        });
      }
    } else {
      sdk.window.showToast(result.error, {
        variant: "error",
      });
    }
  };

  const sendToReplay = async (templateId: string) => {
    const result = await repository.sendToReplay(templateId);

    if (result.kind === "Ok") {
      sdk.window.showToast("Template sent to Replay successfully. A new Replay session has been created.", {
        variant: "success",
      });
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

  const clearTemplates = async () => {
    const result = await repository.clearTemplates();

    if (result.type === "Ok") {
      store.send({ type: "ClearTemplates" });
      analysisStore.selectionState.send({ type: "Reset" });
    } else {
      sdk.window.showToast(result.error, {
        variant: "error",
      });
    }
  };

  const checkAllTemplatesForRole = async (roleId: string) => {
    const result = await repository.checkAllTemplatesForRole(roleId);

    if (result.type === "Ok") {
      sdk.window.showToast(`Checked ${result.count} templates for role`, {
        variant: "success",
      });
    } else {
      sdk.window.showToast(result.error, {
        variant: "error",
      });
    }
  };

  const checkAllTemplatesForUser = async (userId: string) => {
    const result = await repository.checkAllTemplatesForUser(userId);

    if (result.type === "Ok") {
      sdk.window.showToast(`Checked ${result.count} templates for user`, {
        variant: "success",
      });
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

    sdk.backend.onEvent("templates:cleared", () => {
      store.send({ type: "ClearTemplates" });
      analysisStore.selectionState.send({ type: "Reset" });
    });

    sdk.backend.onEvent("cursor:mark", (templateId, isScanning) => {
      store.send({ type: "MarkTemplate", templateId, isScanning });
    });

    sdk.backend.onEvent("cursor:clear", () => {
      store.send({ type: "ClearMarkings" });
    });
  };

  const updateTemplateRequest = async (
    templateId: string,
    requestSpec: RequestSpec,
  ) => {
    const result = await repository.updateTemplateRequest(
      templateId,
      requestSpec,
    );

    if (result.type === "Ok" && result.template) {
      store.send({ type: "UpdateTemplate", template: result.template });
      sdk.window.showToast("Template request updated successfully", {
        variant: "success",
      });
    } else {
      sdk.window.showToast(result.error, {
        variant: "error",
      });
    }
  };

  const updateTemplateRequestRaw = async (
    templateId: string,
    requestRaw: string,
  ) => {
    const result = await repository.updateTemplateRequestRaw(
      templateId,
      requestRaw,
    );

    if (result.type === "Ok" && result.template) {
      store.send({ type: "UpdateTemplate", template: result.template });
      sdk.window.showToast("Template request updated successfully", {
        variant: "success",
      });
    } else {
      sdk.window.showToast(result.error, {
        variant: "error",
      });
    }
  };

  const getRequestResponse = async (requestId: string) => {
    return await repository.getRequestResponse(requestId);
  };

  const getState = () => store.getState();

  return {
    getState,
    initialize,
    toggleTemplateRole,
    toggleTemplateUser,
    checkAllTemplatesForRole,
    checkAllTemplatesForUser,
    addTemplate,
    updateTemplate,
    updateTemplateRequest,
    updateTemplateRequestRaw,
    getRequestResponse,
    deleteTemplate,
    clearTemplates,
    importFromSwagger,
    sendToReplay,
  };
});
