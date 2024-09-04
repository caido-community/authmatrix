import {useSDK} from "@/plugins/sdk";
import {useTemplateRepository} from "@/repositories/template";
import {useTemplateStore} from "@/stores/templates";

export const useTemplateService = () => {
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

  const deleteTemplate = async (id: string) => {
    const result = await repository.deleteTemplate(id);

    if (result.type === "Ok") {
      store.send({ type: "DeleteTemplate", id });
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
  };

  const getState = () => store.getState();

  return {
    getState,
    initialize,
    toggleTemplateRole,
    toggleTemplateUser,
    addTemplate,
    deleteTemplate,
  };
};
