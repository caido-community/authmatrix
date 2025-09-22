<script setup lang="ts">
import MenuBar from "primevue/menubar";
import Button from "primevue/button";
import { computed, onMounted, ref } from "vue";

import Dashboard from "./Dashboard.vue";
import UsersRoles from "./UsersRoles.vue";

import { useSDK } from "@/plugins/sdk";
import { useAnalysisService } from "@/services/analysis";
import { useRoleService } from "@/services/roles";
import { useSettingsService } from "@/services/settings";
import { useSubstitutionService } from "@/services/substitutions";
import { useTemplateService } from "@/services/templates";
import { useUserService } from "@/services/users";

const page = ref<"Dashboard" | "Users & Roles">("Dashboard");
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
      page.value = "Users & Roles";
    },
  },
];

const component = computed(() => {
  switch (page.value) {
    case "Dashboard":
      return Dashboard;
    case "Users & Roles":
      return UsersRoles;
    default:
      return undefined;
  }
});

const roleService = useRoleService();
const userService = useUserService();
const templateService = useTemplateService();
const settingsService = useSettingsService();
const substitutionService = useSubstitutionService();
const analysisService = useAnalysisService();
const sdk = useSDK();

const importConfigInput = ref<HTMLInputElement | undefined>(undefined);
const onClickImportConfig = () => {
  importConfigInput.value?.click();
};
const onConfigFileSelected = async (e: Event) => {
  const target = e.target as HTMLInputElement | undefined;
  const files = target?.files ?? undefined;
  if (!files || files.length === 0) return;
  const file = files[0];
  if (!file) return;
  await templateService.importConfiguration(file);
  if (importConfigInput.value) importConfigInput.value.value = "";
};
const onExportConfig = async () => {
  await templateService.exportConfiguration();
};

onMounted(() => {
  const setup = () => {
    roleService.initialize();
    userService.initialize();
    templateService.initialize();
    settingsService.initialize();
    substitutionService.initialize();
    analysisService.initialize();
  };

  sdk.backend.onEvent("project:changed", setup);
  setup();
});
</script>

<template>
  <div id="plugin--authmatrix">
    <div class="h-full flex flex-col gap-1">
      <MenuBar breakpoint="320px">
        <template #start>
          <div class="flex">
            <div
              v-for="(item, index) in items"
              :key="index"
              class="px-3 py-2 cursor-pointer text-gray-300 rounded transition-all duration-200 ease-in-out"
              :class="{
                'bg-zinc-800/40': page === item.label,
                'hover:bg-gray-800/10': page !== item.label,
              }"
              @click="item.command"
            >
              {{ item.label }}
            </div>
          </div>
        </template>
        <template #end>
          <div class="flex items-center gap-2">
            <Button
              size="small"
              v-tooltip="'Export all AuthMatrix configuration to a file.'"
              label="Export"
              icon="fas fa-download"
              @click="onExportConfig"
            />
            <Button
              size="small"
              v-tooltip="'Import AuthMatrix configuration from a file.'"
              label="Import"
              icon="fas fa-upload"
              @click="onClickImportConfig"
            />
            <input
              ref="importConfigInput"
              type="file"
              accept="application/json,.json"
              class="hidden"
              @change="onConfigFileSelected"
            />
          </div>
        </template>
      </MenuBar>
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
