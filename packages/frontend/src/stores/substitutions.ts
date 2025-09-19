import { defineStore } from "pinia";
import type { SubstitutionDTO } from "shared";
import { reactive } from "vue";

import type { SubstitutionState } from "@/types";

type Context = {
  state: SubstitutionState;
};

type Message =
  | { type: "Start" }
  | { type: "Error"; error: string }
  | { type: "Success"; substitutions: SubstitutionDTO[] }
  | { type: "AddSubstitution"; substitution: SubstitutionDTO }
  | { type: "UpdateSubstitution"; substitution: SubstitutionDTO }
  | { type: "DeleteSubstitution"; id: string }
  | { type: "ClearSubstitutions" };

export const useSubstitutionStore = defineStore("stores.substitutions", () => {
  const context: Context = reactive({
    state: { type: "Idle" },
  });

  const getState = () => context.state;

  const send = (message: Message) => {
    const currState = context.state;

    switch (currState.type) {
      case "Idle":
        context.state = processIdle(currState, message);
        break;
      case "Error":
        context.state = processError(currState, message);
        break;
      case "Success":
        context.state = processSuccess(currState, message);
        break;
      case "Loading":
        context.state = processLoading(currState, message);
        break;
    }
  };

  return { getState, send };
});

const processIdle = (
  state: SubstitutionState & { type: "Idle" },
  message: Message,
): SubstitutionState => {
  switch (message.type) {
    case "Start":
      return { type: "Loading" };
    case "Error":
    case "Success":
    case "AddSubstitution":
    case "UpdateSubstitution":
    case "DeleteSubstitution":
    case "ClearSubstitutions":
      return state;
  }
};

const processError = (
  state: SubstitutionState & { type: "Error" },
  message: Message,
): SubstitutionState => {
  switch (message.type) {
    case "Start":
      return { type: "Loading" };
    case "Error":
    case "Success":
    case "AddSubstitution":
    case "UpdateSubstitution":
    case "DeleteSubstitution":
    case "ClearSubstitutions":
      return state;
  }
};

const processSuccess = (
  state: SubstitutionState & { type: "Success" },
  message: Message,
): SubstitutionState => {
  switch (message.type) {
    case "Start":
      return { type: "Loading" };
    case "AddSubstitution":
      if (
        state.substitutions.some(
          (substitution) => substitution.id === message.substitution.id,
        )
      ) {
        return state;
      }

      return {
        ...state,
        substitutions: [...state.substitutions, message.substitution],
      };
    case "UpdateSubstitution":
      return {
        ...state,
        substitutions: state.substitutions.map((substitution) =>
          substitution.id === message.substitution.id
            ? message.substitution
            : substitution,
        ),
      };
    case "DeleteSubstitution":
      return {
        ...state,
        substitutions: state.substitutions.filter(
          (substitution) => substitution.id !== message.id,
        ),
      };
    case "ClearSubstitutions":
      return {
        ...state,
        substitutions: [],
      };
    case "Error":
    case "Success":
      return state;
  }
};

const processLoading = (
  state: SubstitutionState & { type: "Loading" },
  message: Message,
): SubstitutionState => {
  switch (message.type) {
    case "Error":
      return { type: "Error", error: message.error };
    case "Success":
      return {
        type: "Success",
        substitutions: message.substitutions,
      };
    case "Start":
    case "AddSubstitution":
    case "UpdateSubstitution":
    case "DeleteSubstitution":
    case "ClearSubstitutions":
      return state;
  }
};
