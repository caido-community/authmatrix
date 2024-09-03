<script setup lang="ts">
import { useSDK } from "@/plugins/sdk";
import { SelectionState } from "@/types";
import { onMounted, ref } from "vue";

const props = defineProps<{
  selectionState: SelectionState & { type: "Success" };
}>();

const sdk = useSDK();

const root = ref();

onMounted(() => {
  const editor = sdk.ui.httpResponseEditor();
  root.value.appendChild(editor.getElement());

  const view = editor.getEditorView();
  console.log(view);

  view.dispatch({
    changes: {
      from: 0,
      to: view.state.doc.length,
      insert: props.selectionState.request.raw,
    },
  });
});
</script>

<template>
  <div ref="root" class="h-full"></div>
</template>
