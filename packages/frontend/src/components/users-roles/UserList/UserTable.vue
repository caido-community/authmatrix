<script setup lang="ts">
import Button from "primevue/button";
import Checkbox from "primevue/checkbox";
import Column from "primevue/column";
import DataTable from "primevue/datatable";
import type { RoleDTO, UserDTO } from "shared";

import { useUserService } from "@/services/users";
import { type RoleState, type UserState } from "@/types";

defineProps<{
  state: UserState & { type: "Success" };
  roleState: RoleState & { type: "Success" };
}>();

const getRoleValue = (user: UserDTO, role: RoleDTO) => {
  return user.roleIds.some((roleId) => roleId === role.id);
};

const service = useUserService();
const { userSelection } = service;
const toggleRole = (user: UserDTO, role: RoleDTO) => {
  const isEnabled = user.roleIds.some((roleId) => roleId === role.id);

  if (isEnabled) {
    service.updateUser(user.id, {
      ...user,
      roleIds: user.roleIds.filter((roleId) => roleId !== role.id),
    });
  } else {
    service.updateUser(user.id, {
      ...user,
      roleIds: [...user.roleIds, role.id],
    });
  }
};

const onDeleteUser = (user: UserDTO) => {
  service.deleteUser(user.id);
};
</script>

<template>
  <DataTable
    v-model:selection="userSelection"
    :value="state.users"
    data-key="id"
    striped-rows
    scrollable
    scroll-height="flex"
    size="small"
    selection-mode="single"
    class="w-full"
  >
    <template #empty>
      <div class="flex flex-col items-center p-8 w-full text-center">
        <p class="text-gray-400">No users configured.</p>
        <p class="text-gray-400">
          Click on the button above to add a new user.
        </p>
      </div>
    </template>
    <Column field="name" header="Name" />
    <Column v-for="role in roleState.roles" :key="role.id" :header="role.name">
      <template #body="{ data }">
        <Checkbox
          :model-value="getRoleValue(data, role)"
          binary
          @change="() => toggleRole(data, role)"
        />
      </template>
    </Column>

    <Column header="">
      <template #body="{ data }">
        <div class="flex justify-end">
          <Button
            icon="fas fa-trash"
            text
            severity="danger"
            size="small"
            @click="() => onDeleteUser(data)"
          />
        </div>
      </template>
    </Column>
  </DataTable>
</template>
