import { defineStore } from "pinia";
import { reactive } from "vue";

import type { TemplateState } from "@/types";
import {useSDK} from "@/plugins/sdk";
import {useTemplateRepository} from "@/repositories/template";
import {Template} from "shared";

type Context = {
  state: TemplateState;
};

export const useTemplateStore = defineStore("stores.templates", () => {
  const context: Context = reactive({
    state: { type: "Idle" },
  });

  const sdk = useSDK();
  const repository = useTemplateRepository();

  const toggleTemplateRole = async (templateId: string, roleId: string) => {
    if (context.state.type === "Success") {
      const result = await repository.toggleTemplateRole(templateId, roleId);

      if (result.type === "Ok") {
        const newTemplate = result.template;
        const newTemplates = context.state.templates.map((template) => {
          return template.id === newTemplate.id ? newTemplate : template;
        });

        context.state = {
          ...context.state,
          templates: newTemplates,
        };
      } else {
        sdk.window.showToast(result.error, {
          variant: "error",
        });
      }
    }
  };

  const toggleTemplateUser = async (templateId: string, userId: string) => {
    if (context.state.type === "Success") {
      const result = await repository.toggleTemplateUser(templateId, userId);

      if (result.type === "Ok") {
        const newTemplate = result.template;
        const newTemplates = context.state.templates.map((template) =>
          template.id === newTemplate.id ? newTemplate : template,
        );

        context.state = {
          ...context.state,
          templates: newTemplates,
        };
      } else {
        sdk.window.showToast(result.error, {
          variant: "error",
        });
      }
    }
  };

  const addTemplate = async () => {
    if (context.state.type === "Success") {
      const result = await repository.addTemplate();

      if (result.type === "Ok") {
        context.state = {
          ...context.state,
          templates: [...context.state.templates, result.template],
        };
      } else {
        sdk.window.showToast(result.error, {
          variant: "error",
        });
      }
    }
  };

  const deleteTemplate = async (id: string) => {

    if (context.state.type === "Success") {
      const result = await repository.deleteTemplate(id);

      if (result.type === "Ok") {
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
      } else {
        sdk.window.showToast(result.error, {
          variant: "error",
        });
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
  }

  const initialize = async () => {
    switch (context.state.type) {
      case "Idle":
      case "Error":
      case "Success": {
        context.state = { type: "Loading" };
        const [templates, results] = await Promise.all([
          sdk.backend.getTemplates(),
          sdk.backend.getResults(),
        ]);

        context.state = {
          type: "Success",
          templates,
          results,
          selectionState: {
            type: "None",
          },
          analysisState: { type: "Idle" },
        };

        const firstTemplate = templates[0];
        if (firstTemplate) {
          context.state = {
            ...context.state,
            selectionState: {
              type: "Loading",
              templateId: firstTemplate.id,
              userId: undefined,
            },
          };

          try {
            const result = await sdk.backend.getRequestResponse(
              firstTemplate.requestId,
            );

            if (result.type === "Ok") {
              context.state = {
                ...context.state,
                selectionState: {
                  type: "Success",
                  templateId: firstTemplate.id,
                  userId: undefined,
                  request: result.request,
                  response: result.response,
                }
              }
            } else {
              context.state = {
                ...context.state,
                selectionState: {
                  type: "Error",
                  templateId: firstTemplate.id,
                  userId: undefined,
                }
              }
            };
          } catch {
            context.state = {
              ...context.state,
              selectionState: {
                type: "Error",
                templateId: firstTemplate.id,
                userId: undefined,
              },
            };
          }
        }

        break;
      }
      case "Loading":
        break;
    }

    sdk.backend.onEvent("templates:created", (request) => {
      if (context.state.type === "Success") {
        if (context.state.templates.some((r) => r.id === request.id)) {
          return;
        }

        context.state = {
          ...context.state,
          templates: [...context.state.templates, request],
        };
      }
    });
  };

  const getState = () => context.state;

  const runAnalysis = async () => {
    if (context.state.type === "Success") {
      context.state = {
        ...context.state,
        analysisState: { type: "Analyzing" },
      };
      await sdk.backend.runAnalysis();

      context.state = {
        ...context.state,
        analysisState: { type: "Idle" },
      };
    }
  };

  return {
    getState,
    initialize,
    toggleTemplateRole,
    toggleTemplateUser,
    addTemplate,
    deleteTemplate,
    setSelection,
    setSelectionUser,
    runAnalysis
  };
});
