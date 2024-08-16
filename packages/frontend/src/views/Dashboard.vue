<script setup lang="ts">
import { ResultShow, ResultTable } from "@/components/dashboard";
import {useRoleStore} from "@/stores/roles";
import {useUserStore} from "@/stores/users";
import Splitter from 'primevue/splitter';
import SplitterPanel from 'primevue/splitterpanel';
import {computed} from "vue";

const userStore = useUserStore();
const roleStore = useRoleStore();

const roleState = computed(() => roleStore.getState());
const userState = computed(() => userStore.getState());
</script>

<template>
  <div class="h-full flex flex-col gap-1">
    <Splitter class="h-full" layout="vertical">
      <SplitterPanel :size="50">
        <ResultTable
          v-if="roleState.type === 'Success' && userState.type === 'Success'"
          :user-state="userState"
          :role-state="roleState"
        />
      </SplitterPanel>

      <SplitterPanel :size="50">
        <ResultShow />
      </SplitterPanel>
    </Splitter>
  </div>
</template>
