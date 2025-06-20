<script setup lang="ts">
import Failed from "./Failed.vue";
import Loading from "./Loading.vue";
import None from "./None.vue";
import Show from "./Show.vue";

import { type AnalysisSelectionState } from "@/types";

defineProps<{
  selectionState: AnalysisSelectionState;
}>();
</script>

<template>
  <None v-if="selectionState.type === 'None'" />
  <Loading v-else-if="selectionState.type === 'Loading'" />
  <Failed v-else-if="selectionState.type === 'Error'" />
  <Show v-else :selection-state="selectionState" />
</template>
