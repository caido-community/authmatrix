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

<template>
  <div id="plugin--autorize">
    <div class="h-full flex flex-col gap-1">
      <MenuBar :model="items" />
      <component :is="component" />
    </div>
  </div>
</template>

<style scoped>
#plugin--autorize {
  height: 100%;
}
</style>
