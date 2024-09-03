<script setup lang="ts">
import {
  ResultRequest,
  ResultTabs,
  TemplateTable,
} from "@/components/dashboard";
import { ResultResponse } from "@/components/dashboard/ResultResponse";
import { useRoleStore } from "@/stores/roles";
import { useSettingsStore } from "@/stores/settings";
import { useTemplateStore } from "@/stores/templates";
import { useUserStore } from "@/stores/users";
import { computed } from "vue";

const userStore = useUserStore();
const roleStore = useRoleStore();
const templateStore = useTemplateStore();
const settingsStore = useSettingsStore();

const roleState = computed(() => roleStore.getState());
const userState = computed(() => userStore.getState());
const templateState = computed(() => templateStore.getState());
const settingsState = computed(() => settingsStore.getState());
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
              templateState.type === 'Success'"
        :template-state="templateState"
        :user-state="userState"
        :role-state="roleState"
      />
    </div>

    <div class="w-full h-1/2 flex gap-1">
      <div class="h-full w-1/2">
        <ResultRequest v-if="templateState.type === 'Success'" :template-state="templateState" />
      </div>

      <div class="h-full w-1/2">
        <ResultResponse v-if="templateState.type ==='Success'" :template-state="templateState" />
      </div>
    </div>
  </div>
</template>
