import { useSDK } from "@/plugins/sdk";
import type { Template } from "shared";

export const useTemplateRepository = () => {
  const sdk = useSDK();

  const getTemplates = async () => {
    try {
      const templates = await sdk.backend.getTemplates();
      return {
        type: "Ok" as const,
        templates,
      };
    } catch {
      return {
        type: "Err" as const,
        error: "Failed to get templates",
      };
    }
  };

  const toggleTemplateRole = async (templateId: string, roleId: string) => {
    try {
      const newTemplate = await sdk.backend.toggleTemplateRole(
        templateId,
        roleId,
      );

      if (newTemplate) {
        return {
          type: "Ok" as const,
          template: newTemplate,
        };
      }

      return {
        type: "Err" as const,
        error: "Template or role not found",
      };
    } catch {
      return {
        type: "Err" as const,
        error: "Failed to update template",
      };
    }
  };

  const toggleTemplateUser = async (templateId: string, userId: string) => {
    try {
      const newTemplate = await sdk.backend.toggleTemplateUser(
        templateId,
        userId,
      );

      if (newTemplate) {
        return {
          type: "Ok" as const,
          template: newTemplate,
        };
      }

      return {
        type: "Err" as const,
        error: "Template or user not found",
      };
    } catch {
      return {
        type: "Err" as const,
        error: "Failed to update template",
      };
    }
  };

  const addTemplate = async () => {
    try {
      const newTemplate = await sdk.backend.addTemplate();
      return {
        type: "Ok" as const,
        template: newTemplate,
      };
    } catch {
      return {
        type: "Err" as const,
        error: "Failed to add template",
      };
    }
  };

  const deleteTemplate = async (id: string) => {
    try {
      await sdk.backend.deleteTemplate(id);
      return {
        type: "Ok" as const,
      };
    } catch {
      return {
        type: "Err" as const,
        error: "Failed to delete template",
      };
    }
  };

  const updateTemplate = async (id: string, fields: Omit<Template, "id">) => {
    try {
      const newTemplate = await sdk.backend.updateTemplate(id, fields);
      if (newTemplate) {
        return {
          type: "Ok" as const,
          template: newTemplate,
        };
      }

      return {
        type: "Err" as const,
        error: "Template not found",
      };
    } catch {
      return {
        type: "Err" as const,
        error: "Failed to update template",
      };
    }
  };

  return {
    getTemplates,
    toggleTemplateRole,
    toggleTemplateUser,
    addTemplate,
    updateTemplate,
    deleteTemplate,
  };
};
