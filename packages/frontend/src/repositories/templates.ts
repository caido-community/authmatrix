import type { RequestSpec } from "caido:utils";
import type { TemplateDTO } from "shared";

import { useSDK } from "@/plugins/sdk";

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
        error: "TemplateDTO or user not found",
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
      if (newTemplate) {
        return {
          type: "Ok" as const,
          template: newTemplate,
        };
      }

      return {
        type: "Err" as const,
        error: "Failed to add template",
      };
    } catch {
      return {
        type: "Err" as const,
        error: "Failed to add template",
      };
    }
  };

  const importFromSwagger = async (json: string) => {
    try {
      const created = await sdk.backend.importTemplatesFromOpenApi(json);
      return {
        type: "Ok" as const,
        created,
      };
    } catch {
      return {
        type: "Err" as const,
        error: "Failed to import Swagger/OpenAPI spec",
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

  const updateTemplate = async (
    id: string,
    fields: Omit<TemplateDTO, "id">,
  ) => {
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
        error: "TemplateDTO not found",
      };
    } catch {
      return {
        type: "Err" as const,
        error: "Failed to update template",
      };
    }
  };

  const clearTemplates = async () => {
    try {
      await sdk.backend.clearTemplates();
      return {
        type: "Ok" as const,
      };
    } catch {
      return {
        type: "Err" as const,
        error: "Failed to clear templates",
      };
    }
  };

  const updateTemplateRequest = async (
    templateId: string,
    requestSpec: RequestSpec,
  ) => {
    try {
      const updatedTemplate = await sdk.backend.updateTemplateRequest(
        templateId,
        requestSpec,
      );
      return {
        type: "Ok" as const,
        template: updatedTemplate,
      };
    } catch {
      return {
        type: "Err" as const,
        error: "Failed to update template request",
      };
    }
  };

  const updateTemplateRequestRaw = async (
    templateId: string,
    requestRaw: string,
  ) => {
    try {
      const updatedTemplate = await sdk.backend.updateTemplateRequestRaw(
        templateId,
        requestRaw,
      );
      
      if (updatedTemplate) {
        return {
          type: "Ok" as const,
          template: updatedTemplate,
        };
      }
      
      return {
        type: "Err" as const,
        error: "Failed to update template request - invalid request format",
      };
    } catch (error) {
      return {
        type: "Err" as const,
        error: `Failed to update template request: ${error.message || "Unknown error"}`,
      };
    }
  };

  const getRequestResponse = async (requestId: string) => {
    try {
      const result = await sdk.backend.getRequestResponse(requestId);
      if (result.type === "Ok") {
        return {
          type: "Ok" as const,
          request: result.request,
          response: result.response,
        };
      }

      return {
        type: "Err" as const,
        error: result.message,
      };
    } catch {
      return {
        type: "Err" as const,
        error: "Failed to get request & response",
      };
    }
  };

  return {
    getTemplates,
    toggleTemplateRole,
    toggleTemplateUser,
    addTemplate,
    updateTemplate,
    updateTemplateRequest,
    updateTemplateRequestRaw,
    getRequestResponse,
    deleteTemplate,
    clearTemplates,
    importFromSwagger,
  };
};
