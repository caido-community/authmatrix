<script setup lang="ts">
import Splitter from "primevue/splitter";
import SplitterPanel from "primevue/splitterpanel";
import { computed } from "vue";

import {
  RoleList,
  UserList,
  UserShow,
  UserShowNone,
} from "@/components/users-roles";
import { useRoleService } from "@/services/roles";
import { useUserService } from "@/services/users";

const roleService = useRoleService();
const userService = useUserService();

const roleState = computed(() => roleService.getState());
const userState = computed(() => userService.getState());
</script>

<template>
  <Splitter class="h-full">
    <SplitterPanel class="h-full" :size="50">
      <Splitter layout="vertical" class="h-full">
        <SplitterPanel :size="50">
          <UserList
            v-if="roleState.type === 'Success' && userState.type === 'Success'"
            v-model:selection="userService.userSelection"
            :state="userState"
            :role-state="roleState"
          />
        </SplitterPanel>
        <SplitterPanel :size="50">
          <RoleList v-if="roleState.type === 'Success'" :state="roleState" />
        </SplitterPanel>
      </Splitter>
    </SplitterPanel>
    <SplitterPanel class="h-full" :size="50">
      <UserShow
        v-if="userService.userSelection"
        :user="userService.userSelection"
      />
      <UserShowNone v-else />
    </SplitterPanel>
  </Splitter>
</template>
