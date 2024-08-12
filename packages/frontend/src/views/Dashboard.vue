<script setup lang="ts">
import { ResultShow, ResultTable } from "@/components";
import Splitter from 'primevue/splitter';
import SplitterPanel from 'primevue/splitterpanel';
</script>

<template lang="pug">
.autorize-dashboard
  Splitter(:style="{ height: '100%' }" layout="vertical")
    SplitterPanel(:size="50" :style="{ overflow: 'auto', boxShadow: 'var(--autorize-box-shadow-surface)' }")
      ResultTable

    SplitterPanel(:size="50" :style="{ overflow: 'auto', boxShadow: 'var(--autorize-box-shadow-surface)' }")
      ResultShow
</template>

<style>
.autorize-dashboard {
  height: 100%;

  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}
</style>
