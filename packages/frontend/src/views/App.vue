<script setup lang="ts">
import { ref, computed } from 'vue';
import Dashboard from './Dashboard.vue';
import UsersRoles from './UsersRoles.vue';
import MenuBar from 'primevue/menubar';
import {useRoleStore} from '@/stores/roles';
import {onMounted} from 'vue';
import {useUserStore} from '@/stores/users';

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
];

const component = computed(() => {
  switch (page.value) {
    case "Dashboard":
      return Dashboard;
    case "User & Roles":
      return UsersRoles;
  }
});

const roleStore = useRoleStore();
const userStore = useUserStore();

onMounted(() => {
  roleStore.initialize();
  userStore.initialize();
});

</script>

<template>
  <div id="plugin--autorize">
    <div class="h-full flex flex-col gap-1">
      <MenuBar :model="items" breakpoint="320px" />
      <div class="flex-1 min-h-0">
        <component :is="component" />
      </div>
    </div>
  </div>
</template>

<style scoped>
#plugin--autorize {
  height: 100%;
}
</style>
