import { useSDK } from "@/plugins/sdk";
import type { Context } from "./types";

export const useRequests = (context: Context) => {
	const sdk = useSDK();
	const toggleRequestRole = async (requestId: string, roleId: string) => {
		const newRequest = await sdk.backend.toggleRequestRole(requestId, roleId);

		if (newRequest) {
			if (context.state.type === "Success") {
				const newRequests = context.state.requests.map((request) =>
					request.id === newRequest.id ? newRequest : request,
				);
				context.state = {
          ...context.state,
					requests: newRequests,
				};
			}
		} else {
			sdk.window.showToast("Failed to update request", {
				variant: "error",
			});
		}
	};

	const toggleRequestUser = async (requestId: string, userId: string) => {
		const newRequest = await sdk.backend.toggleRequestUser(requestId, userId);

		if (newRequest) {
			if (context.state.type === "Success") {
				const newRequests = context.state.requests.map((request) =>
					request.id === newRequest.id ? newRequest : request,
				);
				context.state = {
          ...context.state,
					requests: newRequests,
				};
			}
		} else {
			sdk.window.showToast("Failed to update request", {
				variant: "error",
			});
		}
	};

	const addRequest = async () => {
		const newRequest = await sdk.backend.addRequest();

		if (context.state.type === "Success") {
			context.state = {
        ...context.state,
				requests: [...context.state.requests, newRequest],
			};
		}
	};

	const deleteRequest = async (id: string) => {
		await sdk.backend.deleteRequest(id);

		if (context.state.type === "Success") {
			const newRequests = context.state.requests.filter(
				(request) => request.id !== id,
			);
			context.state = {
        ...context.state,
				requests: newRequests,
			};
		}
	};

	return {
		addRequest,
		deleteRequest,
		toggleRequestRole,
		toggleRequestUser,
	};
};
