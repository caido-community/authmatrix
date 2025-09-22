<script setup lang="ts">
import Splitter from "primevue/splitter";
import SplitterPanel from "primevue/splitterpanel";
import { computed } from "vue";

import {
  RoleList,
  SubstitutionList,
  UserList,
  UserShow,
  UserShowNone,
} from "@/components/users-roles";
import { useRoleService } from "@/services/roles";
import { useSubstitutionService } from "@/services/substitutions";
import { useUserService } from "@/services/users";

const roleService = useRoleService();
const userService = useUserService();
const substitutionService = useSubstitutionService();

const roleState = computed(() => roleService.getState());
const userState = computed(() => userService.getState());
const substitutionState = computed(() => substitutionService.getState());
</script>

<template>
  <Splitter class="h-full">
    <SplitterPanel class="h-full" :size="50">
      <Splitter layout="vertical" class="h-full">
        <SplitterPanel :size="33">
          <UserList
            v-if="roleState.type === 'Success' && userState.type === 'Success'"
            v-model:selection="userService.userSelection"
            :state="userState"
            :role-state="roleState"
          />
        </SplitterPanel>
        <SplitterPanel :size="33">
          <RoleList v-if="roleState.type === 'Success'" :state="roleState" />
        </SplitterPanel>
        <SplitterPanel :size="34">
          <SubstitutionList
            v-if="substitutionState.type === 'Success'"
            :state="substitutionState"
          />
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
