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

const store = useRoleStore();
const onAddRole = () => {
  store.addRole("New role");
};

const onDeleteRole = (role: Role) => {
  store.deleteRole(role.id);
};

const onRoleUpdate = (role: Role, field: keyof Role, value: string) => {
  store.updateRole(role.id, {
    ...role,
    [field]: value,
  });
};

</script>

<template>
  <Card class="h-full" :pt="{ body: { class: 'h-full' }, content: { class: 'flex-1 min-h-0' } } ">
    <template #title>
      <div class="flex justify-between items-center">
        <h1>Role List</h1>
        <Button label="+ Add role" @click="onAddRole" />
      </div>
    </template>

    <template #content>
      <DataTable
        :value="props.state.roles"
        striped-rows
        scrollable
        scroll-height="flex"
        size="small"
        edit-mode="cell"
        @cell-edit-complete="({ data, field, newValue }) => onRoleUpdate(data, field, newValue)"

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

        <Column>
          <template #body="{ data }">
            <div class="flex justify-end">
              <Button icon="fas fa-trash"  size="small" text severity="danger" @click="onDeleteRole(data)" />
            </div>
          </template>
        </Column>
      </DataTable>
    </template>
  </Card>
</template>

