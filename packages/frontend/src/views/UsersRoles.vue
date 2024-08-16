<script setup lang="ts">
import { RoleList, UserList, UserShow } from "@/components/users-roles";
import {useRoleStore} from "@/stores/roles";
import {useUserStore} from "@/stores/users";
import {computed} from "vue";

const roleStore = useRoleStore();
const userStore = useUserStore();

const roleState = computed(() => roleStore.getState());
const userState = computed(() => userStore.getState());
</script>

<template>
  <div class="h-full flex gap-1">
    <div class="h-full w-1/2 flex flex-col gap-1">
      <div class="h-1/2">
        <UserList
        v-if="roleState.type === 'Success' && userState.type === 'Success'"
        v-model:selection="userStore.userSelection"
        :state="userState"
        :role-state="roleState" />
      </div>
      <div class="h-1/2">
        <RoleList v-if="roleState.type === 'Success'" :state="roleState" />
      </div>
    </div>

    <div class="h-full w-1/2">
      <UserShow v-if="userStore.userSelection" :user="userStore.userSelection"/>
    </div>
  </div>
</template>
