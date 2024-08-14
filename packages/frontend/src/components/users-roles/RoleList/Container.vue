<script setup lang="ts">
import Card from 'primevue/card';
import DataTable from 'primevue/datatable';
import Button from 'primevue/button';
import Column from 'primevue/column';
import InputText from 'primevue/inputtext';
import {ref} from 'vue';
import {RoleState} from '@/types/roles';
import {useRoleStore} from '@/stores/roles';

const props = defineProps<{
  state: RoleState & { type: 'Success' };
}>();

const columns = [
  { field: 'name', header: 'Name' },
  { field: 'description', header: 'Description' },
];

const editingRows = ref([]);

const store = useRoleStore();
const addRole = () => {
  store.addRole("New role");
};
</script>

<template>
  | {{ state }}
  <div class="h-full">
    <Card class="h-full">
      <template #title>
        <div class="w-100 flex justify-between items-center">
          <h1>Role List</h1>
          <Button label="+ Add role" @click="addRole" />
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
        >
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

          <Column :row-editor="true" style="width: 10%; min-width: 8rem" body-style="text-align: center" />
        </DataTable>
      </template>
    </Card>
  </div>
</template>

