import { useSDK } from "@/plugins/sdk";
import type { Template } from "shared";
import type { Context } from "./types";

export const useTemplates = (context: Context) => {
  const sdk = useSDK();
  const toggleTemplateRole = async (templateId: string, roleId: string) => {
    const newTemplate = await sdk.backend.toggleTemplateRole(
      templateId,
      roleId,
    );

    if (newTemplate) {
      if (context.state.type === "Success") {
        const newTemplates = context.state.templates.map((template) =>
          template.id === newTemplate.id ? newTemplate : template,
        );
        context.state = {
          ...context.state,
          templates: newTemplates,
        };
      }
    } else {
      sdk.window.showToast("Failed to update template", {
        variant: "error",
      });
    }
  };

  const toggleTemplateUser = async (templateId: string, userId: string) => {
    const newTemplate = await sdk.backend.toggleTemplateUser(
      templateId,
      userId,
    );

    if (newTemplate) {
      if (context.state.type === "Success") {
        const newTemplates = context.state.templates.map((template) =>
          template.id === newTemplate.id ? newTemplate : template,
        );
        context.state = {
          ...context.state,
          templates: newTemplates,
        };
      }
    } else {
      sdk.window.showToast("Failed to update template", {
        variant: "error",
      });
    }
  };

  const addTemplate = async () => {
    const newTemplate = await sdk.backend.addTemplate();

    if (context.state.type === "Success") {
      context.state = {
        ...context.state,
        templates: [...context.state.templates, newTemplate],
      };
    }
  };

  const deleteTemplate = async (id: string) => {
    await sdk.backend.deleteTemplate(id);

    if (context.state.type === "Success") {
      const newTemplates = context.state.templates.filter(
        (template) => template.id !== id,
      );

      context.state = {
        ...context.state,
        templates: newTemplates,
      };

      if (context.state.selectionState.type !== "None") {
        if (context.state.selectionState.templateId === id) {
          context.state = {
            ...context.state,
            selectionState: {
              type: "None",
            },
          };
        }
      }
    }
  };

  const setSelection = async (newTemplate: Template | undefined) => {
    if (context.state.type === "Success") {
      if (!newTemplate) {
        context.state = {
          ...context.state,
          selectionState: {
            type: "None",
          },
        };
      } else {
        context.state = {
          ...context.state,
          selectionState: {
            type: "Loading",
            templateId: newTemplate.id,
            userId: undefined,
          },
        };

        try {
          const result = await sdk.backend.getRequestResponse(newTemplate.requestId);
          if (result.type === "Ok") {
            context.state = {
              ...context.state,
              selectionState: {
                type: "Success",
                templateId: newTemplate.id,
                userId: undefined,
                request: result.request,
                response: result.response,
              },
            };
          } else {
            context.state = {
              ...context.state,
              selectionState: {
                type: "Error",
                templateId: newTemplate.id,
                userId: undefined,
              },
            };
          }
        } catch {
          context.state = {
            ...context.state,
            selectionState: {
              type: "Error",
              templateId: newTemplate.id,
              userId: undefined,
            },
          };
          return;
        }
      }
    }
  };

  const setSelectionUser = async (userId: string | undefined) => {
    const state = context.state;
    if (state.type === "Success" && state.selectionState.type !== "None") {
      const templateId = state.selectionState.templateId;

      const result = state.results.find((result) => {
        return result.userId === userId && result.templateId === templateId;
      });

      if (userId && result) {
        context.state = {
          ...state,
          selectionState: {
            type: "Loading",
            templateId,
            userId,
          },
        };

        try {
          const getResult = await sdk.backend.getRequestResponse(result.requestId);

          if (getResult.type === "Ok") {
            context.state = {
              ...state,
              selectionState: {
                type: "Success",
                templateId,
                userId,
                request: getResult.request,
                response: getResult.response,
              },
            };
          } else {
            context.state = {
              ...state,
              selectionState: {
                type: "Error",
                templateId,
                userId,
              },
            };
          }
        } catch {
          context.state = {
            ...state,
            selectionState: {
              type: "Error",
              templateId,
              userId,
            },
          };
        }

        return;
      }

      const requestId = state.templates.find(
        (template) => template.id === templateId,
      )?.requestId;
      if (!userId && requestId) {
        context.state = {
          ...state,
          selectionState: {
            type: "Loading",
            templateId,
            userId,
          },
        };

        try {
          const getResult = await sdk.backend.getRequestResponse(requestId);

          if (getResult.type === "Ok") {
            context.state = {
              ...state,
              selectionState: {
                type: "Success",
                templateId,
                userId,
                request: getResult.request,
              },
            }
          } else {
            context.state = {
              ...state,
              selectionState: {
                type: "Error",
                templateId,
                userId,
              },
            };
          }
        } catch {
          context.state = {
            ...state,
            selectionState: {
              type: "Error",
              templateId,
              userId,
            },
          };
        }
      }
    }
  };

  return {
    addTemplate,
    deleteTemplate,
    toggleTemplateRole,
    toggleTemplateUser,
    setSelection,
    setSelectionUser,
  };
};
