<script setup lang="ts">
import Card from 'primevue/card';
import DataTable from 'primevue/datatable';
import Button from 'primevue/button';
import Column from 'primevue/column';
import InputText from 'primevue/inputtext';
import {ref} from 'vue';

const roles = [
  {
    name: 'Admin',
    description: 'Admin role',
  },
  {
    name: 'User',
    description: 'User role',
  },
];

const columns = [
  { field: 'name', header: 'Name' },
  { field: 'description', header: 'Description' },
];

const editingRows = ref([]);
</script>

<template>
  <div class="h-full">
    <Card class="h-full">
      <template #title>
        <div class="w-100 flex justify-between items-center">
          <h1>Role List</h1>
          <Button label="+ Add role" />
        </div>
      </template>

      <template #content>
        <DataTable
          :value="roles"
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

