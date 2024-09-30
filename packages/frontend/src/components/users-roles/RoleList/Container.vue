<script setup lang="ts">
import { useRoleService } from "@/services/roles";
import { RoleState } from "@/types";
import Button from "primevue/button";
import Card from "primevue/card";
import RoleTable from "./RoleTable.vue";

defineProps<{
  state: RoleState & { type: "Success" };
}>();

const service = useRoleService();
const onAddRole = () => {
  service.addRole("New role");
};
</script>

<template>
  <Card class="h-full" :pt="{ body: { class: 'h-full' }, content: { class: 'flex-1 min-h-0' } } ">
    <template #title>
      <div class="flex justify-between p-4 items-center">
        <div class="flex flex-col">
          <h1>Roles</h1>
          <p class="text-sm text-gray-400">Manage roles and their descriptions</p>
        </div>

        <div class="min-w-max">
          <Button label="+ Add role" size="small" @click="onAddRole" />
        </div>
      </div>
    </template>

    <template #content>
      <RoleTable :state="state"/>
    </template>
  </Card>
</template>

