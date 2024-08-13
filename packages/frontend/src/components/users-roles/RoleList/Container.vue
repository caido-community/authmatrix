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

<template lang="pug">
.autorize-role-list
  Card(:style="{ height: '100%' }")
    template(#title)
      .autorize-role-list__title
        h1 Role list
        .autorize-role-list__actions
          Button(label="+ Add role")

    template(#content)
      DataTable(
        :value="roles"
        v-model:editing-rows="editingRows"
        striped-rows
        scrollable
        scroll-height="flex"
        size="small"
        edit-mode="row")
        Column(v-for="column in columns" :key="column.field" :field="column.field" :header="column.header")
          template(#editor="{ data, field }")
            InputText(v-model="data[field]" autofocus fluid)

        Column(:row-editor="true" style="width: 10%; min-width: 8rem" body-style="text-align: center")
</template>

<style>
.autorize-role-list {
  height: 100%;
}

.autorize-role-list__title {
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
