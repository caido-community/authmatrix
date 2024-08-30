<script setup lang="ts">
import {useSDK} from "@/plugins/sdk";
import {TemplateState} from "@/types";
import {computed, onMounted, ref} from "vue";

const props = defineProps<{
  templateState: TemplateState & { type: "Success" };
}>();

const sdk = useSDK();
const editor = sdk.ui.httpRequestEditor();

const editorRoot = ref();
onMounted(() => {
  editorRoot.value.appendChild(editor.getElement());
});
</script>

<template>
  | {{ templateState.selectionState }}
  <div ref="editorRoot" class="h-full"></div>
</template>
