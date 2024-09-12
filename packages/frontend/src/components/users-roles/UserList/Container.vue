<script setup lang="ts">
import { useUserService } from "@/services/users";
import { RoleState } from "@/types";
import { UserState } from "@/types";
import Button from "primevue/button";
import Card from "primevue/card";
import type { UserDTO } from "shared";
import UserTable from "./UserTable.vue";

defineProps<{
  state: UserState & { type: "Success" };
  roleState: RoleState & { type: "Success" };
}>();

const selection = defineModel<UserDTO | undefined>("selection", {
  required: true,
});

const service = useUserService();
const onAddUser = () => {
  service.addUser("New user");
};
</script>


<template>
  <Card class="h-full" :pt="{ body: { class: 'h-full' }, content: { class: 'flex-1 min-h-0' } } ">
    <template #title>
      <div class="flex justify-between">
        <div class="flex flex-col w-full">
          <h1>Users</h1>
          <p class="text-sm text-gray-400">Manage users and their access to the system</p>
        </div>
        <div class="min-w-max">
          <Button label="+ Add User" @click="onAddUser" />
        </div>
      </div>
    </template>

    <template #content>
      <UserTable
        :state="state"
        :role-state="roleState"
        v-model:selection="selection" />

    </template>
  </Card>
</template>
