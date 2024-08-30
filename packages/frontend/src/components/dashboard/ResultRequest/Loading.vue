<script setup lang="ts">
import Card from 'primevue/card';
import Skeleton from 'primevue/skeleton';
</script>

<template>
  <Card class="h-full" :pt="{ body: { class: 'h-full' }, content: { class: 'h-full' } }">
    <template #content>
      <div class="h-full">
        <Skeleton class="mb-2"></Skeleton>
        <Skeleton width="10rem" class="mb-2"></Skeleton>
        <Skeleton width="5rem" class="mb-2"></Skeleton>
        <Skeleton height="2rem" class="mb-2"></Skeleton>
        <Skeleton width="10rem" height="1rem"></Skeleton>
      </div>
    </template>
  </Card>
</template>
