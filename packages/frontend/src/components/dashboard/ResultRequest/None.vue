<script setup lang="ts">
import Card from "primevue/card";
</script>

<template>
  <Card
    class="h-full"
    :pt="{ body: { class: 'h-full' }, content: { class: 'h-full' } }"
  >
    <template #content>
      <div class="flex flex-col justify-center items-center h-full">
        <i
          class="fas fa-file-circle-xmark text-4xl text-gray-600 mb-3 grayscale invert opacity-35"
        ></i>
        <span class="text-gray-400">No request selected</span>
      </div>
    </template>
  </Card>
</template>
