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

<template lang="pug">
.autorize-user-list
  Card(:style="{ height: '100%' }")
    template(#title)
      .autorize-user-list__title
        h1 User List
        .autorize-user-list__actions
          Button(label="+ Add User")

    template(#content)
      DataTable(
        :value="users"
        v-model:selection="selection"
        data-key="name"
        striped-rows
        scrollable
        scroll-height="flex"
        size="small"
        selection-mode="single")
        Column(v-for="column in columns" :key="column.field" :field="column.field" :header="column.header")
</template>

<style>
.autorize-user-list {
  height: 100%;
}

.autorize-user-list__title {
  width: 100%;

  font-size: 1.5rem;
  font-weight: bold;

  display: flex;
  justify-content: space-between;
  align-items: center;

  h1 {
    font-size: 1.5rem;
    font-weight: bold;
  }
}
</style>
