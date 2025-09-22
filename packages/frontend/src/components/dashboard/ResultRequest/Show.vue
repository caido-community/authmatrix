<script setup lang="ts">
import { onMounted, onUnmounted, ref } from "vue";

import { useSDK } from "@/plugins/sdk";
import { useTemplateService } from "@/services/templates";
import { type AnalysisSelectionState } from "@/types";

const props = defineProps<{
  selectionState: AnalysisSelectionState & { type: "Success" };
}>();

const sdk = useSDK();
const templateService = useTemplateService();

const root = ref();

const handleKeyDown = async (event: KeyboardEvent) => {
  if (event.ctrlKey && event.key === 'r') {
    event.preventDefault();
    event.stopPropagation(); // Prevent the event from bubbling up
    
    // Get the template ID from the selection state
    const templateId = props.selectionState.templateId;
    if (templateId) {
      await templateService.sendToReplay(templateId);
    }
  }
};

onMounted(() => {
  const editor = sdk.ui.httpRequestEditor();
  root.value.appendChild(editor.getElement());

  const view = editor.getEditorView();

  view.dispatch({
    changes: {
      from: 0,
      to: view.state.doc.length,
      insert: props.selectionState.request.raw,
    },
  });

  // Add keyboard event listener to the editor element specifically
  const editorElement = editor.getElement();
  editorElement.addEventListener('keydown', handleKeyDown);
  
  // Also add to the root element for broader coverage
  root.value?.addEventListener('keydown', handleKeyDown);
});

onUnmounted(() => {
  // Remove keyboard event listeners
  const editorElement = root.value?.querySelector('.cm-editor');
  if (editorElement) {
    editorElement.removeEventListener('keydown', handleKeyDown);
  }
  root.value?.removeEventListener('keydown', handleKeyDown);
});
</script>

<template>
  <div ref="root" class="h-full" data-request-preview v-tooltip="'Press Ctrl+R to send this request to Replay'"></div>
</template>
