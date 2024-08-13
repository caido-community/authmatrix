<script setup lang="ts">
import { ref, computed } from 'vue';
import Dashboard from './Dashboard.vue';
import Settings from './Settings.vue';
import UsersRoles from './UsersRoles.vue';
import MenuBar from 'primevue/menubar';

const page = ref<"Dashboard" | "User & Roles" | "Settings">("Dashboard");
const items = [
  {
    label: "Dashboard",
    command: () => page.value = "Dashboard"
  },
  {
    label: "Users & Roles",
    command: () => page.value = "User & Roles"
  },
  {
    label: "Settings",
    command: () => page.value = "Settings"
  },
];

const component = computed(() => {
  switch (page.value) {
    case "Dashboard":
      return Dashboard;
    case "User & Roles":
      return UsersRoles;
    case "Settings":
      return Settings;
  }
});
</script>

<template lang="pug">
.autorize-app
  MenuBar(:model="items")
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
