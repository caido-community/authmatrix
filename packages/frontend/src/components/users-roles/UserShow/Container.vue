<script setup lang="ts">
import Card from 'primevue/card';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import {ref} from 'vue';

</script>

<template>
  <div class="h-full">
    <Card style="height: 100%">
      <template #title>
        <div class="flex justify-between items-center">
          <h1 class="font-bold">Update user</h1>
          <div>
            <Button label="Update" />
          </div>
        </div>
      </template>

      <template #content>
        <div class="flex flex-col space-y-4">
          <label for="name" class="text-sm font-bold">Name</label>
          <InputText id="name" label="Name" autocomplete="false" />
        </div>
      </template>
    </Card>
  </div>
</template>
