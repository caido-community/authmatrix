<script setup lang="ts">
import Column from 'primevue/column';
import DataTable from 'primevue/datatable';
import Card from 'primevue/card';
import SelectButton from 'primevue/selectbutton';
import Button from 'primevue/button';
import Checkbox from 'primevue/checkbox';
import InputText from 'primevue/inputtext';
import IconField from 'primevue/iconfield';
import InputIcon from 'primevue/inputicon';

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

      <template #header>
        <div class="px-4 pt-4 flex justify-between gap-8">
          <div class="flex flex-col gap-2">
            <IconField>
              <InputIcon class="fas fa-magnifying-glass"/>
              <InputText placeholder="Search" />
            </IconField>
          </div>

          <div class="flex items-center gap-4">
            <!-- Capture requests automatically -->
            <div
              class="flex gap-2"
              v-tooltip="'Automatically add each intercepted request to the testing queue for analysis.'">
              <label>Auto-capture requests</label>
              <Checkbox></Checkbox>
            </div>
            <div
              class="flex gap-2"
              v-tooltip="'Automatically trigger the analysis as soon as the request is added to the testing queue.'">
              <label>Auto-run analysis</label>
              <Checkbox></Checkbox>
            </div>
            <Button v-tooltip="'Manually run the analysis on the selected request.'">Analyze</Button>
          </div>
        </div>
      </template>

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
