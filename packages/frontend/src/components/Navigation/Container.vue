<script setup lang="ts">
import MenuBar from 'primevue/menubar';

const items = [
  {
    label: "Dashboard"
  },
  {
    label: "Configuration"
  },
];
</script>

<template lang="pug">
.autorize-navigation
  MenuBar(:model="items")
</template>

<style>

</style>
