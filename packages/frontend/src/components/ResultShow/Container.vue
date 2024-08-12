<script setup lang="ts">
import Card from 'primevue/card';
</script>

<template lang="pug">
.autorize-result-show
  Card(:style="{ height: '100%' }")
    template(#title) Result show
    template(#content)
      p Result show content
</template>

<style>
.autorize-result-show {
  height: 100%;
}
</style>
