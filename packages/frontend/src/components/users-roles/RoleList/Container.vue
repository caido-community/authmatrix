<script setup lang="ts">
import Card from 'primevue/card';
import DataTable from 'primevue/datatable';
import Button from 'primevue/button';
import Column from 'primevue/column';
import InputText from 'primevue/inputtext';
import {ref} from 'vue';
import {RoleState} from '@/types/roles';
import {useRoleStore} from '@/stores/roles';
import {Role} from 'shared';

const props = defineProps<{
  state: RoleState & { type: 'Success' };
}>();

const columns = [
  { field: 'name', header: 'Name' },
  { field: 'description', header: 'Description' },
];

const editingRows = ref([]);

const store = useRoleStore();
const onAddRole = () => {
  store.addRole("New role");
};

const onDeleteRole = (role: Role) => {
  store.deleteRole(role.id);
};

const onRowEditSave = (role: Role, fields: Omit<Role, "id">) => {
  store.updateRole(role.id, fields);
};
</script>

<template>
  <div class="h-full">
    <Card class="h-full" :pt="{ body: { style: { height: '100%' } }, content: { style: { flex: 1, minHeight: 0 } } }">
      <template #title>
        <div class="flex justify-between items-center">
          <h1>Role List</h1>
          <Button label="+ Add role" @click="onAddRole" />
        </div>
      </template>

      <template #content>
        <DataTable
          :value="props.state.roles"
          v-model:editing-rows="editingRows"
          striped-rows
          scrollable
          scroll-height="flex"
          size="small"
          edit-mode="row"
          @row-edit-save="({ data, newData }) => onRowEditSave(data, newData)"
        >
          <template #empty>
            <div class="flex flex-col items-center p-8 w-full">
              <p class="text-gray-400">No roles configured.</p>
              <p class="text-gray-400">Click on the button above to add a new role.</p>
            </div>
          </template>

          <Column
            v-for="column in columns"
            :key="column.field"
            :field="column.field"
            :header="column.header"
          >
            <template #editor="{ data, field }">
              <InputText v-model="data[field]" autofocus fluid />
            </template>
          </Column>

          <Column :row-editor="true">
            <template #body="{ data, editorInitCallback }">
              <div class="flex gap-2 justify-end">
                <Button icon="fas fa-pencil" outlined @click="editorInitCallback" />
                <Button icon="fas fa-trash" outlined severity="danger" @click="onDeleteRole(data)" />
              </div>
            </template>

            <template #editor="{ data, editorSaveCallback, editorCancelCallback }">
              <div class="flex gap-2 justify-end">
                <Button icon="fas fa-check" outlined @click="editorSaveCallback" />
                <Button icon="fas fa-times" outlined @click="editorCancelCallback" />
                <Button icon="fas fa-trash" outlined severity="danger" @click="onDeleteRole(data)" />
              </div>
            </template>
          </Column>
        </DataTable>
      </template>
    </Card>
  </div>
</template>

