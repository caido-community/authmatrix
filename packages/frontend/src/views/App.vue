<script setup lang="ts">
import { ref, onMounted } from 'vue';

const counter = ref(0);

onMounted(() => {
  setInterval(() => {
    counter.value += 1;
  }, 1000);
});

</script>

<template lang="pug">
.autorize-app
  h1 Hello, Vue 3!
  p Counter: {{ counter }}
</template>
