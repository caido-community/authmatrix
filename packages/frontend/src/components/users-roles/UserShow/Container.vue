<script setup lang="ts">
import Card from 'primevue/card';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
</script>

<template>
  <div class="h-full flex flex-col gap-1">
    <Card class="h-full" :pt="{ body: { class: 'flex flex-col flex-1' }, content: { class: 'flex flex-col flex-1' } } ">
      <template #title>
        <div class="flex justify-between items-center">
          <h1 class="font-bold">User</h1>
          <div>
            <Button label="Save" />
          </div>
        </div>
      </template>

      <template #content>
        <div class="flex flex-col flex-1 gap-8">
          <div class="flex flex-col gap-2">
            <label for="name" class="text-sm">Name</label>
            <InputText id="name" label="Name" autocomplete="off" />
          </div>

          <div class="flex justify-between items-center">
            <h1 class="font-bold">Cookies</h1>
            <div>
              <Button label="+ Add cookie" size="small" />
            </div>
          </div>

          <div class="flex-1">
            <DataTable :value="[]" scrollable scroll-height="flex" striped-rows>
              <Column field="name" header="Name" />
              <Column field="value" header="Value" />
              <template #empty>
                <div class="flex flex-col items-center justify-center my-8">
                  <p class="text-gray-400">No cookies configured. </p>
                  <p class="text-gray-400">Add cookies to include in requests for this user.</p>
                </div>
              </template>
            </DataTable>
          </div>

          <div class="flex justify-between items-center">
            <h1 class="font-bold">Headers</h1>
            <div>
              <Button label="+ Add header" size="small" />
            </div>
          </div>

          <div class="flex-1">
            <DataTable :value="[]" scrollable scroll-height="flex" striped-rows>
              <Column field="name" header="Name" />
              <Column field="value" header="Value" />
              <template #empty>
                <div class="flex flex-col items-center justify-center my-8">
                  <p class="text-gray-400">No headers configured. </p>
                  <p class="text-gray-400">Add headers to include in requests for this user.</p>
                </div>
              </template>
            </DataTable>
          </div>
        </div>
      </template>
    </Card>
  </div>
</template>
