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

const sendToReplay = async () => {
  const requestId = props.selectionState.request.id;
  if (requestId === undefined) {
    sdk.window.showToast("No request selected", { variant: "warning" });
    return;
  }

  try {
    const collections = sdk.replay.getCollections();
    let collection = collections.find((c) => c.name === "AuthMatrix");
    if (collection === undefined) {
      collection = await sdk.replay.createCollection("AuthMatrix");
    }

    await sdk.replay.createSession(
      { type: "ID", id: requestId },
      collection.id,
    );

    sdk.window.showToast("Request sent to Replay", { variant: "success" });
  } catch {
    sdk.window.showToast("Failed to send to Replay", { variant: "error" });
  }
};

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
