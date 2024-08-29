<script setup lang="ts">
import { ResultRequest, ResultTable } from "@/components/dashboard";
import {ResultResponse} from "@/components/dashboard/ResultResponse";
import { useRequestStore } from "@/stores/requests";
import { useRoleStore } from "@/stores/roles";
import {useSettingsStore} from "@/stores/settings";
import { useUserStore } from "@/stores/users";
import { computed } from "vue";

const userStore = useUserStore();
const roleStore = useRoleStore();
const requestStore = useRequestStore();
const settingsStore = useSettingsStore();

const roleState = computed(() => roleStore.getState());
const userState = computed(() => userStore.getState());
const requestState = computed(() => requestStore.getState());
const settingsState = computed(() => settingsStore.getState());
</script>

<template>
  <div class="h-full flex flex-col gap-1">
    <div class="w-full h-1/2">
      <ResultTable
        v-if="
          roleState.type === 'Success' &&
          userState.type === 'Success' &&
          requestState.type === 'Success' &&
          settingsState.type === 'Success'"
        :state="requestState"
        :user-state="userState"
        :role-state="roleState"
        :settings-state="settingsState"
      />
    </div>
    <div class="w-full h-1/2 flex gap-1">
      <div class="h-full w-1/2">
        <ResultRequest />
      </div>

      <div class="h-full w-1/2">
        <ResultResponse />
      </div>
    </div>
  </div>
</template>
