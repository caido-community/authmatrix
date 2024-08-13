<script setup lang="ts">
import Splitter from 'primevue/splitter';
import SplitterPanel from 'primevue/splitterpanel';
</script>

<template lang="pug">
.autorize-settings
  Splitter(:style="{ height: '100%' }" layout="vertical")
    SplitterPanel(:size="50")
      ResultTable

    SplitterPanel(:size="50")
      ResultShow
</template>

<style>
.autorize-settings {
  height: 100%;

  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}
</style>
