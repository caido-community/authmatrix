<script setup lang="ts">
import { ref, onMounted } from 'vue';
import Button from "primevue/button";

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
  Button Click me
  p Counter: {{ counter }}
</template>
