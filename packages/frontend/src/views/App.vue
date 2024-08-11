<script setup lang="ts">
import { ref, onMounted } from 'vue';

const counter = ref(0);

onMounted(() => {
  setInterval(() => {
    counter.value += 1;
  }, 1000);
});

</script>

<template>
  <div id="app">
    <h1>Hello from VueJS {{ counter }}</h1>
  </div>
</template>
