<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { ResultShow, ResultTable, UserList, UserShow, Navigation } from "@/components";
import Splitter from 'primevue/splitter';
import SplitterPanel from 'primevue/splitterpanel';
</script>

<template lang="pug">
.autorize-configuration
  div user
</template>

<style>
.autorize-configuration {
  height: 100%;

  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}
</style>
