<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { ResultShow, ResultTable, UserList, UserShow, Navigation } from "@/components";
import Dashboard from './Dashboard.vue';
import Configuration from './Configuration.vue';
import MenuBar from 'primevue/menubar';

const page = ref<"Dashboard" | "Configuration">("Dashboard");
const items = [
  {
    label: "Dashboard",
    command: () => page.value = "Dashboard"
  },
  {
    label: "Configuration",
    command: () => page.value = "Configuration"
  },
];

const component = computed(() => {
  if (page.value === "Dashboard") {
    return Dashboard;
  } else {
    return Configuration;
  }
});
</script>

<template lang="pug">
.autorize-app
  MenuBar(:model="items" :style="{ boxShadow: 'var(--autorize-box-shadow-surface)' }")
  component(:is="component")
</template>

<style>
.autorize-app {
  height: 100%;

  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}
</style>
