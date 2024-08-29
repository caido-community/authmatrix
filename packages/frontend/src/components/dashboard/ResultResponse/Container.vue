<script setup lang="ts">
import {useSDK} from "@/plugins/sdk";
import {onMounted, ref} from "vue";

const sdk = useSDK();
const editor = sdk.ui.httpResponseEditor();

const editorRoot = ref();
onMounted(() => {
  editorRoot.value.appendChild(editor.getElement());
});
</script>

<template>
  <div ref="editorRoot" class="h-full"></div>
</template>
