<script setup lang="ts">
import {
  ResultRequest,
  ResultTabs,
  TemplateTable,
} from "@/components/dashboard";
import { ResultResponse } from "@/components/dashboard/ResultResponse";
import { useAnalysisService } from "@/services/analysis";
import { useRoleService } from "@/services/roles";
import { useSettingsService } from "@/services/settings";
import { useTemplateService } from "@/services/templates";
import { useUserService } from "@/services/users";
import { computed } from "vue";

const userService = useUserService();
const roleService = useRoleService();
const templateService = useTemplateService();
const settingsService = useSettingsService();
const analysisService = useAnalysisService();

const roleState = computed(() => roleService.getState());
const userState = computed(() => userService.getState());
const templateState = computed(() => templateService.getState());
const settingsState = computed(() => settingsService.getState());
</script>

<template>
  <div class="h-full flex flex-col gap-1">
    <div class="w-full h-1/2">
      <TemplateTable
        v-if="
          roleState.type === 'Success' &&
          userState.type === 'Success' &&
          templateState.type === 'Success' &&
          settingsState.type === 'Success'"
        :state="templateState"
        :user-state="userState"
        :role-state="roleState"
        :settings-state="settingsState"
      />
    </div>
    <div class="w-full">
      <ResultTabs
        v-if="roleState.type === 'Success' &&
              userState.type === 'Success' &&
              templateState.type === 'Success' &&
              analysisService.resultState.type === 'Success'"
        :template-state="templateState"
        :user-state="userState"
        :role-state="roleState"
        :result-state="analysisService.resultState"
        :selection-state="analysisService.selectionState"
      />
    </div>

    <div class="w-full h-1/2 flex gap-1">
      <div class="h-full w-1/2">
        <ResultRequest :selection-state="analysisService.selectionState" />
      </div>

      <div class="h-full w-1/2">
        <ResultResponse :selection-state="analysisService.selectionState" />
      </div>
    </div>
  </div>
</template>
