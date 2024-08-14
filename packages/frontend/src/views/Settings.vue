<script setup lang="ts">
import {ResultShow, ResultTable} from '@/components/dashboard';
import Splitter from 'primevue/splitter';
import SplitterPanel from 'primevue/splitterpanel';
</script>

<template>
  <div class="h-full flex flex-col gap-1">
    <Splitter class="h-full" layout="vertical">
      <SplitterPanel :size="50">
        <ResultTable />
      </SplitterPanel>

      <SplitterPanel :size="50">
        <ResultShow />
      </SplitterPanel>
    </Splitter>
  </div>
</template>

