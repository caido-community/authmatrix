<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { ResultShow, ResultTable, UserList, UserShow } from "@/components";
import Splitter from 'primevue/splitter';
import SplitterPanel from 'primevue/splitterpanel';

const counter = ref(0);

onMounted(() => {
  setInterval(() => {
    counter.value += 1;
  }, 1000);
});

</script>

<template lang="pug">
.autorize-app
  Splitter(:style="{ height: '100%' }" layout="vertical")
    SplitterPanel(:size="33" :style="{ overflow: 'auto' }")
      Splitter
        SplitterPanel(:size="33" :style="{ overflow: 'auto' }")
          UserList
        SplitterPanel(:size="67" :style="{ overflow: 'auto' }")
          UserShow

    SplitterPanel(:size="67" :style="{ overflow: 'auto' }")
      Splitter(:style="{ height: '100%' }")
        SplitterPanel(:size="50" :style="{ overflow: 'auto' }")
          ResultTable
        SplitterPanel(:size="50" :style="{ overflow: 'auto' }")
          ResultShow
</template>

<style>
.autorize-app {
  height: 100%;
}
</style>
