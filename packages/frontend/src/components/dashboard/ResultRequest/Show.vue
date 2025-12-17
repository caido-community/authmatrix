<script setup lang="ts">
import ContextMenu from "primevue/contextmenu";
import { computed, onMounted, onUnmounted, ref } from "vue";

import { useSDK } from "@/plugins/sdk";
import { type AnalysisSelectionState } from "@/types";

const props = defineProps<{
  selectionState: AnalysisSelectionState & { type: "Success" };
}>();

const sdk = useSDK();
const root = ref();
const contextMenu = ref();

// Send to Replay - calls backend RPC
const sendToReplay = async () => {
  const requestId = props.selectionState.request.id;
  if (requestId === undefined) {
    sdk.window.showToast("No request selected", { variant: "warning" });
    return;
  }

  try {
    const result = await sdk.backend.sendToReplay(requestId);
    if (result.type === "Ok") {
      sdk.window.showToast("Request sent to Replay", { variant: "success" });
    } else {
      sdk.window.showToast(result.message, { variant: "error" });
    }
  } catch {
    sdk.window.showToast("Failed to send to Replay", { variant: "error" });
  }
};

// Context menu items
const menuItems = computed(() => [
  {
    label: "Send to Replay",
    icon: "fas fa-play",
    command: sendToReplay,
  },
]);

const onContextMenu = (event: MouseEvent) => {
  contextMenu.value?.show(event);
};

// Keyboard shortcut handler
const handleKeyDown = (event: KeyboardEvent) => {
  if ((event.metaKey || event.ctrlKey) && event.key === "r") {
    event.preventDefault();
    sendToReplay();
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

  document.addEventListener("keydown", handleKeyDown);
});

onUnmounted(() => {
  document.removeEventListener("keydown", handleKeyDown);
});
</script>

<template>
  <div ref="root" class="h-full" @contextmenu.prevent="onContextMenu"></div>
  <ContextMenu ref="contextMenu" :model="menuItems" />
</template>
