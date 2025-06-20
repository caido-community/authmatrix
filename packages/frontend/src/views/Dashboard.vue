<script setup lang="ts">
import Splitter from "primevue/splitter";
import SplitterPanel from "primevue/splitterpanel";
import { computed } from "vue";

import {
  ResultRequest,
  ResultResponse,
  ResultTabs,
  TemplateTable,
} from "@/components/dashboard";
import { useAnalysisService } from "@/services/analysis";
import { useRoleService } from "@/services/roles";
import { useSettingsService } from "@/services/settings";
import { useTemplateService } from "@/services/templates";
import { useUserService } from "@/services/users";

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
          settingsState.type === 'Success'
        "
        :state="templateState"
        :user-state="userState"
        :role-state="roleState"
        :settings-state="settingsState"
      />
    </div>

    <div class="w-full h-1/2 flex flex-col gap-1">
      <div v-if="analysisService.selectionState.type !== 'None'" class="w-full">
        <ResultTabs
          v-if="
            roleState.type === 'Success' &&
            userState.type === 'Success' &&
            templateState.type === 'Success' &&
            analysisService.resultState.type === 'Success'
          "
          :template-state="templateState"
          :user-state="userState"
          :role-state="roleState"
          :result-state="analysisService.resultState"
          :selection-state="analysisService.selectionState"
        />
      </div>

      <div class="w-full flex-1 min-h-0">
        <Splitter class="h-full">
          <SplitterPanel :size="50" class="h-full">
            <ResultRequest :selection-state="analysisService.selectionState" />
          </SplitterPanel>
          <SplitterPanel :size="50" class="h-full">
            <ResultResponse :selection-state="analysisService.selectionState" />
          </SplitterPanel>
        </Splitter>
      </div>
    </div>
  </div>
</template>
