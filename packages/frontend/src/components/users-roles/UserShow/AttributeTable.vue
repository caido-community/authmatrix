<script setup lang="ts">
import Button from 'primevue/button';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import {User} from 'shared';
import {generateID} from '@/utils';
import Select from 'primevue/select';
import InputText from 'primevue/inputtext';

const user = defineModel<User>("user", { required: true });

const onAddCookie = () => {
  const id = generateID();
  user.value.attributes.push({ id, name: 'My attribute', value: 'My value', kind: 'Cookie' });
};
</script>

<template>
  <div class="flex-1 flex flex-col gap-2 min-h-0">
    <div class="flex justify-between items-center">
      <h1 class="font-bold">Attributes</h1>
      <div>
        <Button label="+ Add attribute" size="small" @click="onAddCookie" />
      </div>
    </div>

    <div class="min-h-0">
      <DataTable :value="user.attributes" edit-mode="cell" scrollable scroll-height="flex" striped-rows>
        <Column field="name" header="Name">
          <template #editor="{data}">
            <InputText v-model="data.name" />
          </template>
        </Column>

        <Column field="kind" header="Kind">
          <template #editor="{data}">
            <Select :options="['Cookie', 'Header']" v-model="data.kind" />
          </template>
        </Column>

        <Column field="value" header="Value" >
          <template #editor="{data}">
            <InputText v-model="data.value" />
          </template>
        </Column>

        <Column>
          <template>
            <div class="flex justify-end">
              <Button severity="danger" text size="small" icon="fas fa-trash" />
            </div>
          </template>
        </Column>

        <template #empty>
          <div class="flex flex-col items-center justify-center my-8">
            <p class="text-gray-400">No attributes configured. </p>
            <p class="text-gray-400">Add attributes to include in requests for this user.</p>
          </div>
        </template>
      </DataTable>
    </div>
  </div>
</template>
