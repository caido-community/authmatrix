import { useSDK } from "@/plugins/sdk";
import type { Context } from "./types";
import {computed} from "vue";
import {TemplateVariant} from "@/types";
import {Template, User} from "shared";

export const useTemplates = (context: Context) => {
	const sdk = useSDK();
	const toggleTemplateRole = async (templateId: string, roleId: string) => {
		const newTemplate = await sdk.backend.toggleTemplateRole(templateId, roleId);

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
		const newTemplate = await sdk.backend.toggleTemplateUser(templateId, userId);

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

      const newSelection = context.state.selection?.templateId === id ? undefined : context.state.selection;

			context.state = {
        ...context.state,
				templates: newTemplates,
        selection: newSelection,
			};
		}
	};

  const setSelection = (newTemplate: Template | undefined) => {
    if (context.state.type === "Success") {

      if (!newTemplate) {
        context.state = {
          ...context.state,
          selection: undefined,
        };
      } else {
        context.state = {
          ...context.state,
          selection: {
            templateId: newTemplate.id,
            userId: undefined,
          },
        };
      }
    }
  }

  const setSelectionUser = (userId: string | undefined) => {
    const state = context.state;
    if (state.type === "Success" && state.selection) {
      if (!userId) {
        context.state = {
          ...state,
          selection: {
            templateId: state.selection.templateId,
            userId: undefined,
          },
        };
        return;
      }

      const selection = state.selection;
      const hasResult = state.results.some((result) => {
        return result.userId === userId && result.templateId === selection.templateId ;
      });

      if (hasResult) {
        context.state = {
          ...state,
          selection: {
            templateId: selection.templateId,
            userId,
          },
        };
      }
    }
  }

	return {
		addTemplate,
		deleteTemplate,
		toggleTemplateRole,
		toggleTemplateUser,
    setSelection,
    setSelectionUser,
	};
};
