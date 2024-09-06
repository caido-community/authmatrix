<script setup lang="ts">
import { useAnalysisService } from "@/services/analysis";
import { useRoleService } from "@/services/roles";
import { useSettingsService } from "@/services/settings";
import { useTemplateService } from "@/services/templates";
import { useUserService } from "@/services/users";
import MenuBar from "primevue/menubar";
import { computed, ref } from "vue";
import { onMounted } from "vue";
import Dashboard from "./Dashboard.vue";
import UsersRoles from "./UsersRoles.vue";

const page = ref<"Dashboard" | "User & Roles" | "Settings">("Dashboard");
const items = [
  {
    label: "Dashboard",
    command: () => {
      page.value = "Dashboard";
    },
  },
  {
    label: "Users & Roles",
    command: () => {
      page.value = "User & Roles";
    },
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

const roleService = useRoleService();
const userService = useUserService();
const templateService = useTemplateService();
const settingsService = useSettingsService();
const analysisService = useAnalysisService();

onMounted(() => {
  roleService.initialize();
  userService.initialize();
  templateService.initialize();
  settingsService.initialize();
  analysisService.initialize();
});
</script>

<template>
  <div id="plugin--authmatrix">
    <div class="h-full flex flex-col gap-1">
      <MenuBar :model="items" breakpoint="320px" />
      <div class="flex-1 min-h-0">
        <component :is="component" />
      </div>
    </div>
  </div>
</template>

<style scoped>
#plugin--authmatrix {
  height: 100%;
}
</style>
