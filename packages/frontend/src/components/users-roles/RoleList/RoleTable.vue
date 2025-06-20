<script setup lang="ts">
import Button from "primevue/button";
import Column from "primevue/column";
import DataTable from "primevue/datatable";
import InputText from "primevue/inputtext";
import type { RoleDTO } from "shared";
import { ref } from "vue";

import { useRoleService } from "@/services/roles";
import { type RoleState } from "@/types";

const props = defineProps<{
  state: RoleState & { type: "Success" };
}>();

const columns = [
  { field: "name", header: "Name" },
  { field: "description", header: "Description" },
];

const editingRows = ref<Set<string>>(new Set());
const service = useRoleService();

const onDeleteRole = (role: RoleDTO) => {
  service.deleteRole(role.id);
};

const onRoleUpdate = (role: RoleDTO, field: keyof RoleDTO, value: string) => {
  service.updateRole(role.id, {
    ...role,
    [field]: value,
  });
};

const handleRoleFieldUpdate = (
  role: RoleDTO,
  fieldName: string,
  value: string,
) => {
  onRoleUpdate(role, fieldName as keyof RoleDTO, value);
};

const toggleEdit = (roleId: string) => {
  const newEditingRows = new Set(editingRows.value);
  if (newEditingRows.has(roleId)) {
    newEditingRows.delete(roleId);
  } else {
    newEditingRows.add(roleId);
  }
  editingRows.value = newEditingRows;
};

const isEditing = (roleId: string) => {
  return editingRows.value.has(roleId);
};
</script>

<template>
  <DataTable
    :value="props.state.roles"
    striped-rows
    scrollable
    scroll-height="flex"
    size="small"
  >
    <template #empty>
      <div class="flex flex-col items-center p-8 w-full text-center">
        <p class="text-gray-400">No roles configured.</p>
        <p class="text-gray-400">
          Click on the button above to add a new role.
        </p>
      </div>
    </template>

    <Column
      v-for="column in columns"
      :key="column.field"
      :field="column.field"
      :header="column.header"
    >
      <template #body="{ data }">
        <InputText
          v-if="isEditing(data.id)"
          v-model="data[column.field]"
          autofocus
          fluid
          @blur="handleRoleFieldUpdate(data, column.field, data[column.field])"
          @keyup.enter="
            handleRoleFieldUpdate(data, column.field, data[column.field])
          "
        />
        <span v-else class="px-3 py-2 block">{{ data[column.field] }}</span>
      </template>
    </Column>

    <Column header="">
      <template #body="{ data }">
        <div class="flex justify-end gap-1">
          <Button
            v-tooltip="isEditing(data.id) ? 'Save changes' : 'Edit role'"
            :icon="isEditing(data.id) ? 'fas fa-check' : 'fas fa-pencil'"
            size="small"
            text
            :severity="isEditing(data.id) ? 'success' : 'info'"
            @click="toggleEdit(data.id)"
          />
          <Button
            v-tooltip="'Delete role'"
            icon="fas fa-trash"
            size="small"
            text
            severity="danger"
            @click="onDeleteRole(data)"
          />
        </div>
      </template>
    </Column>
  </DataTable>
</template>
