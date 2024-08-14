<script setup lang="ts">
import Column from 'primevue/column';
import DataTable from 'primevue/datatable';
import Card from 'primevue/card';

const columns = [
  { field: 'id', header: 'ID' },
  { field: 'host', header: 'Host' },
  { field: 'path', header: 'Path' },
]

const items = Array.from({ length: 20 }).map((_, index) => ({
  id: index + 1,
  host: "localhost",
  path: "/path",
}));
</script>

<template>
  <div class="h-full">
    <Card
      class="h-full"
      :pt="{ body: { style: { height: '100%', padding: '0.5rem' } }, content: { style: { height: '100%' } } }">
      <template #content>
        <DataTable
          :value="items"
          striped-rows
          scrollable
          scroll-height="flex"
          size="small"
        >
          <Column
            v-for="column in columns"
            :key="column.field"
            :field="column.field"
            :header="column.header"
            :pt="{ bodyCell: { style: { padding: '0 0.5rem', lineHeight: '21px' } } }"
          />
        </DataTable>
      </template>
    </Card>
  </div>
</template>
