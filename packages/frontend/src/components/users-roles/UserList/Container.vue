<script setup lang="ts">
import Card from 'primevue/card';
import DataTable from 'primevue/datatable';
import Button from 'primevue/button';
import Column from 'primevue/column';
import {ref} from 'vue';

const users = [
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

const selection = ref();
</script>


<template>
  <div class="h-full">
    <Card class="h-full">
      <template #title>
        <div class="flex justify-between items-center w-full text-xl font-bold">
          <h1>User List</h1>
          <Button label="+ Add User" />
        </div>
      </template>

      <template #content>
        <DataTable
          :value="users"
          v-model:selection="selection"
          data-key="name"
          striped-rows
          scrollable
          scroll-height="flex"
          size="small"
          selection-mode="single"
          class="w-full"
        >
          <Column
            v-for="column in columns"
            :key="column.field"
            :field="column.field"
            :header="column.header"
          />
        </DataTable>
      </template>
    </Card>
  </div>
</template>
