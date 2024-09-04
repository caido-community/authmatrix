<script setup lang="ts">
import { RoleList, UserList, UserShow } from "@/components/users-roles";
import { useRoleService } from "@/services/roles";
import { useUserService } from "@/services/users";
import { computed } from "vue";

const roleService = useRoleService();
const userService = useUserService();

const roleState = computed(() => roleService.getState());
const userState = computed(() => userService.getState());
</script>

<template>
  <div class="h-full flex gap-1">
    <div class="h-full w-1/2 flex flex-col gap-1">
      <div class="h-1/2">
        <UserList
        v-if="roleState.type === 'Success' && userState.type === 'Success'"
        v-model:selection="userService.userSelection"
        :state="userState"
        :role-state="roleState" />
      </div>
      <div class="h-1/2">
        <RoleList v-if="roleState.type === 'Success'" :state="roleState" />
      </div>
    </div>

    <div class="h-full w-1/2">
      <UserShow v-if="userService.userSelection" :user="userService.userSelection"/>
    </div>
  </div>
</template>
