<script setup lang="ts">
import Card from "primevue/card";
import SelectButton from "primevue/selectbutton";
import { computed } from "vue";

import { useAnalysisService } from "@/services/analysis";
import {
  type AnalysisResultState,
  type AnalysisSelectionState,
  type TemplateState,
  type UserState,
} from "@/types";

const props = defineProps<{
  templateState: TemplateState & { type: "Success" };
  userState: UserState & { type: "Success" };
  resultState: AnalysisResultState & { type: "Success" };
  selectionState: AnalysisSelectionState;
}>();

const options = computed(() => {
  const selection = props.selectionState;
  if (selection.type === "None") return ["Original"];

  const users = props.userState.users.map((user) => user.id);

  return ["Original", ...users];
});

const getLabel = (option: string) => {
  if (option === "Original") return option;
  const user = props.userState.users.find((u) => u.id === option);
  return user?.name ?? "N/A";
};

const isDisabled = (option: string) => {
  if (props.selectionState.type === "None") return true;
  if (option === "Original") return false;

  const template = props.selectionState.templateId;
  const hasResult = props.resultState.results.some((result) => {
    return result.templateId === template && result.userId === option;
  });

  return !hasResult;
};

const analysisService = useAnalysisService();
const selection = computed({
  get: () => {
    if (props.selectionState.type === "None") return "Original";
    return props.selectionState.userId ?? "Original";
  },
  set: (option) => {
    if (props.selectionState.type === "Success") {
      if (option === "Original") {
        analysisService.selectResult(props.selectionState.templateId);
      } else {
        analysisService.selectResult(props.selectionState.templateId, option);
      }
    }
  },
});
</script>

<template>
  <Card :pt="{ body: { style: 'padding: 0.5rem 0.35rem' } }">
    <template #content>
      <div class="flex gap-2 items-center w-full">
        <div class="flex flex-col gap-1">
          <SelectButton
            v-model="selection"
            :options="options"
            :option-disabled="isDisabled"
            :allow-empty="false"
          >
            <template #option="{ option }">
              <span v-if="option === 'Original'">{{ option }}</span>
              <span v-else class="flex items-center gap-2">
                <span class="text-xs fas fa-user"></span>
                {{ getLabel(option) }}
              </span>
            </template>
          </SelectButton>
        </div>
      </div>
    </template>
  </Card>
</template>
