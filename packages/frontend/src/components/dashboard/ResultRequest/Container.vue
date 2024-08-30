<script setup lang="ts">
import {TemplateState} from "@/types";

import None from "./None.vue";
import Loading from "./Loading.vue";
import Show from "./Show.vue";
import Error from "./Error.vue";

const props = defineProps<{
  templateState: TemplateState & { type: "Success" };
}>();

</script>

<template>
  <None v-if="props.templateState.selectionState.type === 'None'" />
  <Loading v-else-if="props.templateState.selectionState.type === 'Loading'" />
  <Error v-else-if="props.templateState.selectionState.type === 'Error'" />
  <Show v-else :selection-state="props.templateState.selectionState" />
</template>
