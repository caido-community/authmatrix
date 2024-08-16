<script setup lang="ts">
import { useUserStore } from "@/stores/users";
import { RoleState } from "@/types/roles";
import { UserState } from "@/types/users";
import Button from "primevue/button";
import Card from "primevue/card";
import { User } from "shared";
import UserTable from "./UserTable.vue";

defineProps<{
	state: UserState & { type: "Success" };
	roleState: RoleState & { type: "Success" };
}>();

const selection = defineModel<User | null>("selection", { required: true });

const store = useUserStore();
const onAddUser = () => {
	store.addUser("New user");
};
</script>


<template>
  <Card class="h-full" :pt="{ body: { class: 'h-full' }, content: { class: 'flex-1 min-h-0' } } ">
    <template #title>
      <div class="flex justify-between items-center w-full">
        <h1>User List</h1>
        <Button label="+ Add User" @click="onAddUser" />
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
