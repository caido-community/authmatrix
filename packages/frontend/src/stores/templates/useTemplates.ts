import { useSDK } from "@/plugins/sdk";
import type { Context } from "./types";
import {computed} from "vue";

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

	const requestSelection = computed({
		get: () => {
      if (context.state.type === "Success") {
        return context.state.selection;
      }
    },
		set: (newSelection) => {
      if (context.state.type === "Success") {
        context.state.selection = newSelection;
      }
		},
	});



	return {
		addTemplate,
		deleteTemplate,
		toggleTemplateRole,
		toggleTemplateUser,
    requestSelection,
	};
};
