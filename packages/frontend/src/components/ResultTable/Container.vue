<script setup lang="ts">
import Column from 'primevue/column';
import DataTable from 'primevue/datatable';

const columns = [
  { field: 'ID', header: 'ID' },
  { field: 'Host', header: 'Host' },
  { field: 'Path', header: 'Path' },
]
</script>

<template lang="pug">
.autorize-result-table
  DataTable(:style="{ height: '100%' }")
    Column(v-for="column in columns" :key="column.field" :field="column.field" :header="column.header")

</template>

<style>
.autorize-result-table {
  height: 100%;
}
</style>
